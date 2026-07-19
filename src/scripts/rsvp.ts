import { ORGANIZER, RSVP_ENDPOINT } from '../data/wedding';

/* RSVP-форма: ответ уходит в воркер (worker/), тот пересылает его в Телеграм */
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
  const submitEl = form.querySelector<HTMLButtonElement>('button[type="submit"]');

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

  /** Куда отправлять гостя, если автоматика не сработала */
  const fallback = `Не удалось отправить ответ. Напишите, пожалуйста, организатору: ${ORGANIZER.telPretty}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const first = firstEl.value.trim();
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

    if (!RSVP_ENDPOINT) {
      setHint(fallback);
      return;
    }

    const drinks: string[] = [];
    form
      .querySelectorAll<HTMLInputElement>('input[name="drink"]:checked')
      .forEach((d) => drinks.push(d.value));

    const attending = isComing();
    const payload = {
      first,
      last: lastEl.value.trim(),
      attending,
      plus: attending && plusEl.checked,
      plusNames: attending && plusEl.checked ? plusNameEl.value.trim() : '',
      drinks: attending ? drinks : [],
    };

    if (submitEl) submitEl.disabled = true;
    setHint('Отправляем…');

    try {
      const res = await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));

      // Форму закрываем: повторная отправка того же ответа никому не нужна
      form.querySelectorAll('input, button').forEach((el) => {
        (el as HTMLInputElement).disabled = true;
      });
      setHint(
        attending
          ? 'Спасибо! Ответ получен — ждём вас 13 сентября.'
          : 'Спасибо, что дали знать. Будем скучать!',
      );
    } catch {
      if (submitEl) submitEl.disabled = false;
      setHint(fallback);
    }
  });
}

initRsvp();
