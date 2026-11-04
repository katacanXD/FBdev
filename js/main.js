document.addEventListener('DOMContentLoaded', function () {
  initPublicationFilters();
  initDemoForm();
});

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
  const count = document.getElementById('publicationCount');
  const empty = document.getElementById('publicationEmpty');

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const selectedTopic = topic.value;
    let visible = 0;

    cards.forEach(function (card) {
      const text = card.getAttribute('data-search').toLowerCase();
      const matchesQuery = text.indexOf(query) !== -1;
      const matchesTopic = selectedTopic === 'all' || card.getAttribute('data-topic') === selectedTopic;
      const show = matchesQuery && matchesTopic;

      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    count.textContent = visible;
    empty.hidden = visible !== 0;
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

  reset.addEventListener('click', function () {
    search.value = '';
    topic.value = 'all';
    sort.value = 'newest';
    applyFilters();
  });

  applyFilters();
}

function initDemoForm() {
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
