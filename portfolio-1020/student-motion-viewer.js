(() => {
  const gallery = document.querySelector('.student-motion-grid');
  const dialog = document.querySelector('.student-video-dialog');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const viewer = dialog.querySelector('.student-video-viewer');
  const video = dialog.querySelector('video');
  const title = dialog.querySelector('.student-video-viewer__title');
  const previous = dialog.querySelector('.student-video-viewer__arrow--previous');
  const next = dialog.querySelector('.student-video-viewer__arrow--next');
  const returnLink = dialog.querySelector('.student-video-viewer__meta a');
  const closeButton = dialog.querySelector('.student-video-dialog__close');
  const videoCount = gallery.querySelectorAll('.student-motion-card__button').length;
  let currentIndex = 1;
  let trigger = null;
  let originalPosition = { left: 0, top: 0 };
  let startedOnBackdrop = false;

  const isPlainClick = (event) => event.button === 0 && !event.ctrlKey &&
    !event.metaKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
  const videoUrl = (index) => `./student-video.html?video=${String(index).padStart(2, '0')}`;

  function showVideo(index) {
    currentIndex = ((index - 1 + videoCount) % videoCount) + 1;
    const paddedIndex = String(currentIndex).padStart(2, '0');
    previous.href = videoUrl(currentIndex === 1 ? videoCount : currentIndex - 1);
    next.href = videoUrl(currentIndex === videoCount ? 1 : currentIndex + 1);
    title.textContent = `AIGC MOTION ${paddedIndex}`;
    video.pause();
    video.src = `./assets/student-videos/student-video-${paddedIndex}.mp4`;
    video.play().catch(() => {});
  }

  function closeViewer() {
    if (dialog.open) dialog.close();
  }

  gallery.addEventListener('click', (event) => {
    const link = event.target.closest('.student-motion-card__button');
    if (!link || !isPlainClick(event) || link.target === '_blank' ||
        document.body.classList.contains('is-editing')) return;
    const index = Number(new URL(link.href).searchParams.get('video'));
    if (!Number.isInteger(index) || index < 1 || index > videoCount) return;
    event.preventDefault();
    trigger = link;
    originalPosition = { left: window.scrollX, top: window.scrollY };
    document.documentElement.classList.add('has-student-video-viewer');
    dialog.showModal();
    showVideo(index);
  });

  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    startedOnBackdrop = false;
    document.documentElement.classList.remove('has-student-video-viewer');
    // Keep the existing gallery and loaded rows, with no navigation or smooth scroll.
    if (window.scrollX !== originalPosition.left || window.scrollY !== originalPosition.top) {
      window.scrollTo({ ...originalPosition, behavior: 'instant' });
    }
    trigger?.focus({ preventScroll: true });
    trigger = null;
  });

  closeButton.addEventListener('click', closeViewer);
  returnLink.addEventListener('click', (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    closeViewer();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (!document.fullscreenElement) closeViewer();
  });

  const isBackdrop = (target) => target === dialog || target === viewer;
  dialog.addEventListener('pointerdown', (event) => {
    startedOnBackdrop = event.isPrimary && event.button === 0 && isBackdrop(event.target);
  });
  dialog.addEventListener('pointercancel', () => { startedOnBackdrop = false; });
  dialog.addEventListener('click', (event) => {
    const shouldClose = startedOnBackdrop && event.button === 0 && isBackdrop(event.target);
    startedOnBackdrop = false;
    if (shouldClose) closeViewer();
  });

  for (const [link, direction] of [[previous, -1], [next, 1]]) {
    link.addEventListener('click', (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      showVideo(currentIndex + direction);
    });
  }
  dialog.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.target.closest('video, input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showVideo(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
})();
