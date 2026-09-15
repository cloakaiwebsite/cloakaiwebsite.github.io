/* CloakAI layout.js — shared nav, particles, cursor glow */

/* ── Particle dots — EXACT same as homepage ─── */
(function(){
  var c=document.getElementById('particles');
  if(!c)return;
  for(var i=0;i<20;i++){
    var p=document.createElement('div');
    p.className='particle';
    p.style.left=Math.random()*100+'vw';
    p.style.top=Math.random()*100+'vh';
    p.style.width=Math.random()*5+'px';
    p.style.height=p.style.width;
    p.style.animationDelay=Math.random()*5+'s';
    c.appendChild(p);
  }
})();

/* ── Cursor glow ─────────────────────────────── */
(function(){
  var cg=document.getElementById('cg');
  if(!cg)return;
  var gx=0,gy=0;
  document.addEventListener('mousemove',function(e){gx=e.clientX;gy=e.clientY;});
  setInterval(function(){cg.style.left=gx+'px';cg.style.top=gy+'px';},16);
})();

/* ── Nav toggle ──────────────────────────────── */
function toggleNav(){
  var b=document.getElementById('ham-btn'),n=document.getElementById('mnav');
  if(!b||!n)return;
  b.classList.toggle('open');n.classList.toggle('open');
}
document.addEventListener('click',function(e){
  var n=document.getElementById('mnav'),b=document.getElementById('ham-btn');
  if(n&&b&&n.classList.contains('open')&&!n.contains(e.target)&&!b.contains(e.target)){
    n.classList.remove('open');b.classList.remove('open');
  }
});
document.querySelectorAll('#mnav a').forEach(function(a){
  a.addEventListener('click',function(){
    var n=document.getElementById('mnav'),b=document.getElementById('ham-btn');
    if(n)n.classList.remove('open');if(b)b.classList.remove('open');
  });
});

/* ── Account link in the top nav, on EVERY page ──────────────────────
   Injected here so all pages get it without editing each file. The label is
   "My Account" when a valid Google session token is present (set by the account
   page, or by a "Continue with Google" checkout), otherwise "Sign in". Both link
   to the account page, which handles the actual sign-in. The label text is a fixed
   string, never user data, so building it with innerHTML is safe. */
(function(){
  var nav=document.getElementById('mnav');
  if(!nav||nav.querySelector('[data-account-link]'))return;
  var signedIn=false;
  try{
    var t=sessionStorage.getItem('cloakai_gtok')||'';
    if(t){var p=JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));signedIn=(Number(p.exp||0)*1000)>Date.now();}
  }catch(e){signedIn=false;}
  var a=document.createElement('a');
  a.href='account.html';
  a.setAttribute('data-account-link','');
  a.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>'+(signedIn?'My Account':'Sign in');
  var cta=nav.querySelector('.nav-cta');
  if(cta)nav.insertBefore(a,cta);else nav.appendChild(a);
})();

/* ── News bar dismiss ────────────────────────── */
(function(){
  var btn=document.getElementById('news-bar-close');
  if(btn)btn.addEventListener('click',function(){
    var bar=document.getElementById('news-bar');
    if(bar)bar.style.display='none';
  });
})();
