/* ==========================================================================
   33 ОБОРОТА — данные каталога
   Учебный проект: цены, состояние и наличие демонстрационные.
   Обложки: пока картинки нет, рисуется заглушка из палитры + типографики;
   когда положите файл images/covers/<id>.jpg, он подставится автоматически.
   ========================================================================== */
(function () {
  "use strict";

  var GENRES = [
    { id: "rock", label: "Рок", bg: "#13322a", fg: "#f1ede2" },
    { id: "jazz", label: "Джаз", bg: "#1b3a57", fg: "#f1ede2" },
    { id: "electronic", label: "Электроника", bg: "#e9ff5c", fg: "#17140f" },
    { id: "hiphop", label: "Хип-хоп", bg: "#ff6b35", fg: "#17140f" },
    { id: "soul", label: "Соул и фанк", bg: "#8c2f26", fg: "#f1ede2" },
    { id: "pop", label: "Поп", bg: "#a9b7a0", fg: "#17140f" }
  ];

  var BADGES = {
    new: { label: "Новый завоз", cls: "new" },
    hit: { label: "Хит полки", cls: "hit" },
    sale: { label: "Скидка", cls: "sale" },
    used: { label: "Б/у", cls: "used" }
  };

  var PRODUCTS = [
    {
      id: "pink-floyd-dark-side",
      artist: "Pink Floyd",
      title: "The Dark Side of the Moon",
      year: 1973,
      genre: "rock",
      label: "Harvest",
      price: 5900,
      oldPrice: null,
      badge: "hit",
      condition: "Новое издание, 180 г",
      format: "LP",
      country: "EU",
      cover: { bg: "#12100c", fg: "#f1ede2", accent: "#e9ff5c", pattern: 4 },
      desc:
        "Записан в Abbey Road между 1972 и 1973 годами и с тех пор не выходил из чартов. " +
        "Сорок три минуты про время, безумие и деньги — и один из самых узнаваемых конвертов в истории. " +
        "Издание на 180 граммах, с наклейкой и вкладышем с текстами.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1973",
        "Лейбл": "Harvest",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    },
    {
      id: "miles-davis-kind-of-blue",
      artist: "Miles Davis",
      title: "Kind of Blue",
      year: 1959,
      genre: "jazz",
      label: "Columbia",
      price: 4900,
      oldPrice: null,
      badge: "hit",
      condition: "Новое издание, 180 г",
      format: "LP",
      country: "EU",
      cover: { bg: "#123a5c", fg: "#f1ede2", accent: "#8fd0e8", pattern: 5 },
      desc:
        "Записан за две сессии в 1959 году — и стал точкой отсчёта для всего модального джаза. " +
        "Тишина здесь работает не хуже нот: музыканты играют не спеша, оставляя место друг другу. " +
        "Переиздание с оригинальной обложкой и внутренним конвертом.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1959",
        "Лейбл": "Columbia",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Внутренний конверт с полиэтиленом"
      }
    },
    {
      id: "daft-punk-discovery",
      artist: "Daft Punk",
      title: "Discovery",
      year: 2001,
      genre: "electronic",
      label: "Virgin",
      price: 4200,
      oldPrice: null,
      badge: "new",
      condition: "Новое издание",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#d8d2c2", fg: "#17140f", accent: "#ff6b35", pattern: 1 },
      desc:
        "Второй альбом дуэта, в котором фильтрованный фанк окончательно стал поп-музыкой. " +
        "«One More Time» и «Digital Love» звучат так, будто их придумали не люди, а сами фильтры. " +
        "Двойной винил, разворотный конверт.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "2001",
        "Лейбл": "Virgin",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "140 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "nirvana-nevermind",
      artist: "Nirvana",
      title: "Nevermind",
      year: 1991,
      genre: "rock",
      label: "DGC",
      price: 5400,
      oldPrice: 6200,
      badge: "sale",
      condition: "Новое издание, 180 г",
      format: "LP",
      country: "EU",
      cover: { bg: "#2f5f8f", fg: "#f1ede2", accent: "#f2c14e", pattern: 3 },
      desc:
        "Записан в Sound City в 1991-м и за несколько месяцев перевернул радио. " +
        "Три аккорда, грязный звук и мелодии, которые невозможно забыть. " +
        "Переиздание на 180 граммах с оригинальным конвертом.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1991",
        "Лейбл": "DGC",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    },
    {
      id: "kendrick-lamar-gkmc",
      artist: "Kendrick Lamar",
      title: "good kid, m.A.A.d city",
      year: 2012,
      genre: "hiphop",
      label: "Top Dawg / Aftermath",
      price: 4600,
      oldPrice: null,
      badge: "new",
      condition: "Новое издание",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#c9c2ae", fg: "#17140f", accent: "#17140f", pattern: 3 },
      desc:
        "История взросления в Комптоне, записанная как короткометражка: интерлюдии, разговоры, " +
        "шум вечеринки. Один из немногих рэп-альбомов, который слушают от первой до последней дорожки. " +
        "Двойной винил в разворотном конверте.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "2012",
        "Лейбл": "Top Dawg / Aftermath",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "140 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "radiohead-ok-computer",
      artist: "Radiohead",
      title: "OK Computer",
      year: 1997,
      genre: "rock",
      label: "Parlophone",
      price: 5200,
      oldPrice: null,
      badge: null,
      condition: "Новое издание, 180 г",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#e3ded2", fg: "#17140f", accent: "#5a7fd4", pattern: 4 },
      desc:
        "Альбом о том, как техника и тревога проникают в частную жизнь, — и, кажется, " +
        "за двадцать пять лет он только точнее попал в цель. Записан в особняке в Сомерсете " +
        "и в Abbey Road. Двойной винил, ремастер.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "1997",
        "Лейбл": "Parlophone",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "fleetwood-mac-rumours",
      artist: "Fleetwood Mac",
      title: "Rumours",
      year: 1977,
      genre: "rock",
      label: "Warner Bros.",
      price: 4400,
      oldPrice: null,
      badge: "used",
      condition: "Б/у, VG+",
      format: "LP",
      country: "US",
      cover: { bg: "#efe8d8", fg: "#17140f", accent: "#a9b7a0", pattern: 5 },
      desc:
        "Пластинка, записанная группой, которая распадалась прямо в студии: " +
        "пять человек пишут песни о расставаниях друг с другом. " +
        "Наш экземпляр — американский первопресс, конверт с лёгкими потёртостями по углам.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1977",
        "Лейбл": "Warner Bros.",
        "Страна": "США",
        "Состояние": "Б/у, VG+ (проверено иглой)",
        "Вес": "120 г",
        "Вкладыш": "Оригинальный внутренний конверт"
      }
    },
    {
      id: "bjork-homogenic",
      artist: "Björk",
      title: "Homogenic",
      year: 1997,
      genre: "electronic",
      label: "One Little Indian",
      price: 4700,
      oldPrice: null,
      badge: null,
      condition: "Новое издание",
      format: "LP",
      country: "EU",
      cover: { bg: "#dcd6c8", fg: "#17140f", accent: "#b3a7c9", pattern: 2 },
      desc:
        "Струнные, которые звучат как вулканическая порода, и биты, собранные из всего подряд. " +
        "Альбом, где поп-форма выдержала вес эксперимента. " +
        "Переиздание с оригинальным конвертом.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1997",
        "Лейбл": "One Little Indian",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    },
    {
      id: "beatles-abbey-road",
      artist: "The Beatles",
      title: "Abbey Road",
      year: 1969,
      genre: "rock",
      label: "Apple",
      price: 6500,
      oldPrice: null,
      badge: "used",
      condition: "Б/у, VG+",
      format: "LP",
      country: "UK",
      cover: { bg: "#e8e2d2", fg: "#17140f", accent: "#8d9a86", pattern: 4 },
      desc:
        "Последний альбом, который группа записала вместе, — и, пожалуй, самый аккуратный. " +
        "Вторая сторона почти без пауз: попурри, которое собирается в целое. " +
        "Британский пресс, обложка с потёртостями, пластинка проверена.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1969",
        "Лейбл": "Apple",
        "Страна": "Великобритания",
        "Состояние": "Б/у, VG+ (проверено иглой)",
        "Вес": "120 г",
        "Вкладыш": "Оригинальный внутренний конверт"
      }
    },
    {
      id: "massive-attack-mezzanine",
      artist: "Massive Attack",
      title: "Mezzanine",
      year: 1998,
      genre: "electronic",
      label: "Virgin",
      price: 4300,
      oldPrice: null,
      badge: null,
      condition: "Новое издание, 180 г",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#17140f", fg: "#f1ede2", accent: "#7f8f6a", pattern: 2 },
      desc:
        "Самый тёмный альбом трип-хопа: бас на грани инфразвука, гитары, которые звучат как " +
        "ржавчина, и голоса, записанные будто через стену. Слушать громко и в темноте. " +
        "Двойной винил, ремастер.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "1998",
        "Лейбл": "Virgin",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "nina-simone-spell",
      artist: "Nina Simone",
      title: "I Put a Spell on You",
      year: 1965,
      genre: "soul",
      label: "Philips",
      price: 3800,
      oldPrice: null,
      badge: "used",
      condition: "Б/у, VG+",
      format: "LP",
      country: "US",
      cover: { bg: "#4a1f1a", fg: "#f1ede2", accent: "#e9b44c", pattern: 1 },
      desc:
        "Голос, который не просит внимания, а забирает его. Здесь и заглавная вещь Скримина Джея Хокинса, " +
        "и «Feeling Good», и баллады, в которых Нина Симона звучит как целый оркестр. " +
        "Американский пресс, конверт с потёртостями.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1965",
        "Лейбл": "Philips",
        "Страна": "США",
        "Состояние": "Б/у, VG+ (проверено иглой)",
        "Вес": "120 г",
        "Вкладыш": "Оригинальный внутренний конверт"
      }
    },
    {
      id: "aphex-twin-saw",
      artist: "Aphex Twin",
      title: "Selected Ambient Works 85–92",
      year: 1992,
      genre: "electronic",
      label: "Apollo / R&S",
      price: 4500,
      oldPrice: null,
      badge: null,
      condition: "Новое издание",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#1d2b2b", fg: "#d9e6e0", accent: "#9fe0c8", pattern: 3 },
      desc:
        "Сборник, собранный из кассет, записанных Ричардом Д. Джеймсом в конце восьмидесятых. " +
        "Эмбиент, который не усыпляет, а держит в напряжении. " +
        "Двойной винил, ремастер с оригинальных плёнок.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "1992",
        "Лейбл": "Apollo / R&S",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "depeche-mode-violator",
      artist: "Depeche Mode",
      title: "Violator",
      year: 1990,
      genre: "electronic",
      label: "Mute",
      price: 4100,
      oldPrice: null,
      badge: "hit",
      condition: "Новое издание, 180 г",
      format: "LP",
      country: "EU",
      cover: { bg: "#1a1a1a", fg: "#e9e2d0", accent: "#ff6b35", pattern: 5 },
      desc:
        "Альбом, на котором синтезаторы окончательно перестали быть «электроникой для своих». " +
        "«Personal Jesus» и «Enjoy the Silence» — по-прежнему самые точные песни о желании. " +
        "Переиздание на 180 граммах.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1990",
        "Лейбл": "Mute",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    },
    {
      id: "amy-winehouse-back-to-black",
      artist: "Amy Winehouse",
      title: "Back to Black",
      year: 2006,
      genre: "soul",
      label: "Island",
      price: 4800,
      oldPrice: 5600,
      badge: "sale",
      condition: "Новое издание, 180 г",
      format: "LP",
      country: "EU",
      cover: { bg: "#17140f", fg: "#f1ede2", accent: "#c9a227", pattern: 2 },
      desc:
        "Соул, записанный так, будто микрофоны ещё ламповые, а оркестр сидит в той же комнате. " +
        "Голос Эми Уайнхаус здесь — главный инструмент, и он не щадит ни её, ни слушателя. " +
        "Переиздание на 180 граммах.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "2006",
        "Лейбл": "Island",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    },
    {
      id: "boards-of-canada-mhtrtc",
      artist: "Boards of Canada",
      title: "Music Has the Right to Children",
      year: 1998,
      genre: "electronic",
      label: "Warp",
      price: 4600,
      oldPrice: null,
      badge: "new",
      condition: "Новое издание",
      format: "2×LP",
      country: "EU",
      cover: { bg: "#d9d2bd", fg: "#17140f", accent: "#6f8f7a", pattern: 1 },
      desc:
        "Плёночные синтезаторы, детские голоса и шум, который кажется воспоминанием. " +
        "Альбом-настроение, после которого сложно включить что-то другое. " +
        "Двойной винил, ремастер.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "1998",
        "Лейбл": "Warp",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "kino-gruppa-krovi",
      artist: "Кино",
      title: "Группа крови",
      year: 1988,
      genre: "rock",
      label: "Мелодия",
      price: 3600,
      oldPrice: 4200,
      badge: "sale",
      condition: "Б/у, VG+",
      format: "LP",
      country: "USSR",
      cover: { bg: "#8c2f26", fg: "#f1ede2", accent: "#e9ff5c", pattern: 4 },
      desc:
        "Записан в 1987-м, вышел в 1988-м — и стал пластинкой, которую в стране слушали " +
        "переписанной с кассеты на кассету. Витя Цой поёт о войне, крови и надежде без пафоса. " +
        "Советский пресс, конверт с потёртостями.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "1988",
        "Лейбл": "Мелодия",
        "Страна": "СССР",
        "Состояние": "Б/у, VG+ (проверено иглой)",
        "Вес": "120 г",
        "Вкладыш": "Оригинальный внутренний конверт"
      }
    },
    {
      id: "zemfira-zemfira",
      artist: "Земфира",
      title: "Земфира",
      year: 1999,
      genre: "pop",
      label: "REAL Records",
      price: 3900,
      oldPrice: null,
      badge: "new",
      condition: "Новое издание",
      format: "2×LP",
      country: "RU",
      cover: { bg: "#c3b9a6", fg: "#17140f", accent: "#d94f3d", pattern: 5 },
      desc:
        "Дебютный альбом, который в 1999-м звучал как письмо из другого города. " +
        "Гитарный поп без глянца, с текстами, которые цитируют до сих пор. " +
        "Первое виниловое переиздание, двойной конверт.",
      specs: {
        "Формат": "2×LP, 33⅓ об/мин",
        "Год выпуска": "1999",
        "Лейбл": "REAL Records",
        "Страна": "Россия",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Разворотный конверт"
      }
    },
    {
      id: "molchat-doma-etazhi",
      artist: "Молчат Дома",
      title: "Этажи",
      year: 2018,
      genre: "rock",
      label: "Sacred Bones",
      price: 3700,
      oldPrice: null,
      badge: "new",
      condition: "Новое издание",
      format: "LP",
      country: "EU",
      cover: { bg: "#cfc9b8", fg: "#17140f", accent: "#17140f", pattern: 2 },
      desc:
        "Пост-панк из Минска, записанный на домашней технике: холодные драм-машины, " +
        "бас вперёд и голос, который скорее выдыхает слова, чем поёт их. " +
        "Международное переиздание на виниле.",
      specs: {
        "Формат": "LP, 33⅓ об/мин",
        "Год выпуска": "2018",
        "Лейбл": "Sacred Bones",
        "Страна": "Евросоюз",
        "Состояние": "Новое, запечатано",
        "Вес": "180 г",
        "Вкладыш": "Есть, с текстами"
      }
    }
  ];

  // Обложка: если файла нет, остаётся нарисованная заглушка.
  PRODUCTS.forEach(function (p) {
    p.coverImage = "images/covers/" + p.id + ".jpg";
    p.url = "product.html?id=" + encodeURIComponent(p.id);
  });

  var byId = {};
  PRODUCTS.forEach(function (p) {
    byId[p.id] = p;
  });

  function genreLabel(id) {
    for (var i = 0; i < GENRES.length; i++) {
      if (GENRES[i].id === id) return GENRES[i].label;
    }
    return "Разное";
  }

  function genreColor(id) {
    for (var i = 0; i < GENRES.length; i++) {
      if (GENRES[i].id === id) return GENRES[i];
    }
    return { id: id, label: "Разное", bg: "#e6e0d1", fg: "#17140f" };
  }

  function countByGenre() {
    var counts = {};
    GENRES.forEach(function (g) {
      counts[g.id] = 0;
    });
    PRODUCTS.forEach(function (p) {
      counts[p.genre] = (counts[p.genre] || 0) + 1;
    });
    return counts;
  }

  window.ShopData = {
    GENRES: GENRES,
    BADGES: BADGES,
    PRODUCTS: PRODUCTS,
    byId: byId,
    genreLabel: genreLabel,
    genreColor: genreColor,
    countByGenre: countByGenre
  };
})();
