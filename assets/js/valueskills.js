window.SKILL_VALUES = {
  javascript:  64,
  python:      36,
  java:        40,
  html5:       87,

  tailwindcss: 53,
  nextjs:      42,
  css3:        67,
  vscode:      68,

  claude:      84,
  github:      89,
  opencode:    80,
  git:         66,

  firebase:    57,
  supabase:    26,
  vercel:      87,
  netlify:     76,
  onesignal:   69,
  devops:      90,
};

(() => {
  const cards = document.querySelectorAll('.skill[data-skill]');
  if (!cards.length) return;
  cards.forEach((card) => {
    const raw = Number(window.SKILL_VALUES[card.dataset.skill]);
    if (!Number.isFinite(raw)) return;
    const value = Math.min(100, Math.max(0, Math.round(raw)));
    const fill = card.querySelector('.bar i');
    if (fill) fill.style.width = `${value}%`;
    const label = document.createElement('span');
    label.className = 'skill-val';
    label.textContent = value;
    card.style.setProperty('--v', value);
    card.setAttribute('aria-label', `${card.getAttribute('aria-label')}, ${value} of 100`);
    card.appendChild(label);
  });
})();

(() => {
  const on = (c) => c.classList.add('lit');
  const off = (c) => c.classList.remove('lit');
  document.querySelectorAll('.skill[data-skill]').forEach((c) => {
    let t;
    c.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') on(c); });
    c.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') off(c); });
    c.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      clearTimeout(t); on(c);
      t = setTimeout(() => off(c), 2200);
    });
    c.addEventListener('focus', () => on(c));
    c.addEventListener('blur', () => off(c));
  });
})();
