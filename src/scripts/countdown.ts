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

  /* Обновляет цифру с мягким «тиком», если значение сменилось */
  const setNum = (el: HTMLElement, value: string | number) => {
    const s = String(value);
    if (el.textContent === s) return;
    el.textContent = s;
    if (!reduceMotion) {
      el.classList.remove('tick');
      void el.offsetWidth; // перезапуск анимации
      el.classList.add('tick');
    }
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
