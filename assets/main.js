/* ==========================================================================
   DELTIXIA — Moteur d'interactivité
   - Réseau de particules (canvas) connecté
   - Curseur lumineux qui suit la souris
   - Spotlight sur cartes (CSS vars --mx/--my)
   - Tilt 3D au survol
   - Boutons magnétiques
   - Compteurs animés au scroll
   - Reveal au scroll
   - Barre de progression du scroll
   - Initialisation des icônes Lucide
   ========================================================================== */

(() => {
  'use strict';

  const isCoarse = window.matchMedia('(hover: none)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Réseau de particules — canvas léger, connectivité douce
     ---------------------------------------------------------- */
  function initParticleNetwork() {
    const canvases = document.querySelectorAll('canvas[data-particles]');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d', { alpha: true });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w, h, particles = [];

      const baseCount   = parseInt(canvas.dataset.count) || 55;
      const COUNT       = isCoarse ? Math.floor(baseCount * 0.5) : baseCount;
      const MAX_DIST    = 140;
      const SPEED       = .35;
      const COLOR_DOT   = canvas.dataset.color || 'rgba(6, 182, 212, .85)';
      const COLOR_LINE  = 'rgba(124, 58, 237, ';

      function resize() {
        const rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function spawn() {
        particles = Array.from({ length: COUNT }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * SPEED,
          vy: (Math.random() - .5) * SPEED,
          r: Math.random() * 1.2 + .6,
        }));
      }

      function step() {
        ctx.clearRect(0, 0, w, h);

        // Mise à jour positions
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        });

        // Lignes entre particules proches
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i], b = particles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d < MAX_DIST) {
              const op = (1 - d / MAX_DIST) * .35;
              ctx.strokeStyle = COLOR_LINE + op + ')';
              ctx.lineWidth = .6;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // Points
        ctx.fillStyle = COLOR_DOT;
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        rafId = requestAnimationFrame(step);
      }

      let rafId = null, running = false;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !running) { running = true; step(); }
          else if (!e.isIntersecting && running) { cancelAnimationFrame(rafId); running = false; }
        });
      });
      io.observe(canvas);

      resize();
      spawn();
      window.addEventListener('resize', () => { resize(); spawn(); });
    });
  }

  /* ----------------------------------------------------------
     2. Curseur lumineux qui suit la souris
     ---------------------------------------------------------- */
  function initCursor() {
    if (isCoarse) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    let cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('visible');
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));

    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (t.closest('a, button, [data-cursor-grow]')) cursor.classList.add('expanded');
      else cursor.classList.remove('expanded');
    });

    function loop() {
      cx += (tx - cx) * .18;
      cy += (ty - cy) * .18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ----------------------------------------------------------
     3. Spotlight sur cartes — radial qui suit la souris
     ---------------------------------------------------------- */
  function initSpotlight() {
    document.querySelectorAll('.card-spot').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top)  / r.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ----------------------------------------------------------
     4. Tilt 3D sur éléments .tilt
     ---------------------------------------------------------- */
  function initTilt() {
    if (isCoarse || reduceMotion) return;
    document.querySelectorAll('.tilt').forEach(el => {
      const wrap = el.closest('.tilt-wrap') || el;
      const MAX = parseFloat(el.dataset.tilt || 8);

      wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - .5;
        const y = (e.clientY - r.top)  / r.height - .5;
        el.style.transform = `rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg)`;
      });
      wrap.addEventListener('mouseleave', () => {
        el.style.transform = 'rotateY(0) rotateX(0)';
      });
    });
  }

  /* ----------------------------------------------------------
     5. Boutons magnétiques
     ---------------------------------------------------------- */
  function initMagnetic() {
    if (isCoarse || reduceMotion) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      const STRENGTH = parseFloat(el.dataset.magnetic || .35);

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2)  * STRENGTH;
        const y = (e.clientY - r.top  - r.height / 2) * STRENGTH;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ----------------------------------------------------------
     6. Compteurs animés au scroll
     ---------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const dur    = parseInt(el.dataset.duration || 1600);
      const dec    = parseInt(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const start  = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = (target * eased).toFixed(dec);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: .4 });
    counters.forEach(c => io.observe(c));
  }

  /* ----------------------------------------------------------
     7. Reveal au scroll
     ---------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: .12 });
    els.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------
     8. Barre de progression du scroll
     ---------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = p + '%';
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     9. Word reveal — délais en cascade
     ---------------------------------------------------------- */
  function initWordReveal() {
    document.querySelectorAll('[data-words]').forEach(host => {
      const text = host.textContent.trim();
      const words = text.split(/\s+/);
      host.textContent = '';
      words.forEach((w, i) => {
        const wrap = document.createElement('span');
        wrap.className = 'word-reveal';
        const inner = document.createElement('span');
        inner.textContent = w;
        inner.style.animationDelay = (i * 0.08) + 's';
        wrap.appendChild(inner);
        host.appendChild(wrap);
        if (i < words.length - 1) host.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    initReveal();
    initWordReveal();
    initScrollProgress();
    initParticleNetwork();
    initCursor();
    initSpotlight();
    initTilt();
    initMagnetic();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
