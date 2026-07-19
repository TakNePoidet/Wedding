/**
 * Приёмник RSVP-заявок: принимает ответ гостя с сайта и пересылает
 * его в Телеграм.
 *
 * Зачем прослойка: чтобы отправить сообщение, нужен токен бота,
 * а весь код сайта публичен — токен из него достаёт кто угодно.
 * Здесь токен живёт в секретах Cloudflare и наружу не выходит.
 *
 * Секреты задаются один раз (см. README):
 *   npx wrangler secret put TELEGRAM_TOKEN
 *   npx wrangler secret put TELEGRAM_CHAT_ID
 */

export interface Env {
  TELEGRAM_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  /** Откуда разрешено слать заявки: список через запятую (wrangler.toml) */
  ALLOWED_ORIGIN: string;
}

/** Что присылает форма */
interface Rsvp {
  first?: unknown;
  last?: unknown;
  attending?: unknown;
  plus?: unknown;
  plusNames?: unknown;
  drinks?: unknown;
  note?: unknown;
}

/** Обрезаем и чистим: в Телеграм не должно уехать полотно на мегабайт */
const clean = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = (env.ALLOWED_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    // Access-Control-Allow-Origin принимает ровно одно значение, списка он
    // не понимает — отвечаем тем источником, с которого пришёл запрос,
    // если он разрешён. Иначе первым из списка, чтобы браузер отсёк ответ сам.
    const from = request.headers.get('Origin');
    const ok = !allowed.length || (from ? allowed.includes(from) : true);
    const origin = from && ok ? from : (allowed[0] ?? '*');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method not allowed' }, 405, origin);
    }

    // Слабая, но бесплатная защита от случайного мусора: заявки принимаем
    // только со своих адресов. От целенаправленного спама не спасёт —
    // заголовок подделывается — но отсекает ботов, которые ходят по всему.
    if (!ok) {
      return json({ ok: false, error: 'forbidden origin' }, 403, origin);
    }

    let data: Rsvp;
    try {
      data = (await request.json()) as Rsvp;
    } catch {
      return json({ ok: false, error: 'bad json' }, 400, origin);
    }

    const first = clean(data.first, 80);
    if (!first) {
      return json({ ok: false, error: 'no name' }, 400, origin);
    }

    const last = clean(data.last, 80);
    const attending = data.attending !== false;
    const plusNames = clean(data.plusNames, 300);
    const note = clean(data.note, 600);
    const drinks = Array.isArray(data.drinks)
      ? data.drinks.map((d) => clean(d, 40)).filter(Boolean).slice(0, 20)
      : [];

    // Без parse_mode: текст гостя уходит как есть, экранировать нечего
    // и подставить разметку в сообщение он не сможет.
    const lines = [
      attending ? '✅ Придёт' : '✳️ Не сможет',
      '',
      `Гость: ${first}${last ? ` ${last}` : ''}`,
    ];
    if (attending) {
      if (data.plus === true) {
        lines.push(`Со спутниками: ${plusNames || 'имена уточнит позже'}`);
      }
      if (drinks.length) lines.push(`Напитки: ${drinks.join(', ')}`);
    }
    // Комментарий шлём при любом ответе: тем, кто не придёт, тоже есть что сказать
    if (note) lines.push('', `Пожелание: ${note}`);

    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lines.join('\n'),
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      // Отдаём только description Телеграма («Unauthorized», «chat not found»
      // и т. п.) — токена в нём нет, а без него настройку не отладить.
      let description = '';
      try {
        description = String(((await res.json()) as { description?: unknown }).description ?? '');
      } catch {
        /* ответ не json — обойдёмся кодом */
      }
      console.error('telegram error', res.status, description);
      return json({ ok: false, error: 'telegram failed', status: res.status, description }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  },
};
