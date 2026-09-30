(() => {
  const brand = document.querySelector('.brand');
  const header = document.querySelector('.site-header');
  if (!brand || !header) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const controller = new AbortController();
  const { signal } = controller;
  const opts = { signal };

  let popTimeout = null;
  const pop = () => {
    brand.classList.remove('is-popping');
    void brand.offsetWidth;
    brand.classList.add('is-popping');
    clearTimeout(popTimeout);
    popTimeout = setTimeout(() => brand.classList.remove('is-popping'), 700);
  };

  brand.addEventListener('click', pop, opts);
  brand.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pop(); }, opts);

  if (finePointer.matches) {
    let glowFrame = null;
    let gx = 0, gy = 0;
    const paintGlow = () => {
      header.style.setProperty('--header-glow-x', `${gx}px`);
      header.style.setProperty('--header-glow-y', `${gy}px`);
      glowFrame = null;
    };
    header.addEventListener('pointermove', e => {
      const rect = header.getBoundingClientRect();
      gx = e.clientX - rect.left;
      gy = e.clientY - rect.top;
      header.classList.add('has-glow');
      if (glowFrame === null) glowFrame = requestAnimationFrame(paintGlow);
    }, { ...opts, passive: true });
    header.addEventListener('pointerleave', () => header.classList.remove('has-glow'), opts);
  }

  let popTimer = null;
  const startAmbient = () => {
    if (popTimer !== null || reduced.matches) return;
    popTimer = setInterval(() => { if (!brand.matches(':hover')) pop(); }, 12000);
  };
  const stopAmbient = () => { clearInterval(popTimer); popTimer = null; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stopAmbient() : startAmbient()), opts);
  startAmbient();

  const greeting = document.querySelector('[data-greeting]');
  const GREETINGS = {
    en: { late: 'Still awake?', morning: 'Good morning.', afternoon: 'Good afternoon.', evening: 'Good evening.', night: 'Good night.' },
    id: { late: 'Masih bangun?', morning: 'Selamat pagi.', afternoon: 'Selamat siang.', evening: 'Selamat malam.', night: 'Selamat malam.' }
  };
  const updateGreeting = () => {
    if (!greeting) return;
    const hour = new Date().getHours();
    const lang = document.documentElement.lang === 'id' ? 'id' : 'en';
    const key = hour < 5 ? 'late' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
    greeting.textContent = GREETINGS[lang][key];
  };
  updateGreeting();

  const themeToggle = document.querySelector('.theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const THEME_COLOR = { dark: '#071a3b', light: '#e8f0ff' };
  const applyTheme = theme => {
    const light = theme === 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('arlingkin-theme', theme); } catch {}
    metaTheme?.setAttribute('content', THEME_COLOR[theme]);
    metaScheme?.setAttribute('content', light ? 'light' : 'dark');
    if (!themeToggle) return;
    const label = light ? 'Switch to dark theme' : 'Switch to light theme';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
    themeToggle.querySelector('.theme-label').textContent = light ? 'LIGHT' : 'DARK';
    themeToggle.querySelector('.theme-icon').textContent = light ? '☀' : '◐';
  };
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('arlingkin-theme') || 'dark'; } catch {}
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'), opts);

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let progressFrame = null;
  const paintProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    progressFrame = null;
  };
  const scheduleProgress = () => { if (progressFrame === null) progressFrame = requestAnimationFrame(paintProgress); };
  addEventListener('scroll', scheduleProgress, { ...opts, passive: true });
  addEventListener('resize', scheduleProgress, opts);
  paintProgress();

  const marqueeWrap = document.querySelector('[data-marquee]');
  const firstTrack = marqueeWrap?.querySelector('.tool-marquee-track');
  let marqueeObserver = null;
  if (firstTrack && !firstTrack.dataset.ready) {
    const softenClone = (node, isDuplicate) => {
      const clone = node.cloneNode(true);
      clone.tabIndex = -1;
      clone.setAttribute('aria-hidden', 'true');
      if (isDuplicate) clone.dataset.clone = '1';
      return clone;
    };
    const reverseTrack = firstTrack.cloneNode(false);
    reverseTrack.className = 'tool-marquee-track is-reverse';
    reverseTrack.setAttribute('aria-hidden', 'true');
    [...firstTrack.children].reverse().forEach(chip => reverseTrack.appendChild(softenClone(chip, false)));
    marqueeWrap.appendChild(reverseTrack);
    marqueeWrap.querySelectorAll('.tool-marquee-track').forEach(track => {
      track.dataset.ready = '1';
      [...track.children].forEach(chip => track.appendChild(softenClone(chip, true)));
    });

    let spotFrame = null;
    marqueeWrap.addEventListener('pointermove', e => {
      const chip = e.target.closest('.tool-chip');
      if (!chip || spotFrame !== null) return;
      const { clientX, clientY } = e;
      spotFrame = requestAnimationFrame(() => {
        const rect = chip.getBoundingClientRect();
        chip.style.setProperty('--px', `${clientX - rect.left}px`);
        chip.style.setProperty('--py', `${clientY - rect.top}px`);
        spotFrame = null;
      });
    }, { ...opts, passive: true });

    if ('IntersectionObserver' in window) {
      marqueeObserver = new IntersectionObserver(([entry]) => {
        marqueeWrap.classList.toggle('is-offscreen', !entry.isIntersecting);
      });
      marqueeObserver.observe(marqueeWrap);
    }
  }

  document.querySelectorAll('.cta, .read-link, .project-link').forEach(el => {
    el.addEventListener('pointerdown', () => {
      el.classList.remove('is-pressed');
      void el.offsetWidth;
      el.classList.add('is-pressed');
    }, opts);
  });

  document.querySelectorAll('[data-current-path]').forEach(el => {
    el.textContent = decodeURIComponent(location.pathname).slice(0, 48);
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.lang-btn')) setTimeout(updateGreeting, 0);
  }, opts);

  addEventListener('pagehide', () => {
    stopAmbient();
    clearTimeout(popTimeout);
    if (progressFrame !== null) cancelAnimationFrame(progressFrame);
    marqueeObserver?.disconnect();
    controller.abort();
  }, { once: true });
})();

(() => {
  const KEY = 'arlingkin-bg';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const liteQuery = matchMedia('(max-width: 700px), (pointer: coarse)');
  const controller = new AbortController();
  const opts = { signal: controller.signal };
  let channel = null;
  try { channel = new BroadcastChannel(KEY); } catch {}

  const rand = (min, max) => min + Math.random() * (max - min);
  const isPalette = v => v && [v.a, v.b, v.c].every(Number.isFinite);
  const detectLite = () => liteQuery.matches || (navigator.deviceMemory ?? 8) <= 4 || navigator.connection?.saveData === true;
  let current = { a: 158, b: 196, c: 330 };
  let lite = false;
  let alt = false;

  const setVars = (prefix, palette) => {
    root.style.setProperty(`${prefix}a`, palette.a);
    root.style.setProperty(`${prefix}b`, palette.b);
    root.style.setProperty(`${prefix}c`, palette.c);
  };

  const paint = palette => {
    current = palette;
    root.style.setProperty('--acc-h', palette.a);
    alt = !alt;
    setVars(alt ? '--bg2-' : '--bg-', palette);
    root.classList.toggle('bg-alt', alt);
  };

  const paintInstant = palette => {
    root.classList.add('bg-instant');
    current = palette;
    root.style.setProperty('--acc-h', palette.a);
    alt = false;
    setVars('--bg-', palette);
    setVars('--bg2-', palette);
    root.classList.remove('bg-alt');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('bg-instant')));
  };

  const applyLite = () => {
    lite = detectLite();
    root.classList.toggle('lite', lite);
  };

  const readStored = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      return isPalette(value) ? value : null;
    } catch { return null; }
  };

  const pickHue = () => {
    let hue = 0;
    for (let i = 0; i < 6; i++) {
      hue = rand(0, 305);
      if (hue > 195) hue += 60;
      const diff = Math.abs(hue - current.a) % 360;
      if (Math.min(diff, 360 - diff) >= 50) break;
    }
    return Math.round(hue);
  };

  const nextPalette = () => {
    const a = pickHue();
    return { a, b: Math.round(a + rand(28, 70)), c: Math.round(a + rand(150, 210)) };
  };

  const shuffle = () => {
    const palette = nextPalette();
    paint(palette);
    try { localStorage.setItem(KEY, JSON.stringify(palette)); } catch {}
    channel?.postMessage(palette);
  };

  const receive = palette => {
    if (isPalette(palette) && palette.a !== current.a) paint(palette);
  };

  const stored = readStored();
  paintInstant(stored || current);
  applyLite();
  liteQuery.addEventListener('change', applyLite, opts);

  channel?.addEventListener('message', e => receive(e.data), opts);
  addEventListener('storage', e => {
    if (e.key !== KEY || !e.newValue) return;
    try { receive(JSON.parse(e.newValue)); } catch {}
  }, opts);

  if (!reduced.matches) {
    let lastY = scrollY, dir = 0, travelled = 0, lastChange = 0, frame = null;
    const step = () => {
      frame = null;
      const y = scrollY;
      const delta = y - lastY;
      lastY = y;
      if (!delta) return;
      const nextDir = Math.sign(delta);
      if (nextDir !== dir) { dir = nextDir; travelled = 0; }
      travelled += Math.abs(delta);
      const now = performance.now();
      if (travelled >= Math.max(360, innerHeight * .6) && now - lastChange > 3000) {
        travelled = 0;
        lastChange = now;
        shuffle();
      }
    };
    addEventListener('scroll', () => { if (frame === null) frame = requestAnimationFrame(step); }, { ...opts, passive: true });
  }

  addEventListener('pagehide', () => {
    channel?.close();
    controller.abort();
  }, { once: true });
})();

(() => {
  if (HTMLScriptElement.supports?.('speculationrules')) return;
  const controller = new AbortController();
  const seen = new Set();
  const prefetch = event => {
    const link = event.target.closest?.('a[href^="/"]');
    if (!link || link.target === '_blank' || seen.has(link.pathname)) return;
    seen.add(link.pathname);
    const tag = document.createElement('link');
    tag.rel = 'prefetch';
    tag.href = link.href;
    document.head.appendChild(tag);
  };
  const opts = { signal: controller.signal, passive: true, capture: true };
  document.addEventListener('pointerover', prefetch, opts);
  document.addEventListener('touchstart', prefetch, opts);
  document.addEventListener('focusin', prefetch, opts);
  addEventListener('pagehide', () => controller.abort(), { once: true });
})();

(() => {
  const finePointer = matchMedia('(pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const opts = { signal: controller.signal, passive: true };
  const SPOT = '.article, .skill, .icon-card, .auto-card, .contact-card, .project-row';
  const MAGNET = '.cta, .read-link, .to-top, .footer-copy, .theme-toggle';
  let glow = null, frame = null, last = null, magnet = null, glowOn = false, live = 0;

  const resetMagnet = () => {
    if (!magnet) return;
    magnet.style.translate = '';
    magnet = null;
  };

  const render = () => {
    frame = null;
    if (!last) return;
    const { x, y, target } = last;
    if (glow) {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!glowOn) { glowOn = true; glow.classList.add('on'); }
    }
    const card = target?.closest?.(SPOT);
    if (card) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--px', `${x - rect.left}px`);
      card.style.setProperty('--py', `${y - rect.top}px`);
    }
    if (reduced.matches) return;
    const el = target?.closest?.(MAGNET);
    if (el !== magnet) resetMagnet();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (x - rect.left - rect.width / 2) / rect.width;
    const dy = (y - rect.top - rect.height / 2) / rect.height;
    el.style.translate = `${(dx * 10).toFixed(1)}px ${(dy * 8).toFixed(1)}px`;
    magnet = el;
  };

  if (finePointer.matches) {
    if (!reduced.matches) {
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      glow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glow);
    }
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      last = { x: e.clientX, y: e.clientY, target: e.target };
      if (frame === null) frame = requestAnimationFrame(render);
    }, opts);
    document.documentElement.addEventListener('pointerleave', () => {
      resetMagnet();
      glowOn = false;
      glow?.classList.remove('on');
    }, opts);
  }

  const burst = (x, y) => {
    if (live >= 5) return;
    live += 1;
    const wrap = document.createElement('span');
    wrap.className = 'burst';
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;
    const count = 8;
    const offset = Math.random() * 45;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('i');
      const angle = ((i * 360) / count + offset) * Math.PI / 180;
      const dist = 24 + Math.random() * 22;
      spark.style.setProperty('--x', `${(Math.cos(angle) * dist).toFixed(1)}px`);
      spark.style.setProperty('--y', `${(Math.sin(angle) * dist).toFixed(1)}px`);
      wrap.appendChild(spark);
    }
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      wrap.remove();
      live -= 1;
    };
    wrap.addEventListener('animationend', e => { if (e.target === wrap) end(); });
    setTimeout(end, 1200);
    document.body.appendChild(wrap);
  };

  document.addEventListener('pointerdown', e => {
    if (reduced.matches || e.button > 0) return;
    if (e.target.closest?.('a, button')) burst(e.clientX, e.clientY);
  }, opts);

  addEventListener('pagehide', () => {
    if (frame !== null) cancelAnimationFrame(frame);
    glow?.remove();
    controller.abort();
  }, { once: true });
})();
