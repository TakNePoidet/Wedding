/* «Скопировать адрес» */
function initCopyAddress() {
  const btn = document.getElementById('addr-copy');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const addr = btn.getAttribute('data-addr') || '';
    const done = () => {
      const prev = btn.textContent;
      btn.classList.add('copied');
      btn.textContent = 'адрес скопирован';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = prev;
      }, 2200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(addr).then(done).catch(done);
    } else {
      done();
    }
  });
}

initCopyAddress();
