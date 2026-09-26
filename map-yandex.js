(async function () {
  const box = document.getElementById('yandexMap');
  const status = document.getElementById('mapStatus');
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

    const {YMap,YMapDefaultSchemeLayer,YMapDefaultFeaturesLayer,YMapMarker} = ymaps3;
    const map = new YMap(box,{location:{center:[90,61.5],zoom:3}});
    map.addChild(new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    const objects=[
      {id:1,name:'Нальчик - демонстрационный объект размещения',cat:'accommodation',type:'Место размещения',coords:[43.6071,43.4846],url:'places.html'},
      {id:2,name:'Нальчик - демонстрационный производитель',cat:'manufacturers',type:'Производитель',coords:[43.590,43.493],url:'manufacturers.html'},
      {id:3,name:'Нальчик - демонстрационная практика',cat:'practices',type:'Практика',coords:[43.625,43.475],url:'practices.html'},
      {id:4,name:'Приэльбрусье - демонстрационная курортная зона',cat:'resorts',type:'Курортная зона',coords:[42.514,43.257],url:'kbr.html'},
      {id:5,name:'Горная природная точка - демо',cat:'nature',type:'Природный объект',coords:[42.75,43.35],url:'kbr.html'}
    ];
    const visible=new Set(['accommodation','manufacturers','practices','resorts','nature']);
    const markerStore=new Map();
    const symbols={accommodation:'⌂',manufacturers:'▢',practices:'✣',resorts:'★',nature:'♧'};

    function createMarker(o){
      const el=document.createElement('button');
      el.className=`ym-marker marker-${o.cat}`;
      el.type='button'; el.innerHTML=`<span>${symbols[o.cat]||'•'}</span>`; el.title=o.name;
      const marker=new YMapMarker({coordinates:o.coords},el);
      el.onclick=(e)=>{e.stopPropagation();map.update({location:{center:o.coords,zoom:12,duration:500}});showCard(o)};
      return {marker,el};
    }
    function showCard(o){
      const card=document.getElementById('mapCard');
      card.innerHTML=`<div class="map-card-close" id="mapCardClose">×</div><div class="map-card-type">${o.type}</div>
        <h3>${o.name}</h3><p>Демонстрационная точка. Позже здесь будут фото, рейтинг, статус верификации и краткое описание.</p>
        <a href="${o.url}">Подробнее →</a>`;
      card.classList.add('show');
      document.getElementById('mapCardClose').onclick=()=>card.classList.remove('show');
    }
    function syncMarkers(){
      [...markerStore.entries()].forEach(([id,rec])=>{
        const o=objects.find(x=>x.id===id);
        if(o&&!visible.has(o.cat)){map.removeChild(rec.marker);markerStore.delete(id)}
      });
      objects.forEach(o=>{
        if(visible.has(o.cat)&&!markerStore.has(o.id)){
          const rec=createMarker(o);markerStore.set(o.id,rec);map.addChild(rec.marker);
        }
      });
      renderObjects();
    }
    function renderObjects(){
      const list=document.getElementById('objectList');list.innerHTML='';
      objects.filter(o=>visible.has(o.cat)).forEach(o=>{
        const el=document.createElement('div');el.className='object-item';
        el.innerHTML=`<b>${o.name}</b><span>${o.type}</span>`;
        el.onclick=()=>{map.update({location:{center:o.coords,zoom:12,duration:500}});showCard(o)};
        list.appendChild(el);
      });
    }
    document.querySelectorAll('.layer-btn').forEach(btn=>btn.onclick=()=>{
      const k=btn.dataset.layer;
      if(visible.has(k)){visible.delete(k);btn.classList.remove('active')}else{visible.add(k);btn.classList.add('active')}
      syncMarkers();
    });

    const centers={
      'Кабардино-Балкарская Республика':[43.05,43.45],
      'Ставропольский край':[42.85,45.05],
      'Москва':[37.6176,55.7558],
      'Санкт-Петербург':[30.3159,59.9391],
      'Донецкая Народная Республика':[37.80,48.02],
      'Луганская Народная Республика':[39.31,48.57],
      'Запорожская область':[35.14,47.84],
      'Херсонская область':[33.38,46.65]
    };

    function renderRegions(q=''){
      const list=document.getElementById('regionList');list.innerHTML='';
      const n=q.trim().toLowerCase();
      (window.RUSSIA_REGIONS||[]).filter(x=>!n||x.toLowerCase().includes(n)).forEach(name=>{
        const el=document.createElement('div');el.className='region-item';
        el.innerHTML=`<b>${name}</b><span>Показать на карте</span>`;
        el.onclick=()=>{
          const c=centers[name];
          if(c) map.update({location:{center:c,zoom:name==='Кабардино-Балкарская Республика'?8:7,duration:500}});
          else document.getElementById('regionSearchNote').textContent=`${name}: регион есть в навигации сайта. Точный центр добавим при наполнении региональной базы.`;
        };
        list.appendChild(el);
      });
    }
    document.getElementById('regionSearch').oninput=e=>renderRegions(e.target.value);
    document.getElementById('fitKbr').onclick=()=>map.update({location:{center:[43.05,43.45],zoom:8,duration:500}});
    document.getElementById('fitRussia').onclick=()=>map.update({location:{center:[90,61.5],zoom:3,duration:500}});

    syncMarkers(); renderRegions();
    status.textContent='Яндекс Карта подключена. Русская локаль ru_RU.';
  } catch (e) {
    console.error(e);
    status.textContent='Карта не загрузилась. Проверьте API-ключ и HTTP Referer gavi077.github.io.';
    box.innerHTML=`<div class="map-placeholder"><div class="map-placeholder-icon">!</div><h3>Карта пока не загрузилась</h3>
      <p>Проверьте ключ в <b>yandex-config.js</b>. После изменения ограничения HTTP Referer иногда требуется немного времени.</p></div>`;
  }
})();