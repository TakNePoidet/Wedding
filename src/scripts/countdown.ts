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

  /** Длительность переката — держать в паре с rollOut в countdown.css */
  const ROLL_MS = 500;

  /* Обновляет цифру «перекатом»: прежнее значение уезжает вверх,
     новое приходит снизу. Два элемента живут одновременно — иначе
     это не перекат, а подмена с миганием.

     Уходящую цифру снимаем по таймеру, а не по animationend: секунды
     тикают, даже когда вкладка в фоне, а там анимации не запускаются
     и событие не приходит — призраки копились бы в разметке, и
     `aria-live` зачитывал бы их все подряд. Заодно перед каждой
     сменой подчищаем всё, что осталось с прошлого раза. */
  const setNum = (el: HTMLElement, value: string | number) => {
    const s = String(value);

    // всё, что уже уехало, живым цифрам не родня
    el.querySelectorAll('.d.is-out').forEach((ghost) => ghost.remove());

    const cur = el.querySelector<HTMLElement>('.d');

    if (!cur) {
      el.textContent = '';
      const first = document.createElement('span');
      first.className = 'd';
      first.textContent = s;
      el.appendChild(first);
      return;
    }

    if (cur.textContent === s) return;

    if (reduceMotion) {
      cur.textContent = s;
      return;
    }

    cur.classList.add('is-out');
    // пока уходящая цифра на экране, для скринридера её уже нет:
    // иначе `aria-live` прочитал бы старое и новое значение слитно
    cur.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => cur.remove(), ROLL_MS);

    const next = document.createElement('span');
    next.className = 'd is-in';
    next.textContent = s;
    el.appendChild(next);
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
