import { WEDDING_DATE } from '../data/wedding';
import { plural } from './plural';

/* Таймер обратного отсчёта */
function initCountdown() {
  const timer = document.getElementById('timer');
  const done = document.getElementById('timer-done');
  if (!timer) return;

  const q = (sel: string) => timer.querySelector(sel) as HTMLElement;

  const elDays = q('[data-days]');
  const elHours = q('[data-hours]');
  const elMinutes = q('[data-minutes]');
  const elSeconds = q('[data-seconds]');
  const lblDays = q('[data-days-label]');
  const lblHours = q('[data-hours-label]');
  const lblMinutes = q('[data-minutes-label]');
  const lblSeconds = q('[data-seconds-label]');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  /** Момент подмены текста — нижняя точка digitSwap (42% от 0.4s) */
  const SWAP_AT_MS = 168;

  /* Меняет цифру коротким «вдохом»: элемент гаснет, в нижней точке
     подменяется текст, элемент проступает обратно.

     Цифра всегда одна. Схема с двумя (уходящая + приходящая) уже
     была: она либо требовала обрезающей маски, которая срезала
     Playfair, либо показывала обе разом и превращала «58»→«59»
     в нечитаемое «5859». Заодно исчез повод плодить узлы: ничего
     не накапливается и `aria-live` читает ровно одно значение. */
  const setNum = (el: HTMLElement, value: string | number) => {
    const s = String(value);
    if (el.dataset.v === s) return;
    const first = el.dataset.v === undefined;
    el.dataset.v = s;

    // первый расчёт заменяет прочерк из разметки — молча, без «вдоха»:
    // анимировать появление начального значения незачем
    if (reduceMotion || first) {
      el.textContent = s;
      return;
    }

    // перезапуск анимации, если предыдущая ещё идёт
    el.classList.remove('is-swap');
    void el.offsetWidth;
    el.classList.add('is-swap');

    window.setTimeout(() => {
      // за 168 мс значение могло смениться снова — пишем актуальное
      el.textContent = el.dataset.v ?? s;
    }, SWAP_AT_MS);
  };

  let handle: ReturnType<typeof setInterval>;

  const tick = () => {
    const diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      timer.hidden = true;
      if (done) done.hidden = false;
      clearInterval(handle);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setNum(elDays, days);
    setNum(elHours, pad(hours));
    setNum(elMinutes, pad(minutes));
    setNum(elSeconds, pad(seconds));

    lblDays.textContent = plural(days, ['день', 'дня', 'дней']);
    lblHours.textContent = plural(hours, ['час', 'часа', 'часов']);
    lblMinutes.textContent = plural(minutes, ['минута', 'минуты', 'минут']);
    lblSeconds.textContent = plural(seconds, ['секунда', 'секунды', 'секунд']);
  };

  tick();
  handle = setInterval(tick, 1000);
}

initCountdown();
