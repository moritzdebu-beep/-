function renderCatalogEmoji() {
  const canvas = document.querySelector('.catalog-heading__emoji canvas[data-source]');
  if (!canvas) return;

  const image = new Image();
  image.addEventListener('load', () => {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(image, 114, 194, 540, 365, 0, 0, canvas.width, canvas.height);

    try {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const darkest = Math.min(red, green, blue);
        const chroma = Math.max(red, green, blue) - darkest;
        if (darkest > 245 && chroma < 12) pixels.data[index + 3] = 0;
        else if (darkest > 232 && chroma < 18) pixels.data[index + 3] = Math.round(255 * (245 - darkest) / 13);
      }
      context.putImageData(pixels, 0, 0);
    } catch {}
  }, { once: true });
  image.src = new URL(canvas.dataset.source, document.baseURI).href;
}

renderCatalogEmoji();

const revealSelector = ".work-item, .student-work-card, .student-motion-card, .teacher-card";
let revealOrder = 0;

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08,
    })
  : null;

function registerRevealCards(root = document) {
  const cards = [];
  if (root instanceof Element && root.matches(revealSelector)) cards.push(root);
  cards.push(...root.querySelectorAll(revealSelector));

  cards.forEach((card) => {
    if (card.dataset.revealReady === "true") return;
    card.dataset.revealReady = "true";
    card.classList.add("scroll-reveal");
    card.style.setProperty("--reveal-delay", `${(revealOrder % 6) * 55}ms`);
    revealOrder += 1;

    if (revealObserver) {
      revealObserver.observe(card);
    } else {
      card.classList.add("is-visible");
    }
  });
}

registerRevealCards();

const revealMutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) registerRevealCards(node);
    });
  });
});
revealMutationObserver.observe(document.body, { childList: true, subtree: true });

window.otoNavigate = (url) => {
  window.location.href = new URL(url, window.location.href).href;
};
