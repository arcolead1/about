(() => {
  const root = document.querySelector('[data-cron]');
  if (!root) return;

  const REPO = 'arlingkin/arlingkin';
  const FLOWS = {
    metrics: { file: 'metrics.yml', fallback: ['0 0 * * *'] },
    streak: { file: 'update-streak-badge.yml', fallback: ['0 1 * * *'] }
  };
  const CACHE_KEY = 'arlingkin-cron-v1';
  const TTL = 15 * 60e3;
  const OVERDUE = 15 * 60e3;
  const L = {
    en: {
      due: 'Due now. GitHub can start a few minutes late.', next: 'Next run', none: 'no runs yet', na: 'unavailable',
      events: { schedule: 'scheduled', push: 'push', workflow_dispatch: 'manual' },
      status: { success: 'success', failure: 'failed', cancelled: 'cancelled', running: 'running', queued: 'queued', unknown: 'unknown' }
    },
    id: {
      due: 'Waktunya jalan. GitHub kadang telat beberapa menit.', next: 'Run berikutnya', none: 'belum ada run', na: 'tidak tersedia',
      events: { schedule: 'terjadwal', push: 'push', workflow_dispatch: 'manual' },
      status: { success: 'berhasil', failure: 'gagal', cancelled: 'dibatalkan', running: 'berjalan', queued: 'antre', unknown: 'tidak diketahui' }
    }
  };

  const q = sel => root.querySelector(sel);
  const el = {
    ring: q('[data-ring]'), pct: q('[data-pct]'), d: q('[data-d]'), h: q('[data-h]'), m: q('[data-m]'), s: q('[data-s]'),
    next: q('[data-next]'), expr: q('[data-expr]'), last: q('[data-last]'), chip: q('[data-chip]'),
    status: q('[data-status]'), file: q('[data-cron-file]'), src: q('[data-src]')
  };
  const tabs = [...root.querySelectorAll('.cron-tab')];
  const controller = new AbortController();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let current = 'metrics';
  let store = {};
  let target = null;
  let period = 864e5;
  let timer = null;
  let onScreen = true;
  let lastSecond = -1;

  try { store = JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { store = {}; }
  const saveStore = () => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(store)); } catch {} };

  const parseField = (src, min, max) => {
    const out = new Set();
    for (const part of src.split(',')) {
      const [range, stepRaw] = part.split('/');
      const step = stepRaw === undefined ? 1 : Number(stepRaw);
      if (!Number.isInteger(step) || step < 1) return null;
      let lo, hi;
      if (range === '*') { lo = min; hi = max; }
      else if (range.includes('-')) { [lo, hi] = range.split('-').map(Number); }
      else { lo = Number(range); hi = stepRaw === undefined ? lo : max; }
      if (![lo, hi].every(Number.isInteger) || lo < min || hi > max || lo > hi) return null;
      for (let v = lo; v <= hi; v += step) out.add(v);
    }
    return out;
  };

  const parseCron = expr => {
    const f = String(expr).trim().split(/\s+/);
    if (f.length !== 5) return null;
    const minute = parseField(f[0], 0, 59);
    const hour = parseField(f[1], 0, 23);
    const dom = parseField(f[2], 1, 31);
    const month = parseField(f[3], 1, 12);
    const dowRaw = parseField(f[4], 0, 7);
    if (![minute, hour, dom, month, dowRaw].every(Boolean)) return null;
    return {
      expr: f.join(' '),
      minute: [...minute].sort((a, b) => a - b),
      hour: [...hour].sort((a, b) => a - b),
      dom, month,
      dow: new Set([...dowRaw].map(v => v % 7)),
      domAny: f[2].startsWith('*'),
      dowAny: f[4].startsWith('*')
    };
  };

  const dayMatches = (cron, day) => {
    const domOk = cron.dom.has(day.getUTCDate());
    const dowOk = cron.dow.has(day.getUTCDay());
    if (cron.domAny && cron.dowAny) return true;
    if (cron.domAny) return dowOk;
    if (cron.dowAny) return domOk;
    return domOk || dowOk;
  };

  const nextRun = (cron, from) => {
    const start = new Date(from.getTime() - (from.getTime() % 60e3) + 60e3);
    for (let i = 0; i < 800; i++) {
      const day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
      if (!cron.month.has(day.getUTCMonth() + 1) || !dayMatches(cron, day)) continue;
      for (const h of cron.hour) {
        for (const m of cron.minute) {
          const t = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m));
          if (t >= start) return t;
        }
      }
    }
    return null;
  };

  const lang = () => (document.documentElement.lang === 'id' ? 'id' : 'en');
  const crons = () => {
    const raw = store[current]?.crons?.length ? store[current].crons : FLOWS[current].fallback;
    return raw.map(parseCron).filter(Boolean);
  };

  const computeTarget = now => {
    let best = null, bestCron = null;
    const base = new Date(now - OVERDUE);
    for (const cron of crons()) {
      const t = nextRun(cron, base);
      if (t && (!best || t < best)) { best = t; bestCron = cron; }
    }
    target = best;
    if (best && bestCron) {
      const after = nextRun(bestCron, best);
      period = after ? Math.max(after - best, 60e3) : 864e5;
    }
  };

  const pad = n => String(n).padStart(2, '0');
  const dateFmt = () => new Intl.DateTimeFormat(lang() === 'id' ? 'id-ID' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });
  const relative = date => {
    const f = new Intl.RelativeTimeFormat(lang(), { numeric: 'auto' });
    const diff = (date - Date.now()) / 1000;
    const abs = Math.abs(diff);
    if (abs < 3600) return f.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return f.format(Math.round(diff / 3600), 'hour');
    return f.format(Math.round(diff / 86400), 'day');
  };

  const renderStatic = () => {
    const t = L[lang()];
    const flow = FLOWS[current];
    const last = store[current]?.last;
    el.file.textContent = flow.file;
    el.expr.textContent = crons().map(c => c.expr).join('  |  ') || '-';
    el.src.href = `https://github.com/${REPO}/actions/workflows/${flow.file}`;
    if (last) {
      const when = new Date(last.at);
      const ev = t.events[last.event] || last.event;
      el.last.textContent = `${relative(when)} · ${ev}`;
      const key = last.status !== 'completed' ? (last.status === 'queued' ? 'queued' : 'running') : (last.conclusion === 'success' ? 'success' : last.conclusion === 'cancelled' ? 'cancelled' : last.conclusion ? 'failure' : 'unknown');
      el.status.textContent = t.status[key];
      el.chip.className = `cron-chip ${key === 'success' ? 'ok' : key === 'failure' ? 'bad' : key === 'unknown' || key === 'cancelled' ? 'unk' : 'run'}`;
    } else {
      el.last.textContent = store[current]?.runsOk ? t.none : t.na;
      el.status.textContent = '-';
      el.chip.className = 'cron-chip unk';
    }
    computeTarget(Date.now());
    tick();
  };

  const tick = () => {
    if (!target) return;
    const now = Date.now();
    if (now - target.getTime() > OVERDUE) computeTarget(now);
    const diff = target.getTime() - now;
    const due = diff <= 0;
    const total = Math.max(0, Math.floor(diff / 1000));
    const frac = due ? 1 : Math.min(1, Math.max(0, 1 - diff / period));
    el.d.textContent = pad(Math.floor(total / 86400));
    el.h.textContent = pad(Math.floor(total % 86400 / 3600));
    el.m.textContent = pad(Math.floor(total % 3600 / 60));
    el.s.textContent = pad(total % 60);
    el.ring.style.setProperty('--p', frac.toFixed(4));
    el.pct.textContent = `${Math.round(frac * 100)}%`;
    el.next.textContent = due ? L[lang()].due : `${L[lang()].next}: ${dateFmt().format(target)}`;
    root.classList.toggle('is-due', due);
    if (!reduced.matches && total !== lastSecond) {
      lastSecond = total;
      el.s.classList.remove('tick');
      void el.s.offsetWidth;
      el.s.classList.add('tick');
    }
  };

  const fetchWithTimeout = async (url, parse) => {
    const ctl = new AbortController();
    const stop = () => ctl.abort();
    controller.signal.addEventListener('abort', stop, { once: true });
    const timeout = setTimeout(stop, 8000);
    try {
      const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(String(res.status));
      return await res[parse]();
    } finally {
      clearTimeout(timeout);
      controller.signal.removeEventListener('abort', stop);
    }
  };

  const load = async id => {
    const entry = store[id] || {};
    if (entry.t && Date.now() - entry.t < TTL) return;
    const file = FLOWS[id].file;
    const [yml, runs] = await Promise.allSettled([
      fetchWithTimeout(`https://raw.githubusercontent.com/${REPO}/main/.github/workflows/${file}`, 'text'),
      fetchWithTimeout(`https://api.github.com/repos/${REPO}/actions/workflows/${file}/runs?per_page=1`, 'json')
    ]);
    const next = { ...entry };
    let ok = false;
    if (yml.status === 'fulfilled') {
      const found = [...yml.value.matchAll(/^\s*-\s*cron:\s*["']([^"']+)["']/gm)].map(m => m[1]);
      if (found.length) { next.crons = found; ok = true; }
    }
    if (runs.status === 'fulfilled') {
      const run = runs.value?.workflow_runs?.[0];
      if (run) next.last = { at: run.updated_at || run.created_at, status: run.status, conclusion: run.conclusion, event: run.event };
      next.runsOk = true;
      ok = true;
    }
    if (ok) next.t = Date.now();
    store[id] = next;
    saveStore();
    if (id === current && !controller.signal.aborted) renderStatic();
  };

  const start = () => {
    if (timer !== null || !onScreen || document.hidden) return;
    timer = setInterval(tick, 1000);
    tick();
  };
  const stop = () => { clearInterval(timer); timer = null; };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const id = tab.dataset.wf;
    if (!FLOWS[id] || id === current) return;
    current = id;
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    renderStatic();
    load(id);
  }, { signal: controller.signal }));

  document.addEventListener('click', e => {
    if (e.target.closest('.lang-btn')) setTimeout(renderStatic, 0);
  }, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()), { signal: controller.signal });

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? start() : stop();
    });
    observer.observe(root);
  }

  addEventListener('pagehide', () => {
    stop();
    observer?.disconnect();
    controller.abort();
  }, { once: true });

  renderStatic();
  start();
  load('metrics');
})();
