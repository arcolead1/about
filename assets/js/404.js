/* 404 page only: extra i18n keys, route suggestion and star-field parallax. Loaded after main.js. */
/* teks khusus halaman 404 (main.js menerapkannya saat DOMContentLoaded) */
Object.assign(T, {
  'e404.h1':   { en: "This is not the page <em>you're looking for.</em>", id: "Ini bukan halaman <em>yang kamu cari.</em>" },
  'e404.sub':  { en: "The link may be broken, or the page moved. Pick a way back below.", id: "Tautannya mungkin salah atau halamannya pindah. Pilih jalan kembali di bawah." },
  'e404.path': { en: "You tried to open", id: "Kamu mencoba membuka" },
  'e404.mean': { en: "Did you mean", id: "Maksudmu" },
  'e404.jump': { en: "Or jump to", id: "Atau langsung ke" },
  'e404.help': { en: "Still stuck?", id: "Masih bingung?" }
});

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* 1) tebak halaman yang dimaksud (jarak edit terdekat) */
  const PAGES = ['/', '/about', '/skills', '/projects', '/stats', '/contact', '/notes', '/notes/mindustry', '/notes/trading'];
  const dist = (a, b) => {
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) {
        row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = row;
    }
    return prev[b.length];
  };
  let want = location.pathname;
  try { want = decodeURIComponent(want); } catch {}
  want = want.toLowerCase().replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  const box = document.querySelector('[data-suggest]');
  const link = document.querySelector('[data-suggest-link]');
  if (box && link && want !== '/') {
    let best = null, bestD = Infinity;
    PAGES.forEach(p => { const d = dist(want, p); if (d < bestD) { bestD = d; best = p; } });
    if (best && bestD <= Math.max(2, Math.ceil(want.length * 0.3))) {
      link.href = best;
      link.textContent = best;
      box.hidden = false;
    }
  }

  /* 2) langit bintang 3 lapis + parallax kursor */
  const sky = document.querySelector('[data-sky]');
  if (!sky) return;
  [
    { n: 46, k: 8,  s: [1, 1.6],   o: [.25, .5] },
    { n: 26, k: 20, s: [1.6, 2.4], o: [.35, .65] },
    { n: 12, k: 42, s: [2.4, 3.4], o: [.5, .85] }
  ].forEach(l => {
    const layer = document.createElement('div');
    layer.className = 'nf-layer';
    layer.style.setProperty('--k', l.k);
    for (let i = 0; i < l.n; i++) {
      const dot = document.createElement('i');
      dot.className = 'nf-dot';
      dot.style.cssText = `left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 100).toFixed(1)}%;--s:${rand(...l.s).toFixed(2)};opacity:${rand(...l.o).toFixed(2)}`;
      layer.appendChild(dot);
    }
    sky.appendChild(layer);
  });
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    let frame = null, mx = 0, my = 0;
    const paint = () => {
      sky.style.setProperty('--mx', mx.toFixed(3));
      sky.style.setProperty('--my', my.toFixed(3));
      frame = null;
    };
    addEventListener('pointermove', e => {
      mx = (e.clientX / innerWidth - .5) * -2;
      my = (e.clientY / innerHeight - .5) * -2;
      if (frame === null) frame = requestAnimationFrame(paint);
    }, { passive: true });
  }
})();
