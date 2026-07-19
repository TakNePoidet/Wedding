import { COUPLE_GENITIVE, DATE_LONG, RSVP_CONFIG } from '../data/wedding';

/* RSVP-форма: имя, фамилия и «+1» собираются в готовое сообщение для мессенджера */
function initRsvp() {
  const form = document.getElementById('rsvp-form') as HTMLFormElement | null;
  if (!form) return;

  const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

  const hint = byId<HTMLElement>('rsvp-hint');
  const firstEl = byId<HTMLInputElement>('rsvp-first');
  const lastEl = byId<HTMLInputElement>('rsvp-last');
  const plusEl = byId<HTMLInputElement>('rsvp-plus');
  const plusField = byId<HTMLElement>('rsvp-plus-field');
  const plusNameEl = byId<HTMLInputElement>('rsvp-plus-name');
  const whenYes = byId<HTMLElement>('rsvp-when-yes');
  const attendEls = form.querySelectorAll<HTMLInputElement>('input[name="attend"]');

  const phoneDigits = (RSVP_CONFIG.phone || '').replace(/\D/g, '');

  const setHint = (text?: string) => {
    if (hint) hint.textContent = text || '';
  };

  const isComing = () => {
    const no = document.getElementById('rsvp-no') as HTMLInputElement | null;
    return !(no && no.checked);
  };

  // Поля напитков/«+1» видны только при ответе «Буду»
  const syncAttend = () => {
    if (whenYes) whenYes.hidden = !isComing();
  };
  attendEls.forEach((el) => el.addEventListener('change', syncAttend));
  syncAttend();

  // Поле имени спутника появляется только при отмеченном «+1»
  plusEl.addEventListener('change', () => {
    plusField.hidden = !plusEl.checked;
    if (plusEl.checked) plusNameEl.focus();
  });

  // Подсветка имени снимается, как только гость начал печатать
  firstEl.addEventListener('input', () => {
    if (firstEl.value.trim()) firstEl.closest('.field')?.classList.remove('field--invalid');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const first = firstEl.value.trim();
    const last = lastEl.value.trim();
    if (!first) {
      const fieldEl = firstEl.closest('.field') as HTMLElement;
      // перезапуск «тряски», если гость жмёт отправить повторно
      fieldEl.classList.remove('field--invalid');
      void fieldEl.offsetWidth;
      fieldEl.classList.add('field--invalid');
      firstEl.focus();
      setHint('Напишите, пожалуйста, ваше имя.');
      return;
    }

    const who = first + (last ? ` ${last}` : '');
    let msg: string;

    if (!isComing()) {
      msg = `Здравствуйте! Это ${who}. К сожалению, не смогу быть на свадьбе ${COUPLE_GENITIVE} ${DATE_LONG}. Обнимаю и поздравляю!`;
    } else {
      msg = `Здравствуйте! Это ${who}. Подтверждаю присутствие на свадьбе ${COUPLE_GENITIVE} ${DATE_LONG}.`;
      if (plusEl.checked) {
        const plusNames = plusNameEl.value.trim();
        msg += plusNames
          ? ` Со мной будут: ${plusNames}.`
          : ' Буду с парой/семьёй, имена уточню позже.';
      }
      const drinks: string[] = [];
      form
        .querySelectorAll<HTMLInputElement>('input[name="drink"]:checked')
        .forEach((d) => drinks.push(d.value));
      if (drinks.length) {
        msg += ` Из напитков предпочтём: ${drinks.join(', ')}.`;
      }
    }

    let href = '';
    if (RSVP_CONFIG.type === 'telegram' && RSVP_CONFIG.telegram) {
      href = `https://t.me/${RSVP_CONFIG.telegram.replace(/^@/, '')}`;
      // t.me не принимает готовый текст — кладём его в буфер обмена
      navigator.clipboard?.writeText(msg).catch(() => {});
      setHint('Текст ответа скопирован — вставьте его в чате.');
    } else if (RSVP_CONFIG.type === 'phone' && phoneDigits) {
      href = `tel:+${phoneDigits}`;
    } else if (phoneDigits) {
      href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
      setHint('Открыли мессенджер с готовым ответом — останется нажать «отправить». Спасибо!');
    }

    if (href) window.open(href, '_blank', 'noopener');
  });
}

initRsvp();
