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

/* Дата и время торжества: 13 сентября 2026, 15:30 (Уфа, UTC+5) */
var WEDDING_DATE = new Date('2026-09-13T15:30:00+05:00');

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
  var whenYes = document.getElementById('rsvp-when-yes');
  var attendEls = form.querySelectorAll('input[name="attend"]');

  var phoneDigits = (cfg.phone || '').replace(/\D/g, '');

  function setHint(text) { if (hint) hint.textContent = text || ''; }

  function isComing() {
    var no = document.getElementById('rsvp-no');
    return !(no && no.checked);
  }

  // Поля напитков/«+1» видны только при ответе «Буду»
  function syncAttend() {
    if (whenYes) whenYes.hidden = !isComing();
  }
  attendEls.forEach(function (el) { el.addEventListener('change', syncAttend); });
  syncAttend();

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
      var fieldEl = firstEl.closest('.field');
      // перезапуск «тряски», если гость жмёт отправить повторно
      fieldEl.classList.remove('field--invalid');
      void fieldEl.offsetWidth;
      fieldEl.classList.add('field--invalid');
      firstEl.focus();
      setHint('Напишите, пожалуйста, ваше имя.');
      return;
    }

    var who = first + (last ? ' ' + last : '');
    var msg;

    if (!isComing()) {
      msg = 'Здравствуйте! Это ' + who + '. К сожалению, не смогу быть на свадьбе Никиты и Леры 13 сентября 2026. Обнимаю и поздравляю!';
    } else {
      msg = 'Здравствуйте! Это ' + who + '. Подтверждаю присутствие на свадьбе Никиты и Леры 13 сентября 2026.';
      if (plusEl.checked) {
        var plusNames = plusNameEl.value.trim();
        msg += plusNames
          ? ' Со мной будут: ' + plusNames + '.'
          : ' Буду с парой/семьёй, имена уточню позже.';
      }
      var drinks = [];
      form.querySelectorAll('input[name="drink"]:checked').forEach(function (d) {
        drinks.push(d.value);
      });
      if (drinks.length) {
        msg += ' Из напитков предпочтём: ' + drinks.join(', ') + '.';
      }
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
      setHint('Открыли мессенджер с готовым ответом — останется нажать «отправить». Спасибо!');
    }

    if (href) window.open(href, '_blank', 'noopener');
  });
})();

/* ------------------------------------------------------------
   Линия прогресса прокрутки (сверху страницы)
   ------------------------------------------------------------ */
(function initProgress() {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;

  var ticking = false;
  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max)) : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ------------------------------------------------------------
   Кнопка «наверх» — появляется после первого экрана
   ------------------------------------------------------------ */
(function initToTop() {
  var btn = document.getElementById('to-top');
  if (!btn) return;

  var shown = false, ticking = false;
  function update() {
    var want = (window.scrollY || document.documentElement.scrollTop) > window.innerHeight * 0.9;
    if (want !== shown) { shown = want; btn.classList.toggle('show', want); }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  btn.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  update();
})();

/* ------------------------------------------------------------
   Кнопка Telegram-чата: пока ссылки нет — мягкая подсказка
   ------------------------------------------------------------ */
(function initTgChat() {
  var a = document.getElementById('tg-chat');
  if (!a) return;
  var href = a.getAttribute('href');
  if (href && href !== '#') return;   // ссылка задана — работаем как обычно

  a.removeAttribute('target');
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var hint = document.getElementById('tg-hint');
    if (hint) hint.hidden = false;
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

/* ------------------------------------------------------------
   «Сохранить дату в календарь» — генерируем .ics
   ------------------------------------------------------------ */
(function initCalendar() {
  var btn = document.getElementById('ics-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    // 13.09.2026 15:30 Уфа (UTC+5) → в UTC это 10:30; afterparty до ~23:30
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//nikita-lera//wedding//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:wedding-nikita-lera-2026-09-13@github.io',
      'DTSTAMP:20260708T000000Z',
      'DTSTART:20260913T103000Z',
      'DTEND:20260913T183000Z',
      'SUMMARY:Свадьба Никиты и Леры',
      'DESCRIPTION:Сбор гостей к 15:30. Будем счастливы видеть вас рядом!',
      'LOCATION:Ресторан «Лебединое озеро»\\, ПКиО им. М. Гафури\\, проспект Октября 77/2\\, Уфа',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'nikita-lera-13-09-2026.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

    var label = btn.querySelector('span');
    var prev = label.textContent;
    btn.classList.add('done');
    label.textContent = 'дата сохранена';
    setTimeout(function () { btn.classList.remove('done'); label.textContent = prev; }, 2600);
  });
})();

/* ------------------------------------------------------------
   «Скопировать адрес»
   ------------------------------------------------------------ */
(function initCopyAddress() {
  var btn = document.getElementById('addr-copy');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var addr = btn.getAttribute('data-addr') || '';
    var done = function () {
      var prev = btn.textContent;
      btn.classList.add('copied');
      btn.textContent = 'адрес скопирован';
      setTimeout(function () { btn.classList.remove('copied'); btn.textContent = prev; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(done).catch(done);
    } else {
      done();
    }
  });
})();

/* ------------------------------------------------------------
   Палитра: имя цвета по тапу (наведение/фокус — уже в CSS)
   ------------------------------------------------------------ */
(function initPalette() {
  var dots = document.querySelectorAll('.dot');
  if (!dots.length) return;
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var wasOn = dot.classList.contains('show-name');
      dots.forEach(function (d) { d.classList.remove('show-name'); });
      if (!wasOn) dot.classList.add('show-name');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dot')) {
      dots.forEach(function (d) { d.classList.remove('show-name'); });
    }
  });
})();

/* ------------------------------------------------------------
   Лёгкий параллакс ботаники за курсором (десктоп, если разрешено движение)
   ------------------------------------------------------------ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var leaves = document.querySelectorAll('.botanical');
  if (!leaves.length) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

  window.addEventListener('mousemove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1..1
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  });

  function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    leaves.forEach(function (leaf, i) {
      var depth = 6 + (i % 3) * 5;                     // разная «глубина»
      // CSS-свойство translate независимо от transform (sway) и складывается с ним
      leaf.style.translate = (cx * depth).toFixed(1) + 'px ' + (cy * depth).toFixed(1) + 'px';
    });
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }
})();
