(() => {
  const board = document.querySelector('.service-board');
  const toggle = document.querySelector('.service-wechat-toggle');
  const qr = document.getElementById('service-wechat-qr');
  if (!board || !toggle || !qr) return;
  const hover = window.matchMedia('(hover: hover)');
  let closeTimer;
  let keyboardFocus = false;

  const setVisible = visible => {
    window.clearTimeout(closeTimer);
    qr.hidden = !visible;
    board.classList.toggle('is-wechat-visible', visible);
    toggle.setAttribute('aria-expanded', String(visible));
  };

  const closeAfterLeave = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!toggle.matches(':hover') && !qr.matches(':hover') && !keyboardFocus) setVisible(false);
    }, 180);
  };

  for (const element of [toggle, qr]) {
    element.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') setVisible(true);
    });
    element.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') closeAfterLeave();
    });
  }

  toggle.addEventListener('focus', () => {
    keyboardFocus = toggle.matches(':focus-visible');
    if (keyboardFocus) setVisible(true);
  });
  toggle.addEventListener('pointerdown', () => { keyboardFocus = false; });
  toggle.addEventListener('blur', () => {
    keyboardFocus = false;
    closeAfterLeave();
  });

  toggle.addEventListener('click', event => {
    if (event.detail === 0) {
      keyboardFocus = true;
      setVisible(true);
      return;
    }
    if (hover.matches && event.pointerType !== 'touch') {
      setVisible(true);
      return;
    }
    const visible = toggle.getAttribute('aria-expanded') !== 'true';
    setVisible(visible);
    if (visible && window.matchMedia('(max-width: 767px)').matches) {
      qr.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'center'
      });
    }
  });

  document.addEventListener('click', event => {
    if (!toggle.contains(event.target) && !qr.contains(event.target)) setVisible(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      keyboardFocus = false;
      setVisible(false);
    }
  });
})();
