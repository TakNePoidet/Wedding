#!/usr/bin/env python3
"""Пересборка шрифтов сайта.

Забирает woff2 из Google Fonts, оставляет только нужные подмножества,
подрезает их под алфавиты и раскладывает в public/fonts/.
Заодно печатает блок @font-face, который идёт в src/styles/fonts.css.

Зачем: шрифты со своего домена не тянут за собой два лишних соединения
к чужим доменам на критическом пути, а подрезка убирает больше трети веса.

Запуск (нужны fonttools и brotli):

    pip install fonttools brotli
    python3 scripts/fonts.py

Меняете набор начертаний — правьте URL ниже. Он должен совпадать с тем,
что реально применяется на странице: проверить можно, пройдя по
вычисленным стилям всех элементов в консоли браузера.
"""

import os
import re
import shutil
import tempfile
import urllib.request

# Начертания ровно те, что применяются на сайте. У Playfair Display нет 600
# и курсива — они не встречаются нигде.
CSS_URL = (
    'https://fonts.googleapis.com/css2?'
    'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500'
    '&family=Lora:ital,wght@0,400;0,500;1,400'
    '&family=Marck+Script'
    '&family=Playfair+Display:wght@400;500'
    '&display=swap'
)

# Сайт русский; латиница нужна для цифр, «Afterparty» и «P.S.».
# Вьетнамское, математическое и расширенные подмножества выброшены.
KEEP_SUBSETS = {'cyrillic', 'latin'}

# Подрезаем под ПОЛНЫЕ алфавиты, а не под текст страницы: в форме RSVP
# гость печатает своё имя и пожелание, там может встретиться любая буква.
CYRILLIC = ''.join(chr(c) for c in range(0x0410, 0x0450)) + 'Ёё'
LATIN = ''.join(chr(c) for c in range(0x41, 0x5B)) + ''.join(chr(c) for c in range(0x61, 0x7B))
DIGITS = '0123456789'
PUNCT = ' .,:;!?—–-…«»“”\'’()[]/&@#№%+=*·°"'
CHARS = CYRILLIC + LATIN + DIGITS + PUNCT

UA = (
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
    '(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
)
OUT_DIR = 'public/fonts'


def main() -> None:
    from fontTools import subset

    css = urllib.request.urlopen(
        urllib.request.Request(CSS_URL, headers={'User-Agent': UA})
    ).read().decode()

    blocks = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})', css)
    os.makedirs(OUT_DIR, exist_ok=True)

    faces, before, after = [], 0, 0
    with tempfile.TemporaryDirectory() as tmp:
        for sub, block in blocks:
            if sub not in KEEP_SUBSETS:
                continue
            url = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
            family = re.search(r"font-family:\s*'([^']+)'", block).group(1)
            weight = re.search(r'font-weight:\s*(\d+)', block).group(1)
            style = re.search(r'font-style:\s*(\w+)', block).group(1)

            name = f"{family.lower().replace(' ', '-')}-{weight}{'i' if style == 'italic' else ''}-{sub}.woff2"
            raw = os.path.join(tmp, name)
            with open(raw, 'wb') as fh:
                fh.write(urllib.request.urlopen(url).read())
            before += os.path.getsize(raw)

            dest = os.path.join(OUT_DIR, name)
            subset.main([
                raw,
                f'--text={CHARS}',
                '--layout-features=kern,liga,calt,onum,tnum',
                '--flavor=woff2',
                f'--output-file={dest}',
                '--no-hinting',
                '--desubroutinize',
                '--drop-tables+=DSIG',
            ])
            after += os.path.getsize(dest)
            faces.append(block.replace(url, f'/fonts/{name}'))

    print(f'\nфайлов: {len(faces)}   {before / 1024:.0f} КБ → {after / 1024:.0f} КБ '
          f'(минус {100 - after / before * 100:.0f}%)')
    print(f'\nБлок @font-face для src/styles/fonts.css записан в {OUT_DIR}/_faces.css')
    with open(os.path.join(OUT_DIR, '_faces.css'), 'w') as fh:
        fh.write('\n'.join(faces) + '\n')
    print('\nПосле замены проверьте страницу: «квадратиков» вместо букв быть не должно.')


if __name__ == '__main__':
    main()
