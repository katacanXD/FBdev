/* ==========================================================================
   33 ОБОРОТА — оформление заказа
   Сводка заказа, пересчёт доставки, валидация формы и подтверждение.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.Store;
  var UI = window.ShopUI;

  var DELIVERY = {
    courier: { cost: 390, label: "Курьер по Москве" },
    pickup: { cost: 290, label: "Пункт выдачи" },
    shop: { cost: 0, label: "Самовывоз" }
  };

  var form = document.getElementById("orderForm");
  var summary = document.getElementById("orderSummary");
  var empty = document.getElementById("orderEmpty");
  var layout = document.getElementById("orderLayout");
  var addressField = document.getElementById("addressField");
  var addressInput = document.getElementById("orderAddress");

  function chosenDelivery() {
    var input = form ? form.querySelector('input[name="delivery"]:checked') : null;
    return input ? input.value : "courier";
  }

  function deliveryCost() {
    var key = chosenDelivery();
    if (key === "courier" && S.subtotal() >= UI.FREE_SHIPPING) return 0;
    return DELIVERY[key].cost;
  }

  function row(label, value, modifier) {
    return (
      '<div class="summary__row' + (modifier ? " " + modifier : "") + '">' +
      "<span>" + label + "</span><span>" + value + "</span></div>"
    );
  }

  function renderDeliveryPrices() {
    var courier = document.querySelector('[data-delivery-price="courier"]');
    if (courier) {
      courier.textContent =
        S.subtotal() >= UI.FREE_SHIPPING ? "Бесплатно" : "390 ₽";
    }
  }

  function renderSummary() {
    if (!summary) return;

    if (!S.count()) {
      summary.innerHTML =
        '<p class="text-muted mb-0">Корзина пуста — добавьте пластинки, чтобы оформить заказ.</p>';
      return;
    }

    var items = S.cart()
      .map(function (line) {
        var p = line.product;
        return (
          '<div class="mini-item">' +
          '<a class="mini-item__cover" href="' + UI.esc(p.url) + '" aria-label="' + UI.esc(p.title) + '">' +
          UI.cover(p) +
          "</a>" +
          "<div>" +
          '<p class="mini-item__title mb-0">' + UI.esc(p.artist) + " — " + UI.esc(p.title) + "</p>" +
          '<p class="mini-item__meta mb-0">' + line.qty + " шт. · " + UI.esc(p.format) + "</p>" +
          "</div>" +
          '<p class="mini-item__price mb-0">' + UI.money(line.sum) + "</p>" +
          "</div>"
        );
      })
      .join("");

    var promo = S.promo();
    var delivery = deliveryCost();
    var total = S.total() + delivery;

    summary.innerHTML =
      '<div class="mb-2">' + items + "</div>" +
      row("Товары", UI.money(S.subtotal())) +
      (promo ? row("Скидка " + UI.esc(promo.code), "−" + UI.money(S.discount())) : "") +
      row("Доставка", delivery ? UI.money(delivery) : "бесплатно") +
      row("К оплате", UI.money(total), "summary__row--total") +
      '<p class="summary__note">' +
      (delivery ? "До бесплатной доставки — " + UI.money(Math.max(0, UI.FREE_SHIPPING - S.subtotal())) + "." : "Доставка бесплатная.") +
      "</p>" +
      '<a class="btn-line w-100 mt-2" href="cart.html">Изменить корзину</a>';
  }

  function toggleAddress() {
    if (!addressField || !addressInput) return;
    var isPickup = chosenDelivery() === "shop";
    addressField.hidden = isPickup;
    addressInput.required = !isPickup;
    addressInput.closest(".col-12").hidden = isPickup;
  }

  function render() {
    if (!form || !layout) return;
    var hasItems = S.count() > 0;
    layout.hidden = !hasItems;
    if (empty) empty.hidden = hasItems;
    renderDeliveryPrices();
    renderSummary();
  }

  function bind() {
    if (form) {
      form.addEventListener("change", function (event) {
        if (event.target.name === "delivery") {
          toggleAddress();
          renderSummary();
        }
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!S.count()) {
          UI.toast("Корзина пуста — нечего оформлять", "warn");
          return;
        }

        form.classList.add("was-validated");
        if (!form.checkValidity()) {
          var firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) firstInvalid.focus();
          UI.toast("Проверьте отмеченные поля", "warn");
          return;
        }

        var number = "33-" + Math.floor(100000 + Math.random() * 900000);
        var numberEl = document.getElementById("successNumber");
        if (numberEl) numberEl.textContent = number;

        S.clear();
        S.clearPromo();
        form.reset();
        form.classList.remove("was-validated");
        toggleAddress();
        render();

        var modalEl = document.getElementById("successModal");
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
        UI.toast("Заказ " + number + " принят", "ok");
      });
    }

    document.addEventListener("shop:change", function (event) {
      var type = event.detail && event.detail.type;
      if (type === "cart" || type === "promo") render();
    });
  }

  function init() {
    bind();
    toggleAddress();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
