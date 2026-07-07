/* ============================================================
   Никита и Лера · 13.09.2026
   Таймер обратного отсчёта + мягкие reveal-анимации.
   ============================================================ */

/* ------------------------------------------------------------
   НАСТРОЙКА RSVP  ← замените контакт здесь (одно место)
   type: 'whatsapp' | 'telegram' | 'phone'
   whatsapp/phone: номер в международном формате без + и пробелов,
                   например '79991234567'
   telegram: ник без @, например 'nikita_lera'
   ------------------------------------------------------------ */
var RSVP_CONFIG = {
  type: 'whatsapp',
  phone: '70000000000',      // TODO: заменить на реальный номер
  telegram: '',              // либо укажите ник и type: 'telegram'
  message: 'Здравствуйте! Подтверждаю присутствие на свадьбе Никиты и Леры 13 сентября 2026.'
};

/* Дата и время торжества: 13 сентября 2026, 15:00 (Уфа, UTC+5) */
var WEDDING_DATE = new Date('2026-09-13T15:00:00+05:00');

/* ------------------------------------------------------------
   Русское склонение существительных
   plural(5, ['день','дня','дней']) -> 'дней'
   ------------------------------------------------------------ */
function plural(n, forms) {
  var n10 = n % 10;
  var n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

/* ------------------------------------------------------------
   Таймер обратного отсчёта
   ------------------------------------------------------------ */
(function initCountdown() {
  var timer = document.getElementById('timer');
  var done = document.getElementById('timer-done');
  if (!timer) return;

  var elDays = timer.querySelector('[data-days]');
  var elHours = timer.querySelector('[data-hours]');
  var elMinutes = timer.querySelector('[data-minutes]');
  var elSeconds = timer.querySelector('[data-seconds]');
  var lblDays = timer.querySelector('[data-days-label]');
  var lblHours = timer.querySelector('[data-hours-label]');
  var lblMinutes = timer.querySelector('[data-minutes-label]');
  var lblSeconds = timer.querySelector('[data-seconds-label]');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      timer.hidden = true;
      if (done) done.hidden = false;
      clearInterval(handle);
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    elDays.textContent = days;
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);

    lblDays.textContent = plural(days, ['день', 'дня', 'дней']);
    lblHours.textContent = plural(hours, ['час', 'часа', 'часов']);
    lblMinutes.textContent = plural(minutes, ['минута', 'минуты', 'минут']);
    lblSeconds.textContent = plural(seconds, ['секунда', 'секунды', 'секунд']);
  }

  tick();
  var handle = setInterval(tick, 1000);
})();

/* ------------------------------------------------------------
   RSVP-кнопка
   ------------------------------------------------------------ */
(function initRsvp() {
  var link = document.getElementById('rsvp-link');
  var hint = document.getElementById('rsvp-hint');
  if (!link) return;

  var cfg = RSVP_CONFIG;
  var text = encodeURIComponent(cfg.message || '');
  var href = '#';
  var placeholder = false;

  if (cfg.type === 'telegram' && cfg.telegram) {
    href = 'https://t.me/' + cfg.telegram.replace(/^@/, '');
  } else if (cfg.type === 'phone' && cfg.phone) {
    href = 'tel:+' + cfg.phone.replace(/\D/g, '');
  } else if (cfg.phone) {
    href = 'https://wa.me/' + cfg.phone.replace(/\D/g, '') + '?text=' + text;
  }

  // Признак незаполненного контакта
  if (cfg.type !== 'telegram' && /^0+$/.test((cfg.phone || '').replace(/\D/g, ''))) {
    placeholder = true;
  }
  if (cfg.type === 'telegram' && !cfg.telegram) placeholder = true;

  link.setAttribute('href', href);
  if (hint) {
    hint.textContent = placeholder
      ? 'Кнопка настраивается: укажите контакт в\u00A0script.js (RSVP_CONFIG).'
      : 'Откроется мессенджер с\u00A0готовым сообщением.';
  }
})();

/* ------------------------------------------------------------
   Reveal-анимации при скролле
   ------------------------------------------------------------ */
(function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // лёгкий органичный разброс появления
        entry.target.style.transitionDelay = (Math.min(entry.intersectionRatio, 0.2) * 0.4).toFixed(2) + 's';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function (el) { io.observe(el); });
})();
