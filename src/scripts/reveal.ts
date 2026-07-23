/* Reveal-анимации при скролле */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (!items.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // лёгкий органичный разброс появления
        const target = entry.target as HTMLElement;
        target.style.transitionDelay = `${(Math.min(entry.intersectionRatio, 0.2) * 0.4).toFixed(2)}s`;
        target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );

  items.forEach((el) => io.observe(el));
}

initReveal();
