/* Search + tag filter + "show more" for any page with [data-filter] (notes, projects). */
(() => {
  const root = document.querySelector('[data-filter]');
  if (!root) return;

  const input = root.querySelector('[data-filter-q]');
  const chips = [...root.querySelectorAll('[data-filter-tag]')];
  const groups = [...root.querySelectorAll('[data-filter-group]')];
  const idle = [...root.querySelectorAll('[data-filter-idle]')];
  const countEl = root.querySelector('[data-filter-count]');
  const emptyEl = root.querySelector('[data-filter-empty]');
  const moreBtn = root.querySelector('[data-filter-more]');
  const clearBtn = root.querySelector('[data-filter-clear]');
  const dates = [...root.querySelectorAll('time[data-date]')];
  const PAGE = Math.max(1, Number(root.dataset.page) || 8);
  const noun = root.dataset.noun || 'items';
  const controller = new AbortController();
  const opts = { signal: controller.signal };

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lang = () => (document.documentElement.lang === 'id' ? 'id' : 'en');
  const tr = (key, fallback) => {
    const entry = typeof T !== 'undefined' ? T[key] : null;
    return (entry && (entry[lang()] || entry.en)) || fallback;
  };
  const rows = [...root.querySelectorAll('[data-item]')].map(el => ({
    el,
    q: norm(el.dataset.q),
    tags: (el.dataset.tags || '').split(/\s+/).filter(Boolean),
    group: el.closest('[data-filter-group]')
  }));

  const params = new URLSearchParams(location.search);
  let tag = params.get('tag') || '';
  if (!chips.some(c => c.dataset.filterTag === tag)) tag = '';
  if (input) input.value = params.get('q') || '';
  let limit = PAGE;
  let first = true;

  chips.forEach(chip => {
    const id = chip.dataset.filterTag;
    chip.dataset.n = id ? rows.filter(r => r.tags.includes(id)).length : rows.length;
  });

  const pop = el => {
    el.classList.remove('filter-pop');
    void el.offsetWidth;
    el.classList.add('filter-pop');
    setTimeout(() => el.classList.remove('filter-pop'), 600);
  };

  const syncUrl = q => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (tag) next.set('tag', tag);
    const qs = next.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  };

  const texts = () => {
    if (input) input.placeholder = tr(input.dataset.ph, input.placeholder);
    const fmt = new Intl.DateTimeFormat(lang() === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    dates.forEach(t => { t.textContent = fmt.format(new Date(`${t.dataset.date}T00:00:00Z`)); });
  };

  const render = () => {
    const raw = input ? input.value.trim() : '';
    const terms = norm(raw).split(/\s+/).filter(Boolean);
    const active = terms.length > 0 || tag !== '';
    const shown = new Set(rows.filter(r => (!tag || r.tags.includes(tag)) && terms.every(t => r.q.includes(t))));
    let paged = 0;
    if (!active) {
      groups.filter(g => g.hasAttribute('data-paged')).forEach(g => {
        rows.filter(r => r.group === g && shown.has(r)).slice(limit).forEach(r => { shown.delete(r); paged++; });
      });
    }
    rows.forEach(r => {
      const visible = shown.has(r);
      if (visible && r.el.hidden && !first) pop(r.el);
      r.el.hidden = !visible;
    });
    groups.forEach(g => { g.hidden = !rows.some(r => r.group === g && shown.has(r)); });
    idle.forEach(el => { el.hidden = active; });
    if (moreBtn) moreBtn.hidden = paged === 0;
    if (emptyEl) emptyEl.hidden = shown.size > 0;
    if (countEl) countEl.textContent = tr(`filter.count.${noun}`, 'Showing {n} of {t}').replace('{n}', shown.size).replace('{t}', rows.length);
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filterTag === tag)));
    syncUrl(raw);
    first = false;
  };

  input?.addEventListener('input', () => { limit = PAGE; render(); }, opts);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Escape' && input.value) { input.value = ''; limit = PAGE; render(); }
  }, opts);
  chips.forEach(chip => chip.addEventListener('click', () => {
    const id = chip.dataset.filterTag;
    tag = id === tag ? '' : id;
    limit = PAGE;
    render();
  }, opts));
  moreBtn?.addEventListener('click', () => { limit += PAGE; render(); }, opts);
  clearBtn?.addEventListener('click', () => {
    if (input) { input.value = ''; input.focus(); }
    tag = '';
    limit = PAGE;
    render();
  }, opts);
  document.addEventListener('click', e => {
    if (e.target.closest('.lang-btn')) setTimeout(() => { texts(); render(); }, 0);
  }, opts);
  document.addEventListener('DOMContentLoaded', () => { texts(); render(); }, { once: true });
  addEventListener('pagehide', () => controller.abort(), { once: true });

  texts();
  render();
})();
