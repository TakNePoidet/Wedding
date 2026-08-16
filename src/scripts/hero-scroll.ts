/* ------------------------------------------------------------
   Обложка на прокрутке: текст чуть отстаёт и растворяется.

   Даёт ощущение глубины на первом же движении колеса — обложка
   уходит медленнее страницы, как задник в театре. Считаем только
   пока обложка в кадре: ниже неё обработчик выходит сразу.
   ------------------------------------------------------------ */
function initHeroScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector<HTMLElement>('.hero');
  const inner = hero?.querySelector<HTMLElement>('.reveal');
  const art = hero?.querySelector<HTMLElement>('.hero__art');
  if (!hero || !inner) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const h = hero.offsetHeight;
    const y = window.scrollY;
    if (y > h) return; // обложка уехала — считать нечего

    const p = Math.min(1, y / h); // 0 → 1 по мере ухода обложки
    // текст поднимается медленнее страницы и тает
    inner.style.transform = `translateY(${(p * 42).toFixed(1)}px)`;
    inner.style.opacity = String(Math.max(0, 1 - p * 1.5));
    // персонажи отстают сильнее — разные планы
    if (art) art.style.transform = `translateY(${(p * 70).toFixed(1)}px)`;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
}

initHeroScroll();
