const FAVORITES_KEY = 'iitr:favorites';

const HEART_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path></svg>';

const favoritesStore = {
  read: function () {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (id) {
        return typeof id === 'string';
      }) : [];
    } catch (error) {
      return [];
    }
  },

  write: function (ids) {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      // Storage may be unavailable in private mode; the interface still works for this page.
    }
  },

  has: function (id) {
    return this.read().indexOf(id) !== -1;
  },

  toggle: function (id) {
    const ids = this.read();
    const index = ids.indexOf(id);

    if (index === -1) {
      ids.push(id);
    } else {
      ids.splice(index, 1);
    }

    this.write(ids);
    return ids;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  initImageFallbacks();
  initArticleTools();
  initFavorites();
  initPublicationFilters();
  initOrderForm();
  initBackToTop();
  initGlobalSearch();
  initEventCalendar();
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character];
  });
}

function normalizeSearchText(value) {
  return String(value).toLowerCase().replace(/ё/g, 'е');
}

function initImageFallbacks() {
  document.querySelectorAll('main img').forEach(function (img) {
    function hide() {
      img.hidden = true;
    }

    if (img.complete && img.naturalWidth === 0) {
      hide();
    }

    img.addEventListener('error', hide);
  });
}

function initArticleTools() {
  const article = document.querySelector('[data-article]');
  if (!article) {
    return;
  }

  const data = article.dataset;
  const statusSlot = article.querySelector('[data-status-panel]');
  if (statusSlot) {
    statusSlot.innerHTML = buildStatusPanel(data);
  }

  const toolsSlot = article.querySelector('[data-article-tools]');
  if (toolsSlot) {
    toolsSlot.className = 'article-tools';
    toolsSlot.innerHTML =
      '<button class="btn btn-outline-primary btn-sm" type="button" data-print-article>' +
        '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><rect x="7" y="14" width="10" height="7" fill="none" stroke="currentColor" stroke-width="1.8"></rect></svg>' +
        'Скачать PDF' +
      '</button>' +
      '<button class="btn btn-outline-primary btn-sm article-fav" type="button" data-favorite-toggle data-favorite-id="' + escapeHtml(data.articleId || '') + '" aria-pressed="false" aria-label="Добавить в избранное">' +
        HEART_ICON +
        '<span data-favorite-label>В избранное</span>' +
      '</button>' +
      '<a class="btn btn-outline-primary btn-sm" href="#citationCard">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M9 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v2a3 3 0 0 1-3 3M21 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v2a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
        'Цитировать' +
      '</a>';
  }

  const printButton = article.querySelector('[data-print-article]');
  if (printButton) {
    printButton.addEventListener('click', function () {
      window.print();
    });
  }

  const authorsGost = data.authorsGost || '';
  const authorsApa = data.authorsApa || '';
  const title = data.articleTitle || '';
  const year = data.articleYear || '';
  const date = data.articleDate || '';
  const gost = authorsGost + ' ' + title + ' // Публикации НИИ ИТ. ' + year + '. ' + date + '.';
  const apa = authorsApa + ' (' + year + '). ' + title + '. Публикации НИИ ИТ.';

  const aside = document.querySelector('aside');
  if (aside) {
    const citation = document.createElement('div');
    citation.className = 'card side-card citation-card mb-4';
    citation.id = 'citationCard';
    citation.innerHTML =
      '<div class="card-header">Цитирование</div>' +
      '<div class="card-body">' +
        '<div class="citation-item">' +
          '<p class="citation-label">ГОСТ</p>' +
          '<p class="citation-text">' + escapeHtml(gost) + '</p>' +
          '<button class="btn btn-sm btn-outline-primary" type="button" data-copy-citation>Скопировать</button>' +
        '</div>' +
        '<div class="citation-item">' +
          '<p class="citation-label">APA</p>' +
          '<p class="citation-text">' + escapeHtml(apa) + '</p>' +
          '<button class="btn btn-sm btn-outline-primary" type="button" data-copy-citation>Скопировать</button>' +
        '</div>' +
      '</div>';
    aside.insertBefore(citation, aside.firstElementChild);
  }

  document.querySelectorAll('[data-copy-citation]').forEach(function (button) {
    button.addEventListener('click', function () {
      const item = button.closest('.citation-item');
      const text = item ? item.querySelector('.citation-text') : null;
      if (text) {
        copyText(text.textContent, button);
      }
    });
  });
}

function buildStatusPanel(data) {
  const labels = [
    'На рассмотрении',
    'Ожидает рецензирования',
    'На рецензировании',
    'Подготовка к публикации',
    'Опубликовано'
  ];
  const shortLabels = ['Рассмотрение', 'Ожидание рецензии', 'Рецензирование', 'Подготовка', 'Опубликовано'];
  const stage = Math.min(labels.length, Math.max(1, parseInt(data.statusStage, 10) || 1));
  const progress = Math.round((stage / labels.length) * 100);
  const currentLabel = data.statusLabel || labels[stage - 1];
  const updated = data.statusDate ? 'Обновлено ' + data.statusDate : 'Статус обновляется редакцией';
  const note = data.statusNote || '';

  const steps = shortLabels.map(function (label, index) {
    const step = index + 1;
    let className = '';

    if (step < stage) {
      className = 'is-done';
    } else if (step === stage) {
      className = 'is-current';
    }

    return '<li class="' + className + '"' + (step === stage ? ' aria-current="step"' : '') + '>' + escapeHtml(label) + '</li>';
  }).join('');

  return '<section class="status-panel" aria-label="Статус публикации">' +
    '<div class="status-head">' +
      '<p class="status-eyebrow">Статус публикации</p>' +
      '<p class="status-updated">' + escapeHtml(updated) + '</p>' +
    '</div>' +
    '<div class="status-current-row">' +
      '<span class="status-dot" aria-hidden="true"></span>' +
      '<strong class="status-current-label">' + escapeHtml(currentLabel) + '</strong>' +
      '<span class="status-step-count">Этап ' + stage + ' из ' + labels.length + '</span>' +
    '</div>' +
    '<div class="status-progress" aria-hidden="true"><span style="width: ' + progress + '%"></span></div>' +
    '<ol class="status-labels" aria-label="Этапы публикации">' + steps + '</ol>' +
    (note ? '<p class="status-note">' + escapeHtml(note) + '</p>' : '') +
  '</section>';
}

function copyText(text, button) {
  function done() {
    const original = button.textContent;
    button.textContent = 'Скопировано';
    button.classList.add('is-copied');

    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove('is-copied');
    }, 1800);
  }

  function fallback() {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      done();
    } catch (error) {
      // The text stays selectable in the card if copying is blocked.
    }

    textarea.remove();
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function initFavorites() {
  document.querySelectorAll('.pub-card').forEach(function (card) {
    const link = card.querySelector('.pub-link');
    const cover = card.querySelector('.pub-cover');
    if (!link || !cover) {
      return;
    }

    const id = link.getAttribute('href').split('/').pop().replace('.html', '');
    const publication = card.closest('[data-publication]');
    if (publication) {
      publication.setAttribute('data-favorite-id', id);
    }
    card.setAttribute('data-favorite-id', id);

    if (cover.querySelector('[data-favorite-toggle]')) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pub-favorite';
    button.setAttribute('data-favorite-toggle', '');
    button.setAttribute('data-favorite-id', id);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Добавить в избранное');
    button.title = 'В избранное';
    button.innerHTML = HEART_ICON;
    cover.appendChild(button);
  });

  renderFavorites();

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-favorite-toggle]');
    if (!button) {
      return;
    }

    event.preventDefault();
    const id = button.getAttribute('data-favorite-id');
    if (!id) {
      return;
    }

    favoritesStore.toggle(id);
    renderFavorites();
    document.dispatchEvent(new Event('favorites:change'));
  });

  window.addEventListener('storage', function (event) {
    if (event.key === FAVORITES_KEY) {
      renderFavorites();
      document.dispatchEvent(new Event('favorites:change'));
    }
  });
}

function renderFavorites() {
  const ids = favoritesStore.read();

  document.querySelectorAll('[data-favorite-toggle]').forEach(function (button) {
    const active = ids.indexOf(button.getAttribute('data-favorite-id')) !== -1;
    const label = button.querySelector('[data-favorite-label]');

    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное');
    button.title = active ? 'Убрать из избранного' : 'В избранное';

    if (label) {
      label.textContent = active ? 'В избранном' : 'В избранное';
    }
  });

  document.querySelectorAll('[data-favorites-count]').forEach(function (element) {
    element.textContent = String(ids.length);
  });
}

function initPublicationFilters() {
  const list = document.getElementById('publicationList');
  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('[data-publication]'));
  const search = document.getElementById('publicationSearch');
  const topic = document.getElementById('publicationTopic');
  const sort = document.getElementById('publicationSort');
  const reset = document.getElementById('publicationReset');
  const favoritesButton = document.getElementById('publicationFavorites');
  const count = document.getElementById('publicationCount');
  const empty = document.getElementById('publicationEmpty');
  const emptyTitle = document.getElementById('publicationEmptyTitle');
  const emptyText = document.getElementById('publicationEmptyText');
  let favoritesOnly = false;

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const selectedTopic = topic.value;
    let visible = 0;

    cards.forEach(function (card) {
      const text = card.getAttribute('data-search').toLowerCase();
      const matchesQuery = text.indexOf(query) !== -1;
      const matchesTopic = selectedTopic === 'all' || card.getAttribute('data-topic') === selectedTopic;
      const matchesFavorites = !favoritesOnly || favoritesStore.has(card.getAttribute('data-favorite-id'));
      const show = matchesQuery && matchesTopic && matchesFavorites;

      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    count.textContent = visible;
    empty.hidden = visible !== 0;

    if (visible === 0) {
      if (emptyTitle) {
        emptyTitle.textContent = favoritesOnly ? 'В избранном пока пусто' : 'Ничего не найдено';
      }

      if (emptyText) {
        emptyText.textContent = favoritesOnly
          ? 'Нажмите на сердечко у публикации, чтобы сохранить её здесь.'
          : 'Измените запрос или сбросьте фильтры.';
      }
    }

    sortCards();
  }

  function sortCards() {
    const mode = sort.value;
    const sorted = cards.slice().sort(function (a, b) {
      if (mode === 'title') {
        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'ru');
      }

      const difference = a.getAttribute('data-date').localeCompare(b.getAttribute('data-date'));
      return mode === 'oldest' ? difference : -difference;
    });

    sorted.forEach(function (card) {
      list.appendChild(card);
    });
  }

  search.addEventListener('input', applyFilters);
  topic.addEventListener('change', applyFilters);
  sort.addEventListener('change', applyFilters);

  if (favoritesButton) {
    favoritesButton.addEventListener('click', function () {
      favoritesOnly = !favoritesOnly;
      favoritesButton.classList.toggle('is-active', favoritesOnly);
      favoritesButton.setAttribute('aria-pressed', favoritesOnly ? 'true' : 'false');
      applyFilters();
    });

    document.addEventListener('favorites:change', applyFilters);
  }

  reset.addEventListener('click', function () {
    search.value = '';
    topic.value = 'all';
    sort.value = 'newest';
    favoritesOnly = false;

    if (favoritesButton) {
      favoritesButton.classList.remove('is-active');
      favoritesButton.setAttribute('aria-pressed', 'false');
    }

    applyFilters();
  });

  applyFilters();
}

function initGlobalSearch() {
  const nav = document.querySelector('.navbar-nav');
  if (!nav || document.querySelector('[data-search-open]')) {
    return;
  }

  const rootPrefix = window.location.pathname.indexOf('/articles/') !== -1 ? '../' : '';
  const searchIndex = [
    {
      type: 'Публикация',
      title: 'Адаптивные модели для потоковых данных',
      meta: 'И. И. Иванов, А. А. Смирнова · Искусственный интеллект · Подготовка к публикации',
      keywords: 'потоковые данные онлайн-обучение дрейф данных машинное обучение разметка',
      url: 'articles/ai-streams.html'
    },
    {
      type: 'Публикация',
      title: 'Защита цепочек поставок ПО',
      meta: 'П. П. Петров · Кибербезопасность · На рецензировании',
      keywords: 'supply chain цепочка поставок безопасность сборки зависимости артефакты',
      url: 'articles/sec-supply-chain.html'
    },
    {
      type: 'Публикация',
      title: 'Архитектура микросервисов',
      meta: 'Д. Д. Орлов · Разработка ПО · Опубликовано',
      keywords: 'микросервисы архитектура наблюдаемость контракты тестирование платформа',
      url: 'articles/dev-microservices.html'
    },
    {
      type: 'Публикация',
      title: 'Маршрутизация в гетерогенных сетях',
      meta: 'С. С. Кузнецов · Сети и распределённые системы · Опубликовано',
      keywords: 'маршрутизация гетерогенные сети QoS топология пропускная способность',
      url: 'articles/net-routing.html'
    },
    {
      type: 'Публикация',
      title: 'Объяснимые модели для анализа данных',
      meta: 'И. И. Иванов · Искусственный интеллект · На рассмотрении',
      keywords: 'объяснимый ИИ интерпретация признаки XAI доверие анализ данных',
      url: 'articles/ai-explainable.html'
    },
    {
      type: 'Раздел',
      title: 'Публикации',
      meta: 'Каталог статей института',
      keywords: 'публикации статьи каталог',
      url: 'catalog.html'
    },
    {
      type: 'Раздел',
      title: 'Требования к публикациям',
      meta: 'Правила оформления и сроки подачи',
      keywords: 'требования оформление подача рукопись',
      url: 'requirements.html'
    },
    {
      type: 'Раздел',
      title: 'Об институте',
      meta: 'Миссия, лаборатории и команда',
      keywords: 'институт лаборатории команда история',
      url: 'about.html'
    },
    {
      type: 'Раздел',
      title: 'Контакты',
      meta: 'Адрес, телефон и схема проезда',
      keywords: 'контакты адрес телефон метро',
      url: 'contacts.html'
    },
    {
      type: 'Раздел',
      title: 'Подать статью',
      meta: 'Форма отправки рукописи',
      keywords: 'подать статью рукопись форма',
      url: 'order.html'
    },
    {
      type: 'Раздел',
      title: 'Главная',
      meta: 'НИИ информационных технологий',
      keywords: 'главная институт ит',
      url: 'index.html'
    }
  ];

  const searchItem = document.createElement('li');
  searchItem.className = 'nav-item nav-search-item ms-lg-1';
  searchItem.innerHTML =
    '<button class="nav-search-btn" type="button" data-search-open aria-label="Поиск по сайту" aria-haspopup="dialog">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
      '<span class="nav-search-text">Поиск</span>' +
      '<kbd>/</kbd>' +
    '</button>';

  const callToAction = nav.querySelector('.nav-item.ms-lg-2');
  if (callToAction) {
    nav.insertBefore(searchItem, callToAction);
  } else {
    nav.appendChild(searchItem);
  }

  document.body.insertAdjacentHTML('beforeend',
    '<div class="modal fade search-modal" id="siteSearchModal" tabindex="-1" aria-labelledby="siteSearchLabel" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-lg">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h2 class="modal-title h6" id="siteSearchLabel">Поиск по сайту</h2>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="search-input-wrap">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
              '<input class="form-control search-input" id="siteSearchInput" type="search" placeholder="Название, автор или ключевое слово" autocomplete="off" aria-controls="siteSearchResults">' +
            '</div>' +
            '<div class="search-hint"><span>Публикации, авторы и ключевые слова</span><span><kbd>↑</kbd><kbd>↓</kbd> выбрать · <kbd>Enter</kbd> открыть</span></div>' +
            '<div class="search-results" id="siteSearchResults" role="listbox" aria-label="Результаты поиска"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>');

  const modalElement = document.getElementById('siteSearchModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const input = document.getElementById('siteSearchInput');
  const results = document.getElementById('siteSearchResults');
  let activeIndex = -1;

  function setActive(index) {
    const links = Array.from(results.querySelectorAll('.search-result'));
    if (!links.length) {
      activeIndex = -1;
      return;
    }

    activeIndex = Math.max(0, Math.min(index, links.length - 1));
    links.forEach(function (link, linkIndex) {
      const active = linkIndex === activeIndex;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    links[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function renderResults(query) {
    const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    let items;

    if (!tokens.length) {
      items = searchIndex.filter(function (item) {
        return item.type === 'Публикация';
      });
    } else {
      items = searchIndex.map(function (item) {
        const title = normalizeSearchText(item.title);
        const meta = normalizeSearchText(item.meta);
        const keywords = normalizeSearchText(item.keywords);
        const haystack = title + ' ' + meta + ' ' + keywords + ' ' + normalizeSearchText(item.type);

        if (!tokens.every(function (token) {
          return haystack.indexOf(token) !== -1;
        })) {
          return null;
        }

        let score = 0;
        tokens.forEach(function (token) {
          if (title.indexOf(token) !== -1) {
            score += 4;
          }
          if (meta.indexOf(token) !== -1) {
            score += 2;
          }
          if (keywords.indexOf(token) !== -1) {
            score += 1;
          }
        });

        return { item: item, score: score };
      }).filter(Boolean).sort(function (a, b) {
        return b.score - a.score;
      }).map(function (entry) {
        return entry.item;
      });
    }

    results.innerHTML = '';

    if (!items.length) {
      results.innerHTML = '<p class="search-empty mb-0">Ничего не найдено. Попробуйте другое слово.</p>';
      activeIndex = -1;
      return;
    }

    items.forEach(function (item) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = rootPrefix + item.url;
      link.setAttribute('role', 'option');
      link.innerHTML =
        '<span class="search-result-type">' + escapeHtml(item.type) + '</span>' +
        '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
        '<span class="search-result-meta">' + escapeHtml(item.meta) + '</span>';
      results.appendChild(link);
    });

    setActive(0);
  }

  function openSearch() {
    const collapse = document.getElementById('mainNav');
    if (collapse && collapse.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    }

    modal.show();
  }

  document.querySelectorAll('[data-search-open]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  modalElement.addEventListener('shown.bs.modal', function () {
    input.focus();
    input.select();
  });

  modalElement.addEventListener('hidden.bs.modal', function () {
    input.value = '';
    renderResults('');
  });

  input.addEventListener('input', function () {
    renderResults(input.value);
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const links = results.querySelectorAll('.search-result');
      if (!links.length) {
        return;
      }

      event.preventDefault();
      setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    }

    if (event.key === 'Enter') {
      const active = results.querySelector('.search-result.is-active');
      if (active) {
        event.preventDefault();
        active.click();
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    const isSlash = event.key === '/' || event.code === 'Slash';
    if (!isSlash || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }

    const target = event.target;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }

    event.preventDefault();
    openSearch();
  });

  renderResults('');
}

function initEventCalendar() {
  const list = document.getElementById('eventList');
  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('[data-event]'));
  const filters = Array.from(document.querySelectorAll('[data-event-filter]'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  cards.forEach(function (card) {
    const end = new Date(card.getAttribute('data-event-end') + 'T23:59:59');
    const upcoming = end >= today;
    card.setAttribute('data-event-state', upcoming ? 'upcoming' : 'past');
    card.classList.toggle('is-past', !upcoming);
  });

  function updateCounts() {
    const counts = { all: cards.length, upcoming: 0, past: 0 };

    cards.forEach(function (card) {
      counts[card.getAttribute('data-event-state')] += 1;
    });

    filters.forEach(function (button) {
      const count = button.querySelector('[data-event-count]');
      if (count) {
        count.textContent = String(counts[button.getAttribute('data-event-filter')]);
      }
    });
  }

  function applyFilter(mode) {
    cards.forEach(function (card) {
      card.hidden = mode !== 'all' && card.getAttribute('data-event-state') !== mode;
    });

    filters.forEach(function (button) {
      const active = button.getAttribute('data-event-filter') === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(button.getAttribute('data-event-filter'));
    });
  });

  list.addEventListener('click', function (event) {
    const button = event.target.closest('[data-add-calendar]');
    if (!button) {
      return;
    }

    const card = button.closest('[data-event]');
    if (card) {
      downloadCalendarEvent(card, button);
    }
  });

  updateCounts();
  applyFilter('all');
}

function addDaysToIso(isoDate, days) {
  const parts = isoDate.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function escapeIcs(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function downloadCalendarEvent(card, button) {
  const start = card.getAttribute('data-event-start');
  const end = card.getAttribute('data-event-end');
  const slug = card.getAttribute('data-event-slug') || 'event';
  const title = card.getAttribute('data-event-title') || 'Мероприятие НИИ ИТ';
  const place = card.getAttribute('data-event-place') || '';
  const description = card.getAttribute('data-event-description') || '';
  const startValue = start.replace(/-/g, '');
  const endValue = addDaysToIso(end, 1).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NII IT//Events//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + slug + '@iitr.ru',
    'DTSTAMP:' + stamp,
    'DTSTART;VALUE=DATE:' + startValue,
    'DTEND;VALUE=DATE:' + endValue,
    'SUMMARY:' + escapeIcs(title),
    'LOCATION:' + escapeIcs(place),
    'DESCRIPTION:' + escapeIcs(description),
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = slug + '.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);

  const original = button.innerHTML;
  button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Календарь скачан';
  button.classList.add('is-done');

  window.clearTimeout(button._calendarTimer);
  button._calendarTimer = window.setTimeout(function () {
    button.innerHTML = original;
    button.classList.remove('is-done');
  }, 2200);
}

function initOrderForm() {
  const form = document.querySelector('.js-validate');
  if (!form) {
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const modalElement = document.getElementById('submitModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }

    form.classList.remove('was-validated');
    form.reset();
  });
}

function initBackToTop() {
  const button = document.querySelector('[data-to-top]');
  if (!button) {
    return;
  }

  function toggleButton() {
    button.classList.toggle('is-visible', window.scrollY > 480);
  }

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();

  button.addEventListener('click', function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduceMotion || document.hidden ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior: behavior });
  });
}
