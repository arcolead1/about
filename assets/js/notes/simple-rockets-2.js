(() => {
  const figures = [...document.querySelectorAll('.sr-fig')];
  if (!figures.length) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const STILL_ORBIT_TIME = 11;

  const AERO = {
    axis: 100,
    xStart: 664,
    xWake: 232,
    xEnd: 28,
    xStep: 4,
    radii: [17, 29, 43, 59, 77],
    nose: [[440, 15], [478, 13], [500, 5], [512, 0]],
    smoothSpan: 24
  };

  const bezier = (p, t) => {
    const u = 1 - t;
    return [0, 1].map(i => u ** 3 * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t ** 3 * p[3][i]);
  };
  const noseTable = Array.from({ length: 49 }, (_, i) => bezier(AERO.nose, i / 48));
  const noseHalf = x => {
    const i = noseTable.findIndex(([nx]) => nx >= x);
    if (i <= 0) return noseTable[0][1];
    const [x0, y0] = noseTable[i - 1];
    const [x1, y1] = noseTable[i];
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  };

  const hull = x => {
    if (x >= 512) return 0;
    if (x >= 440) return noseHalf(x);
    if (x >= 268) return 15;
    if (x >= 232) return 15 + (268 - x) * 29 / 36;
    if (x >= 220) return 6 + (x - 220) / 4;
    return 0;
  };
  const hullSmooth = x => {
    let sum = 0;
    let count = 0;
    for (let u = -AERO.smoothSpan; u <= AERO.smoothSpan; u += AERO.xStep) {
      sum += hull(x + u);
      count += 1;
    }
    return sum / count;
  };

  const streamline = (radius, side, phase, from, to) => {
    const points = [];
    for (let x = from; x >= to; x -= AERO.xStep) {
      const wake = Math.min(1, Math.max(0, (AERO.xWake - x) / 200));
      const r = Math.hypot(radius, hullSmooth(x)) * (1 - .32 * wake * (1 - radius / 100));
      const swirl = wake ** 1.2 * (4 + radius * .06) * (Math.sin(x * .085 + phase) + .5 * Math.sin(x * .21 + phase * 1.7));
      points.push(`${x} ${(AERO.axis + side * (r + swirl)).toFixed(1)}`);
    }
    return `M${points.join(' L')}`;
  };

  const buildFlow = group => {
    const segments = [
      ['sr-wind', AERO.xStart, AERO.xWake],
      ['sr-wind sr-wind--wake', AERO.xWake, AERO.xEnd]
    ];
    AERO.radii.forEach((radius, i) => {
      [-1, 1].forEach((side, j) => {
        const phase = i * 1.3 + j * 2.1;
        segments.forEach(([className, from, to]) => {
          const path = document.createElementNS(SVG_NS, 'path');
          path.setAttribute('class', className);
          path.setAttribute('d', streamline(radius, side, phase, from, to));
          path.style.setProperty('--lag', `${(-((i * 3 + j * 5) % 7) * .31).toFixed(2)}s`);
          group.appendChild(path);
        });
      });
    });
  };

  const figureOf = new Map(figures.map(fig => [fig, { fig, svg: fig.querySelector('svg') }]));
  const setPlaying = ({ fig, svg }, playing) => {
    fig.classList.toggle('is-paused', !playing);
    if (playing) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  };

  document.querySelectorAll('[data-sr-flow]').forEach(buildFlow);
  figureOf.forEach(item => setPlaying(item, false));

  if (reduced.matches) {
    document.querySelectorAll('.sr-fig--orbit svg').forEach(svg => svg.setCurrentTime?.(STILL_ORBIT_TIME));
    return;
  }
  if (!('IntersectionObserver' in window)) {
    figureOf.forEach(item => setPlaying(item, true));
    return;
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => setPlaying(figureOf.get(entry.target), entry.isIntersecting)),
    { threshold: .2 }
  );
  figures.forEach(fig => observer.observe(fig));
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
})();
