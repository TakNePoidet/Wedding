/* Лёгкий параллакс ботаники за курсором (десктоп, если разрешено движение) */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const leaves = document.querySelectorAll<HTMLElement>('.botanical');
  if (!leaves.length) return;

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf: number | null = null;

  const loop = () => {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    leaves.forEach((leaf, i) => {
      const depth = 6 + (i % 3) * 5; // разная «глубина»
      // CSS-свойство translate независимо от transform (sway) и складывается с ним
      leaf.style.translate = `${(cx * depth).toFixed(1)}px ${(cy * depth).toFixed(1)}px`;
    });
    raf =
      Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : null;
  };

  window.addEventListener('mousemove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  });
}

initParallax();
