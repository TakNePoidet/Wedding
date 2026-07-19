/* ============================================================
   Единственный источник правды по свадьбе.
   Всё, что раньше дублировалось между index.html, script.js
   и JSON-LD, теперь живёт здесь.
   ============================================================ */

/* ------------------------------------------------------------
   Дата и время торжества: 13 сентября 2026, Уфа (UTC+5).
   Три значения ниже — единственное, что задаётся руками.
   Всё остальное (ISO-строки, таймер, .ics, schema.org,
   заголовки, подписи) считается из них.
   ------------------------------------------------------------ */
/** Часовой пояс площадки */
const TZ = '+05:00';

/** День свадьбы */
export const DATE_ISO = '2026-09-13';
/** Во сколько собираемся */
export const GATHERING_TIME = '15:00';
/** Во сколько вечер заканчивается */
export const END_TIME = '23:00';

export const START_ISO = `${DATE_ISO}T${GATHERING_TIME}:00${TZ}`;
export const END_ISO = `${DATE_ISO}T${END_TIME}:00${TZ}`;
export const WEDDING_DATE = new Date(START_ISO);

/* ------------------------------------------------------------
   Дата в разных видах. Разбираем строку, а не Date: getDate()
   зависит от часового пояса машины, которая собирает сайт.
   ------------------------------------------------------------ */
const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const WEEKDAYS = [
  'воскресенье', 'понедельник', 'вторник', 'среда',
  'четверг', 'пятница', 'суббота',
];

const [year, month, day] = DATE_ISO.split('-').map(Number);

/** '13 сентября 2026' */
export const DATE_LONG = `${day} ${MONTHS[month - 1]} ${year}`;
/** '13.09.2026' */
export const DATE_SHORT = DATE_ISO.split('-').reverse().join('.');
/** '13 · 09 · 2026' — подпись в подвале */
export const DATE_DOTTED = DATE_ISO.split('-').reverse().join(' · ');
/** 'воскресенье'. Полдень по UTC, чтобы пояс не сдвинул день недели. */
export const DATE_WEEKDAY = WEEKDAYS[new Date(`${DATE_ISO}T12:00:00Z`).getUTCDay()];

export const COUPLE = 'Никита и Лера';
/** Родительный падеж — «свадьба Никиты и Леры» */
export const COUPLE_GENITIVE = 'Никиты и Леры';
export const SITE_URL = 'https://leranikita.ru';

export const VENUE = {
  name: 'Ресторан «Лебединое озеро»',
  street: 'проспект Октября, 77/2, ПКиО им. М. Гафури',
  city: 'Уфа',
  country: 'RU',
  /** Строка, которую копирует кнопка «скопировать адрес» */
  copyText: 'Уфа, проспект Октября, 77/2, ресторан «Лебединое озеро»',
} as const;

/** «ресторан «Лебединое озеро»» — для середины предложения.
    Опускаем только первую букву: toLowerCase() убил бы и заглавную в названии. */
export const VENUE_INLINE = VENUE.name.charAt(0).toLowerCase() + VENUE.name.slice(1);

/* ------------------------------------------------------------
   НАСТРОЙКА RSVP  ← замените контакт здесь (одно место)
   type: 'whatsapp' | 'telegram' | 'phone'
   whatsapp/phone: номер в международном формате без + и пробелов
   telegram: ник без @
   ------------------------------------------------------------ */
export const RSVP_CONFIG = {
  type: 'whatsapp' as 'whatsapp' | 'telegram' | 'phone',
  phone: '70000000000', // TODO: заменить на реальный номер
  telegram: '', // либо укажите ник и type: 'telegram'
};

/** Крайний срок ответа — показывается в секции RSVP */
export const RSVP_DEADLINE = '10 августа';

export const ORGANIZER = {
  name: 'Гульназ',
  agency: 'ОГОНЬ',
  tel: '+79377804333',
  telPretty: '+7 937 780-43-33',
};

/** Ссылка на чат праздника. Пустая строка → кнопка показывает подсказку. */
export const CHAT_URL = '';

export const FLOWER_SUBSCRIPTION_URL =
  'https://verafox.ru/tsvetochnaya-podpiska-dlya-nikity-i-lery-13-09-2026.html';

/**
 * Программа дня. `h`/`m` — время начала (крупная цифра + мелкие минуты),
 * `note` — необязательная подпись.
 */
export const TIMELINE = [
  { h: '15', m: ':00', title: 'Сбор гостей', note: 'Жених и&nbsp;невеста с&nbsp;гостями, фуршет' },
  { h: '15', m: ':35', title: 'Представление гостей' },
  { h: '16', m: ':00', title: 'Церемония', note: 'Регистрация, поздравления и&nbsp;подарки, общее фото' },
  { h: '17', m: ':00', title: 'Ужин и&nbsp;программа', note: 'Тосты, музыка и&nbsp;любимые блюда' },
  { h: '22', m: ':00', title: 'Afterparty', note: 'Танцы и&nbsp;дискотека до&nbsp;последнего аккорда' },
] as const;

export const DETAILS = [
  { k: 'День', v: `${DATE_LONG}, ${DATE_WEEKDAY}` },
  { k: 'Сбор гостей', v: `к&nbsp;${GATHERING_TIME}, просим не&nbsp;опаздывать` },
  {
    k: 'Место',
    v: 'ресторан «Лебединое озеро»<br /><em>ПКиО им.&nbsp;М.&nbsp;Гафури, проспект Октября, 77/2</em>',
  },
] as const;

/** `s` — множитель размера точки, даёт живой неровный ряд */
export const PALETTE = [
  { c: '#F1EADB', s: 1.15, name: 'кремовый' },
  { c: '#DCC7A8', s: 0.9, name: 'бежевый' },
  { c: '#B79B78', s: 1.05, name: 'тёплый беж' },
  { c: '#8B7355', s: 0.85, name: 'кофейный' },
  { c: '#5E4B36', s: 1.1, name: 'шоколад' },
  { c: '#AEBE9F', s: 0.95, name: 'шалфей' },
  { c: '#7C9070', s: 1.2, name: 'олива' },
  { c: '#4F6344', s: 0.9, name: 'хвоя' },
  { c: '#E9E0CC', s: 1.0, name: 'молочный' },
  { c: '#FBF8F1', s: 1.0, name: 'белый', ring: true },
  { c: '#2A2822', s: 0.85, name: 'графит' },
] as const;

export const DRINKS = [
  'Белое вино',
  'Красное вино',
  'Шампанское',
  'Виски',
  'Водка',
  'Коньяк',
  'Безалкогольные',
] as const;

export const RULES = [
  {
    k: 'О&nbsp;детях',
    v: 'Будем рады вам и&nbsp;вашим детям, но&nbsp;уверены: малышам будет комфортнее дома, чем на&nbsp;шумном празднике. К&nbsp;сожалению, площадка не&nbsp;позволяет пригласить аниматора и&nbsp;организовать для&nbsp;них безопасное пространство.',
  },
  {
    k: 'Без «Горько!»',
    v: 'Мы&nbsp;за&nbsp;искренние моменты&nbsp;— целоваться будем тогда, когда захочется самим.',
  },
  {
    k: 'Фото',
    v: 'Делитесь кадрами с&nbsp;хэштегом <b>#____</b>&nbsp;— так мы&nbsp;соберём вечер вашими глазами.',
  },
  {
    k: 'За&nbsp;столом',
    v: 'Говорим обо&nbsp;всём на&nbsp;свете&nbsp;— кроме политики. Пусть будет только доброе.',
  },
] as const;

const addrQuery = encodeURIComponent('Уфа, проспект Октября, 77/2');

export const MAP_LINKS = [
  { label: 'Яндекс.Карты', href: `https://yandex.ru/maps/?text=${addrQuery}` },
  {
    label: '2ГИС',
    href: `https://2gis.ru/ufa/search/${encodeURIComponent('проспект Октября 77/2')}`,
  },
  {
    label: 'Google&nbsp;Maps',
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Уфа проспект Октября 77/2')}`,
  },
] as const;

export const MAP_EMBED = `https://yandex.ru/map-widget/v1/?text=${addrQuery}&z=15`;
