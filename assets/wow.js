/* SaleSonicAI website (corporate theme). Vanilla JS, no dependencies, no tracking. */
(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)}, $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Header shadow on scroll */
  var hdr = $('.hdr');
  function onScroll(){ hdr.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* Subtle scroll reveal */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); }, {rootMargin:'0px 0px -6% 0px', threshold:.08});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('in'); }); }

  /* Role tabs: ARIA tabs with arrow-key support */
  var tabs = $$('.switch__tabs [role=tab]');
  function select(t, focus){
    tabs.forEach(function(x){ var on = x===t; x.setAttribute('aria-selected', on); x.tabIndex = on?0:-1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    if(focus) t.focus();
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

  /* MEDDIC / MEDDPICC toggle */
  var seg = $$('.seg [role=radio]'), xp = $$('.sc .xp');
  function setM(b, focus){
    seg.forEach(function(x){ var on=x===b; x.setAttribute('aria-checked', on); x.tabIndex = on?0:-1; });
    var p = b.getAttribute('data-m')==='meddpicc';
    xp.forEach(function(li){ li.hidden = !p; });
    if(focus) b.focus();
  }
  seg.forEach(function(b,i){
    b.addEventListener('click', function(){ setM(b); });
    b.addEventListener('keydown', function(e){ if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].indexOf(e.key)>-1){ e.preventDefault(); setM(seg[(i+1)%seg.length], true); } });
  });

  /* Enquiry form: sends via FormSubmit (AJAX), falls back to a normal POST to /thanks.html without JS */
  (function(){
    var f = $('.cform'); if(!f || !window.fetch || !window.FormData) return;
    var st = $('.cform__status', f), btn = $('button[type=submit]', f);
    f.addEventListener('submit', function(e){
      e.preventDefault(); st.className = 'cform__status'; st.textContent = '';
      var bad = $$('[required]', f).filter(function(i){ var v = i.value.trim(); var b = !v || (i.type==='email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)); i.setAttribute('aria-invalid', b ? 'true' : 'false'); return b; });
      if(bad.length){ st.className = 'cform__status err'; st.textContent = 'Please add your full name, a valid email address and both challenges.'; bad[0].focus(); return; }
      if($('[name=_honey]', f).value) return;
      btn.disabled = true; st.textContent = 'Sending…';
      fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {method:'POST', referrerPolicy:'strict-origin-when-cross-origin', headers:{'Accept':'application/json'}, body:new FormData(f)})
        .then(function(r){ return r.json().then(function(j){ if(!r.ok || String(j.success)!=='true') throw new Error(j.message||'failed'); }); })
        .then(function(){ f.reset(); st.className = 'cform__status ok'; st.textContent = 'Thank you. We’ve received your enquiry and will be in touch shortly to arrange a short conversation about your challenges.'; })
        .catch(function(){ st.className = 'cform__status err'; st.textContent = 'Sorry, that didn’t send. Please check your connection and try again.'; })
        .then(function(){ btn.disabled = false; });
    });
  })();
})();
