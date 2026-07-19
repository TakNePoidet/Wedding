/* Кнопка чата праздника: пока ссылки нет — мягкая подсказка */
function initTgChat() {
  const a = document.getElementById('tg-chat');
  if (!a) return;

  const href = a.getAttribute('href');
  if (href && href !== '#') return; // ссылка задана — работаем как обычно

  a.removeAttribute('target');
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const hint = document.getElementById('tg-hint');
    if (hint) hint.hidden = false;
  });
}

initTgChat();
