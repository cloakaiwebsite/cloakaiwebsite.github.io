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

/* ── News bar dismiss ────────────────────────── */
(function(){
  var btn=document.getElementById('news-bar-close');
  if(btn)btn.addEventListener('click',function(){
    var bar=document.getElementById('news-bar');
    if(bar)bar.style.display='none';
  });
})();
