  (function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwiUq0F0XaszN92aTVaOLwXR9VPh4MUKZN4eF42igu0IbwytKkrrFzP8LLf9wsCPLUaYA/exec';

  /* ── CHAT ── */
  var heroJoke=document.getElementById('heroJoke'),heroReveal=document.getElementById('heroReveal'),heroSkip=document.getElementById('heroSkip'),chat=document.getElementById('chat'),hTimers=[],heroDone=false;
  var JOKES=[[["uncanned","knock, knock."],["you","who's there?"],["uncanned","un—"],["you","un who?"],["uncanned","exactly. that's kind of the problem."]],[["uncanned","we built a soda."],["you","love that. can i buy one?"],["uncanned","that's the part we're still working on."]],[["uncanned","ask us anything."],["you","when does it launch?"],["uncanned","anything except that."]],[["uncanned","most cans tell you what's inside."],["you","and yours?"],["uncanned","ours mostly tells you what isn't."]],[["uncanned","we ran a focus group."],["you","and?"],["uncanned","everyone agreed soda was a drink. we took notes."]],[["you","so... what's an un?"],["uncanned","a no, said with hospitality."],["you","that's not an answer."],["uncanned","exactly."]]];
  var jIdx=Math.floor(Math.random()*JOKES.length);
  try{var prev=parseInt(localStorage.getItem('unc_joke'),10);if(JOKES.length>1&&jIdx===prev)jIdx=(jIdx+1)%JOKES.length;localStorage.setItem('unc_joke',jIdx);}catch(e){}
  var joke=JOKES[jIdx];
  var bubEls=joke.map(function(line){var b=document.createElement('div');b.className='bub bub-'+(line[0]==='you'?'you':'uncanned');b.textContent=line[1];chat.appendChild(b);return b;});
  var typing=document.createElement('div');typing.className='typing';typing.setAttribute('aria-hidden','true');typing.innerHTML='<span></span><span></span><span></span>';
  function fizzOut(){if(typing.parentNode)typing.parentNode.removeChild(typing);bubEls.forEach(function(b){b.style.animationDelay=(Math.random()*.4).toFixed(2)+'s';});chat.classList.add('fizz');}
  function heroShowPunch(){if(typing.parentNode)typing.parentNode.removeChild(typing);chat.style.display='none';heroJoke.classList.add('revealed');}
  function heroShowReveal(){if(heroDone)return;heroDone=true;heroReveal.classList.add('show');heroReveal.setAttribute('aria-hidden','false');heroSkip.classList.add('gone');}
  if(RM){chat.style.display='none';heroJoke.classList.add('revealed');heroReveal.classList.add('show');heroReveal.setAttribute('aria-hidden','false');heroSkip.style.display='none';heroDone=true;}
  else{
    var t=450,GAP=1150,TYPE=720;
    joke.forEach(function(line,i){var side=line[0]==='you'?'you':'uncanned',at=t;hTimers.push(setTimeout(function(){chat.insertBefore(typing,bubEls[i]);typing.className='typing typing-'+side+' show';},at));hTimers.push(setTimeout(function(){typing.className='typing';bubEls[i].classList.add('show');},at+TYPE));t+=GAP;});
    var lastAt=t-GAP+TYPE,fizzAt=lastAt+3000,punchAt=fizzAt+1300,revealAt=punchAt+1400;
    hTimers.push(setTimeout(function(){heroSkip.classList.add('show');},950));
    hTimers.push(setTimeout(fizzOut,fizzAt));hTimers.push(setTimeout(heroShowPunch,punchAt));hTimers.push(setTimeout(heroShowReveal,revealAt));
    heroSkip.addEventListener('click',function(){hTimers.forEach(clearTimeout);hTimers=[];heroShowPunch();heroShowReveal();});
  }

  /* ── MODALS ── */
  var lastFocus=null,openEl=null,FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),textarea,select,summary,[tabindex]:not([tabindex="-1"])';
  function focusables(m){return Array.prototype.slice.call(m.querySelectorAll(FOCUSABLE)).filter(function(el){return el.offsetParent!==null||el===document.activeElement;});}
  function openModal(name){var m=document.getElementById('modal-'+name);if(!m)return;lastFocus=document.activeElement;m.removeAttribute('hidden');document.body.classList.add('modal-open');openEl=m;if(name==='founders')loadCounter();document.querySelectorAll('.nav-pill button,.nav-mobile-cta').forEach(function(c){c.classList.toggle('is-on',c.getAttribute('data-open-modal')===name);});var f=focusables(m);if(f.length)f[0].focus();}
  function closeModal(){if(!openEl)return;openEl.setAttribute('hidden','');document.body.classList.remove('modal-open');openEl=null;document.querySelectorAll('.nav-pill button,.nav-mobile-cta').forEach(function(c){c.classList.remove('is-on');});if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  document.addEventListener('click',function(e){var opener=e.target.closest('[data-open-modal]');if(opener){e.preventDefault();openModal(opener.getAttribute('data-open-modal'));return;}if(e.target.closest('[data-close-modal]')){e.preventDefault();closeModal();return;}if(e.target.classList.contains('modal')){closeModal();}});
  document.addEventListener('keydown',function(e){if(!openEl)return;if(e.key==='Escape'){e.preventDefault();closeModal();return;}if(e.key==='Tab'){var f=focusables(openEl);if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

  /* ── COUNTER & FORM ── */
  var counter=document.getElementById('fCounter'),counterLoaded=false;
  function loadCounter(){if(counterLoaded)return;fetch(ENDPOINT).then(function(r){return r.json();}).then(function(d){if(d&&typeof d.founders==='number'){var total=(typeof d.total==='number')?d.total:500;counter.textContent=d.founders+' of '+total+' insiders in.';counter.hidden=false;counterLoaded=true;}}).catch(function(){});}
  var form=document.getElementById('founderForm'),nameI=document.getElementById('fName'),emailI=document.getElementById('fEmail'),hp=document.getElementById('fWebsite'),cta=document.getElementById('fCta'),status=document.getElementById('fStatus'),doneBtn=document.getElementById('fDone'),emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,ref=new URLSearchParams(location.search).get('ref')||'',locked=false;
  function setStatus(msg,isErr){status.textContent=msg;status.classList.toggle('err',!!isErr);}
  function restore(){cta.disabled=false;cta.textContent='Count me in';}
  function succeed(msg){setStatus(msg);locked=true;cta.disabled=true;cta.textContent='insider ✓';nameI.disabled=true;emailI.disabled=true;doneBtn.hidden=false;doneBtn.focus();}
  form.addEventListener('submit',function(e){e.preventDefault();if(locked)return;var name=nameI.value.trim(),email=emailI.value.trim();if(!name){setStatus('we need a name to put in the run.',true);nameI.focus();return;}if(!emailRe.test(email)){setStatus('that email looks a little off — mind checking it?',true);emailI.focus();return;}setStatus('');cta.disabled=true;cta.textContent='knocking…';fetch(ENDPOINT,{method:'POST',body:JSON.stringify({type:'claim',email:email,name:name,ref:ref,website:hp.value})}).then(function(r){return r.json();}).then(function(d){if(d&&d.existing){succeed("you're already an insider. patience pays.");}else if(d&&d.closed){restore();setStatus('all 500 insider seats are taken. waitlist opens at launch.');}else if(d&&d.error){restore();setStatus(d.error,true);}else if(d&&typeof d.number!=='undefined'){succeed("you're insider #"+d.number+" of "+d.total+". cans incoming 07.2026.");counter.textContent=d.number+' of '+d.total+' insiders in.';counter.hidden=false;}else{restore();setStatus('something odd happened at the door. try again?',true);}}).catch(function(){restore();setStatus("couldn't reach the door. check your connection and try again.",true);});});
})();

(function(){
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM)return;

  /* split punchline words */
  (function(){var h1=document.getElementById('hero-h');if(!h1)return;var nodes=Array.prototype.slice.call(h1.childNodes),idx=0;nodes.forEach(function(node){if(node.nodeType===3){var parts=node.nodeValue.split(/(\s+)/),frag=document.createDocumentFragment();parts.forEach(function(p){if(/^\s+$/.test(p))frag.appendChild(document.createTextNode(p));else if(p.length){var s=document.createElement('span');s.className='word';s.style.setProperty('--i',idx++);s.textContent=p;frag.appendChild(s);}});node.parentNode.replaceChild(frag,node);}else if(node.nodeType===1&&node.classList.contains('accent')){var wrap=document.createElement('span');wrap.className='word';wrap.style.setProperty('--i',idx++);node.parentNode.insertBefore(wrap,node);wrap.appendChild(node);}});})();

  /* draw-in for doodles */
  function setupDrawIn(container,onTrigger){var elements=container.querySelectorAll('path,line,ellipse,circle,rect,polygon,polyline'),sIdx=0,fIdx=0,q=[];elements.forEach(function(el){var stroke=el.getAttribute('stroke'),fill=el.getAttribute('fill'),isS=stroke&&stroke!=='none',hasF=fill&&fill!=='none';if(isS&&!hasF){try{var len=el.getTotalLength();el.style.strokeDasharray=len;el.style.strokeDashoffset=len;el.style.transition='stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1) '+(sIdx*70)+'ms';q.push({el:el,kind:'stroke'});sIdx++;}catch(e){el.style.opacity='0';el.style.transition='opacity .5s ease '+(fIdx*60)+'ms';q.push({el:el,kind:'fade',orig:el.getAttribute('opacity')||'1'});fIdx++;}}else{var o=el.getAttribute('opacity')||'1';el.style.opacity='0';el.style.transition='opacity .5s ease '+(700+fIdx*50)+'ms';q.push({el:el,kind:'fade',orig:o});fIdx++;}});function trigger(){q.forEach(function(item){if(item.kind==='stroke')item.el.style.strokeDashoffset='0';else item.el.style.opacity=item.orig;});}if(onTrigger)onTrigger(trigger);else requestAnimationFrame(function(){requestAnimationFrame(trigger);});}
  document.querySelectorAll('.doodle').forEach(function(d){setupDrawIn(d);});

  /* stamp restamp */
  (function(){var stamp=document.querySelector('.hero-stamp');if(!stamp)return;var wordEl=stamp.querySelector('#stamp-word');if(!wordEl){var texts=stamp.querySelectorAll('text');if(texts.length>=2)wordEl=texts[1];}if(!wordEl)return;wordEl.classList.add('stamp-word');var words=['COOKING','THINKING','DELAYING','FIGURING IT OUT','TRYING','WORKING ON IT'],wi=0;function fire(){stamp.classList.add('restamp');setTimeout(function(){wordEl.classList.add('gone');setTimeout(function(){wi=(wi+1)%words.length;wordEl.textContent=words[wi];wordEl.classList.remove('gone');},100);},230);setTimeout(function(){stamp.classList.remove('restamp');},1000);}function schedule(){setTimeout(function(){if(!document.hidden)fire();schedule();},9000+Math.random()*5000);}schedule();})();

  /* wavy links */
  ['.strip a','.strip button','a[href^="mailto:"]'].forEach(function(sel){document.querySelectorAll(sel).forEach(function(el){el.classList.add('wavy-hover');});});

  /* parallax — doodles + cans respond to mouse */
  //(function(){var hero=document.querySelector('.hero');if(!hero)return;var els=Array.prototype.slice.call(hero.querySelectorAll('.doodle,.can-float'));els.forEach(function(d){d.__depth=4+Math.random()*9;});var tx=0,ty=0,raf=null;function tick(){raf=null;els.forEach(function(d){d.style.setProperty('--px',(tx*d.__depth).toFixed(1)+'px');d.style.setProperty('--py',(ty*d.__depth).toFixed(1)+'px');});}hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-0.5)*2;ty=((e.clientY-r.top)/r.height-0.5)*2;if(!raf)raf=requestAnimationFrame(tick);},{passive:true});hero.addEventListener('mouseleave',function(){tx=0;ty=0;if(!raf)raf=requestAnimationFrame(tick);});})();//  
})();