(() => {
  const header = document.querySelector('.project-page .site-header');
  const hero = document.querySelector('.project-hero');
  if (!header || !hero) return;
  let pending = false;
  function updateHeader() {
    header.classList.toggle('is-on-paper', hero.getBoundingClientRect().bottom <= header.offsetHeight);
    pending = false;
  }
  function scheduleUpdate() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateHeader);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  updateHeader();
})();
