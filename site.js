
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return [...document.querySelectorAll(sel)]}
function fakeSubmit(id,msg){
  const f=document.getElementById(id);
  if(!f) return;
  f.addEventListener("submit",e=>{
    e.preventDefault();
    const box=document.createElement("div");
    box.className="notice";
    box.style.marginTop="16px";
    box.textContent=msg;
    f.after(box);
    f.querySelectorAll("button").forEach(b=>b.disabled=true);
  });
}
document.addEventListener("DOMContentLoaded",()=>{
  qsa("[data-go]").forEach(el=>el.addEventListener("click",()=>location.href=el.dataset.go));
});


document.addEventListener("DOMContentLoaded", () => {
  const crumbs = document.querySelector(".breadcrumbs");
  if (crumbs && !document.querySelector(".back-nav-btn")) {
    const back = document.createElement("button");
    back.className = "back-nav-btn";
    back.type = "button";
    back.innerHTML = "← Назад";
    back.addEventListener("click", () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = "index.html";
    });
    crumbs.insertAdjacentElement("beforebegin", back);
  }
});


// =========================================================
// v14 VISUAL PATCH
// Визуальные изменения без вмешательства в карту и данные.
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const path = (window.location.pathname || "").toLowerCase();
  const file = path.split("/").pop();

  // Убираем декоративные значки только на внутренних страницах.
  // Главная index.html и корень сайта сохраняют свои существующие значки.
  const isHome = file === "" || file === "index.html";
  if (!isHome) document.body.classList.add("inner-page-clean");

  // Меняем временный символ ✦ в шапках/подвалах на фирменный логотип.
  document.querySelectorAll(".emblem").forEach((emblem) => {
    if (emblem.querySelector("img")) return;
    emblem.textContent = "";
    const logo = document.createElement("img");
    logo.src = "assets/logo/ozdorovitelnaya-logo.png";
    logo.alt = "Оздоровительная карта России";
    logo.className = "site-brand-logo";
    emblem.appendChild(logo);
  });
});



// =========================================================
// СОГЛАСОВАННЫЙ ДЕМО-ФУНКЦИОНАЛ КАБИНЕТОВ
// Только локальная работа в браузере. Карты, API и главная не затрагиваются.
// =========================================================
const OZ_STORE = {
  get(key, fallback){
    try { const raw=localStorage.getItem('oz_'+key); return raw ? JSON.parse(raw) : fallback; }
    catch(e){ return fallback; }
  },
  set(key, value){ localStorage.setItem('oz_'+key, JSON.stringify(value)); return value; }
};
function ozId(prefix='id'){ return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function ozNow(){ return new Date().toLocaleString('ru-RU'); }
function ozNotify(text, type='info'){
  const list=OZ_STORE.get('notifications',[]);
  list.unshift({id:ozId('n'),text,type,date:ozNow(),read:false});
  OZ_STORE.set('notifications',list.slice(0,30));
}
function ozEscape(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));}
function ozSeed(){
  if(!localStorage.getItem('oz_favorites')) OZ_STORE.set('favorites',[
    {id:'fav_golubye',name:'Санаторий «Голубые ели»',type:'Место размещения',region:'Кабардино-Балкарская Республика'},
    {id:'fav_kmv',name:'ООО «Кавказские Минеральные Воды»',type:'Производитель',region:'Кабардино-Балкарская Республика'}
  ]);
  if(!localStorage.getItem('oz_reviews')) OZ_STORE.set('reviews',[
    {id:'rev_seed',object:'Санаторий «Голубые ели»',rating:5,text:'Удобное расположение и понятная информация о программах.',author:'Пользователь',status:'Опубликован',date:ozNow()}
  ]);
  if(!localStorage.getItem('oz_participants')) OZ_STORE.set('participants',[
    {id:'p_seed',name:'Пример участника',type:'Место размещения',region:'Кабардино-Балкарская Республика',status:'На проверке',date:ozNow()}
  ]);
  if(!localStorage.getItem('oz_verification')) OZ_STORE.set('verification',{status:'На проверке',level:'Базовый',updated:ozNow()});
  if(!localStorage.getItem('oz_notifications')) OZ_STORE.set('notifications',[
    {id:'n_seed',text:'Личный кабинет готов к демонстрации.',type:'info',date:ozNow(),read:false}
  ]);
}
function ozSetActiveTab(container, name){
  container.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  container.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==name);
}
function ozInitTabs(){
  document.querySelectorAll('[data-tabs]').forEach(container=>{
    container.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>ozSetActiveTab(container,btn.dataset.tab)));
    const first=container.querySelector('[data-tab]'); if(first) ozSetActiveTab(container,first.dataset.tab);
  });
}
function ozRenderUserAccount(){
  const root=document.querySelector('[data-user-account]'); if(!root) return;
  const favorites=OZ_STORE.get('favorites',[]), bookings=OZ_STORE.get('bookings',[]), reviews=OZ_STORE.get('reviews',[]), notifications=OZ_STORE.get('notifications',[]);
  const set=(sel,val)=>{const el=root.querySelector(sel); if(el) el.textContent=val;};
  set('[data-count-favorites]',favorites.length); set('[data-count-bookings]',bookings.length); set('[data-count-reviews]',reviews.length); set('[data-count-notifications]',notifications.filter(n=>!n.read).length);
  const favBox=root.querySelector('[data-favorites-list]');
  if(favBox) favBox.innerHTML=favorites.length?favorites.map(x=>`<div class="account-row"><div><b>${ozEscape(x.name)}</b><span>${ozEscape(x.type)} · ${ozEscape(x.region)}</span></div><button class="mini-action" data-remove-favorite="${ozEscape(x.id)}">Удалить</button></div>`).join(''):'<div class="empty-state">В избранном пока ничего нет.</div>';
  const bookBox=root.querySelector('[data-bookings-list]');
  if(bookBox) bookBox.innerHTML=bookings.length?bookings.map(x=>`<div class="account-row"><div><b>${ozEscape(x.organization||'Заявка на размещение')}</b><span>${ozEscape(x.dates||'Даты не указаны')} · ${ozEscape(x.status||'Новая')}</span></div><small>${ozEscape(x.date||'')}</small></div>`).join(''):'<div class="empty-state">Заявок пока нет. Их можно отправить через форму бронирования.</div>';
  const revBox=root.querySelector('[data-reviews-list]');
  if(revBox) revBox.innerHTML=reviews.length?reviews.map(x=>`<div class="account-row"><div><b>${ozEscape(x.object)}</b><span>${'★'.repeat(Number(x.rating)||0)}${'☆'.repeat(5-(Number(x.rating)||0))} · ${ozEscape(x.status)}</span><p>${ozEscape(x.text)}</p></div></div>`).join(''):'<div class="empty-state">Отзывов пока нет.</div>';
  const noteBox=root.querySelector('[data-notifications-list]');
  if(noteBox) noteBox.innerHTML=notifications.length?notifications.map(x=>`<div class="notification-item ${x.read?'is-read':''}"><b>${ozEscape(x.text)}</b><span>${ozEscape(x.date)}</span></div>`).join(''):'<div class="empty-state">Новых уведомлений нет.</div>';
  root.querySelectorAll('[data-remove-favorite]').forEach(btn=>btn.addEventListener('click',()=>{OZ_STORE.set('favorites',favorites.filter(x=>x.id!==btn.dataset.removeFavorite));ozRenderUserAccount();}));
  const form=root.querySelector('#reviewForm');
  if(form&&!form.dataset.bound){form.dataset.bound='1';form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form);const item={id:ozId('rev'),object:fd.get('object'),rating:Number(fd.get('rating')),text:fd.get('text'),author:'Пользователь',status:'На модерации',date:ozNow()};const arr=OZ_STORE.get('reviews',[]);arr.unshift(item);OZ_STORE.set('reviews',arr);ozNotify('Отзыв отправлен на модерацию.');form.reset();ozRenderUserAccount();});}
  const favForm=root.querySelector('#favoriteForm');
  if(favForm&&!favForm.dataset.bound){favForm.dataset.bound='1';favForm.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(favForm);const arr=OZ_STORE.get('favorites',[]);arr.unshift({id:ozId('fav'),name:fd.get('name'),type:fd.get('type'),region:'Кабардино-Балкарская Республика'});OZ_STORE.set('favorites',arr);favForm.reset();ozRenderUserAccount();});}
}
function ozRenderParticipantAccount(){
  const root=document.querySelector('[data-participant-account]'); if(!root) return;
  const v=OZ_STORE.get('verification',{status:'На проверке',level:'Базовый'}), bookings=OZ_STORE.get('bookings',[]), reviews=OZ_STORE.get('reviews',[]), notifications=OZ_STORE.get('notifications',[]);
  const set=(sel,val)=>{const el=root.querySelector(sel);if(el)el.textContent=val;};
  set('[data-verification-status]',v.status);set('[data-bookings-count]',bookings.length);set('[data-reviews-count]',reviews.length);set('[data-notifications-count]',notifications.filter(x=>!x.read).length);
  const b=root.querySelector('[data-participant-bookings]');if(b)b.innerHTML=bookings.length?bookings.map(x=>`<div class="account-row"><div><b>${ozEscape(x.name||'Пользователь')}</b><span>${ozEscape(x.organization||'Объект')} · ${ozEscape(x.dates||'Даты не указаны')}</span></div><span class="status">${ozEscape(x.status||'Новая')}</span></div>`).join(''):'<div class="empty-state">Новых заявок пока нет.</div>';
  const n=root.querySelector('[data-participant-notifications]');if(n)n.innerHTML=notifications.slice(0,8).map(x=>`<div class="notification-item ${x.read?'is-read':''}"><b>${ozEscape(x.text)}</b><span>${ozEscape(x.date)}</span></div>`).join('');
  const docForm=root.querySelector('#documentForm');if(docForm&&!docForm.dataset.bound){docForm.dataset.bound='1';docForm.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(docForm),docs=OZ_STORE.get('documents',[]);docs.unshift({id:ozId('doc'),name:fd.get('name'),number:fd.get('number'),expires:fd.get('expires'),status:'Загружен'});OZ_STORE.set('documents',docs);ozNotify('Документ добавлен в кабинет участника.');docForm.reset();alert('Документ добавлен в демонстрационном режиме.');});}
}
function ozRenderAdmin(){
  const root=document.querySelector('[data-admin]');if(!root)return;
  const participants=OZ_STORE.get('participants',[]),reviews=OZ_STORE.get('reviews',[]),bookings=OZ_STORE.get('bookings',[]);
  const pbox=root.querySelector('[data-admin-participants]');
  if(pbox)pbox.innerHTML=participants.map(x=>`<div class="admin-row"><div><b>${ozEscape(x.name)}</b><span>${ozEscape(x.type)} · ${ozEscape(x.region)}</span></div><div class="admin-actions"><span class="status">${ozEscape(x.status)}</span><button class="mini-action" data-participant-action="approve" data-id="${x.id}">Подтвердить</button><button class="mini-action" data-participant-action="reject" data-id="${x.id}">Отклонить</button></div></div>`).join('')||'<div class="empty-state">Заявок участников нет.</div>';
  const rbox=root.querySelector('[data-admin-reviews]');
  if(rbox)rbox.innerHTML=reviews.map(x=>`<div class="admin-row"><div><b>${ozEscape(x.object)}</b><span>${'★'.repeat(Number(x.rating)||0)} · ${ozEscape(x.text)}</span></div><div class="admin-actions"><span class="status">${ozEscape(x.status)}</span><button class="mini-action" data-review-action="publish" data-id="${x.id}">Опубликовать</button><button class="mini-action" data-review-action="reject" data-id="${x.id}">Скрыть</button></div></div>`).join('')||'<div class="empty-state">Отзывов нет.</div>';
  const set=(sel,val)=>{const e=root.querySelector(sel);if(e)e.textContent=val;};set('[data-admin-bookings]',bookings.length);set('[data-admin-participants-count]',participants.length);set('[data-admin-reviews-count]',reviews.length);
  root.querySelectorAll('[data-participant-action]').forEach(b=>b.onclick=()=>{const arr=OZ_STORE.get('participants',[]);const x=arr.find(i=>i.id===b.dataset.id);if(x){x.status=b.dataset.participantAction==='approve'?'Верифицирован':'Отклонён';OZ_STORE.set('participants',arr);OZ_STORE.set('verification',{status:x.status,level:'Базовый',updated:ozNow()});ozNotify('Статус участника изменён: '+x.status);ozRenderAdmin();}});
  root.querySelectorAll('[data-review-action]').forEach(b=>b.onclick=()=>{const arr=OZ_STORE.get('reviews',[]);const x=arr.find(i=>i.id===b.dataset.id);if(x){x.status=b.dataset.reviewAction==='publish'?'Опубликован':'Отклонён';OZ_STORE.set('reviews',arr);ozNotify('Статус отзыва изменён: '+x.status);ozRenderAdmin();}});
}
function ozBindBooking(){
  const f=document.getElementById('bookingForm');if(!f||f.dataset.ozBound)return;f.dataset.ozBound='1';
  f.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(f);const arr=OZ_STORE.get('bookings',[]);arr.unshift({id:ozId('book'),region:fd.get('region'),organization:fd.get('organization'),dates:fd.get('dates'),guests:fd.get('guests'),name:fd.get('name'),contact:fd.get('contact'),comment:fd.get('comment'),status:'Новая',date:ozNow()});OZ_STORE.set('bookings',arr);ozNotify('Заявка на бронирование принята и появилась в кабинете.');f.reset();const box=document.querySelector('[data-booking-result]');if(box){box.hidden=false;box.textContent='Заявка сохранена. Она уже отображается в кабинете пользователя и кабинете участника.';}});
}
function ozBindParticipantJoin(){
  const f=document.getElementById('joinForm');if(!f||f.dataset.ozBound)return;f.dataset.ozBound='1';
  f.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(f);const arr=OZ_STORE.get('participants',[]);arr.unshift({id:ozId('part'),type:fd.get('type'),region:fd.get('region'),name:fd.get('name'),email:fd.get('email'),about:fd.get('about'),status:'На проверке',date:ozNow()});OZ_STORE.set('participants',arr);OZ_STORE.set('verification',{status:'На проверке',level:'Базовый',updated:ozNow()});ozNotify('Заявка участника принята. Статус: «На проверке».');const box=document.querySelector('[data-join-result]');if(box){box.hidden=false;box.textContent='Заявка сохранена. Она уже видна в административной части.';}f.reset();});
}
function ozRenderVerification(){
  const root=document.querySelector('[data-verification-page]');if(!root)return;const v=OZ_STORE.get('verification',{status:'На проверке',level:'Базовый',updated:ozNow()});
  const s=root.querySelector('[data-live-verification-status]');if(s)s.textContent=v.status;const l=root.querySelector('[data-live-verification-level]');if(l)l.textContent=v.level;const u=root.querySelector('[data-live-verification-updated]');if(u)u.textContent=v.updated;
}
function ozMarkNotificationsRead(){const btn=document.querySelector('[data-mark-read]');if(!btn)return;btn.onclick=()=>{const arr=OZ_STORE.get('notifications',[]);arr.forEach(x=>x.read=true);OZ_STORE.set('notifications',arr);ozRenderUserAccount();ozRenderParticipantAccount();};}
document.addEventListener('DOMContentLoaded',()=>{ozSeed();ozInitTabs();ozRenderUserAccount();ozRenderParticipantAccount();ozRenderAdmin();ozBindBooking();ozBindParticipantJoin();ozRenderVerification();ozMarkNotificationsRead();});
