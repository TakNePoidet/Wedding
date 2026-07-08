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
  telegram: ''               // либо укажите ник и type: 'telegram'
};
/* Текст ответа собирается автоматически из полей формы (имя, фамилия, +1) */

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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* Обновляет цифру с мягким «тиком», если значение сменилось */
  function setNum(el, value) {
    var s = String(value);
    if (el.textContent === s) return;
    el.textContent = s;
    if (!reduceMotion) {
      el.classList.remove('tick');
      void el.offsetWidth; // перезапуск анимации
      el.classList.add('tick');
    }
  }

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

    setNum(elDays, days);
    setNum(elHours, pad(hours));
    setNum(elMinutes, pad(minutes));
    setNum(elSeconds, pad(seconds));

    lblDays.textContent = plural(days, ['день', 'дня', 'дней']);
    lblHours.textContent = plural(hours, ['час', 'часа', 'часов']);
    lblMinutes.textContent = plural(minutes, ['минута', 'минуты', 'минут']);
    lblSeconds.textContent = plural(seconds, ['секунда', 'секунды', 'секунд']);
  }

  tick();
  var handle = setInterval(tick, 1000);
})();

/* ------------------------------------------------------------
   RSVP-форма: имя, фамилия и «+1» собираются
   в готовое сообщение для мессенджера
   ------------------------------------------------------------ */
(function initRsvp() {
  var form = document.getElementById('rsvp-form');
  if (!form) return;

  var cfg = RSVP_CONFIG;
  var hint = document.getElementById('rsvp-hint');
  var firstEl = document.getElementById('rsvp-first');
  var lastEl = document.getElementById('rsvp-last');
  var plusEl = document.getElementById('rsvp-plus');
  var plusField = document.getElementById('rsvp-plus-field');
  var plusNameEl = document.getElementById('rsvp-plus-name');

  var phoneDigits = (cfg.phone || '').replace(/\D/g, '');
  var isPlaceholder =
    (cfg.type === 'telegram' && !cfg.telegram) ||
    (cfg.type !== 'telegram' && (!phoneDigits || /^0+$/.test(phoneDigits)));

  function setHint(text) { if (hint) hint.textContent = text; }

  if (isPlaceholder) {
    setHint('Форма настраивается: укажите контакт в\u00A0script.js (RSVP_CONFIG).');
  } else if (cfg.type === 'telegram') {
    setHint('Откроется наш Telegram\u00A0— текст ответа скопируется сам.');
  } else {
    setHint('Ответ откроется в\u00A0WhatsApp готовым сообщением.');
  }

  // Поле имени спутника появляется только при отмеченном «+1»
  plusEl.addEventListener('change', function () {
    plusField.hidden = !plusEl.checked;
    if (plusEl.checked) plusNameEl.focus();
  });

  // Подсветка имени снимается, как только гость начал печатать
  firstEl.addEventListener('input', function () {
    if (firstEl.value.trim()) firstEl.closest('.field').classList.remove('field--invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var first = firstEl.value.trim();
    var last = lastEl.value.trim();
    if (!first) {
      firstEl.closest('.field').classList.add('field--invalid');
      firstEl.focus();
      setHint('Напишите, пожалуйста, ваше имя.');
      return;
    }

    var who = first + (last ? ' ' + last : '');
    var msg = 'Здравствуйте! Это ' + who + '. Подтверждаю присутствие на свадьбе Никиты и Леры 13 сентября 2026.';
    if (plusEl.checked) {
      var plusName = plusNameEl.value.trim();
      msg += ' Со мной будет ещё один гость' + (plusName ? ' — ' + plusName : '') + '.';
    }

    var href = '';
    if (cfg.type === 'telegram' && cfg.telegram) {
      href = 'https://t.me/' + cfg.telegram.replace(/^@/, '');
      // t.me не принимает готовый текст — кладём его в буфер обмена
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).catch(function () {});
      }
      setHint('Текст ответа скопирован\u00A0— вставьте его в\u00A0чате.');
    } else if (cfg.type === 'phone' && phoneDigits) {
      href = 'tel:+' + phoneDigits;
    } else if (phoneDigits) {
      href = 'https://wa.me/' + phoneDigits + '?text=' + encodeURIComponent(msg);
    }

    if (href) window.open(href, '_blank', 'noopener');
  });
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
