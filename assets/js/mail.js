(() => {
  const address = `${['linggasaja', '03'].join('')}@${['gmail', 'com'].join('.')}`;
  window.SITE_MAIL = address;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-mail-link]').forEach((el) => { el.href = `mailto:${address}`; });
    document.querySelectorAll('[data-mail-text]').forEach((el) => { el.textContent = address; });
    document.querySelectorAll('[data-copy=""]').forEach((el) => { el.setAttribute('data-copy', address); });
  }, { once: true });
})();
