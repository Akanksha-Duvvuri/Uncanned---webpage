(function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM){
    document.querySelectorAll('.scene').forEach(function(s){ s.classList.add('in'); });
    return;
  }

  /* 1. Split punchline into words */
  (function splitWords(){
    var h1 = document.getElementById('hero-h');
    if(!h1) return;
    var nodes = Array.prototype.slice.call(h1.childNodes);
    var idx = 0;
    nodes.forEach(function(node){
      if(node.nodeType === 3){
        var parts = node.nodeValue.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if(/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
          else if(p.length){
            var s = document.createElement('span');
            s.className = 'word';
            s.style.setProperty('--i', idx++);
            s.textContent = p;
            frag.appendChild(s);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if(node.nodeType === 1 && node.classList.contains('accent')){
        var wrap = document.createElement('span');
        wrap.className = 'word';
        wrap.style.setProperty('--i', idx++);
        node.parentNode.insertBefore(wrap, node);
        wrap.appendChild(node);
      }
    });
  })();

  /* 2. Draw-in for hero doodles + scene doodles (on-load for hero, on-scroll for scenes) */
  function setupDrawIn(container, onTrigger){
    var elements = container.querySelectorAll('path, line, ellipse, circle, rect, polygon, polyline');
    var strokeIdx = 0, fillIdx = 0;
    var animQueue = [];

    elements.forEach(function(el){
      var stroke = el.getAttribute('stroke');
      var fill = el.getAttribute('fill');
      var isStroked = stroke && stroke !== 'none';
      var hasFill = fill && fill !== 'none';

      if(isStroked && !hasFill){
        try{
          var len = el.getTotalLength();
          el.style.strokeDasharray = len;
          el.style.strokeDashoffset = len;
          el.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1) ' + (strokeIdx * 70) + 'ms';
          animQueue.push({el:el, kind:'stroke'});
          strokeIdx++;
        }catch(e){
          el.style.opacity = '0';
          el.style.transition = 'opacity .5s ease ' + (fillIdx * 60) + 'ms';
          animQueue.push({el:el, kind:'fade', orig:el.getAttribute('opacity') || '1'});
          fillIdx++;
        }
      } else {
        var fOrig = el.getAttribute('opacity') || '1';
        el.style.opacity = '0';
        el.style.transition = 'opacity .5s ease ' + (700 + fillIdx * 50) + 'ms';
        animQueue.push({el:el, kind:'fade', orig:fOrig});
        fillIdx++;
      }
    });

    function trigger(){
      animQueue.forEach(function(item){
        if(item.kind === 'stroke') item.el.style.strokeDashoffset = '0';
        else item.el.style.opacity = item.orig;
      });
    }

    if(onTrigger) onTrigger(trigger);
    else {
      requestAnimationFrame(function(){
        requestAnimationFrame(trigger);
      });
    }
  }

  /* Hero doodles draw in on load */
  document.querySelectorAll('.doodle').forEach(function(d){ setupDrawIn(d); });

  /* Scene doodles draw in when scrolled into view */
  (function scenesOnScroll(){
    var scenes = document.querySelectorAll('.scene');
    if(!scenes.length) return;
    var triggers = new Map();

    scenes.forEach(function(scene){
      setupDrawIn(scene, function(trigger){
        triggers.set(scene, trigger);
      });
    });

    if(!('IntersectionObserver' in window)){
      scenes.forEach(function(s){
        s.classList.add('in');
        var t = triggers.get(s);
        if(t) t();
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && !entry.target.__drawn){
          entry.target.__drawn = true;
          entry.target.classList.add('in');
          setTimeout(function(){
            var t = triggers.get(entry.target);
            if(t) t();
          }, 150);
        }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -40px 0px' });

    scenes.forEach(function(s){ observer.observe(s); });
  })();

  /* 3. Stamp restamps */
  (function restamp(){
    var stamp = document.querySelector('.hero-stamp');
    if(!stamp) return;
    var wordEl = stamp.querySelector('#stamp-word');
    if(!wordEl){
      var texts = stamp.querySelectorAll('text');
      if(texts.length >= 2) wordEl = texts[1];
    }
    if(!wordEl) return;
    wordEl.classList.add('stamp-word');

    var words = ['COOKING','THINKING','DELAYING','FIGURING IT OUT','TRYING','WORKING ON IT'];
    var wi = 0;

    function fire(){
      stamp.classList.add('restamp');
      setTimeout(function(){
        wordEl.classList.add('gone');
        setTimeout(function(){
          wi = (wi + 1) % words.length;
          wordEl.textContent = words[wi];
          wordEl.classList.remove('gone');
        }, 100);
      }, 230);
      setTimeout(function(){ stamp.classList.remove('restamp'); }, 1000);
    }
    function schedule(){
      setTimeout(function(){
        if(!document.hidden) fire();
        schedule();
      }, 9000 + Math.random() * 5000);
    }
    schedule();
  })();

  /* 4. Wavy underline on hover */
  (function wavy(){
    var selectors = ['.strip a', '.strip button', 'a[href^="mailto:"]'];
    selectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        el.classList.add('wavy-hover');
      });
    });
  })();

  /* 5. Subtle parallax on hero doodles */
  (function parallax(){
    var hero = document.querySelector('.hero');
    if(!hero) return;
    var doodles = Array.prototype.slice.call(hero.querySelectorAll('.doodle'));
    if(!doodles.length) return;
    doodles.forEach(function(d){ d.__depth = 5 + Math.random() * 10; });
    var tx = 0, ty = 0, raf = null;
    function tick(){
      raf = null;
      doodles.forEach(function(d){
        d.style.setProperty('--px', (tx * d.__depth).toFixed(1) + 'px');
        d.style.setProperty('--py', (ty * d.__depth).toFixed(1) + 'px');
      });
    }
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      if(!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    hero.addEventListener('mouseleave', function(){
      tx = 0; ty = 0;
      if(!raf) raf = requestAnimationFrame(tick);
    });
  })();
})();
