(() => {
  const CELL_W = 16;
  const CELL_H = 20;
  const STEPS = 24;
  const FRAME_MS = 30;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rand = (min, max) => min + Math.random() * (max - min);
  const parseHex = value => {
    const hex = value.trim().replace('#', '');
    const full = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
  };
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  const rain = (card, signal) => {
    const art = card.querySelector('.code-art');
    if (!art) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'card-rain';
    canvas.setAttribute('aria-hidden', 'true');
    art.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const css = getComputedStyle(card);
    const [head, mid, tail] = ['--rain-head', '--rain-mid', '--rain-tail'].map(key => parseHex(css.getPropertyValue(key)));
    const flash = mix(head, [255, 255, 255], .6);
    const font = css.getPropertyValue('--font-mono').trim() || 'monospace';
    const shade = t => {
      const [r, g, b] = t < .12 ? mix(flash, head, t / .12) : t < .5 ? mix(head, mid, (t - .12) / .38) : mix(mid, tail, (t - .5) / .5);
      const a = t < .06 ? 1 : Math.pow(1 - t, 1.6) * .95;
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    };

    let sprites = [];
    let w = 0, h = 0, ox = 0, cols = 0, rows = 0;
    let heads, speeds, lens, bits;
    let frameId = 0, last = 0, onScreen = false;

    const buildSprites = dpr => {
      sprites = ['0', '1'].map(ch => Array.from({ length: STEPS }, (_, s) => {
        const sprite = document.createElement('canvas');
        sprite.width = Math.ceil(CELL_W * dpr);
        sprite.height = Math.ceil(CELL_H * dpr);
        const g = sprite.getContext('2d');
        g.font = `500 ${Math.round(15 * dpr)}px ${font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = shade((s + .5) / STEPS);
        g.fillText(ch, sprite.width / 2, sprite.height / 2);
        return sprite;
      }));
    };

    const spawn = (c, initial) => {
      lens[c] = rand(8, 18);
      speeds[c] = rand(5, 11);
      heads[c] = initial ? rand(-lens[c], rows) : -rand(0, rows * .6) - 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let c = 0; c < cols; c++) {
        const hd = heads[c];
        const len = lens[c];
        const x = ox + c * CELL_W;
        const end = Math.min(rows - 1, Math.floor(hd));
        for (let r = Math.max(0, Math.ceil(hd - len)); r <= end; r++) {
          const s = Math.min(STEPS - 1, Math.floor((hd - r) / len * STEPS));
          ctx.drawImage(sprites[bits[c * rows + r]][s], x, r * CELL_H, CELL_W, CELL_H);
        }
      }
    };

    const step = dt => {
      for (let c = 0; c < cols; c++) {
        heads[c] += speeds[c] * dt;
        if (heads[c] - lens[c] > rows) spawn(c, false);
        else if (Math.random() < .1) bits[c * rows + Math.min(rows - 1, Math.max(0, Math.floor(heads[c])))] ^= 1;
      }
      for (let i = 0; i < 6; i++) bits[Math.floor(Math.random() * bits.length)] ^= 1;
    };

    const setup = () => {
      w = art.clientWidth;
      h = art.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL_W);
      rows = Math.ceil(h / CELL_H);
      ox = (w - cols * CELL_W) / 2;
      heads = new Float32Array(cols);
      speeds = new Float32Array(cols);
      lens = new Float32Array(cols);
      bits = Uint8Array.from({ length: cols * rows }, () => (Math.random() < .5 ? 1 : 0));
      for (let c = 0; c < cols; c++) spawn(c, true);
      buildSprites(dpr);
      draw();
    };

    const frame = now => {
      frameId = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      step(Math.min(now - last, 100) / 1000);
      last = now;
      draw();
    };
    const play = () => {
      if (frameId || reduced.matches || !cols) return;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    };
    const pause = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const sync = () => (onScreen && !document.hidden ? play() : pause());

    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    const ro = new ResizeObserver(() => { setup(); sync(); });
    document.addEventListener('visibilitychange', sync, { signal });
    signal.addEventListener('abort', () => { pause(); io.disconnect(); ro.disconnect(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      if (signal.aborted) return;
      ro.observe(art);
      io.observe(card);
    });
  };

  const themes = { rain };
  const controller = new AbortController();
  document.querySelectorAll('[data-card-theme]').forEach(card => {
    const theme = themes[card.dataset.cardTheme];
    if (theme) theme(card, controller.signal);
  });
  addEventListener('pagehide', () => controller.abort(), { once: true });
})();
