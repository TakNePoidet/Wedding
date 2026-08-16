/* ------------------------------------------------------------
   Курсор-компаньон и «магнитные» кнопки.

   Оба поведения живут в одном модуле: они слушают одно и то же
   движение мыши, и разносить их по файлам значило бы держать два
   параллельных rAF-цикла ради одного указателя.

   Включается только для мыши (pointer: fine) и только если гость
   не просил убрать движение. Разметку кольца создаём здесь же —
   в HTML ей делать нечего, без скрипта она не нужна.
   ------------------------------------------------------------ */

/** Что считается интерактивным — над этим кольцо раскрывается */
const HOT = 'a, button, .dot, input, label.chip, label.seg, summary';
/** Крупный текст — над ним кольцо поджимается, чтобы не заслонять */
const QUIET = 'h1, h2, .head, .intro__names';
/** Кнопки, которые слегка тянутся к курсору.
    Магнит пишет в свойство `translate`, поэтому сюда нельзя брать
    элементы, которых это свойство уже держит: у стрелки обложки
    центрирование сделано утилитой -translate-x-1/2, и притяжение
    сбивало её вправо на половину ширины. */
const MAGNETS = '.link-btn, .to-top, .ink-btn';

function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const ring = document.createElement('div');
  ring.className = 'cursor';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  root.classList.add('has-cursor');

  // Кольцо догоняет указатель с запаздыванием — отсюда ощущение веса
  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let raf: number | null = null;

  const magnets = Array.from(document.querySelectorAll<HTMLElement>(MAGNETS));

  const loop = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    // Именно `translate`, а не `transform`. Раскрытие кольца задано
    // отдельным свойством `scale`, а порядок применения —
    // translate → rotate → scale → transform: при записи позиции
    // в `transform` масштаб умножал бы уже смещённые координаты,
    // и кольцо улетало бы тем дальше, чем дальше курсор от левого
    // верхнего угла (на 1.75 из точки 533,402 — в 933,704).
    ring.style.translate = `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;

    // Магниты: пока курсор рядом, кнопка тянется к нему
    for (const el of magnets) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) / 2 + 60;
      if (dist < reach) {
        const pull = (1 - dist / reach) * 0.32;
        el.style.translate = `${(dx * pull).toFixed(1)}px ${(dy * pull).toFixed(1)}px`;
      } else if (el.style.translate) {
        el.style.translate = '';
      }
    }

    // На последнем кадре садимся точно на указатель. Без этого цикл
    // замирал бы «почти на месте»: при редких кадрах (фон, слабое
    // устройство) остаточный зазор доходил до десятка пикселей, и
    // кольцо выглядело бы отвязавшимся от курсора.
    if (Math.abs(mx - rx) < 0.5 && Math.abs(my - ry) < 0.5) {
      rx = mx;
      ry = my;
      ring.style.translate = `${rx}px ${ry}px`;
      raf = null;
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  window.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!ring.classList.contains('is-on')) ring.classList.add('is-on');

      const el = e.target as Element | null;
      const hot = !!el?.closest?.(HOT);
      ring.classList.toggle('is-hot', hot);
      ring.classList.toggle('is-quiet', !hot && !!el?.closest?.(QUIET));

      kick();
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => ring.classList.remove('is-on'));
  document.addEventListener('mousedown', () => ring.classList.add('is-down'));
  document.addEventListener('mouseup', () => ring.classList.remove('is-down'));

  // Магниты держатся за координаты в окне — при прокрутке их надо пересчитать
  window.addEventListener('scroll', kick, { passive: true });
}

initCursor();
