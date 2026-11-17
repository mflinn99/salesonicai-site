/* SaleSonicAI landing (WOW staging). Vanilla JS, no dependencies, no tracking. */
(function(){
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = RM.matches;
  var $ = function(s,c){return (c||document).querySelector(s)}, $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Header state */
  var hdr = $('.hdr');
  function onScroll(){ hdr.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* Scroll reveal */
  var revealEls = $$('.reveal, .scorecard');
  if ('IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); }, {rootMargin:'0px 0px -8% 0px', threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  /* Sonic waves on a canvas (hero background, final CTA) */
  function waves(canvas, opts){
    if(!canvas) return;
    var ctx = canvas.getContext('2d'), w, h, dpr, t = 0, raf = null, visible = true;
    function size(){ dpr = Math.min(window.devicePixelRatio||1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
    function draw(){
      ctx.clearRect(0,0,w,h);
      var lines = opts.lines, cy = h*opts.y;
      for(var i=0;i<lines;i++){
        var p = i/(lines-1), amp = opts.amp*h*(0.35+0.65*Math.sin(p*Math.PI)), freq = 0.006 + p*0.004, sp = t*(0.6+p*0.8);
        ctx.beginPath();
        for(var x=0;x<=w;x+=6){
          var env = Math.sin(Math.PI*x/w);
          var y = cy + Math.sin(x*freq + sp + i*0.5)*amp*env*Math.cos(t*0.3 + i*0.2) + Math.sin(x*freq*2.3 - sp)*amp*0.25*env;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        var a = (0.06 + 0.22*Math.sin(p*Math.PI))*opts.alpha;
        ctx.strokeStyle = i%3===0 ? 'rgba(124,196,255,'+a+')' : 'rgba(63,143,245,'+a+')';
        ctx.lineWidth = i===Math.floor(lines/2) ? 1.6 : 1;
        ctx.stroke();
      }
    }
    function loop(){ t += 0.012; draw(); raf = requestAnimationFrame(loop); }
    size(); window.addEventListener('resize', size);
    if(!reduced){
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible && !raf) loop(); if(!visible && raf){ cancelAnimationFrame(raf); raf=null; } }).observe(canvas);
      } else loop();
    }
  }
  waves($('.hero__waves'), {lines:18, y:.72, amp:.12, alpha:1});
  waves($('.final__waves'), {lines:14, y:.5, amp:.16, alpha:.9});

  /* Hero War Room console: spokes, cycling adviser, mini sound wave */
  var svgNS = 'http://www.w3.org/2000/svg', spokes = $('.spokes'), nodes = $$('.nodes li');
  var lens = [['Atlas','Revenue intelligence lens'],['Vex','Risk lens'],['Apex','Growth lens'],['Nova','Strategy lens'],['Ember','People and culture lens'],['Summit','Board chair synthesis: one recommendation, logged']];
  var lines = nodes.map(function(n){
    var a = parseFloat(n.style.getPropertyValue('--a'))*Math.PI/180, l = document.createElementNS(svgNS,'line');
    l.setAttribute('x1',200); l.setAttribute('y1',200); l.setAttribute('x2',200+168*Math.cos(a)); l.setAttribute('y2',200+168*Math.sin(a));
    spokes.appendChild(l); return l;
  });
  var feed = $('.feed__line'), who = $('.feed__who'), what = $('.feed__what'), step = 0;
  function tick(){
    var k = step % 6;
    nodes.forEach(function(n,i){ var on = (k===5) || i===k; n.classList.toggle('on', on); lines[i].classList.toggle('on', on); });
    who.textContent = lens[k][0]; what.textContent = lens[k][1];
    feed.classList.remove('swap'); void feed.offsetWidth; feed.classList.add('swap');
    step++;
  }
  tick(); if(!reduced) setInterval(tick, 2000);
  (function(){
    var c = $('.feed__wave'); if(!c) return; var x = c.getContext('2d'), d = Math.min(window.devicePixelRatio||1,2), W=120, H=34, t=0;
    c.width=W*d; c.height=H*d; x.scale(d,d);
    function f(){ x.clearRect(0,0,W,H); var bars=24;
      for(var i=0;i<bars;i++){ var v = reduced ? 0.4+0.5*Math.abs(Math.sin(i*0.7)) : 0.18+0.82*Math.abs(Math.sin(t*2.2+i*0.55)*Math.cos(t*0.9+i*0.21));
        var bh = Math.max(3, v*H); x.fillStyle = 'rgba(124,196,255,'+(0.35+0.6*v)+')'; x.fillRect(i*5, (H-bh)/2, 3, bh); }
      t+=0.03; if(!reduced) requestAnimationFrame(f); }
    f();
  })();

  /* Persona switcher: ARIA tabs with arrow-key support and moving ink */
  var tabs = $$('.switch__tabs [role=tab]'), ink = $('.switch__ink');
  function placeInk(t){ if(!ink||!t) return; ink.style.width = t.offsetWidth+'px'; ink.style.transform = 'translate('+(t.offsetLeft-5)+'px,'+(t.offsetTop-5)+'px)'; ink.style.height = t.offsetHeight+'px'; ink.style.top='5px'; ink.style.bottom='auto'; }
  function select(t, focus){
    tabs.forEach(function(x){ var on = x===t; x.setAttribute('aria-selected', on); x.tabIndex = on?0:-1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    placeInk(t); if(focus) t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click', function(){ select(t); });
    t.addEventListener('keydown', function(e){
      var n = null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') n = tabs[(i+1)%tabs.length];
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp') n = tabs[(i-1+tabs.length)%tabs.length];
      else if(e.key==='Home') n = tabs[0]; else if(e.key==='End') n = tabs[tabs.length-1];
      if(n){ e.preventDefault(); select(n,true); }
    });
  });
  var cur = tabs.filter(function(t){return t.getAttribute('aria-selected')==='true'})[0];
  placeInk(cur); window.addEventListener('resize', function(){ placeInk(tabs.filter(function(t){return t.getAttribute('aria-selected')==='true'})[0]); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ placeInk(tabs.filter(function(t){return t.getAttribute('aria-selected')==='true'})[0]); });

  /* War Room advisers */
  var advs = $$('.adv'), det = $('.adviser-detail'), dn = $('.adviser-detail__name'), dl = $('.adviser-detail__lens');
  advs.forEach(function(b){ b.addEventListener('click', function(){
    advs.forEach(function(x){ x.setAttribute('aria-pressed', x===b); });
    dn.textContent = b.querySelector('span').textContent; dl.textContent = b.getAttribute('data-lens');
    det.classList.remove('swap'); void det.offsetWidth; det.classList.add('swap');
  }); });

  /* MEDDIC / MEDDPICC toggle */
  var seg = $$('.seg [role=radio]'), xp = $$('.sc .xp');
  function setM(b, focus){
    seg.forEach(function(x){ var on=x===b; x.setAttribute('aria-checked', on); x.tabIndex = on?0:-1; });
    var p = b.getAttribute('data-m')==='meddpicc';
    xp.forEach(function(li){ li.hidden = !p; if(p){ li.classList.remove('show'); void li.offsetWidth; li.classList.add('show'); } });
    if(focus) b.focus();
  }
  seg.forEach(function(b,i){
    b.addEventListener('click', function(){ setM(b); });
    b.addEventListener('keydown', function(e){ if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].indexOf(e.key)>-1){ e.preventDefault(); setM(seg[(i+1)%seg.length], true); } });
  });

  /* Count-up numbers */
  $$('.count').forEach(function(el){
    if(reduced || !('IntersectionObserver' in window)) return;
    var to = +el.getAttribute('data-to'); el.textContent = '0';
    new IntersectionObserver(function(es, o){ if(!es[0].isIntersecting) return; o.disconnect(); var s = performance.now();
      (function f(n){ var p = Math.min(1,(n-s)/1200); el.textContent = Math.round(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(f); })(s);
    }, {threshold:.6}).observe(el);
  });

  /* Spotlight on bento tiles */
  $$('.tile').forEach(function(t){ t.addEventListener('pointermove', function(e){ var r=t.getBoundingClientRect(); t.style.setProperty('--mx',(e.clientX-r.left)+'px'); t.style.setProperty('--my',(e.clientY-r.top)+'px'); }); });
})();
