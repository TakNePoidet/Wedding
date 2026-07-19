/* Палитра: имя цвета по тапу (наведение/фокус — уже в CSS) */
function initPalette() {
  const dots = document.querySelectorAll<HTMLElement>('.dot');
  if (!dots.length) return;

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const wasOn = dot.classList.contains('show-name');
      dots.forEach((d) => d.classList.remove('show-name'));
      if (!wasOn) dot.classList.add('show-name');
    });
  });

  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.dot')) {
      dots.forEach((d) => d.classList.remove('show-name'));
    }
  });
}

initPalette();
