/* ==========================================================================
   33 ОБОРОТА — хранилище состояния
   Корзина, избранное, недавно просмотренные и промокод.
   Всё живёт в localStorage, поэтому переживает перезагрузку страницы.
   ========================================================================== */
(function () {
  "use strict";

  var KEY_CART = "33oborota.cart.v1";
  var KEY_WISH = "33oborota.wishlist.v1";
  var KEY_RECENT = "33oborota.recent.v1";
  var KEY_PROMO = "33oborota.promo.v1";

  var PROMOS = {
    VINYL10: { rate: 0.1, label: "−10% по промокоду" },
    PLATINKA15: { rate: 0.15, label: "−15% по промокоду" }
  };

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* приватный режим — работаем без сохранения */
    }
  }

  function emit(type) {
    document.dispatchEvent(
      new CustomEvent("shop:change", { detail: { type: type } })
    );
  }

  function findProduct(id) {
    return window.ShopData.byId[id] || null;
  }

  function normalize(items) {
    if (!Array.isArray(items)) return [];
    return items
      .filter(function (item) {
        return item && findProduct(item.id);
      })
      .map(function (item) {
        return { id: item.id, qty: Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1)) };
      });
  }

  var cart = normalize(read(KEY_CART, []));
  var wish = read(KEY_WISH, []);
  var recent = read(KEY_RECENT, []);
  var promo = read(KEY_PROMO, null);

  wish = Array.isArray(wish) ? wish.filter(findProduct) : [];
  recent = Array.isArray(recent) ? recent.filter(findProduct) : [];

  function saveCart() {
    write(KEY_CART, cart);
    emit("cart");
  }

  var Store = {
    /* ---------- корзина ---------- */
    cart: function () {
      return cart.map(function (line) {
        var product = findProduct(line.id);
        return {
          product: product,
          qty: line.qty,
          sum: product.price * line.qty
        };
      });
    },

    count: function () {
      return cart.reduce(function (acc, line) {
        return acc + line.qty;
      }, 0);
    },

    subtotal: function () {
      return cart.reduce(function (acc, line) {
        var product = findProduct(line.id);
        return acc + (product ? product.price * line.qty : 0);
      }, 0);
    },

    has: function (id) {
      return cart.some(function (line) {
        return line.id === id;
      });
    },

    qtyOf: function (id) {
      var found = null;
      cart.forEach(function (line) {
        if (line.id === id) found = line.qty;
      });
      return found;
    },

    add: function (id, qty) {
      var product = findProduct(id);
      if (!product) return false;
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var line = null;
      cart.forEach(function (item) {
        if (item.id === id) line = item;
      });
      if (line) {
        line.qty = Math.min(99, line.qty + qty);
      } else {
        cart.push({ id: id, qty: Math.min(99, qty) });
      }
      saveCart();
      return true;
    },

    setQty: function (id, qty) {
      qty = parseInt(qty, 10) || 0;
      if (qty <= 0) {
        Store.remove(id);
        return;
      }
      cart.forEach(function (line) {
        if (line.id === id) line.qty = Math.min(99, qty);
      });
      saveCart();
    },

    remove: function (id) {
      cart = cart.filter(function (line) {
        return line.id !== id;
      });
      saveCart();
    },

    clear: function () {
      cart = [];
      saveCart();
    },

    /* ---------- избранное ---------- */
    wishlist: function () {
      return wish.slice();
    },

    inWishlist: function (id) {
      return wish.indexOf(id) !== -1;
    },

    toggleWishlist: function (id) {
      if (!findProduct(id)) return false;
      var added;
      if (Store.inWishlist(id)) {
        wish = wish.filter(function (item) {
          return item !== id;
        });
        added = false;
      } else {
        wish.push(id);
        added = true;
      }
      write(KEY_WISH, wish);
      emit("wishlist");
      return added;
    },

    /* ---------- недавно просмотренные ---------- */
    pushRecent: function (id) {
      if (!findProduct(id)) return;
      recent = recent.filter(function (item) {
        return item !== id;
      });
      recent.unshift(id);
      recent = recent.slice(0, 8);
      write(KEY_RECENT, recent);
    },

    recent: function (exceptId, limit) {
      var list = recent.filter(function (id) {
        return id !== exceptId;
      });
      return list.slice(0, limit || 4).map(function (id) {
        return findProduct(id);
      }).filter(Boolean);
    },

    /* ---------- промокод ---------- */
    promo: function () {
      return promo;
    },

    applyPromo: function (code) {
      var key = String(code || "").trim().toUpperCase();
      if (!key) return { ok: false, message: "Введите промокод" };
      if (!PROMOS[key]) return { ok: false, message: "Такого промокода нет" };
      promo = { code: key, rate: PROMOS[key].rate, label: PROMOS[key].label };
      write(KEY_PROMO, promo);
      emit("promo");
      return { ok: true, message: "Промокод применён: " + promo.label };
    },

    clearPromo: function () {
      promo = null;
      write(KEY_PROMO, null);
      emit("promo");
    },

    /* ---------- деньги ---------- */
    discount: function () {
      if (!promo) return 0;
      return Math.round(Store.subtotal() * promo.rate);
    },

    total: function () {
      return Math.max(0, Store.subtotal() - Store.discount());
    },

    money: function (value) {
      return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
    }
  };

  window.Store = Store;
})();
