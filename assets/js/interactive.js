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

  const marqueeTrack = document.querySelector('.tool-marquee-track');
  if (marqueeTrack && !marqueeTrack.dataset.cloned) {
    marqueeTrack.dataset.cloned = '1';
    [...marqueeTrack.children].forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      marqueeTrack.appendChild(clone);
    });
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
    controller.abort();
  }, { once: true });
})();
