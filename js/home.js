/* ==========================================================================
   33 ОБОРОТА — главная страница
   Собирает полку новинок, жанровые плитки и разделители-полки.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ShopData;
  var UI = window.ShopUI;

  function plural(n, forms) {
    var abs = Math.abs(n) % 100;
    var last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
  }

  function renderFresh() {
    var grid = document.getElementById("newGrid");
    if (!grid) return;

    var fresh = D.PRODUCTS.filter(function (p) {
      return p.badge === "new";
    });
    if (fresh.length < 4) {
      fresh = fresh.concat(
        D.PRODUCTS.filter(function (p) {
          return p.badge === "hit";
        })
      );
    }
    UI.renderCards(fresh.slice(0, 4), grid, "col-12 col-sm-6 col-lg-3");
  }

  function renderGenres() {
    var grid = document.getElementById("genreGrid");
    if (!grid) return;
    var counts = D.countByGenre();

    grid.innerHTML = D.GENRES.map(function (g) {
      var n = counts[g.id] || 0;
      return (
        '<div class="col-6 col-lg-4">' +
        '<a class="genre-tile" href="catalog.html?genre=' + g.id + '"' +
        ' style="--tile-bg:' + g.bg + ";--tile-fg:" + g.fg + '">' +
        '<span class="genre-tile__arrow" aria-hidden="true">↗</span>' +
        '<span class="genre-tile__glyph" aria-hidden="true"></span>' +
        '<span class="genre-tile__name">' + UI.esc(g.label) + "</span>" +
        '<span class="genre-tile__count">' + n + " " + plural(n, ["пластинка", "пластинки", "пластинок"]) + "</span>" +
        "</a></div>"
      );
    }).join("");
  }

  function renderCrate() {
    var row = document.getElementById("crateRow");
    if (!row) return;
    var counts = D.countByGenre();
    row.innerHTML = D.GENRES.map(function (g) {
      return (
        '<a class="crate__tab" href="catalog.html?genre=' + g.id + '">' +
        UI.esc(g.label) + " <small>" + (counts[g.id] || 0) + "</small></a>"
      );
    }).join("");
  }

  function init() {
    renderFresh();
    renderGenres();
    renderCrate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
