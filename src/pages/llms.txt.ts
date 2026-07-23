import type { APIRoute } from 'astro';
import {
  COUPLE,
  COUPLE_GENITIVE,
  DATE_LONG,
  DATE_WEEKDAY,
  GATHERING_TIME,
  ORGANIZER,
  RSVP_DEADLINE,
  SITE_URL,
  TIMELINE,
  VENUE,
} from '../data/wedding';

/**
 * llms.txt — краткая выжимка о свадьбе для языковых моделей.
 *
 * Собирается из wedding.ts, а не лежит статикой в public/: иначе при
 * переносе даты файл продолжил бы называть старую, и это заметили бы
 * не сразу — его никто не открывает глазами.
 */
export const GET: APIRoute = () => {
  const timeline = TIMELINE.map(
    (t) => `- ${t.h}${t.m} — ${strip(t.title)}${'note' in t && t.note ? `: ${strip(t.note)}` : ''}`,
  ).join('\n');

  const body = `# ${COUPLE} — свадьба ${DATE_LONG}

> Сайт-приглашение на свадьбу ${COUPLE_GENITIVE}. ${DATE_LONG}, ${DATE_WEEKDAY}, ${VENUE.city}.
> Одна страница: программа дня, дресс-код, как добраться и форма подтверждения.

## Коротко

- Дата: ${DATE_LONG}, ${DATE_WEEKDAY}
- Сбор гостей: к ${GATHERING_TIME}
- Место: ${VENUE.name}, ${VENUE.street}, ${VENUE.city}
- Подтвердить присутствие: до ${RSVP_DEADLINE}
- Организатор: ${ORGANIZER.name}, ${ORGANIZER.agency}, ${ORGANIZER.telPretty}

## Программа дня

${timeline}

## Просьбы к гостям

- Вечер для взрослых: малышей до школьного возраста лучше оставить дома.
- Вместо букета — три цветка: один про жениха, один про невесту, один про обоих.
  Из них собирают убранство столов.
- Фотографиями делятся в общем чате, QR-код на него будет на площадке.

## Разделы

- [Приглашение](${SITE_URL}/#invite)
- [Программа дня](${SITE_URL}/#program)
- [Коротко о главном](${SITE_URL}/#details)
- [Дресс-код](${SITE_URL}/#dress)
- [Подтверждение присутствия](${SITE_URL}/#rsvp)
- [Как нас найти](${SITE_URL}/#map)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

/** В данных живут HTML-сущности вроде &nbsp; — в текстовом файле им не место */
function strip(s: string): string {
  return s.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '');
}
