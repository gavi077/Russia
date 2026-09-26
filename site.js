
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
