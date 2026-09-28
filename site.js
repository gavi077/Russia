
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

