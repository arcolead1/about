window.SKILL_VALUES = {
  javascript:  63,
  python:      62,
  java:        70,
  html5:       87,

  tailwindcss: 84,
  nextjs:      71,
  css3:        56,
  vscode:      82,

  claude:      84,
  github:      56,
  opencode:    62,
  git:         76,

  firebase:    61,
  supabase:    63,
  vercel:      87,
  netlify:     76,
  onesignal:   69,
  devops:      74,
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
    card.setAttribute('aria-label', `${card.getAttribute('aria-label')}, ${value} of 100`);
    card.appendChild(label);
  });
})();
