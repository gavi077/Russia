(async function () {
  const box = document.getElementById('yandexMap');
  const status = document.getElementById('mapStatus');
  const input = document.getElementById('regionSearch');
  const dropdown = document.getElementById('regionDropdown');
  const picker = document.getElementById('regionPicker');
  const objectList = document.getElementById('objectList');
  const key = (window.YANDEX_MAPS_API_KEY || '').trim();

  if (!key || key === 'PASTE_YANDEX_MAPS_API_KEY_HERE') {
    status.textContent = 'Вставьте API-ключ в yandex-config.js.';
    box.innerHTML = `<div class="map-placeholder"><div class="map-placeholder-icon">Я</div>
      <h3>Яндекс Карта подготовлена</h3><p>Остался один шаг: вставить API-ключ в файл <b>yandex-config.js</b>.</p></div>`;
    return;
  }

  function loadYandex() {
    return new Promise((resolve, reject) => {
      if (window.ymaps3) return resolve();
      const s = document.createElement('script');
      s.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Yandex Maps API load error'));
      document.head.appendChild(s);
    });
  }

  try {
    status.textContent = 'Загрузка Яндекс Карты...';
    await loadYandex();
    await ymaps3.ready;

    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;
    const map = new YMap(box, { location: { center: [90, 61.5], zoom: 3 } });
    map.addChild(new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    /*
      Центры нужны только для навигации карты.
      Координаты ведут к административному центру или центральной части региона.
      Это не границы региона и не политическая разметка карты.
    */
    const REGION_VIEW = {
      "Республика Адыгея": {c:[40.1058,44.6098],z:8},
      "Республика Алтай": {c:[85.9603,51.9581],z:7},
      "Республика Башкортостан": {c:[56.0153,54.7388],z:6},
      "Республика Бурятия": {c:[107.5846,51.8345],z:6},
      "Республика Дагестан": {c:[47.5047,42.9831],z:7},
      "Донецкая Народная Республика": {c:[37.8029,48.0159],z:7},
      "Республика Ингушетия": {c:[44.7732,43.1668],z:9},
      "Кабардино-Балкарская Республика": {c:[43.6071,43.4846],z:8},
      "Республика Калмыкия": {c:[44.2702,46.3083],z:7},
      "Карачаево-Черкесская Республика": {c:[42.0578,44.2233],z:8},
      "Республика Карелия": {c:[34.3597,61.7849],z:6},
      "Республика Коми": {c:[50.8365,61.6688],z:5},
      "Республика Крым": {c:[34.1024,44.9521],z:7},
      "Луганская Народная Республика": {c:[39.3078,48.5740],z:7},
      "Республика Марий Эл": {c:[47.8861,56.6328],z:8},
      "Республика Мордовия": {c:[45.1839,54.1874],z:8},
      "Республика Саха (Якутия)": {c:[129.7326,62.0281],z:4},
      "Республика Северная Осетия - Алания": {c:[44.6819,43.0251],z:8},
      "Республика Татарстан": {c:[49.1064,55.7961],z:7},
      "Республика Тыва": {c:[94.4378,51.7191],z:6},
      "Удмуртская Республика": {c:[53.2045,56.8527],z:7},
      "Республика Хакасия": {c:[91.4292,53.7212],z:7},
      "Чеченская Республика": {c:[45.6986,43.3178],z:8},
      "Чувашская Республика": {c:[47.2519,56.1439],z:8},

      "Алтайский край": {c:[83.7699,53.3474],z:6},
      "Забайкальский край": {c:[113.4994,52.0336],z:5},
      "Камчатский край": {c:[158.6559,53.0370],z:5},
      "Краснодарский край": {c:[38.9753,45.0355],z:6},
      "Красноярский край": {c:[92.8526,56.0106],z:4},
      "Пермский край": {c:[56.2294,58.0105],z:6},
      "Приморский край": {c:[131.8855,43.1155],z:6},
      "Ставропольский край": {c:[41.9734,45.0445],z:6},
      "Хабаровский край": {c:[135.0719,48.4827],z:5},

      "Амурская область": {c:[127.5365,50.2907],z:6},
      "Архангельская область": {c:[40.5158,64.5393],z:5},
      "Астраханская область": {c:[48.0408,46.3479],z:7},
      "Белгородская область": {c:[36.5873,50.5954],z:8},
      "Брянская область": {c:[34.3637,53.2521],z:7},
      "Владимирская область": {c:[40.4066,56.1291],z:7},
      "Волгоградская область": {c:[44.5169,48.7071],z:6},
      "Вологодская область": {c:[39.8915,59.2205],z:6},
      "Воронежская область": {c:[39.2003,51.6608],z:7},
      "Запорожская область": {c:[35.1396,47.8388],z:7},
      "Ивановская область": {c:[40.9739,57.0004],z:8},
      "Иркутская область": {c:[104.2807,52.2864],z:5},
      "Калининградская область": {c:[20.4522,54.7104],z:8},
      "Калужская область": {c:[36.2612,54.5138],z:8},
      "Кемеровская область - Кузбасс": {c:[86.0873,55.3552],z:6},
      "Кировская область": {c:[49.6679,58.6036],z:6},
      "Костромская область": {c:[40.9269,57.7679],z:7},
      "Курганская область": {c:[65.3411,55.4410],z:7},
      "Курская область": {c:[36.1930,51.7304],z:8},
      "Ленинградская область": {c:[31.2889,59.9391],z:7},
      "Липецкая область": {c:[39.5992,52.6088],z:8},
      "Магаданская область": {c:[150.8085,59.5682],z:5},
      "Московская область": {c:[37.6176,55.7558],z:7},
      "Мурманская область": {c:[33.0749,68.9707],z:6},
      "Нижегородская область": {c:[44.0059,56.3269],z:7},
      "Новгородская область": {c:[31.2699,58.5215],z:7},
      "Новосибирская область": {c:[82.9204,55.0302],z:7},
      "Омская область": {c:[73.3686,54.9893],z:6},
      "Оренбургская область": {c:[55.0969,51.7682],z:6},
      "Орловская область": {c:[36.0638,52.9704],z:8},
      "Пензенская область": {c:[45.0183,53.1959],z:7},
      "Псковская область": {c:[28.3322,57.8194],z:7},
      "Ростовская область": {c:[39.7015,47.2357],z:6},
      "Рязанская область": {c:[39.7349,54.6296],z:7},
      "Самарская область": {c:[50.1002,53.1959],z:7},
      "Саратовская область": {c:[46.0343,51.5336],z:7},
      "Сахалинская область": {c:[142.7380,46.9591],z:5},
      "Свердловская область": {c:[60.5975,56.8389],z:6},
      "Смоленская область": {c:[32.0453,54.7826],z:7},
      "Тамбовская область": {c:[41.4523,52.7212],z:7},
      "Тверская область": {c:[35.9119,56.8587],z:7},
      "Томская область": {c:[84.9482,56.4846],z:6},
      "Тульская область": {c:[37.6175,54.1930],z:8},
      "Тюменская область": {c:[65.5343,57.1530],z:6},
      "Ульяновская область": {c:[48.4026,54.3142],z:7},
      "Херсонская область": {c:[32.6178,46.6354],z:7},
      "Челябинская область": {c:[61.4026,55.1644],z:6},
      "Ярославская область": {c:[39.8845,57.6261],z:7},

      "Москва": {c:[37.6176,55.7558],z:10},
      "Санкт-Петербург": {c:[30.3159,59.9391],z:10},
      "Севастополь": {c:[33.5254,44.6167],z:10},
      "Еврейская автономная область": {c:[132.9217,48.7946],z:7},
      "Ненецкий автономный округ": {c:[53.0069,67.6381],z:5},
      "Ханты-Мансийский автономный округ - Югра": {c:[69.0189,61.0032],z:5},
      "Чукотский автономный округ": {c:[177.5103,64.7342],z:4},
      "Ямало-Ненецкий автономный округ": {c:[66.6019,66.5298],z:5}
    };

    // Реальные точки можно подключать позднее из отдельного файла:
    // window.HEALTH_MAP_OBJECTS = [{name, category, region, coords:[lon,lat], type, url}, ...]
    const objects = Array.isArray(window.HEALTH_MAP_OBJECTS) ? window.HEALTH_MAP_OBJECTS : [];
    const visible = new Set(['accommodation','resorts','practices','manufacturers']);
    const markerStore = new Map();
    let selectedRegion = '';
    let regionMarker = null;
    let activeIndex = -1;

    const symbols = {
      accommodation:'⌂',
      resorts:'★',
      practices:'✣',
      manufacturers:'▢'
    };

    function createObjectMarker(o, index) {
      const el = document.createElement('button');
      el.className = `ym-marker marker-${o.category}`;
      el.type = 'button';
      el.innerHTML = `<span>${symbols[o.category] || '•'}</span>`;
      el.title = o.name || '';
      const marker = new YMapMarker({coordinates:o.coords}, el);
      el.onclick = (e) => {
        e.stopPropagation();
        map.update({location:{center:o.coords,zoom:12,duration:450}});
        showCard(o);
      };
      return {marker,el,index};
    }

    function showCard(o) {
      const card = document.getElementById('mapCard');
      card.innerHTML = `<div class="map-card-close" id="mapCardClose">×</div>
        <div class="map-card-type">${o.type || 'Объект'}</div>
        <h3>${o.name || ''}</h3>
        <p>${o.description || 'Информация об объекте будет добавлена в региональную базу.'}</p>
        ${o.url ? `<a href="${o.url}">Подробнее →</a>` : ''}`;
      card.classList.add('show');
      document.getElementById('mapCardClose').onclick = () => card.classList.remove('show');
    }

    function clearObjectMarkers() {
      markerStore.forEach(rec => map.removeChild(rec.marker));
      markerStore.clear();
    }

    function renderObjects() {
      objectList.innerHTML = '';

      if (!selectedRegion) {
        objectList.innerHTML = `<div class="empty-objects">Сначала выберите регион. После этого здесь появятся доступные места отдыха, курортные зоны, практики и производители этого региона.</div>`;
        return;
      }

      const filtered = objects.filter(o =>
        o.region === selectedRegion && visible.has(o.category)
      );

      if (!filtered.length) {
        objectList.innerHTML = `<div class="empty-objects"><b>${selectedRegion}</b><br>Объекты по выбранным категориям пока не загружены в базу. Карта уже готова к их отображению без изменения навигации.</div>`;
        return;
      }

      filtered.forEach(o => {
        const el = document.createElement('div');
        el.className = 'object-item';
        el.innerHTML = `<b>${o.name}</b><span>${o.type || ''}</span>`;
        el.onclick = () => {
          map.update({location:{center:o.coords,zoom:12,duration:450}});
          showCard(o);
        };
        objectList.appendChild(el);
      });
    }

    function syncObjectMarkers() {
      clearObjectMarkers();
      if (!selectedRegion) {
        renderObjects();
        return;
      }

      objects
        .filter(o => o.region === selectedRegion && visible.has(o.category))
        .forEach((o, i) => {
          const rec = createObjectMarker(o, i);
          markerStore.set(`${o.region}-${o.name}-${i}`, rec);
          map.addChild(rec.marker);
        });

      renderObjects();
    }

    function setRegionMarker(name, view) {
      if (regionMarker) {
        map.removeChild(regionMarker);
        regionMarker = null;
      }
      const el = document.createElement('div');
      el.className = 'region-center-marker';
      el.textContent = name;
      regionMarker = new YMapMarker({coordinates:view.c}, el);
      map.addChild(regionMarker);
    }

    function selectRegion(name) {
      const view = REGION_VIEW[name];
      if (!view) return;

      selectedRegion = name;
      input.value = name;
      closeDropdown();
      setRegionMarker(name, view);
      map.update({location:{center:view.c,zoom:view.z,duration:500}});
      status.innerHTML = `<b>${name}</b> выбран. Карта перемещена к региону. Ниже можно включать и отключать категории объектов.`;
      syncObjectMarkers();
    }

    function regionNames() {
      return (window.RUSSIA_REGIONS || []).filter(name => REGION_VIEW[name]);
    }

    function getFilteredRegions(query, forceAll=false) {
      const all = regionNames();
      if (forceAll) return all;
      const q = (query || '').trim().toLowerCase();
      if (!q) return all;
      return all.filter(name => name.toLowerCase().includes(q));
    }

    function renderDropdown(query='', forceAll=false) {
      const names = getFilteredRegions(query, forceAll);
      dropdown.innerHTML = '';
      activeIndex = -1;

      if (!names.length) {
        dropdown.innerHTML = `<div class="empty-objects">Регион не найден. Попробуйте другое написание.</div>`;
        openDropdown();
        return;
      }

      names.forEach((name, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'region-option';
        btn.textContent = name;
        btn.dataset.index = idx;
        btn.onmousedown = (e) => e.preventDefault();
        btn.onclick = () => selectRegion(name);
        dropdown.appendChild(btn);
      });
      openDropdown();
    }

    function openDropdown() {
      dropdown.classList.add('open');
      input.setAttribute('aria-expanded','true');
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded','false');
      activeIndex = -1;
    }

    // Клик по полю всегда показывает ПОЛНЫЙ список, даже если регион уже выбран.
    input.addEventListener('focus', () => renderDropdown('', true));
    input.addEventListener('click', () => renderDropdown('', true));

    // При наборе список фильтруется.
    input.addEventListener('input', () => renderDropdown(input.value, false));

    // Клавиатурная навигация.
    input.addEventListener('keydown', (e) => {
      const options = [...dropdown.querySelectorAll('.region-option')];
      if (e.key === 'ArrowDown' && options.length) {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, options.length - 1);
      } else if (e.key === 'ArrowUp' && options.length) {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
      } else if (e.key === 'Enter' && activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault();
        options[activeIndex].click();
        return;
      } else if (e.key === 'Escape') {
        closeDropdown();
        return;
      } else {
        return;
      }

      options.forEach((o,i) => o.classList.toggle('active', i === activeIndex));
      options[activeIndex]?.scrollIntoView({block:'nearest'});
    });

    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) closeDropdown();
    });

    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.layer;
        if (visible.has(k)) {
          visible.delete(k);
          btn.classList.remove('active');
        } else {
          visible.add(k);
          btn.classList.add('active');
        }
        syncObjectMarkers();
      };
    });

    renderObjects();
    status.textContent = 'Выберите регион в поле выше. Карта сразу перейдёт к выбранному региону.';
  } catch (e) {
    console.error(e);
    status.textContent = 'Карта не загрузилась. Проверьте API-ключ и HTTP Referer gavi077.github.io.';
    box.innerHTML = `<div class="map-placeholder"><div class="map-placeholder-icon">!</div>
      <h3>Карта пока не загрузилась</h3>
      <p>Проверьте ключ в <b>yandex-config.js</b>. После изменения ограничения HTTP Referer иногда требуется немного времени.</p></div>`;
  }
})();
