/* ------------------------------------------------------------
   Интро-занавес: показать имена, дождаться шрифтов, открыть обложку.

   Класс `is-intro` на <html> ставит встроенный скрипт в <head>
   (Base.astro) — до первой отрисовки, иначе гость успел бы увидеть
   обложку раньше занавеса. Здесь только сценарий и уборка.

   Ждём именно шрифты: имена набраны рукописным Marck Script, и
   подмена системным курсивом в момент открытия — самое заметное,
   что может случиться на первом экране.
   ------------------------------------------------------------ */
function initIntro() {
  const root = document.documentElement;
  if (!root.classList.contains('is-intro')) return;

  const intro = document.getElementById('intro');
  if (!intro) {
    root.classList.remove('is-intro');
    return;
  }

  /** Снять занавес и вернуть странице прокрутку */
  const finish = () => {
    intro.classList.add('is-out');
    root.classList.add('is-intro-done');
    // убираем из потока после проезда полотна
    const drop = () => {
      intro.remove();
      root.classList.remove('is-intro');
    };
    const done = () => window.setTimeout(drop, 60);
    intro.addEventListener('transitionend', done, { once: true });
    // страховка: если transitionend не придёт (вкладка в фоне)
    window.setTimeout(drop, 1600);
  };

  // Проявляем имена на следующем кадре — иначе переход стартует
  // из уже конечного состояния и его не видно.
  requestAnimationFrame(() => intro.classList.add('is-in'));

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  const ready = fonts ? fonts.ready : Promise.resolve();

  // Занавес живёт минимум 1.1 с (иначе мелькает) и максимум 2.6 с
  // (иначе на медленной сети превращается в заглушку).
  const MIN = 1100;
  const MAX = 2600;
  const started = performance.now();
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    finish();
  };

  ready.then(() => {
    const waited = performance.now() - started;
    window.setTimeout(close, Math.max(0, MIN - waited));
  });
  window.setTimeout(close, MAX);
}

initIntro();
