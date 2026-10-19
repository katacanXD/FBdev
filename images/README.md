# Изображения для «33 ОБОРОТА»

Пока картинок нет, сайт выглядит законченным: обложки рисуются из палитры и типографики,
фотополоса — из бумажной фактуры. Как только файл появляется по нужному пути, он сам
подставляется поверх заглушки (`onerror` у `<img>` убирает битую картинку).

## 1. Обложки пластинок

Папка: `images/covers/`. Формат: JPG, **квадрат 1000 × 1000 px**, sRGB, до 300 КБ.
Это главный визуальный слой каталога — лучше подобрать реальные обложки изданий.

| Файл | Артист — альбом | Год |
|---|---|---|
| `pink-floyd-dark-side.jpg` | Pink Floyd — The Dark Side of the Moon | 1973 |
| `miles-davis-kind-of-blue.jpg` | Miles Davis — Kind of Blue | 1959 |
| `daft-punk-discovery.jpg` | Daft Punk — Discovery | 2001 |
| `nirvana-nevermind.jpg` | Nirvana — Nevermind | 1991 |
| `kendrick-lamar-gkmc.jpg` | Kendrick Lamar — good kid, m.A.A.d city | 2012 |
| `radiohead-ok-computer.jpg` | Radiohead — OK Computer | 1997 |
| `fleetwood-mac-rumours.jpg` | Fleetwood Mac — Rumours | 1977 |
| `bjork-homogenic.jpg` | Björk — Homogenic | 1997 |
| `beatles-abbey-road.jpg` | The Beatles — Abbey Road | 1969 |
| `massive-attack-mezzanine.jpg` | Massive Attack — Mezzanine | 1998 |
| `nina-simone-spell.jpg` | Nina Simone — I Put a Spell on You | 1965 |
| `aphex-twin-saw.jpg` | Aphex Twin — Selected Ambient Works 85–92 | 1992 |
| `depeche-mode-violator.jpg` | Depeche Mode — Violator | 1990 |
| `amy-winehouse-back-to-black.jpg` | Amy Winehouse — Back to Black | 2006 |
| `boards-of-canada-mhtrtc.jpg` | Boards of Canada — Music Has the Right to Children | 1998 |
| `kino-gruppa-krovi.jpg` | Кино — Группа крови | 1988 |
| `zemfira-zemfira.jpg` | Земфира — Земфира | 1999 |
| `molchat-doma-etazhi.jpg` | Молчат Дома — Этажи | 2018 |

## 2. Фотографии лавки

Папка: `images/shop/`. Формат: JPG, sRGB, горизонтальные.

| Файл | Что на фото | Пропорции |
|---|---|---|
| `crate.jpg` | Ящики с пластинками, руки перебирают конверты | 4:5 (вертикальное), 1200 × 1500 px |
| `needle.jpg` | Крупный план: игла на дорожке, видна канавка | 1:1, 800 × 800 px |
| `shelf.jpg` | Стеллаж с пластинками в зале, тёплый свет | 1:1 или 4:3, 800 × 800 px |

Совет по съёмке: тёплый свет, дерево, бумага, немного беспорядка — лавка должна выглядеть
живой, а не как шоурум.

## 3. Соцпревью

| Файл | Что это | Размер |
|---|---|---|
| `images/og-cover.jpg` | Картинка для ссылки в соцсетях и мессенджерах | 1200 × 630 px |

Содержание: обложка любой пластинки на фоне стеллажа + логотип «33 ОБОРОТА».
Путь уже прописан в `<meta property="og:image">` на главной.

## Как заменить заглушку

1. Положить файл в нужную папку с точным именем из таблицы.
2. Обновить страницу — картинка появится поверх нарисованной обложки.

Если файла нет, ничего не ломается: остаётся типографическая обложка в цветах пластинки.
