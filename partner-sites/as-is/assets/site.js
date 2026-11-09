(function(){
  var d=document,EN=d.documentElement.lang==='en',rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var live=/(^|\.)as-is\.gr$|\.pages\.dev$/.test(location.hostname);
  // header
  var top=d.querySelector('.top');
  var fl=d.querySelector('.float');function onS(){if(fl)fl.classList.toggle('off',scrollY<500);if(top&&!d.body.classList.contains('plain'))top.classList.toggle('solid',scrollY>60)}
  addEventListener('scroll',onS,{passive:true});onS();
  // menu
  var menu=d.getElementById('menu'),burger=d.querySelector('.burger');
  if(burger){burger.onclick=function(){menu.hidden=false;d.documentElement.style.overflow='hidden'};
    menu.querySelector('.x').onclick=function(){menu.hidden=true;d.documentElement.style.overflow=''}}
  // hero slides
  var sl=[].slice.call(d.querySelectorAll('.slides img'));
  if(sl.length>1&&!rm){var i=0;setInterval(function(){sl[i].classList.remove('on');i=(i+1)%sl.length;sl[i].classList.add('on')},6500)}
  // parallax
  var par=[].slice.call(d.querySelectorAll('.bleed img'));
  if(par.length&&!rm){var t=false;function p(){par.forEach(function(im){var r=im.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var k=(r.top+r.height/2-innerHeight/2)/innerHeight;im.style.transform='translate3d(0,'+(k*-8)+'%,0)'});t=false}
    addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(p)}},{passive:true});p()}
  // sticky journey
  var st=[].slice.call(d.querySelectorAll('.j-steps li')),pics=[].slice.call(d.querySelectorAll('.j-pic img'));
  if(st.length&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var n=st.indexOf(e.target);st.forEach(function(s,x){s.classList.toggle('on',x===n)});pics.forEach(function(s,x){s.classList.toggle('on',x===n)})}})},{rootMargin:'-45% 0px -45% 0px'});st.forEach(function(s){io.observe(s)})}
  // hover preview on service list
  var peek=d.querySelector('.peek');
  if(peek&&matchMedia('(hover:hover) and (min-width:861px)').matches){
    var imgs=peek.querySelectorAll('img'),x=0,y=0,cx=0,cy=0,run=false;
    function tick(){cx+=(x-cx)*.12;cy+=(y-cy)*.12;peek.style.transform='translate3d('+cx+'px,'+cy+'px,0)';if(run)requestAnimationFrame(tick)}
    d.querySelectorAll('.list a').forEach(function(a,n){
      a.addEventListener('mouseenter',function(){imgs.forEach(function(m,k){m.classList.toggle('on',k===n)});peek.classList.add('on');if(!run){run=true;tick()}});
      a.addEventListener('mouseleave',function(){peek.classList.remove('on');run=false});
      a.addEventListener('mousemove',function(e){x=Math.min(e.clientX+30,innerWidth-370);y=Math.max(90,Math.min(e.clientY-210,innerHeight-450))});
    });
  }
  // drag rail
  d.querySelectorAll('.rail').forEach(function(r){var down=false,sx=0,sl0=0;
    r.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;sx=e.clientX;sl0=r.scrollLeft;r.classList.add('grab');e.preventDefault()});
    addEventListener('pointermove',function(e){if(down)r.scrollLeft=sl0-(e.clientX-sx)});
    addEventListener('pointerup',function(){down=false;r.classList.remove('grab')})});
  // source + notifications
  var q=new URLSearchParams(location.search),src=null;
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
  try{src=JSON.parse(ss('src')||'null')}catch(e){}
  if(!src){src={s:q.get('utm_source')||(q.get('fbclid')?'facebook':q.get('gclid')?'google-ads':''),m:q.get('utm_medium')||'',c:q.get('utm_campaign')||'',r:d.referrer.slice(0,120),l:location.pathname};ss('src',JSON.stringify(src))}
  function ping(btn){if(!live)return;var b=JSON.stringify({btn:btn,page:location.pathname,src:src});try{if(!(navigator.sendBeacon&&navigator.sendBeacon('/api/click',new Blob([b],{type:'application/json'}))))fetch('/api/click',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:b})}catch(e){}}
  d.querySelectorAll('[data-wa]').forEach(function(a){a.addEventListener('click',function(e){
    ping(a.getAttribute('data-wa'));
    if(!live||!/iPhone|iPad|Android/i.test(navigator.userAgent))return;
    e.preventDefault();var u=new URL(a.href),web=a.href;
    location.href='whatsapp://send?phone='+u.pathname.slice(1)+'&text='+encodeURIComponent(u.searchParams.get('text')||'');
    setTimeout(function(){if(!d.hidden)location.href=web},1200)})});
  // form
  var f=d.getElementById('lead');
  if(f){var out=d.getElementById('out');f.addEventListener('submit',function(e){
    e.preventDefault();var v=new FormData(f);
    if(!String(v.get('name')).trim()){out.textContent=EN?'Please enter your name.':'נא למלא שם.';f.elements.name.focus();return}
    if(String(v.get('phone')).replace(/\D/g,'').length<7){out.textContent=EN?'Please enter a valid phone number.':'נא למלא מספר טלפון תקין.';f.elements.phone.focus();return}
    if(!f.elements.ok.checked){out.textContent=EN?'Please confirm the consent box.':'נא לאשר את העברת הפרטים.';f.elements.ok.focus();return}
    if(!live){out.textContent=EN?'Preview: on the live site this form is sent to us at once.':'תצוגה מקדימה: באתר החי הטופס נשלח אלינו מיד.';return}
    out.textContent=EN?'Sending…':'שולח…';
    fetch('/api/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:v.get('name'),phone:v.get('phone'),goal:v.get('goal'),msg:v.get('msg'),website:v.get('website'),page:location.pathname,src:src})})
    .then(function(r){if(!r.ok)throw 0;f.reset();out.textContent=EN?'Received, thank you. We will get back to you soon.':'קיבלנו, תודה. נחזור אליכם בהקדם.'})
    .catch(function(){out.textContent=EN?'Sending failed. Message us on WhatsApp: +30 690 672 3676':'השליחה לא הצליחה. כתבו לנו בוואטסאפ: ‎+30 690 672 3676'})})}
})();
