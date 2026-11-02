(() => {
  const root = document.querySelector('.wl');
  if (!root) return;

  const KEY = 'arlingkin-welcome';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lang = () => (document.documentElement.lang === 'id' ? 'id' : 'en');
  const theme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const tr = (key, fallback) => (T[key] && (T[key][lang()] || T[key].en)) || fallback;
  const bin = n => Array.from({ length: n }, () => (Math.random() < .5 ? '0' : '1')).join('');
  const picked = new Set();

  const decode = (el, ms = 900) => {
    if (reduced.matches) return;
    const key = el.dataset.i18n;
    const final = () => tr(key, el.textContent);
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / ms);
      const text = final();
      const keep = Math.floor(text.length * p);
      el.textContent = text.slice(0, keep) + text.slice(keep).replace(/\S/g, () => (Math.random() < .5 ? '0' : '1'));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final();
    };
    requestAnimationFrame(step);
  };

  let shaking = false;
  const shake = () => {
    const el = root.querySelector('[data-shake]');
    if (!el || shaking || reduced.matches) return;
    shaking = true;
    const text = el.textContent;
    el.textContent = text.replace(/\S/g, () => (Math.random() < .5 ? '0' : '1'));
    el.classList.add('is-shaking');
    setTimeout(() => { el.textContent = text; }, 110);
    setTimeout(() => { el.classList.remove('is-shaking'); shaking = false; }, 260);
  };

  const sync = () => {
    root.querySelectorAll('[data-wl-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.wlLang === lang() && picked.has('lang'))));
    root.querySelectorAll('[data-wl-theme]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.wlTheme === theme() && picked.has('theme'))));
    root.querySelectorAll('[data-wl-dot]').forEach(d => d.classList.toggle('is-done', picked.has(d.dataset.wlDot)));
    const v = k => root.querySelector(`[data-wl-v="${k}"]`);
    v('lang').textContent = lang();
    v('theme').textContent = theme();
    const ready = picked.has('lang') && picked.has('theme');
    v('status').textContent = tr(ready ? 'welcome.v.ready' : 'welcome.v.wait', '-');
    v('status').toggleAttribute('data-ready', ready);
    const progress = root.querySelector('.wl-progress');
    if (progress) progress.setAttribute('aria-label', tr('welcome.progress', 'Setup progress'));
  };

  const finish = () => { try { localStorage.setItem(KEY, '1'); } catch {} };

  root.addEventListener('click', e => {
    const l = e.target.closest('[data-wl-lang]');
    if (l) { applyLang(l.dataset.wlLang); picked.add('lang'); sync(); return; }
    const t = e.target.closest('[data-wl-theme]');
    if (t) {
      if (theme() !== t.dataset.wlTheme) document.querySelector('.theme-toggle')?.click();
      picked.add('theme'); sync(); return;
    }
    if (e.target.closest('[data-wl-go]')) { picked.add('go'); finish(); }
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.lang-btn')) { picked.add('lang'); setTimeout(sync, 0); }
    else if (e.target.closest('.theme-toggle')) { picked.add('theme'); setTimeout(sync, 0); }
  });

  root.querySelectorAll('[data-decode-hover]').forEach(h => {
    const card = h.closest('a');
    card.addEventListener('pointerenter', () => decode(h, 500));
    card.addEventListener('focus', () => decode(h, 500));
  });

  const rail = root.querySelector('[data-wl-rail]');
  if (rail) {
    const col = Array.from({ length: 24 }, () => bin(2)).join('\n');
    rail.innerHTML = `<i>${col}\n${col}</i>`;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => root.classList.toggle('wl-off', !en.isIntersecting)).observe(root);
  }

  root.addEventListener('pointerover', e => { if (e.target.closest('[data-shake]')) shake(); });

  document.addEventListener('DOMContentLoaded', () => {
    sync();
    const eyebrow = root.querySelector('[data-decode]');
    if (eyebrow) decode(eyebrow, 1000);
    setTimeout(shake, 1100);
  }, { once: true });
})();
