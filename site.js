
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
