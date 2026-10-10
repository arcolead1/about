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
  const searchWrap = root.querySelector('[data-filter-search]');
  const searchBtn = root.querySelector('[data-filter-search-toggle]');
  const searchClear = root.querySelector('[data-filter-search-clear]');
  const panel = root.querySelector('[data-filter-panel]');
  const panelBtn = root.querySelector('[data-filter-panel-toggle]');
  const PAGE = Math.max(1, Number(root.dataset.page) || 8);
  const noun = root.dataset.noun || 'items';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
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

  chips.forEach((chip, i) => chip.style.setProperty('--i', i));

  /* search collapses to an icon; the tag panel folds away behind a "Filter" button */
  let ignoreBlur = false;
  const setSearch = (open, focus) => {
    if (!searchWrap || !input) return;
    searchWrap.classList.toggle('open', open);
    searchBtn.setAttribute('aria-expanded', String(open));
    input.inert = !open;
    if (open && focus) input.focus();
  };
  const setPanel = open => {
    if (!panel || !panelBtn) return;
    panel.classList.toggle('open', open);
    panel.inert = !open;
    panelBtn.setAttribute('aria-expanded', String(open));
  };

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
    if (input) {
      input.placeholder = tr(input.dataset.ph, input.placeholder);
      input.setAttribute('aria-label', tr('filter.label', 'Search'));
    }
    if (searchBtn) { const l = tr('filter.label', 'Search'); searchBtn.setAttribute('aria-label', l); searchBtn.title = `${l} (/)`; }
    if (searchClear) { const l = tr('filter.clearq', 'Clear search'); searchClear.setAttribute('aria-label', l); searchClear.title = l; }
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
    if (countEl) {
      const text = tr(`filter.count.${noun}`, 'Showing {n} of {t}').replace('{n}', shown.size).replace('{t}', rows.length);
      if (countEl.textContent !== text) {
        countEl.textContent = text;
        if (!first && !reduce.matches) countEl.animate([{ opacity: .35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
      }
    }
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filterTag === tag)));
    syncUrl(raw);
    if (searchClear) searchClear.hidden = raw === '';
    if (panelBtn) panelBtn.dataset.active = tag ? '1' : '';
    first = false;
  };

  input?.addEventListener('input', () => { limit = PAGE; render(); }, opts);
  input?.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (input.value) { input.value = ''; limit = PAGE; render(); }
    else { setSearch(false); searchBtn?.focus(); }
  }, opts);
  searchBtn?.addEventListener('pointerdown', () => { ignoreBlur = true; setTimeout(() => { ignoreBlur = false; }, 300); }, opts);
  searchBtn?.addEventListener('click', () => {
    if (searchWrap.classList.contains('open') && !input.value) setSearch(false);
    else setSearch(true, true);
  }, opts);
  searchWrap?.addEventListener('focusout', e => {
    if (ignoreBlur || searchWrap.contains(e.relatedTarget)) return;
    setTimeout(() => { if (!searchWrap.contains(document.activeElement) && !input.value) setSearch(false); }, 0);
  }, opts);
  searchClear?.addEventListener('click', () => { input.value = ''; limit = PAGE; render(); input.focus(); }, opts);
  panelBtn?.addEventListener('click', () => setPanel(!panel.classList.contains('open')), opts);
  chips.forEach(chip => chip.addEventListener('click', () => {
    const id = chip.dataset.filterTag;
    tag = id === tag ? '' : id;
    limit = PAGE;
    render();
  }, opts));
  moreBtn?.addEventListener('click', () => { limit += PAGE; render(); }, opts);
  clearBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    setSearch(true, true);
    tag = '';
    limit = PAGE;
    render();
  }, opts);
  /* tags inside rows/cards jump straight to that filter */
  root.addEventListener('click', e => {
    const chip = e.target.closest('[data-item] .chip[data-tag]');
    if (!chip || !chips.some(c => c.dataset.filterTag === chip.dataset.tag)) return;
    e.preventDefault();
    tag = chip.dataset.tag;
    limit = PAGE;
    setPanel(true);
    render();
    root.querySelector('.filter-bar')?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
  }, opts);

  /* keyboard: "/" opens search; arrows walk the visible results (search <-> list) */
  const links = () => rows.filter(r => !r.el.hidden).map(r => (r.el.matches('a') ? r.el : r.el.querySelector('a')));
  root.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const list = links();
    const onInput = e.target === input;
    const i = list.indexOf(e.target);
    if ((!onInput && i < 0) || (onInput && e.key === 'ArrowUp')) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') list[onInput ? 0 : Math.min(i + 1, list.length - 1)]?.focus();
    else if (i > 0) list[i - 1].focus();
    else setSearch(true, true);
  }, opts);
  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable))) return;
    e.preventDefault();
    setSearch(true, true);
  }, opts);

  document.addEventListener('click', e => {
    if (e.target.closest('.lang-btn')) setTimeout(() => { texts(); render(); }, 0);
  }, opts);
  document.addEventListener('DOMContentLoaded', () => { texts(); render(); }, { once: true });
  addEventListener('pagehide', () => controller.abort(), { once: true });

  setSearch(Boolean(input && input.value), false);
  setPanel(tag !== '');
  texts();
  render();
})();
