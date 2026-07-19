import { COUPLE_GENITIVE, END_ISO, GATHERING_TIME, START_ISO, VENUE } from '../data/wedding';

/* «Сохранить дату в календарь» — генерируем .ics на лету */
function initCalendar() {
  const btn = document.getElementById('ics-btn');
  if (!btn) return;

  /** Date -> формат iCalendar в UTC: 20260913T103000Z */
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  /** В iCalendar запятые внутри значения экранируются */
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1');

  btn.addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//nikita-lera//wedding//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:wedding-nikita-lera-2026-09-13@leranikita.ru',
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(new Date(START_ISO))}`,
      `DTEND:${stamp(new Date(END_ISO))}`,
      `SUMMARY:Свадьба ${COUPLE_GENITIVE}`,
      `DESCRIPTION:Сбор гостей к ${GATHERING_TIME}. Будем счастливы видеть вас рядом!`,
      `LOCATION:${esc(`${VENUE.name}, ${VENUE.street}, ${VENUE.city}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nikita-lera-13-09-2026.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    const label = btn.querySelector('span') as HTMLElement;
    const prev = label.textContent;
    btn.classList.add('done');
    label.textContent = 'дата сохранена';
    setTimeout(() => {
      btn.classList.remove('done');
      label.textContent = prev;
    }, 2600);
  });
}

initCalendar();
