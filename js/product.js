/* ==========================================================================
   33 ОБОРОТА — страница пластинки
   Собирает карточку по id из адреса: обложка, покупка, вкладки,
   похожие пластинки и недавно просмотренные.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ShopData;
  var S = window.Store;
  var UI = window.ShopUI;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var product = id ? D.byId[id] : null;

  function badgeHtml(p) {
    var out = "";
    if (p.badge && D.BADGES[p.badge]) {
      var b = D.BADGES[p.badge];
      out += '<span class="rec__badge rec__badge--' + b.cls + '">' + UI.esc(b.label) + "</span>";
    }
    if (p.oldPrice) {
      out +=
        '<span class="rec__badge rec__badge--sale">−' +
        Math.round((1 - p.price / p.oldPrice) * 100) +
        "%</span>";
    }
    return out;
  }

  function notFound() {
    var layout = document.getElementById("productLayout");
    if (!layout) return;
    layout.innerHTML =
      '<div class="col-12"><div class="empty-state">' +
      '<div class="empty-state__disc" aria-hidden="true"></div>' +
      "<h3>Такой пластинки нет</h3>" +
      "<p>Возможно, её уже купили или ссылка устарела. Загляните в каталог — полки обновляются каждую пятницу.</p>" +
      '<a class="btn-ink" href="catalog.html">Перейти в каталог</a>' +
      "</div></div>";
    var tabs = document.getElementById("productTabs");
    if (tabs) tabs.innerHTML = "";
    var related = document.getElementById("related");
    if (related) related.hidden = true;
    document.title = "Пластинка не найдена — 33 ОБОРОТА";
  }

  function renderBreadcrumbs(p) {
    var host = document.getElementById("breadcrumbs");
    if (!host) return;
    host.innerHTML =
      '<li class="breadcrumb-item"><a href="index.html">Главная</a></li>' +
      '<li class="breadcrumb-item"><a href="catalog.html">Каталог</a></li>' +
      '<li class="breadcrumb-item"><a href="catalog.html?genre=' + p.genre + '">' +
      UI.esc(D.genreLabel(p.genre)) + "</a></li>" +
      '<li class="breadcrumb-item active" aria-current="page">' + UI.esc(p.title) + "</li>";
  }

  function renderCover(p) {
    var host = document.getElementById("productCover");
    if (!host) return;
    host.innerHTML =
      '<div class="product__cover-wrap">' +
      UI.cover(p, "product__cover") +
      '<span class="sticker">' + UI.esc(p.format) + " · " + p.year + "</span>" +
      "</div>" +
      '<p class="small text-muted mt-3 mb-0">' +
      "Фотографии конверта и пластинки появятся, когда мы снимем это издание. " +
      "Состояние описано в характеристиках." +
      "</p>";
  }

  function renderInfo(p) {
    var host = document.getElementById("productInfo");
    if (!host) return;
    var inWish = S.inWishlist(p.id);

    host.innerHTML =
      '<p class="product__artist">' + UI.esc(p.artist) + "</p>" +
      '<h1 class="product__title">' + UI.esc(p.title) + "</h1>" +
      '<div class="d-flex flex-wrap gap-2 mt-3">' + badgeHtml(p) + "</div>" +
      '<p class="product__meta">' +
      "<span>" + p.year + "</span>" +
      "<span>" + UI.esc(D.genreLabel(p.genre)) + "</span>" +
      "<span>" + UI.esc(p.label) + "</span>" +
      "<span>" + UI.esc(p.format) + "</span>" +
      "</p>" +
      '<div class="product__price-row">' +
      '<p class="product__price mb-0">' + UI.money(p.price) + "</p>" +
      (p.oldPrice ? '<p class="product__old mb-0">' + UI.money(p.oldPrice) + "</p>" : "") +
      '<p class="product__stock mb-0"><i aria-hidden="true"></i>В наличии в лавке</p>' +
      "</div>" +
      '<div class="product__buy">' +
      '<div class="qty">' +
      '<button type="button" data-qty="-1" aria-label="Уменьшить количество">−</button>' +
      '<input id="qtyInput" type="text" inputmode="numeric" value="1" aria-label="Количество">' +
      '<button type="button" data-qty="1" aria-label="Увеличить количество">+</button>' +
      "</div>" +
      '<button class="btn-ink btn-lg" type="button" data-buy="' + UI.esc(p.id) + '">' +
      UI.icon("plus") + "В корзину</button>" +
      '<button class="btn-line btn-lg' + (inWish ? " is-active" : "") + '" type="button" data-wish="' +
      UI.esc(p.id) + '" aria-pressed="' + (inWish ? "true" : "false") + '">' +
      UI.icon("heart") + '<span data-wish-label>' + (inWish ? "В избранном" : "В избранное") + "</span></button>" +
      "</div>" +
      '<p class="small text-muted mt-3 mb-0">Самовывоз с Покровки бесплатный — обычно готов через час после заказа.</p>' +
      '<div class="product__facts">' +
      '<p class="product__fact">' + UI.icon("truck") + "Бесплатная доставка от 5 000 ₽, курьер по Москве — 390 ₽</p>" +
      '<p class="product__fact">' + UI.icon("shield") + "14 дней на возврат, если пластинка не зашла</p>" +
      '<p class="product__fact">' + UI.icon("needle") + "Состояние: " + UI.esc(p.condition) + "</p>" +
      "</div>";
  }

  function renderTabs(p) {
    var host = document.getElementById("productTabs");
    if (!host) return;

    var specs = Object.keys(p.specs)
      .map(function (key) {
        return "<tr><th scope=\"row\">" + UI.esc(key) + "</th><td>" + UI.esc(p.specs[key]) + "</td></tr>";
      })
      .join("");

    host.innerHTML =
      '<div class="product__tabs">' +
      '<ul class="nav nav-tabs" id="productTab" role="tablist">' +
      '<li class="nav-item" role="presentation">' +
      '<button class="nav-link active" id="tab-desc-btn" data-bs-toggle="tab" data-bs-target="#tab-desc" type="button" role="tab" aria-controls="tab-desc" aria-selected="true">Описание</button>' +
      "</li>" +
      '<li class="nav-item" role="presentation">' +
      '<button class="nav-link" id="tab-specs-btn" data-bs-toggle="tab" data-bs-target="#tab-specs" type="button" role="tab" aria-controls="tab-specs" aria-selected="false">Характеристики</button>' +
      "</li>" +
      '<li class="nav-item" role="presentation">' +
      '<button class="nav-link" id="tab-ship-btn" data-bs-toggle="tab" data-bs-target="#tab-ship" type="button" role="tab" aria-controls="tab-ship" aria-selected="false">Доставка и оплата</button>' +
      "</li>" +
      "</ul>" +
      '<div class="tab-content" id="productTabContent">' +
      '<div class="tab-pane fade show active" id="tab-desc" role="tabpanel" aria-labelledby="tab-desc-btn" tabindex="0">' +
      '<div class="tab-body"><p>' + UI.esc(p.desc) + "</p>" +
      "<p>Мы не перепродаём вслепую: каждую пластинку из этого каталога проверили иглой " +
      "и описали состояние так, как слышим. Если что-то не совпадёт — вернём деньги.</p></div></div>" +
      '<div class="tab-pane fade" id="tab-specs" role="tabpanel" aria-labelledby="tab-specs-btn" tabindex="0">' +
      '<div class="tab-body"><table class="spec-table"><tbody>' + specs + "</tbody></table></div></div>" +
      '<div class="tab-pane fade" id="tab-ship" role="tabpanel" aria-labelledby="tab-ship-btn" tabindex="0">' +
      '<div class="tab-body">' +
      "<p><strong>Москва.</strong> Курьер на следующий день — 390 ₽, бесплатно от 5 000 ₽. " +
      "Самовывоз с Покровки — бесплатно, обычно готов через час.</p>" +
      "<p><strong>Россия.</strong> Пункты выдачи и почта — 2–5 дней, 290 ₽. " +
      "Пластинки упаковываем в жёсткий конверт и пузырчатую плёнку, углы защищаем отдельно.</p>" +
      "<p><strong>Оплата.</strong> Картой онлайн, переводом или наличными при самовывозе. " +
      "Возврат — 14 дней, если пластинка не игралась и сохранён конверт.</p>" +
      "</div></div>" +
      "</div></div>";
  }

  function renderRelated(p) {
    var grid = document.getElementById("relatedGrid");
    if (!grid) return;
    var same = D.PRODUCTS.filter(function (item) {
      return item.id !== p.id && item.genre === p.genre;
    });
    if (same.length < 4) {
      D.PRODUCTS.forEach(function (item) {
        if (same.length >= 4) return;
        if (item.id === p.id) return;
        if (same.indexOf(item) !== -1) return;
        same.push(item);
      });
    }
    UI.renderCards(same.slice(0, 4), grid, "col-6 col-lg-3");
  }

  function renderRecent(p) {
    var section = document.getElementById("recentSection");
    var grid = document.getElementById("recentGrid");
    if (!section || !grid) return;
    var items = S.recent(p.id, 4);
    if (!items.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    UI.renderCards(items, grid, "col-6 col-lg-3");
  }

  function bindBuy(p) {
    var input = document.getElementById("qtyInput");
    var wrap = document.querySelector(".product__buy");

    function clampQty(value) {
      var n = parseInt(value, 10);
      if (!n || n < 1) n = 1;
      if (n > 99) n = 99;
      return n;
    }

    if (wrap) {
      wrap.addEventListener("click", function (event) {
        var stepBtn = event.target.closest("[data-qty]");
        if (stepBtn && input) {
          input.value = clampQty(parseInt(input.value, 10) + Number(stepBtn.getAttribute("data-qty")));
          return;
        }

        var buy = event.target.closest("[data-buy]");
        if (buy) {
          var qty = clampQty(input ? input.value : 1);
          S.add(p.id, qty);
          UI.toast("«" + p.title + "» — " + qty + " шт. в корзине", "ok");
          UI.openCart();
        }
      });
    }

    if (input) {
      input.addEventListener("change", function () {
        input.value = clampQty(input.value);
      });
      input.addEventListener("blur", function () {
        input.value = clampQty(input.value);
      });
    }
  }

  function syncWishLabel() {
    var label = document.querySelector("[data-wish-label]");
    if (!label || !product) return;
    label.textContent = S.inWishlist(product.id) ? "В избранном" : "В избранное";
  }

  function init() {
    if (!product) {
      notFound();
      return;
    }

    document.title = product.artist + " — " + product.title + " · 33 ОБОРОТА";
    renderBreadcrumbs(product);
    renderCover(product);
    renderInfo(product);
    renderTabs(product);
    renderRelated(product);
    bindBuy(product);

    S.pushRecent(product.id);
    renderRecent(product);

    document.addEventListener("shop:change", function (event) {
      if (event.detail && event.detail.type === "wishlist") syncWishLabel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
