const MAP_CENTER = [37.481102, 55.670155];
const MAP_ZOOM = 16;

function initMap() {
  const container = document.getElementById('map');
  if (!container) {
    return;
  }

  const center = MAP_CENTER.join(',');
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
  container.append(link);
}

document.addEventListener('DOMContentLoaded', initMap);
