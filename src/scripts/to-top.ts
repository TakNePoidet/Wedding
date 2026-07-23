/* Кнопка «наверх» — появляется после первого экрана */
function initToTop() {
  const btn = document.getElementById('to-top');
  if (!btn) return;

  let shown = false;
  let ticking = false;

  const update = () => {
    const want = (window.scrollY || document.documentElement.scrollTop) > window.innerHeight * 0.9;
    if (want !== shown) {
      shown = want;
      btn.classList.toggle('show', want);
    }
    ticking = false;
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

  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  update();
}

initToTop();
