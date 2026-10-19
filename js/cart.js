/* ==========================================================================
   33 ОБОРОТА — корзина
   Таблица заказа, изменение количества, удаление, промокод и итоги.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ShopData;
  var S = window.Store;
  var UI = window.ShopUI;

  var content = document.getElementById("cartContent");
  var summary = document.getElementById("cartSummary");
  var countLine = document.getElementById("cartCountLine");

  var feedback = null;

  function plural(n, forms) {
    var abs = Math.abs(n) % 100;
    var last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
  }

  function esc(value) {
    return UI.esc(value);
  }

  function row(label, value, modifier) {
    return (
      '<div class="summary__row' + (modifier ? " " + modifier : "") + '">' +
      "<span>" + label + "</span><span>" + value + "</span></div>"
    );
  }

  function renderTable(items) {
    var rows = items
      .map(function (line) {
        var p = line.product;
        return (
          "<tr>" +
          '<td data-label="Товар">' +
          '<div class="cart-item">' +
          '<a class="cart-item__cover" href="' + esc(p.url) + '" aria-label="' + esc(p.title) + '">' +
          UI.cover(p) +
          "</a>" +
          "<div>" +
          '<p class="cart-item__artist mb-0">' + esc(p.artist) + "</p>" +
          '<a class="cart-item__title" href="' + esc(p.url) + '">' + esc(p.title) + "</a>" +
          '<p class="cart-item__meta mb-0">' + esc(p.format) + " · " + esc(p.condition) + "</p>" +
          "</div></div></td>" +
          '<td data-label="Цена">' + UI.money(p.price) + "</td>" +
          '<td data-label="Кол-во">' +
          '<div class="qty qty--sm">' +
          '<button type="button" data-cart-dec="' + esc(p.id) + '" aria-label="Уменьшить количество">−</button>' +
          '<input type="text" inputmode="numeric" value="' + line.qty + '" data-cart-input="' + esc(p.id) + '" aria-label="Количество «' + esc(p.title) + '»">' +
          '<button type="button" data-cart-inc="' + esc(p.id) + '" aria-label="Увеличить количество">+</button>' +
          "</div></td>" +
          '<td data-label="Сумма">' + UI.money(line.sum) + "</td>" +
          "<td>" +
          '<button type="button" class="cart-remove" data-cart-remove="' + esc(p.id) + '" aria-label="Убрать «' + esc(p.title) + '» из корзины">' +
          UI.icon("trash") +
          "</button></td></tr>"
        );
      })
      .join("");

    return (
      '<table class="cart-table">' +
      '<caption class="visually-hidden">Товары в корзине</caption>' +
      "<thead><tr><th scope=\"col\">Товар</th><th scope=\"col\">Цена</th><th scope=\"col\">Кол-во</th><th scope=\"col\">Сумма</th><th scope=\"col\"><span class=\"visually-hidden\">Удалить</span></th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table>" +
      '<div class="d-flex flex-wrap gap-2 mt-3">' +
      '<a class="btn-line" href="catalog.html">Продолжить покупки</a>' +
      '<button class="btn-ghost" type="button" data-cart-clear>Очистить корзину</button>' +
      "</div>"
    );
  }

  function renderSummary() {
    var promo = S.promo();
    var total = S.count();

    var promoBlock;
    if (promo) {
      promoBlock =
        '<div class="promo" style="align-items:center;justify-content:space-between">' +
        '<span><b>' + esc(promo.code) + "</b> · " + esc(promo.label) + "</span>" +
        '<button type="button" class="btn-ghost" data-promo-remove>Убрать</button>' +
        "</div>";
    } else {
      promoBlock =
        '<form class="promo" data-promo-form>' +
        '<label class="visually-hidden" for="promoInput">Промокод</label>' +
        '<input class="form-control" id="promoInput" name="promo" type="text" placeholder="Промокод" autocomplete="off">' +
        '<button class="btn-line btn-sm" type="submit">Применить</button>' +
        "</form>" +
        '<p class="summary__note mb-0">Попробуйте <b>VINYL10</b> — минус 10%.</p>';
    }

    var feedbackHtml = feedback
      ? '<p class="promo__msg promo__msg--' + (feedback.ok ? "ok" : "err") + '">' + esc(feedback.text) + "</p>"
      : "";

    return (
      '<div class="summary">' +
      '<p class="summary__head mb-0">Итого</p>' +
      '<div class="summary__body">' +
      row("Товары (" + total + " " + plural(total, ["шт.", "шт.", "шт."]) + ")", UI.money(S.subtotal())) +
      (promo ? row("Скидка", "−" + UI.money(S.discount())) : "") +
      row("Доставка", '<span class="text-muted">при оформлении</span>') +
      row("К оплате", UI.money(S.total()), "summary__row--total") +
      promoBlock +
      feedbackHtml +
      '<a class="btn-ink w-100 mt-3" href="order.html">Оформить заказ</a>' +
      '<p class="summary__note">Бесплатная доставка от 5 000 ₽. Пластинки едут в жёстком конверте.</p>' +
      "</div></div>"
    );
  }

  function render() {
    if (!content || !summary) return;
    var items = S.cart();

    if (countLine) {
      countLine.textContent = items.length
        ? S.count() + " " + plural(S.count(), ["пластинка", "пластинки", "пластинок"])
        : "";
    }

    if (!items.length) {
      content.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-state__disc" aria-hidden="true"></div>' +
        "<h3>Корзина пуста</h3>" +
        "<p>Пока здесь нет пластинок. Начните с полки «свежий завоз» — там обычно самое интересное.</p>" +
        '<a class="btn-ink" href="catalog.html">Перейти в каталог</a>' +
        "</div>";
      summary.innerHTML = "";
      return;
    }

    content.innerHTML = renderTable(items);
    summary.innerHTML = renderSummary();
  }

  function bind() {
    if (content) {
      content.addEventListener("click", function (event) {
        var inc = event.target.closest("[data-cart-inc]");
        if (inc) {
          var id = inc.getAttribute("data-cart-inc");
          S.setQty(id, (S.qtyOf(id) || 0) + 1);
          return;
        }

        var dec = event.target.closest("[data-cart-dec]");
        if (dec) {
          var did = dec.getAttribute("data-cart-dec");
          S.setQty(did, (S.qtyOf(did) || 0) - 1);
          return;
        }

        var remove = event.target.closest("[data-cart-remove]");
        if (remove) {
          S.remove(remove.getAttribute("data-cart-remove"));
          UI.toast("Пластинка убрана из корзины", "warn");
          return;
        }

        var clear = event.target.closest("[data-cart-clear]");
        if (clear) {
          if (window.confirm("Убрать все пластинки из корзины?")) {
            S.clear();
            UI.toast("Корзина очищена", "warn");
          }
        }
      });

      content.addEventListener("change", function (event) {
        var input = event.target.closest("[data-cart-input]");
        if (input) {
          S.setQty(input.getAttribute("data-cart-input"), input.value);
        }
      });
    }

    if (summary) {
      summary.addEventListener("submit", function (event) {
        var form = event.target.closest("[data-promo-form]");
        if (!form) return;
        event.preventDefault();
        var input = form.querySelector("input");
        var result = S.applyPromo(input ? input.value : "");
        feedback = { ok: result.ok, text: result.message };
        render();
        UI.toast(result.message, result.ok ? "ok" : "warn");
      });

      summary.addEventListener("click", function (event) {
        var remove = event.target.closest("[data-promo-remove]");
        if (remove) {
          S.clearPromo();
          feedback = null;
          render();
          UI.toast("Промокод убран", "warn");
        }
      });
    }

    document.addEventListener("shop:change", function (event) {
      var type = event.detail && event.detail.type;
      if (type === "cart" || type === "promo") {
        if (type === "promo") feedback = feedback || null;
        render();
      }
    });
  }

  function init() {
    bind();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
