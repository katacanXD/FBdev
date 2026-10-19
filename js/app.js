/* ==========================================================================
   33 ОБОРОТА — общий слой интерфейса
   Карточки, корзина-оффканвас, быстрый просмотр, поиск, тосты,
   вертушка в hero, анимации появления.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ShopData;
  var S = window.Store;
  var FREE_SHIPPING = 5000;

  /* ---------- утилиты ---------- */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function money(value) {
    return S.money(value);
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function icon(name) {
    var paths = {
      cart:
        '<path d="M3 4h2.2l2.2 10.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 2-1.6L20.5 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19.2" r="1.4" fill="currentColor"/><circle cx="17.5" cy="19.2" r="1.4" fill="currentColor"/>',
      search:
        '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
      heart:
        '<path d="M12 20.3S4 15.6 4 10.3A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 8 2.5c0 5.3-8 10-8 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
      plus:
        '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      trash:
        '<path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.8 12.2h9.4L17.5 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      check:
        '<path d="m4.5 12.5 5 5 10-11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      truck:
        '<path d="M2.5 6.5h10.5v9H2.5zM13 9.5h4l3.5 3.5v2.5H13z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="17.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
      shield:
        '<path d="M12 3.2 19 6v5.6c0 4.3-3 7.4-7 9.2-4-1.8-7-4.9-7-9.2V6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m9 12 2.2 2.2L15.4 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
      needle:
        '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" fill="none" stroke="currentColor" stroke-width="1.2"/>',
      arrow:
        '<path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
      close:
        '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
    };
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (paths[name] || "") +
      "</svg>"
    );
  }

  /* ---------- обложка ---------- */
  function cover(p, cls) {
    var c = p.cover;
    return (
      '<div class="cover ' + (cls || "") + '" data-pattern="' + c.pattern + '"' +
      ' style="--cover-bg:' + c.bg + ";--cover-fg:" + c.fg + ";--cover-accent:" + c.accent + '">' +
      '<img class="cover__img" src="' + esc(p.coverImage) + '" alt="Обложка: ' +
      esc(p.artist) + " — " + esc(p.title) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
      '<div class="cover__art" aria-hidden="true">' +
      '<span class="cover__artist">' + esc(p.artist) + "</span>" +
      '<span class="cover__title">' + esc(p.title) + "</span>" +
      '<span class="cover__tag">' + esc(p.format) + " · " + p.year + "</span>" +
      "</div></div>"
    );
  }

  function badges(p) {
    var out = "";
    if (p.badge && D.BADGES[p.badge]) {
      var b = D.BADGES[p.badge];
      out += '<span class="rec__badge rec__badge--' + b.cls + '">' + esc(b.label) + "</span>";
    }
    if (p.oldPrice) {
      var off = Math.round((1 - p.price / p.oldPrice) * 100);
      out += '<span class="rec__badge rec__badge--sale">−' + off + "%</span>";
    }
    return out ? '<div class="rec__badges">' + out + "</div>" : "";
  }

  function wishButton(p, extraClass) {
    var active = S.inWishlist(p.id);
    return (
      '<button type="button" class="rec__wish' + (active ? " is-active" : "") + (extraClass ? " " + extraClass : "") +
      '" data-wish="' + esc(p.id) + '" aria-pressed="' + (active ? "true" : "false") +
      '" aria-label="' + (active ? "Убрать из избранного" : "Добавить в избранное") + '">' +
      icon("heart") + "</button>"
    );
  }

  /* ---------- карточка товара ---------- */
  function card(p) {
    return (
      '<article class="rec" data-product="' + esc(p.id) + '">' +
      '<a class="rec__media" href="' + esc(p.url) + '" aria-label="' +
      esc(p.artist) + " — " + esc(p.title) + ", " + p.year + '">' +
      cover(p) +
      badges(p) +
      "</a>" +
      wishButton(p) +
      '<button type="button" class="rec__quick" data-quick="' + esc(p.id) + '">Быстрый просмотр</button>' +
      '<div class="rec__body">' +
      '<p class="rec__artist">' + esc(p.artist) + "</p>" +
      '<h3 class="rec__title"><a href="' + esc(p.url) + '">' + esc(p.title) + "</a></h3>" +
      '<p class="rec__meta"><span>' + p.year + "</span><span>" + esc(D.genreLabel(p.genre)) +
      "</span><span>" + esc(p.condition) + "</span></p>" +
      '<div class="rec__foot">' +
      '<p class="rec__price">' + money(p.price) +
      (p.oldPrice ? "<small>" + money(p.oldPrice) + "</small>" : "") +
      "</p>" +
      '<button type="button" class="rec__add" data-add="' + esc(p.id) + '" aria-label="Добавить «' +
      esc(p.artist) + " — " + esc(p.title) + "» в корзину\">" +
      icon("plus") + "<span>В корзину</span></button>" +
      "</div></div></article>"
    );
  }

  function renderCards(products, target, colClass) {
    if (!target) return;
    target.innerHTML = products
      .map(function (p) {
        return '<div class="' + (colClass || "col-6 col-lg-4 col-xl-3") + '">' + card(p) + "</div>";
      })
      .join("");
  }

  /* ---------- тосты ---------- */
  function toastStack() {
    var stack = qs(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "false");
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(message, type) {
    var stack = toastStack();
    var node = document.createElement("div");
    node.className = "toast-note toast-note--" + (type === "warn" ? "warn" : "ok");
    node.innerHTML = '<span class="toast-note__dot"></span><span>' + esc(message) + "</span>";
    stack.appendChild(node);
    window.setTimeout(function () {
      node.classList.add("is-leaving");
      window.setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 220);
    }, 2600);
  }

  /* ---------- счётчики в шапке ---------- */
  function syncHeader() {
    qsa("[data-cart-count]").forEach(function (el) {
      var count = S.count();
      el.textContent = count;
      el.hidden = count === 0;
    });
    qsa("[data-wish-count]").forEach(function (el) {
      var count = S.wishlist().length;
      el.textContent = count;
      el.hidden = count === 0;
    });
    qsa("[data-wish-link]").forEach(function (el) {
      el.setAttribute(
        "aria-label",
        "Избранное: " + S.wishlist().length + " пластинок"
      );
    });
  }

  function bumpCart() {
    qsa("[data-cart-count]").forEach(function (el) {
      el.classList.add("is-bumped");
      window.setTimeout(function () {
        el.classList.remove("is-bumped");
      }, 260);
    });
  }

  /* ---------- корзина-оффканвас ---------- */
  function ensureDrawer() {
    if (qs("#cartDrawer")) return;
    var html =
      '<div class="offcanvas offcanvas-end" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerTitle">' +
      '<div class="offcanvas-header">' +
      '<h2 class="offcanvas-title" id="cartDrawerTitle">Корзина <span data-drawer-count></span></h2>' +
      '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрыть"></button>' +
      "</div>" +
      '<div class="offcanvas-body d-flex flex-column">' +
      '<div class="cart-drawer__list" data-drawer-body></div>' +
      '<div class="cart-drawer__foot mt-auto" data-drawer-foot></div>' +
      "</div></div>";
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function renderDrawer() {
    var body = qs("[data-drawer-body]");
    var foot = qs("[data-drawer-foot]");
    if (!body || !foot) return;

    var items = S.cart();
    var countEl = qs("[data-drawer-count]");
    if (countEl) countEl.textContent = items.length ? "(" + S.count() + ")" : "";

    if (!items.length) {
      body.innerHTML =
        '<div class="cart-drawer__empty">' +
        '<div class="empty-state__disc"></div>' +
        "<p>Пока пусто. Пластинки ждут на полке.</p>" +
        '<a class="btn-ink" href="catalog.html">Перейти в каталог</a>' +
        "</div>";
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = items
      .map(function (line) {
        var p = line.product;
        return (
          '<div class="drawer-item" data-line="' + esc(p.id) + '">' +
          '<a class="drawer-item__cover" href="' + esc(p.url) + '" aria-label="' + esc(p.title) + '">' +
          cover(p) +
          "</a>" +
          "<div>" +
          '<p class="drawer-item__artist">' + esc(p.artist) + "</p>" +
          '<p class="drawer-item__title">' + esc(p.title) + "</p>" +
          '<div class="drawer-item__controls">' +
          '<div class="qty qty--sm">' +
          '<button type="button" data-drawer-dec="' + esc(p.id) + '" aria-label="Уменьшить количество">−</button>' +
          '<input type="text" inputmode="numeric" value="' + line.qty + '" aria-label="Количество" data-drawer-input="' + esc(p.id) + '">' +
          '<button type="button" data-drawer-inc="' + esc(p.id) + '" aria-label="Увеличить количество">+</button>' +
          "</div>" +
          '<span class="drawer-item__meta">' + esc(p.format) + "</span>" +
          "</div>" +
          '<button type="button" class="drawer-item__remove" data-drawer-remove="' + esc(p.id) + '">Убрать</button>' +
          "</div>" +
          '<p class="drawer-item__price">' + money(line.sum) + "</p>" +
          "</div>"
        );
      })
      .join("");

    var left = FREE_SHIPPING - S.subtotal();
    var progress = Math.min(100, Math.round((S.subtotal() / FREE_SHIPPING) * 100));
    foot.innerHTML =
      '<div class="d-flex justify-content-between align-items-baseline mb-2">' +
      '<span class="text-muted small">Товары</span>' +
      '<span class="num fw-bold">' + money(S.subtotal()) + "</span>" +
      "</div>" +
      (left > 0
        ? '<p class="summary__note mb-2">До бесплатной доставки — ' + money(left) + "</p>" +
          '<div class="progress" style="height:4px;background:var(--paper-3)" role="progressbar" aria-label="До бесплатной доставки" aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="progress-bar" style="width:' + progress + "%;background:var(--forest)\"></div></div>"
        : '<p class="summary__note mb-2" style="color:#2f7d5c;font-weight:700">Доставка бесплатно</p>') +
      '<div class="d-grid gap-2 mt-3">' +
      '<a class="btn-ink" href="order.html">Оформить заказ</a>' +
      '<a class="btn-line" href="cart.html">Открыть корзину</a>' +
      "</div>";
  }

  function openCart() {
    ensureDrawer();
    renderDrawer();
    var el = qs("#cartDrawer");
    if (window.bootstrap && window.bootstrap.Offcanvas) {
      window.bootstrap.Offcanvas.getOrCreateInstance(el).show();
    } else {
      el.classList.add("show");
    }
  }

  /* ---------- быстрый просмотр ---------- */
  function ensureQuickModal() {
    if (qs("#quickModal")) return;
    var html =
      '<div class="modal fade" id="quickModal" tabindex="-1" aria-labelledby="quickModalTitle" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h2 class="modal-title" id="quickModalTitle">Быстрый просмотр</h2>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>' +
      "</div>" +
      '<div class="modal-body" data-quick-body></div>' +
      "</div></div></div>";
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function openQuick(id) {
    var p = D.byId[id];
    if (!p) return;
    ensureQuickModal();
    var body = qs("[data-quick-body]");
    body.innerHTML =
      '<div class="quick-view">' +
      '<div class="quick-view__cover">' + cover(p) + "</div>" +
      "<div>" +
      '<p class="quick-view__artist">' + esc(p.artist) + "</p>" +
      '<h3 class="quick-view__title">' + esc(p.title) + "</h3>" +
      '<p class="rec__meta mt-2"><span>' + p.year + "</span><span>" + esc(D.genreLabel(p.genre)) +
      "</span><span>" + esc(p.format) + "</span><span>" + esc(p.condition) + "</span></p>" +
      '<p class="quick-view__price">' + money(p.price) + "</p>" +
      '<p class="quick-view__desc">' + esc(p.desc) + "</p>" +
      '<div class="d-flex flex-wrap gap-2 mt-3">' +
      '<button type="button" class="btn-ink" data-add="' + esc(p.id) + '">' + icon("plus") + "В корзину</button>" +
      '<a class="btn-line" href="' + esc(p.url) + '">Подробнее о пластинке</a>' +
      "</div></div></div>";
    var el = qs("#quickModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(el).show();
    }
  }

  /* ---------- поиск ---------- */
  function ensureSearch() {
    if (qs("#searchPanel")) return;
    var html =
      '<div class="offcanvas offcanvas-end search-panel" tabindex="-1" id="searchPanel" aria-labelledby="searchPanelTitle">' +
      '<div class="offcanvas-header">' +
      '<h2 class="offcanvas-title" id="searchPanelTitle">Поиск по полкам</h2>' +
      '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрыть"></button>' +
      "</div>" +
      '<div class="offcanvas-body">' +
      '<form data-search-form role="search">' +
      '<label class="form-label" for="searchInput">Артист, альбом или жанр</label>' +
      '<input class="form-control" id="searchInput" name="q" type="search" placeholder="Например, Radiohead" autocomplete="off">' +
      '<button class="btn-ink w-100 mt-3" type="submit">Найти</button>' +
      "</form>" +
      '<p class="search-panel__hint">Часто ищут</p>' +
      '<div class="search-panel__tags">' +
      '<button type="button" class="search-tag" data-search-tag="джаз">джаз</button>' +
      '<button type="button" class="search-tag" data-search-tag="электроника">электроника</button>' +
      '<button type="button" class="search-tag" data-search-tag="Beatles">Beatles</button>' +
      '<button type="button" class="search-tag" data-search-tag="Кино">Кино</button>' +
      '<button type="button" class="search-tag" data-search-tag="1970">1970-е</button>' +
      "</div></div></div>";
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function openSearch() {
    ensureSearch();
    var el = qs("#searchPanel");
    if (window.bootstrap && window.bootstrap.Offcanvas) {
      window.bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
    window.setTimeout(function () {
      var input = qs("#searchInput");
      if (input) input.focus();
    }, 320);
  }

  /* ---------- вертушка ---------- */
  function initTurntable() {
    qsa("[data-turntable]").forEach(function (deck) {
      var platter = qs("[data-platter]", deck);
      var hint = qs("[data-turntable-hint]", deck);
      var now = qs("[data-turntable-now]", deck);
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function setPlaying(playing) {
        deck.classList.toggle("is-playing", playing);
        if (platter) platter.setAttribute("aria-pressed", playing ? "true" : "false");
        if (platter) {
          platter.setAttribute(
            "aria-label",
            playing ? "Снять пластинку со стола" : "Поставить пластинку"
          );
        }
        if (hint) {
          hint.textContent = playing ? "Игла на дорожке" : "Нажмите на пластинку";
        }
        if (now) {
          now.textContent = playing
            ? "сейчас играет: " + deck.getAttribute("data-now")
            : "на столе: " + deck.getAttribute("data-now");
        }
      }

      if (platter) {
        platter.addEventListener("click", function () {
          setPlaying(!deck.classList.contains("is-playing"));
        });
      }

      // пластинка начинает крутиться сама — но без спешки и без анимации при reduced motion
      if (!reduce) {
        window.setTimeout(function () {
          setPlaying(true);
        }, 900);
      } else {
        setPlaying(false);
      }
    });
  }

  /* ---------- появление блоков ---------- */
  function initReveal() {
    var items = qsa(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- шапка ---------- */
  function initHeader() {
    var head = qs(".site-head");
    if (!head) return;
    var onScroll = function () {
      head.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- события ---------- */
  function bindGlobal() {
    document.addEventListener("click", function (event) {
      var target = event.target;

      var cartOpen = target.closest("[data-cart-open]");
      if (cartOpen) {
        event.preventDefault();
        openCart();
        return;
      }

      var searchOpen = target.closest("[data-search-open]");
      if (searchOpen) {
        event.preventDefault();
        openSearch();
        return;
      }

      var add = target.closest("[data-add]");
      if (add) {
        event.preventDefault();
        var id = add.getAttribute("data-add");
        var product = D.byId[id];
        if (!product) return;
        S.add(id, 1);
        bumpCart();
        add.classList.add("is-added");
        window.setTimeout(function () {
          add.classList.remove("is-added");
        }, 900);
        toast("«" + product.title + "» в корзине", "ok");

        // из быстрого просмотра — закрываем окно, чтобы не мешало
        var modal = add.closest(".modal");
        if (modal && window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
        return;
      }

      var wish = target.closest("[data-wish]");
      if (wish) {
        event.preventDefault();
        var wid = wish.getAttribute("data-wish");
        var added = S.toggleWishlist(wid);
        qsa('[data-wish="' + wid + '"]').forEach(function (btn) {
          btn.classList.toggle("is-active", added);
          btn.setAttribute("aria-pressed", added ? "true" : "false");
          btn.setAttribute(
            "aria-label",
            added ? "Убрать из избранного" : "Добавить в избранное"
          );
        });
        toast(
          added ? "Добавили в избранное" : "Убрали из избранного",
          added ? "ok" : "warn"
        );
        return;
      }

      var quick = target.closest("[data-quick]");
      if (quick) {
        event.preventDefault();
        openQuick(quick.getAttribute("data-quick"));
        return;
      }

      var drawerInc = target.closest("[data-drawer-inc]");
      if (drawerInc) {
        var incId = drawerInc.getAttribute("data-drawer-inc");
        S.setQty(incId, (S.qtyOf(incId) || 0) + 1);
        return;
      }

      var drawerDec = target.closest("[data-drawer-dec]");
      if (drawerDec) {
        var decId = drawerDec.getAttribute("data-drawer-dec");
        S.setQty(decId, (S.qtyOf(decId) || 0) - 1);
        return;
      }

      var drawerRemove = target.closest("[data-drawer-remove]");
      if (drawerRemove) {
        S.remove(drawerRemove.getAttribute("data-drawer-remove"));
        toast("Убрали из корзины", "warn");
        return;
      }

      var searchTag = target.closest("[data-search-tag]");
      if (searchTag) {
        window.location.href =
          "catalog.html?q=" + encodeURIComponent(searchTag.getAttribute("data-search-tag"));
        return;
      }
    });

    document.addEventListener("change", function (event) {
      var input = event.target.closest("[data-drawer-input]");
      if (input) {
        S.setQty(input.getAttribute("data-drawer-input"), input.value);
      }
    });

    document.addEventListener("submit", function (event) {
      var form = event.target.closest("[data-search-form]");
      if (form) {
        event.preventDefault();
        var value = (qs("#searchInput") || {}).value || "";
        window.location.href =
          "catalog.html?q=" + encodeURIComponent(value.trim());
        return;
      }

      var sub = event.target.closest("[data-subscribe]");
      if (sub) {
        event.preventDefault();
        var email = qs("input[type=email]", sub);
        if (!email || !email.checkValidity()) {
          toast("Проверьте адрес почты", "warn");
          if (email) email.focus();
          return;
        }
        sub.reset();
        toast("Готово. Напишем, когда привезём что-то по вашему вкусу", "ok");
      }
    });

    document.addEventListener("shop:change", function (event) {
      syncHeader();
      if (event.detail && event.detail.type === "cart") {
        renderDrawer();
      }
      if (event.detail && event.detail.type === "promo") {
        renderDrawer();
      }
    });

    qsa("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- карусель отзывов: не крутим, если человек просил меньше движения ---------- */
  function initCarousel() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    qsa(".carousel").forEach(function (el) {
      el.removeAttribute("data-bs-ride");
      if (window.bootstrap && window.bootstrap.Carousel) {
        var instance = window.bootstrap.Carousel.getInstance(el);
        if (instance) instance.pause();
      }
    });
  }

  function init() {
    ensureDrawer();
    bindGlobal();
    syncHeader();
    renderDrawer();
    initHeader();
    initTurntable();
    initReveal();
    initCarousel();
  }

  window.ShopUI = {
    esc: esc,
    money: money,
    icon: icon,
    cover: cover,
    card: card,
    renderCards: renderCards,
    toast: toast,
    syncHeader: syncHeader,
    openCart: openCart,
    openSearch: openSearch,
    openQuick: openQuick,
    FREE_SHIPPING: FREE_SHIPPING
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
