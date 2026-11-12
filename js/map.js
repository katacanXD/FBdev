const MAP_LAT = 55.670155;
const MAP_LON = 37.481102;
const MAP_ZOOM = 16;

async function initMap() {
  const container = document.getElementById('map');
  if (!container) {
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    showStaticMap(container);
    return;
  }

  try {
    await withTimeout(loadYandexMaps(apiKey), 10000);
    showInteractiveMap(container);
  } catch (error) {
    showStaticMap(container);
  }
}

async function getApiKey() {
  if (window.MAP_API_KEY) {
    return window.MAP_API_KEY;
  }

  try {
    const response = await fetch('js/map-config.js', { cache: 'no-store' });
    if (!response.ok) {
      return '';
    }

    const text = await response.text();
    const match = text.match(/MAP_API_KEY\s*=\s*['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  } catch (error) {
    return '';
  }
}

function loadYandexMaps(apiKey) {
  return new Promise(function (resolve, reject) {
    if (window.ymaps) {
      window.ymaps.ready(resolve);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(apiKey) + '&lang=ru_RU';
    script.onload = function () {
      window.ymaps.ready(resolve);
    };
    script.onerror = reject;
    document.head.append(script);
  });
}

function withTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject(new Error('Map timeout'));
      }, timeout);
    })
  ]);
}

function showInteractiveMap(container) {
  const map = new window.ymaps.Map(container, {
    center: [MAP_LAT, MAP_LON],
    zoom: MAP_ZOOM,
    controls: ['zoomControl']
  });

  const placemark = new window.ymaps.Placemark(
    [MAP_LAT, MAP_LON],
    {
      hintContent: 'НИИ ИТ',
      balloonContentHeader: 'НИИ ИТ',
      balloonContentBody: 'Москва, проспект Вернадского, 78'
    },
    {
      preset: 'islands#redDotIcon'
    }
  );

  map.geoObjects.add(placemark);
}

function showStaticMap(container) {
  const center = MAP_LON + ',' + MAP_LAT;
  const point = center + ',pm2rdm';
  const mapUrl = 'https://yandex.ru/maps/?ll=' + encodeURIComponent(center) + '&z=' + MAP_ZOOM + '&pt=' + encodeURIComponent(point);
  const imageUrl = 'https://static-maps.yandex.ru/1.x/?ll=' + encodeURIComponent(center) + '&z=' + MAP_ZOOM + '&l=map&pt=' + encodeURIComponent(point) + '&size=650,420';

  const link = document.createElement('a');
  link.className = 'map-link';
  link.href = mapUrl;
  link.target = '_blank';
  link.rel = 'noopener';

  const image = document.createElement('img');
  image.className = 'map-image';
  image.src = imageUrl;
  image.alt = 'Карта: Москва, проспект Вернадского, 78';
  image.width = 650;
  image.height = 420;
  image.loading = 'lazy';

  image.addEventListener('error', function () {
    container.innerHTML = '<div class="map-fallback">Карта временно недоступна. <a href="' + mapUrl + '">Открыть в Яндекс Картах</a></div>';
  });

  link.append(image);
  container.innerHTML = '';
  container.append(link);
}

document.addEventListener('DOMContentLoaded', initMap);
