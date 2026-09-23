/* CloakAI layout.js - shared nav, particles, cursor glow */

/* ── Particle dots - EXACT same as homepage ─── */
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

/* ── Region + currency, shared across EVERY page ──────────────────────────
   India sees INR (default), everyone else sees USD (roughly double). Detection,
   in order: ?region= override, a decision already made this session, browser
   timezone, then an async IP-country refinement. The result is cached in
   sessionStorage so it stays consistent as the visitor moves between pages, and
   is exposed as window.cloakRegion.

   For USD visitors, convertPrices() swaps OUR known INR prices to their USD
   equivalents in the page text. It is intentionally keyed to our EXACT price
   tokens (bounded so a price is never matched inside a longer number), so
   competitor/example prices like Rs1,199 or Rs2,650 are left untouched, and
   JSON-LD scripts are skipped. The homepage runs its own richer pricing logic
   for the cards and checkout modal; it reads window.cloakRegion and listens for
   the 'cloakregion' event, so the two never disagree. */
(function(){
  function fromTZ(){
    try{
      var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');
      if(!tz||tz==='Asia/Kolkata'||tz==='Asia/Calcutta')return 'IN';
      return 'INTL';
    }catch(e){return 'IN';}
  }
  var forced='';
  try{
    var q=(new URLSearchParams(location.search).get('region')||'').toLowerCase();
    if(q==='in')forced='IN';else if(q==='intl')forced='INTL';
  }catch(e){}
  var cached='';
  try{var s=sessionStorage.getItem('cloak_region');if(s==='IN'||s==='INTL')cached=s;}catch(e){}
  var region=forced||cached||fromTZ();
  window.cloakRegion=region;
  try{sessionStorage.setItem('cloak_region',region);}catch(e){}

  // OUR prices only. Each key is matched with a "not followed by a digit" guard
  // so, e.g., 499 never matches inside 4999, and 4-digit prices always carry the
  // comma exactly as written on the pages.
  var MAP={
    '5,999':'144','3,799':'90','2,699':'65','1,899':'45','1,799':'45',
    '999':'25','699':'21','499':'15','333':'8','317':'8','300':'7'
  };
  var RULES=Object.keys(MAP).map(function(k){
    return { re:new RegExp('(₹|Rs\\.?\\s?)'+k.replace(/[.,]/g,'\\$&')+'(?!\\d)','g'), usd:'$'+MAP[k] };
  });
  // Named competitors are cited in USD with an "(approximately Rs X)" note for
  // Indian readers. For USD visitors that note is redundant, so drop it. This only
  // removes the parenthetical; it never invents or alters a competitor's price.
  var APPROX=/\s*\((?:approximately|approx\.?|about|roughly|around|≈|~)\s*(?:₹|Rs\.?\s?)[^)]*\)/gi;
  function convertText(t){
    if(t.indexOf('₹')<0 && t.indexOf('Rs')<0) return t;
    t=t.replace(APPROX,'');
    // Function replacement, never a string: a string like "$15" would be read as
    // the "$1" backreference (the captured currency prefix) plus "5", corrupting
    // the amount. A function returns the literal USD text verbatim.
    RULES.forEach(function(r){ t=t.replace(r.re, function(){ return r.usd; }); });
    return t;
  }
  function convertPrices(){
    if(window.cloakRegion!=='INTL'||!document.body)return;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;if(!p)return NodeFilter.FILTER_REJECT;
        var tag=p.nodeName;
        if(tag==='SCRIPT'||tag==='STYLE'||tag==='NOSCRIPT'||tag==='TEXTAREA')return NodeFilter.FILTER_REJECT;
        if(p.closest&&p.closest('[data-no-convert]'))return NodeFilter.FILTER_REJECT;
        var v=n.nodeValue;
        return (v.indexOf('₹')>=0||v.indexOf('Rs')>=0)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
      }
    });
    var nodes=[],x;while(x=walker.nextNode())nodes.push(x);
    nodes.forEach(function(n){var c=convertText(n.nodeValue);if(c!==n.nodeValue)n.nodeValue=c;});
  }
  window.cloakConvertPrices=convertPrices;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',convertPrices);
  else convertPrices();

  // Async IP-country refinement (once per session, only when not forced). Timezone
  // is the instant default; if the IP country disagrees we correct, cache, convert,
  // and fire 'cloakregion' so the homepage can repaint its cards/modal. Any failure
  // leaves the timezone decision in place.
  if(!forced){
    var resolved=false;try{resolved=sessionStorage.getItem('cloak_region_ip')==='1';}catch(e){}
    if(!resolved){
      try{
        fetch('https://ipapi.co/country/',{cache:'no-store'})
          .then(function(r){return r.ok?r.text():'';})
          .then(function(cc){
            cc=(cc||'').trim().toUpperCase();
            if(cc.length!==2)return;
            var ipRegion=(cc==='IN')?'IN':'INTL';
            try{sessionStorage.setItem('cloak_region_ip','1');}catch(e){}
            if(ipRegion!==window.cloakRegion){
              window.cloakRegion=ipRegion;
              try{sessionStorage.setItem('cloak_region',ipRegion);}catch(e){}
              if(ipRegion==='INTL')convertPrices();
              try{window.dispatchEvent(new CustomEvent('cloakregion',{detail:ipRegion}));}catch(e){}
            }
          })
          .catch(function(){});
      }catch(e){}
    }
  }
})();
