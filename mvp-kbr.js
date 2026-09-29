
(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
  window.addEventListener('DOMContentLoaded',()=>{
    // Places filters
    const cards=[...document.querySelectorAll('[data-place-card]')];
    const filters=[...document.querySelectorAll('[data-place-filter]')];
    if(cards.length && filters.length){
      const apply=()=>{
        const vals=Object.fromEntries(filters.map(f=>[f.dataset.placeFilter,f.value]));
        cards.forEach(c=>{
          let ok=true;
          for(const [k,v] of Object.entries(vals)){
            if(!v) continue;
            const hay=(c.dataset[k]||'').toLowerCase();
            if(!hay.includes(v.toLowerCase())) ok=false;
          }
          c.style.display=ok?'flex':'none';
        });
        const shown=cards.filter(c=>c.style.display!=='none').length;
        const n=document.getElementById('placeResultCount'); if(n)n.textContent=shown;
      };
      filters.forEach(f=>f.addEventListener('change',apply));
      apply();
    }

    // Favorite
    document.querySelectorAll('[data-favorite]').forEach(btn=>{
      const id=btn.dataset.favorite;
      const key='okr_favorites';
      let fav=JSON.parse(localStorage.getItem(key)||'[]');
      const sync=()=>btn.textContent=fav.includes(id)?'★ В избранном':'☆ В избранное';
      sync();
      btn.addEventListener('click',()=>{
        fav=fav.includes(id)?fav.filter(x=>x!==id):[...fav,id];
        localStorage.setItem(key,JSON.stringify(fav));
        sync();
      });
    });

    // Booking form
    const bookingForm=document.getElementById('bookingForm');
    if(bookingForm){
      const qp=new URLSearchParams(location.search);
      const place=qp.get('place')||'Санаторий «Голубые ели»';
      const target=document.getElementById('bookingPlace');
      if(target) target.value=place;
      const summary=document.getElementById('bookingSummary');
      if(summary) summary.innerHTML='<b>'+esc(place)+'</b><br>После отправки заявка появится в кабинете пользователя. На первом этапе санаторий связывается с пользователем напрямую.';
      bookingForm.addEventListener('submit',e=>{
        e.preventDefault();
        const fd=new FormData(bookingForm);
        const item={
          id:Date.now(),
          place:fd.get('place'),
          name:fd.get('name'),
          phone:fd.get('phone'),
          email:fd.get('email'),
          dates:fd.get('dates'),
          guests:fd.get('guests'),
          comment:fd.get('comment'),
          status:'Заявка отправлена',
          created:new Date().toLocaleString('ru-RU')
        };
        const key='okr_bookings';
        const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.unshift(item);
        localStorage.setItem(key,JSON.stringify(arr));
        const done=document.getElementById('bookingDone');
        if(done){done.style.display='block';done.innerHTML='<b>Заявка сохранена.</b><br>В рабочей версии она будет отправлена организации и продублирована в кабинете пользователя.';}
        bookingForm.reset(); if(target)target.value=place;
      });
    }

    // User account
    const list=document.getElementById('userBookings');
    if(list){
      const arr=JSON.parse(localStorage.getItem('okr_bookings')||'[]');
      if(!arr.length) list.innerHTML='<div class="mvp-empty">Заявок пока нет. Откройте карточку санатория и нажмите «Оставить заявку».</div>';
      else list.innerHTML=arr.map(x=>`<div class="mvp-booking"><b>${esc(x.place)}</b><span>${esc(x.status)}</span><div class="mvp-note">${esc(x.created)} · ${esc(x.dates||'Даты не указаны')} · гостей: ${esc(x.guests||'1')}</div></div>`).join('');
    }
    const favBox=document.getElementById('userFavorites');
    if(favBox){
      const fav=JSON.parse(localStorage.getItem('okr_favorites')||'[]');
      favBox.innerHTML=fav.includes('golubye-eli')
        ? '<div class="mvp-booking"><b>Санаторий «Голубые ели»</b><a href="sanatorium-golubye-eli.html">Открыть карточку →</a></div>'
        : '<div class="mvp-empty">Избранное пока пусто.</div>';
    }
  });
})();
