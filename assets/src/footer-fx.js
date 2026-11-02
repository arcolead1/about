(() => {
  const mark = document.querySelector('.footer-mark');
  if (!mark) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const controller = new AbortController();
  const opts = { signal: controller.signal };
  const letters = [...mark.textContent.trim()];
  mark.textContent = '';
  letters.forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'fm-l';
    span.textContent = ch;
    span.style.setProperty('--i', i);
    span.style.setProperty('--r', i % 2 ? 1 : -1);
    if (ch === 'i') span.dataset.hero = '';
    mark.appendChild(span);
  });
  const last = mark.lastElementChild;
  let running = false, seen = false, inView = false, guard = null, frame = null;
  const release = () => {
    clearTimeout(guard);
    mark.classList.remove('is-hopping', 'is-entering');
    running = false;
  };
  const hop = () => {
    if (running || reduced.matches || !last) return;
    running = true;
    mark.classList.add('is-hopping');
    guard = setTimeout(release, 3500);
  };
  const enter = () => {
    if (running || reduced.matches || !last) return;
    running = true;
    mark.classList.remove('is-armed');
    mark.classList.add('is-entering');
    guard = setTimeout(release, 4500);
  };
  if (!reduced.matches && last) mark.classList.add('is-armed');
  mark.addEventListener('click', hop, opts);
  mark.addEventListener('animationend', event => {
    if (event.target !== last) return;
    if (event.animationName === 'fm-in') { release(); hop(); }
    else if (event.animationName.startsWith('fm-hop')) release();
  }, opts);

  if (finePointer.matches && !reduced.matches) {
    let px = -9999, py = 0;
    const paint = () => {
      mark.style.setProperty('--mx', `${px}px`);
      mark.style.setProperty('--my', `${py}px`);
      frame = null;
    };
    mark.addEventListener('pointermove', e => {
      const rect = mark.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      if (frame === null) frame = requestAnimationFrame(paint);
    }, { ...opts, passive: true });
    mark.addEventListener('pointerleave', () => { px = -9999; paint(); }, opts);
  }

  let prevY = scrollY;
  const observer = new IntersectionObserver(([entry]) => {
    const down = scrollY > prevY;
    prevY = scrollY;
    if (!entry.isIntersecting) { inView = false; return; }
    if (!seen) { seen = true; enter(); }
    else if (!inView && down) hop();
    inView = true;
  }, { threshold: 0.55 });
  observer.observe(mark);
  const vis = new IntersectionObserver(([e]) => mark.classList.toggle('is-visible', e.isIntersecting));
  vis.observe(mark);
  addEventListener('pagehide', () => {
    clearTimeout(guard);
    if (frame !== null) cancelAnimationFrame(frame);
    observer.disconnect(); vis.disconnect();
    controller.abort();
  }, { once: true });
})();

(() => {
  const logo = document.querySelector('.footer-logo');
  const footer = document.querySelector('.site-footer');
  const status = document.querySelector('.footer-status');
  const label = logo && logo.querySelector('.fl-text');
  if (!logo || !footer || !label) return;
  const WORD = label.dataset.text || label.textContent.trim();
  const SITE_REPO = 'arlingkin/about';
  const SHA_KEY = 'arlingkin-sha-v1';
  const SHA_TTL = 15 * 60e3;
  const HOLD_MS = 2800;
  const HOLD_LINGER = 3200;
  const SWAP_EVERY = 1900;
  const SWAP_MS = 520;
  const REPO_TAG = `FROM GITHUB ${SITE_REPO}`.toUpperCase();
  const FX = {
    orange: { glyphs: '01#$%&@/<>_=+*~', scan: 'SCAN', key: 'MATCH', id: 'ID ARLINGKIN', tag: 'TARGET LOCKED' },
    blue: { glyphs: '0123456789ABCDEF<>/_', scan: 'DECRYPT', key: 'KEY', id: 'UID 0 ROOT', tag: 'ACCESS GRANTED' }
  };
  let fx = 'orange';
  const VARS = ['--dx', '--dy', '--sk', '--cs', '--mx', '--lo', '--sl', '--op', '--a1', '--a2', '--b1', '--b2', '--hotc', '--g1', '--g2', '--g3', '--gy', '--hud', '--hs', '--eye'];
  const MODES = {
    twitch: { n: [2, 4], amp: .25, scr: 0, tear: .2, gap: [16, 34] },
    slide: { n: [6, 10], amp: 1, scr: .55, tear: .5, gap: [28, 70], snap: 4 },
    tear: { n: [5, 9], amp: .55, scr: .3, tear: 1, gap: [24, 60] },
    decode: { n: [7, 12], amp: .3, scr: .95, tear: .25, gap: [45, 90] },
    blackout: { n: [2, 3], amp: .7, scr: .2, tear: .8, gap: [30, 70], dim: true },
    scan: { n: [8, 13], amp: .12, scr: .15, tear: .1, gap: [55, 95] }
  };
  const NEXT = {
    start: { twitch: .4, slide: .25, tear: .1, scan: .25 },
    twitch: { slide: .45, tear: .2, decode: .1, scan: .25 },
    slide: { tear: .25, decode: .3, scan: .2, end: .25 },
    tear: { slide: .15, decode: .3, scan: .2, end: .35 },
    decode: { end: .65, blackout: .2, scan: .15 },
    blackout: { decode: .5, scan: .2, end: .3 },
    scan: { decode: .55, end: .35, blackout: .1 }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const opts = { signal: controller.signal };
  let seed = (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0;
  const rnd = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const lattice = Array.from({ length: 64 }, rnd);
  const noise = x => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lattice[i & 63] * (1 - u) + lattice[(i + 1) & 63] * u;
  };
  const between = (a, b) => a + rnd() * (b - a);
  const glyph = () => FX[fx].glyphs[Math.floor(rnd() * FX[fx].glyphs.length)];
  const hex = () => Math.floor(rnd() * 16).toString(16);
  const pick = table => {
    let r = rnd();
    for (const [key, weight] of Object.entries(table)) if ((r -= weight) < 0) return key;
    return 'end';
  };
  const put = (k, v) => logo.style.setProperty(k, v);
  const nextFx = () => {
    fx = fx === 'orange' ? 'blue' : 'orange';
    footer.dataset.fx = fx;
  };
  footer.dataset.fx = fx;
  const hud = document.createElement('span');
  const hudText = document.createElement('span');
  const hudTag = document.createElement('span');
  hud.className = 'fl-hud';
  hudTag.className = 'fl-hud-tag';
  hud.setAttribute('aria-hidden', 'true');
  hud.append(hudText, hudTag);
  logo.append(hud);

  let sha = '';
  let shaRequested = false;
  const loadSha = async () => {
    try {
      const cached = JSON.parse(localStorage.getItem(SHA_KEY));
      if (cached && /^[0-9a-f]{7}$/.test(cached.sha)) {
        sha = cached.sha;
        if (Date.now() - cached.t < SHA_TTL) return;
      }
    } catch {}
    try {
      const res = await fetch(`https://api.github.com/repos/${SITE_REPO}/commits/main`, { headers: { Accept: 'application/vnd.github.sha' }, signal: controller.signal });
      if (!res.ok) return;
      const full = (await res.text()).trim();
      if (!/^[0-9a-f]{40}$/.test(full)) return;
      sha = full.slice(0, 7);
      try { localStorage.setItem(SHA_KEY, JSON.stringify({ sha, t: Date.now() })); } catch {}
    } catch {}
  };
  const ensureSha = () => {
    if (shaRequested) return;
    shaRequested = true;
    loadSha();
  };
  const shaLine = (shown, locked) => {
    if (locked && !sha) return 'MAIN ???????';
    return 'MAIN ' + Array.from({ length: 7 }, (_, i) => (sha && i < shown ? sha[i] : hex())).join('');
  };
  const readout = (n, locked) => [
    `${FX[fx].scan} [${'#'.repeat(Math.min(6, n + 1)).padEnd(6, '-')}]`,
    FX[fx].id,
    `${FX[fx].key} ${locked ? 100 : Math.min(99, 38 + n * 9 + Math.floor(rnd() * 6))}%`,
    shaLine(locked ? 7 : Math.min(6, Math.floor(n * .6)), locked)
  ].slice(0, locked ? 4 : Math.min(4, 1 + Math.floor(n / 2))).join('\n') + (locked ? '' : '_');
  const holdReadout = p => [
    `${FX[fx].scan} [${'#'.repeat(Math.round(p * 10)).padEnd(10, '-')}]`,
    `${FX[fx].key} ${Math.floor(p * 100)}%`,
    p > .12 ? FX[fx].id : '',
    p > .4 ? shaLine(p >= 1 ? 7 : Math.floor((p - .4) / .6 * 7), p >= 1) : ''
  ].filter(Boolean).join('\n') + (p >= 1 ? '' : '_');
  const morph = ({ from, to, stagger }, q) => stagger.map((s, i) => (q < s ? from[i] || ' ' : q < s + .3 ? glyph() : to[i] || ' ')).join('');
  const flash = () => {
    hudTag.classList.remove('is-flash');
    void hudTag.offsetWidth;
    hudTag.classList.add('is-flash');
  };

  let loopTimer = null, frameTimer = null, holdTimer = null;
  let visible = false, busy = false, hold = null;
  let trail = [0, 0, 0];
  let clock = rnd() * 100;
  let lock = [];

  const rest = () => {
    logo.classList.remove('is-glitch', 'is-scan');
    footer.classList.remove('is-scan');
    VARS.forEach(k => logo.style.removeProperty(k));
    label.textContent = WORD;
    label.dataset.a = '';
    label.dataset.b = '';
    hudText.textContent = '';
    hudTag.textContent = '';
    hudTag.classList.remove('is-flash');
    busy = false;
  };

  const scramble = (strength, progress) => [...WORD].map((ch, i) => (rnd() < strength && progress * 1.2 < lock[i] + .2 ? glyph() : ch)).join('');

  const render = ({ m, env, progress, reach, power, scan, calm }) => {
    clock += between(.08, .3);
    const kick = rnd() < .2 ? between(.2, 1) : 1;
    const snap = m.snap || 1;
    const raw = ((rnd() < .12 ? -.3 : between(.3, 1)) * kick * m.amp * reach + (noise(clock * 3) * 2 - 1) * 2.5 * m.amp) * env;
    const dx = Math.round(raw / snap) * snap;
    const a1 = between(0, 68), b1 = between(0, 68);
    const band = 14 + 22 * m.tear;
    put('--dx', dx + 'px');
    put('--dy', (between(-1.5, 1.5) * env * power).toFixed(1) + 'px');
    put('--sk', (between(-9, 9) * env * (.4 + .6 * m.tear)).toFixed(1) + 'deg');
    put('--cs', calm ? '0px' : (1 + 3.5 * env * rnd() * (.6 + .4 * m.tear)).toFixed(1) + 'px');
    put('--mx', ((rnd() - .5) * 8 * env).toFixed(1) + 'px');
    put('--lo', calm ? '0' : (.5 + .45 * rnd()).toFixed(2));
    put('--sl', calm ? '.2' : (.3 + .5 * rnd()).toFixed(2));
    put('--op', m.dim && rnd() < .6 ? between(.15, .45).toFixed(2) : '1');
    put('--a1', a1.toFixed(0) + '%');
    put('--a2', Math.max(0, 100 - a1 - between(10, band)).toFixed(0) + '%');
    put('--b1', b1.toFixed(0) + '%');
    put('--b2', Math.max(0, 100 - b1 - between(10, band)).toFixed(0) + '%');
    put('--hotc', scan ? 'var(--orange)' : rnd() < .25 ? 'var(--link)' : '');
    put('--g1', trail[0] - dx + 'px');
    put('--g2', trail[1] - trail[0] + 'px');
    put('--g3', trail[2] - trail[1] + 'px');
    put('--gy', between(-1, 1).toFixed(1) + 'px');
    trail.unshift(dx);
    trail.length = 3;
    label.textContent = scramble(m.scr, progress);
    label.dataset.a = scramble(Math.min(1, m.scr + .25), progress);
    label.dataset.b = scramble(Math.min(1, m.scr + .25), progress);
  };

  const setScan = (on, scale, lines, tag, flicker, steady) => {
    logo.classList.toggle('is-scan', on);
    footer.classList.toggle('is-scan', on);
    put('--hud', on && rnd() < flicker ? '1' : '0');
    if (!on) return;
    put('--hs', Math.max(1, scale).toFixed(2));
    put('--eye', steady ? '1' : (.5 + .5 * rnd()).toFixed(2));
    hudText.textContent = lines;
    hudTag.textContent = tag;
  };

  const frames = power => {
    const list = [];
    for (let mode = pick(NEXT.start), segs = 0; mode !== 'end' && segs < 4; mode = pick(NEXT[mode]), segs++) {
      const count = Math.round(between(...MODES[mode].n) * (.7 + .3 * power));
      for (let k = 0; k < count; k++) list.push(mode);
    }
    return list;
  };

  const burst = (power = 1) => {
    if (busy || reduced.matches) return;
    busy = true;
    const plan = frames(power);
    const total = plan.length;
    const reach = between(10, 26) * power;
    let f = 0;
    let scanned = 0;
    lock = [...WORD].map(() => between(.3, 1));
    if (plan.includes('scan')) nextFx();
    logo.classList.add('is-glitch');
    const step = () => {
      const scan = plan[f] === 'scan';
      const env = .35 + .65 * Math.pow(Math.sin(Math.PI * Math.min(1, f / (total - 1) * 1.1)), .7);
      render({ m: MODES[plan[f]], env, progress: f / total, reach, power, scan });
      const last = plan[f + 1] !== 'scan';
      setScan(scan, 1.45 - scanned * .12 + (rnd() - .5) * .04, scan ? readout(scanned, last) : '', scan && last ? FX[fx].tag : '', .9);
      if (scan) scanned += 1;
      f += 1;
      if (f >= total) {
        rest();
        if (rnd() < .25) frameTimer = setTimeout(() => burst(power * .7), between(200, 520));
        return;
      }
      frameTimer = setTimeout(step, between(...MODES[plan[f]].gap) + (rnd() < .15 ? between(50, 120) : 0));
    };
    step();
  };

  const finishHold = () => {
    clearTimeout(holdTimer);
    hold = null;
    if (status) {
      status.classList.remove('is-holding');
      status.style.removeProperty('--hold');
    }
    rest();
  };

  const holdTick = () => {
    if (!hold) return;
    const now = performance.now();
    if (hold.releasedAt && now - hold.releasedAt > HOLD_LINGER) { finishHold(); return; }
    const p = Math.min(1, (now - hold.start) / HOLD_MS);
    const done = p >= 1;
    if (done && !hold.done) {
      hold.done = true;
      hold.tag = { idx: 0, text: hold.tags[0], since: now, swap: null };
      flash();
      if (navigator.vibrate) navigator.vibrate(24);
    }
    let tag = '';
    let ping = 0;
    if (done) {
      const t = hold.tag;
      if (!t.swap && now - t.since > SWAP_EVERY) {
        t.idx = 1 - t.idx;
        const len = Math.max(t.text.length, hold.tags[t.idx].length);
        t.swap = { from: t.text, to: hold.tags[t.idx], start: now, stagger: Array.from({ length: len }, (_, i) => (i / len) * .45 + rnd() * .2) };
        flash();
      }
      let shown = t.text;
      if (t.swap) {
        const q = reduced.matches ? 1 : Math.min(1, (now - t.swap.start) / SWAP_MS);
        shown = q >= 1 ? t.swap.to : morph(t.swap, q);
        ping = Math.max(0, 1 - (now - t.swap.start) / 420);
        if (q >= 1) { t.text = t.swap.to; t.swap = null; t.since = now; }
      }
      tag = shown.trimEnd();
    }
    render({ m: { amp: .1 + .45 * p, scr: done ? 0 : .95 * (1 - p) + .05, tear: .2 + .5 * p }, env: done ? 0 : .35 + .65 * p, progress: p, reach: 20, power: 1, scan: true, calm: done || reduced.matches });
    setScan(true, done ? 1 + .14 * ping : 1.45 - p * .45, holdReadout(p), tag, 1, done);
    status.style.setProperty('--hold', p.toFixed(3));
    holdTimer = setTimeout(holdTick, done && !hold.tag.swap ? 120 : 33);
  };

  const holdRelease = () => {
    document.removeEventListener('pointerup', holdRelease);
    document.removeEventListener('pointercancel', holdRelease);
    if (!hold) return;
    status.classList.remove('is-holding');
    if (hold.done) hold.releasedAt = performance.now();
    else finishHold();
  };

  const holdPress = e => {
    if (e.button > 0) return;
    if (hold) finishHold();
    ensureSha();
    clearTimeout(frameTimer);
    rest();
    busy = true;
    lock = [...WORD].map(() => between(.3, 1));
    nextFx();
    hold = { start: performance.now(), done: false, releasedAt: 0, tag: null, tags: [FX[fx].tag, REPO_TAG] };
    logo.classList.add('is-glitch');
    status.classList.add('is-holding');
    document.addEventListener('pointerup', holdRelease);
    document.addEventListener('pointercancel', holdRelease);
    holdTick();
  };

  const nextDelay = () => Math.min(11000, 1800 + -Math.log(1 - rnd()) * 4200);
  const loop = first => {
    clearTimeout(loopTimer);
    if (!visible || document.hidden || reduced.matches) return;
    loopTimer = setTimeout(() => { burst(between(.6, 1)); loop(false); }, first ? between(700, 1500) : nextDelay());
  };

  logo.addEventListener('pointerenter', () => { ensureSha(); burst(1); }, opts);
  logo.addEventListener('focusin', () => { ensureSha(); burst(.8); }, opts);
  if (status) {
    status.addEventListener('pointerdown', holdPress, opts);
    status.addEventListener('contextmenu', e => e.preventDefault(), opts);
  }
  document.addEventListener('visibilitychange', () => loop(false), opts);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { ensureSha(); loop(true); } else clearTimeout(loopTimer);
  }, { threshold: .15 }) : null;
  if (observer) observer.observe(footer);
  addEventListener('pagehide', () => {
    clearTimeout(loopTimer);
    clearTimeout(frameTimer);
    clearTimeout(holdTimer);
    if (observer) observer.disconnect();
    controller.abort();
  }, { once: true });
})();
