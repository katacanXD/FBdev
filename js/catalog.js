/* ==========================================================================
   33 ОБОРОТА — каталог
   Фильтры (поиск, жанр, десятилетие, цена, состояние, избранное),
   сортировка, подгрузка по кнопке, синхронизация с адресной строкой.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ShopData;
  var S = window.Store;
  var UI = window.ShopUI;

  var PAGE = 8;
  var PRICE_MAX = 7000;
  var PRICE_MIN = 3000;

  var state = {
    q: "",
    genres: [],
    decades: [],
    max: PRICE_MAX,
    condition: "all",
    badge: "",
    wishOnly: false,
    sort: "featured",
    visible: PAGE
  };

  var els = {};

  function plural(n, forms) {
    var abs = Math.abs(n) % 100;
    var last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  /* ---------- разбор адреса ---------- */
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.q = params.get("q") || "";
    state.genres = (params.get("genre") || "").split(",").filter(Boolean);
    state.decades = (params.get("decade") || "")
      .split(",")
      .filter(Boolean)
      .map(Number);
    state.max = Number(params.get("max")) || PRICE_MAX;
    state.condition = params.get("condition") || "all";
    state.badge = params.get("badge") || "";
    state.wishOnly = params.get("view") === "wishlist";
    state.sort = params.get("sort") || "featured";
  }

  function writeUrl() {
    var params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.genres.length) params.set("genre", state.genres.join(","));
    if (state.decades.length) params.set("decade", state.decades.join(","));
    if (state.max < PRICE_MAX) params.set("max", state.max);
    if (state.condition !== "all") params.set("condition", state.condition);
    if (state.badge) params.set("badge", state.badge);
    if (state.wishOnly) params.set("view", "wishlist");
    if (state.sort !== "featured") params.set("sort", state.sort);

    var query = params.toString();
    var url = window.location.pathname + (query ? "?" + query : "");
    window.history.replaceState(null, "", url);
  }

  /* ---------- фильтрация ---------- */
  function isUsed(p) {
    return p.condition.indexOf("Б/у") === 0;
  }

  function filtered() {
    var query = state.q.trim().toLowerCase();
    return D.PRODUCTS.filter(function (p) {
      if (query) {
        var hay = (
          p.artist + " " + p.title + " " + D.genreLabel(p.genre) + " " +
          p.year + " " + p.label + " " + p.format
        ).toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      if (state.genres.length && state.genres.indexOf(p.genre) === -1) return false;
      if (state.decades.length) {
        var decade = Math.floor(p.year / 10) * 10;
        if (state.decades.indexOf(decade) === -1) return false;
      }
      if (p.price > state.max) return false;
      if (state.condition === "new" && isUsed(p)) return false;
      if (state.condition === "used" && !isUsed(p)) return false;
      if (state.badge && p.badge !== state.badge) return false;
      if (state.wishOnly && !S.inWishlist(p.id)) return false;
      return true;
    });
  }

  function sorted(list) {
    var copy = list.slice();
    switch (state.sort) {
      case "price-asc":
        return copy.sort(function (a, b) {
          return a.price - b.price;
        });
      case "price-desc":
        return copy.sort(function (a, b) {
          return b.price - a.price;
        });
      case "year-desc":
        return copy.sort(function (a, b) {
          return b.year - a.year;
        });
      case "year-asc":
        return copy.sort(function (a, b) {
          return a.year - b.year;
        });
      case "artist":
        return copy.sort(function (a, b) {
          return a.artist.localeCompare(b.artist, "ru");
        });
      default:
        return copy;
    }
  }

  /* ---------- контролы ---------- */
  function renderGenreFilter() {
    var host = document.getElementById("genreFilter");
    if (!host) return;
    var counts = D.countByGenre();
    host.innerHTML = D.GENRES.map(function (g) {
      return (
        '<label class="filter-check">' +
        '<span class="filter-check__label">' +
        '<input class="form-check-input" type="checkbox" name="genre" value="' + g.id + '">' +
        UI.esc(g.label) + "</span>" +
        '<span class="filter-check__count">' + (counts[g.id] || 0) + "</span>" +
        "</label>"
      );
    }).join("");
  }

  function renderDecadeFilter() {
    var host = document.getElementById("decadeFilter");
    if (!host) return;
    var counts = {};
    D.PRODUCTS.forEach(function (p) {
      var decade = Math.floor(p.year / 10) * 10;
      counts[decade] = (counts[decade] || 0) + 1;
    });
    var decades = Object.keys(counts)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });

    host.innerHTML = decades
      .map(function (decade) {
        return (
          '<label class="filter-check">' +
          '<span class="filter-check__label">' +
          '<input class="form-check-input" type="checkbox" name="decade" value="' + decade + '">' +
          decade + "‑е</span>" +
          '<span class="filter-check__count">' + counts[decade] + "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  function syncControls() {
    if (els.search) els.search.value = state.q;
    if (els.sort) els.sort.value = state.sort;
    if (els.price) {
      els.price.value = state.max;
      els.priceOut.textContent = UI.money(state.max);
    }
    if (els.wishOnly) els.wishOnly.checked = state.wishOnly;

    if (els.form) {
      Array.prototype.forEach.call(
        els.form.querySelectorAll('input[name="genre"]'),
        function (input) {
          input.checked = state.genres.indexOf(input.value) !== -1;
        }
      );
      Array.prototype.forEach.call(
        els.form.querySelectorAll('input[name="decade"]'),
        function (input) {
          input.checked = state.decades.indexOf(Number(input.value)) !== -1;
        }
      );
      Array.prototype.forEach.call(
        els.form.querySelectorAll('input[name="condition"]'),
        function (input) {
          input.checked = input.value === state.condition;
        }
      );
    }
  }

  function activeFilterCount() {
    var n = 0;
    if (state.q) n += 1;
    n += state.genres.length;
    n += state.decades.length;
    if (state.max < PRICE_MAX) n += 1;
    if (state.condition !== "all") n += 1;
    if (state.badge) n += 1;
    if (state.wishOnly) n += 1;
    return n;
  }

  function renderChips() {
    var host = document.getElementById("activeChips");
    if (!host) return;
    var chips = [];

    if (state.q) {
      chips.push(
        '<span class="chip">Поиск: «' + UI.esc(state.q) + '»' +
        '<button type="button" data-chip="q" aria-label="Убрать поиск">×</button></span>'
      );
    }
    state.genres.forEach(function (id) {
      chips.push(
        '<span class="chip">' + UI.esc(D.genreLabel(id)) +
        '<button type="button" data-chip="genre" data-value="' + id + '" aria-label="Убрать жанр">×</button></span>'
      );
    });
    state.decades.forEach(function (decade) {
      chips.push(
        '<span class="chip">' + decade + "‑е" +
        '<button type="button" data-chip="decade" data-value="' + decade + '" aria-label="Убрать десятилетие">×</button></span>'
      );
    });
    if (state.max < PRICE_MAX) {
      chips.push(
        '<span class="chip">до ' + UI.money(state.max) +
        '<button type="button" data-chip="max" aria-label="Убрать ограничение цены">×</button></span>'
      );
    }
    if (state.condition !== "all") {
      chips.push(
        '<span class="chip">' + (state.condition === "used" ? "Б/у" : "Новое") +
        '<button type="button" data-chip="condition" aria-label="Убрать состояние">×</button></span>'
      );
    }
    if (state.badge) {
      var label = (D.BADGES[state.badge] || {}).label || state.badge;
      chips.push(
        '<span class="chip">' + UI.esc(label) +
        '<button type="button" data-chip="badge" aria-label="Убрать метку">×</button></span>'
      );
    }
    if (state.wishOnly) {
      chips.push(
        '<span class="chip">Избранное' +
        '<button type="button" data-chip="wish" aria-label="Показать всё">×</button></span>'
      );
    }

    if (chips.length > 1) {
      chips.push('<button type="button" class="chip chip--reset" data-chip="all">Сбросить всё</button>');
    }

    host.innerHTML = chips.join("");
  }

  function render() {
    var list = sorted(filtered());
    var total = list.length;
    var shown = list.slice(0, state.visible);

    UI.renderCards(shown, els.grid, "col-6 col-lg-6 col-xl-4");

    // счётчики
    Array.prototype.forEach.call(document.querySelectorAll("[data-result-count]"), function (el) {
      el.textContent = total;
    });
    if (els.pageCount) {
      els.pageCount.innerHTML =
        "<b>" + total + "</b> " + plural(total, ["позиция", "позиции", "позиций"]);
    }
    if (els.resultLine) {
      els.resultLine.innerHTML =
        "<b>" + total + "</b> " + plural(total, ["пластинка", "пластинки", "пластинок"]);
    }
    var filterBadge = document.querySelector("[data-filter-count]");
    if (filterBadge) {
      var n = activeFilterCount();
      filterBadge.textContent = n ? "(" + n + ")" : "";
    }

    renderChips();
    writeUrl();

    // пусто / не пусто
    if (els.empty) {
      var isEmpty = total === 0;
      els.empty.hidden = !isEmpty;
      els.grid.hidden = isEmpty;
      if (isEmpty && els.emptyText) {
        els.emptyText.textContent = state.wishOnly
          ? "В избранном пока пусто. Нажмите на сердечко у пластинки, чтобы сохранить её здесь."
          : "По выбранным фильтрам ничего не нашлось. Попробуйте расширить диапазон цены или снять пару галочек.";
      }
    }

    // подгрузка
    if (els.loadMore) {
      var hasMore = total > state.visible;
      els.loadMore.hidden = !hasMore;
      if (hasMore && els.loadMoreHint) {
        els.loadMoreHint.textContent = "Показано " + shown.length + " из " + total;
      }
    }
  }

  function resetAll() {
    state.q = "";
    state.genres = [];
    state.decades = [];
    state.max = PRICE_MAX;
    state.condition = "all";
    state.badge = "";
    state.wishOnly = false;
    state.sort = "featured";
    state.visible = PAGE;
    syncControls();
    render();
  }

  /* ---------- события ---------- */
  function bind() {
    els.search = document.getElementById("filterSearch");
    els.sort = document.getElementById("sortSelect");
    els.price = document.getElementById("priceMax");
    els.priceOut = document.getElementById("priceMaxOut");
    els.wishOnly = document.getElementById("wishOnly");
    els.form = document.getElementById("filterForm");
    els.grid = document.getElementById("catalogGrid");
    els.empty = document.getElementById("emptyState");
    els.emptyText = document.getElementById("emptyText");
    els.loadMore = document.getElementById("loadMoreWrap");
    els.loadMoreHint = document.getElementById("loadMoreHint");
    els.pageCount = document.getElementById("pageCount");
    els.resultLine = document.getElementById("resultLine");

    if (els.search) {
      els.search.addEventListener(
        "input",
        debounce(function () {
          state.q = els.search.value;
          state.visible = PAGE;
          render();
        }, 180)
      );
    }

    if (els.form) {
      els.form.addEventListener("change", function (event) {
        var input = event.target;
        if (input.name === "genre") {
          state.genres = Array.prototype.filter
            .call(els.form.querySelectorAll('input[name="genre"]:checked'), function (el) {
              return el.value;
            })
            .map(function (el) {
              return el.value;
            });
        }
        if (input.name === "decade") {
          state.decades = Array.prototype.filter
            .call(els.form.querySelectorAll('input[name="decade"]:checked'), function (el) {
              return el.value;
            })
            .map(function (el) {
              return Number(el.value);
            });
        }
        if (input.name === "condition") {
          state.condition = input.value;
        }
        if (input.id === "wishOnly") {
          state.wishOnly = input.checked;
        }
        state.visible = PAGE;
        render();
      });
    }

    if (els.price) {
      els.price.addEventListener("input", function () {
        state.max = Number(els.price.value);
        els.priceOut.textContent = UI.money(state.max);
        state.visible = PAGE;
        render();
      });
    }

    if (els.sort) {
      els.sort.addEventListener("change", function () {
        state.sort = els.sort.value;
        state.visible = PAGE;
        render();
      });
    }

    var loadBtn = document.getElementById("loadMoreBtn");
    if (loadBtn) {
      loadBtn.addEventListener("click", function () {
        state.visible += PAGE;
        render();
      });
    }

    var resetBtn = document.getElementById("filterReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function (event) {
        event.preventDefault();
        resetAll();
      });
    }

    var emptyReset = document.getElementById("emptyReset");
    if (emptyReset) {
      emptyReset.addEventListener("click", resetAll);
    }

    var chips = document.getElementById("activeChips");
    if (chips) {
      chips.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-chip]");
        if (!btn) return;
        var type = btn.getAttribute("data-chip");
        var value = btn.getAttribute("data-value");

        if (type === "q") state.q = "";
        if (type === "genre") {
          state.genres = state.genres.filter(function (id) {
            return id !== value;
          });
        }
        if (type === "decade") {
          state.decades = state.decades.filter(function (d) {
            return d !== Number(value);
          });
        }
        if (type === "max") state.max = PRICE_MAX;
        if (type === "condition") state.condition = "all";
        if (type === "badge") state.badge = "";
        if (type === "wish") state.wishOnly = false;
        if (type === "all") {
          resetAll();
          return;
        }
        state.visible = PAGE;
        syncControls();
        render();
      });
    }

    document.addEventListener("shop:change", function (event) {
      if (event.detail && event.detail.type === "wishlist" && state.wishOnly) {
        render();
      }
    });
  }

  function init() {
    readUrl();
    renderGenreFilter();
    renderDecadeFilter();
    bind();
    syncControls();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
