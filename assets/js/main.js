const LANG_KEY = 'arlingkin-lang';
const path = location.pathname.replace(/\/$/, '') || '/';


function getLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'id' || q === 'en') return q;
  } catch {}
  try { return localStorage.getItem(LANG_KEY) === 'id' ? 'id' : 'en'; } catch { return 'en'; }
}

function applyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  try {
    const u = new URL(location.href);
    if (u.searchParams.has('lang') && u.searchParams.get('lang') !== lang) { u.searchParams.set('lang', lang); history.replaceState(null, '', u); }
  } catch {}
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const entry = T[key];
    if (!entry) return;

    const factValue = T[`${key}v`];
    if (key.startsWith('about.fact.') && factValue) {
      el.textContent = entry[lang] || entry.en;
      const value = document.createElement('b');
      value.textContent = factValue[lang] || factValue.en;
      el.append(value);
      return;
    }
    el.innerHTML = entry[lang] || entry.en;
  });
  const dateFmt = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  document.querySelectorAll('time[data-date]').forEach(t => { t.textContent = dateFmt.format(new Date(`${t.dataset.date}T00:00:00Z`)); });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const entry = T[el.getAttribute('data-i18n-alt')];
    if (entry) el.alt = entry[lang] || entry.en;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('on', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';
}

function initLangSwitch() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
}

const CONFIG_MAP = [
  ['home.eyebrow', 'role', true],
  ['home.status', 'tagline', true],
  ['home.now.1', 'now_1', true],
  ['home.now.2', 'now_2', true],
  ['home.now.3', 'now_3', true],
  ['home.now.4', 'now_4', true],
  ['about.fact.locv', 'location', false],
  ['about.fact.statv', 'status', false],
  ['about.fact.workv', 'working_on', false],
  ['about.fact.openv', 'open_to', false],
  ['about.fact.emv', 'email', false],
];

function applyConfig() {
  const c = window.SITE_CONFIG;
  if (!c) return;
  const clean = value => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text && !text.startsWith('__') ? text : null;
  };
  const esc = s => s.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  CONFIG_MAP.forEach(([key, field, html]) => {
    const value = clean(c[field]);
    if (value === null || !T[key]) return;
    const text = html ? esc(value) : value;
    T[key] = { en: text, id: text };
  });
}

function setActiveNav() {
  document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('/')) return;
    const target = href.split('#')[0];
    if (path === target || (target !== '/' && path.startsWith(target + '/'))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function revealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => {
    if (el.dataset.delay) el.style.setProperty('--d', `${el.dataset.delay}ms`);
    if (el.getBoundingClientRect().top < innerHeight * .95) {
      el.classList.add('in', 'reveal-instant');
      return;
    }
    io.observe(el);
  });
}

function initCopyEmail() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.getAttribute('data-copy');
      try { await navigator.clipboard.writeText(val); } catch {
        const t = document.createElement('textarea');
        t.value = val; document.body.appendChild(t); t.select();
        document.execCommand('copy'); t.remove();
      }
      const orig = btn.textContent;
      btn.textContent = 'copied ✓';
      setTimeout(() => { btn.textContent = orig; }, 1600);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  applyConfig();
  revealOnScroll();
  initCopyEmail();
  initLangSwitch();
  applyLang(getLang());
  initNoteTypography();
}, { once: true });


function initNoteTypography() {
  const all = ['note-font-0','note-font-1','note-font-2','note-font-3','note-font-4'];
  document.querySelectorAll('[data-note-fonts]').forEach(el => {
    let index = 0;
    el.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      index = (index + 1) % all.length;
      el.classList.remove(...all);
      el.classList.add(all[index]);
      el.classList.toggle('font-shifted', index % 2 === 1);
    });
  });
}
