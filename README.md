# Свадебный сайт · Никита и Лера

Одностраничное приглашение на свадьбу **13 сентября 2026**, ресторан «Лебединое озеро»
(ПКиО им. М. Гафури, проспект Октября, 77/2, Уфа).

Собран на [Astro](https://astro.build) и [Tailwind](https://tailwindcss.com) — статика,
без UI-фреймворков и клиентских библиотек.

## Запуск

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

| Команда | Что делает |
|---------|-----------|
| `pnpm dev` | локальный сервер с горячей перезагрузкой |
| `pnpm build` | сборка в `dist/` |
| `pnpm preview` | посмотреть собранное |
| `pnpm check` | проверка типов в `.astro` и `.ts` |

## Структура

```
src/
  data/wedding.ts     ← все данные свадьбы в одном месте
  pages/index.astro   ← порядок секций
  layouts/Base.astro  ← <head>, мета, Open Graph, schema.org
  components/         ← по компоненту на секцию
  scripts/            ← по модулю на поведение (таймер, RSVP, reveal…)
  styles/theme.css    ← дизайн-система: палитра, шрифты, шкалы кегля и отступов
  styles/             ← остальное — только невыразимое утилитами (градиенты,
                        кейфреймы, классы состояний из JS)
public/               ← картинки, CNAME, robots.txt — копируются как есть
worker/               ← приёмник RSVP-заявок (Cloudflare), деплоится отдельно
```

## Что нужно заменить перед публикацией

Почти всё правится в **`src/data/wedding.ts`**:

1. **Адрес приёмника заявок** — `RSVP_ENDPOINT`. Форма отправляет ответ гостя
   в воркер из `worker/`, тот пересылает его в Телеграм. Как поднять воркер
   и получить адрес — в [worker/README.md](worker/README.md).
   Пока строка пустая, форма просит гостя написать организатору.

2. **Срок ответа RSVP** — `RSVP_DEADLINE`.

3. **Точка на карте** (по желанию) — сейчас метка ставится по адресу. Для точной точки
   возьмите ссылку в [Яндекс.Конструкторе карт](https://yandex.ru/map-constructor/)
   и подставьте в `MAP_EMBED`.

## Публикация

Деплой автоматический: пуш в `main` запускает `.github/workflows/deploy-pages.yml`
(проверка типов → сборка → публикация `dist/`). Вручную: Actions → Deploy to GitHub Pages
→ Run workflow. Сайт — [leranikita.ru](https://leranikita.ru).

Если Actions не смог включить Pages сам, включите один раз вручную:
**Settings → Pages → Source: GitHub Actions** — и перезапустите workflow.

## Шрифты

`Marck Script`, `Cormorant Garamond`, `Lora`, `Playfair Display` — подключаются с Google Fonts
(все поддерживают кириллицу). При недоступности сети подставляются системные serif/sans —
вёрстка не ломается.
