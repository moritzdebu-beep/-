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

// Accent English word initials without changing the underlying text or links.
(() => {
  const excluded = 'oto-pixel-text, .work-item__caption, .work-item__subtitle, [data-pixel-initials="off"], script, style, noscript, template, svg, math, canvas, textarea, input, select, option, optgroup, code, pre';
  const tokens = /(?:https?:\/\/|www\.)[^\s<>]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z]+(?:['’][A-Za-z]+)*/g;

  function decorateText(node) {
    const parent = node.parentElement;
    if (!parent || parent.isContentEditable || parent.closest(excluded)) return;
    const text = node.data;
    if (!/[A-Za-z]/.test(text)) return;

    const wrapper = document.createElement("oto-pixel-text");
    let offset = 0;
    let decorated = false;
    for (const match of text.matchAll(tokens)) {
      const word = match[0];
      wrapper.append(text.slice(offset, match.index));
      if (/^(?:https?:\/\/|www\.)/.test(word) || word.includes("@")) {
        wrapper.append(word);
      } else {
        let start = 0;
        for (let index = 0; index < word.length; index += 1) {
          const isInitial = index === 0 || (/[a-z]/.test(word[index - 1]) && /[A-Z]/.test(word[index]));
          if (!isInitial) continue;
          wrapper.append(word.slice(start, index));
          const initial = document.createElement("oto-pixel-initial");
          initial.className = "pixel-initial";
          initial.textContent = word[index];
          wrapper.append(initial);
          start = index + 1;
          decorated = true;
        }
        wrapper.append(word.slice(start));
      }
      offset = match.index + word.length;
    }
    if (!decorated) return;
    wrapper.append(text.slice(offset));
    node.replaceWith(wrapper);
  }

  function decorate(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      decorateText(root);
      return;
    }
    if (!(root instanceof Element) || root.closest(excluded) || root.isContentEditable) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(decorateText);
  }

  decorate(document.body);
  new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "characterData") decorate(change.target);
      else change.addedNodes.forEach(decorate);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();

const revealSelector = [
  ".work-item", ".student-work-card", ".student-motion-card", ".teacher-card",
  ".home-page--tray .collection-intro__top",
  ".home-page--tray .collection-intro__bottom",
  ".home-page--tray .student-collection__heading",
  ".home-page--tray .catalog-more",
  ".home-page--tray .portal-link",
  ".home-page--tray .studio-footer__grid",
  ".home-page--tray .studio-info__header",
  ".home-page--tray .studio-info__body",
  ".home-page--tray .studio-info__qr",
].join(", ");
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


// Keep the slow tray turn at its current angle while it is off screen.
(() => {
  const tray = document.querySelector(".home-page--tray .hero-tray");
  const hero = document.querySelector(".home-page--tray .hero--tray");
  if (!tray || !hero) return;
  let inView = true;
  const updatePlayback = () => {
    tray.dataset.motionPaused = String(!inView || document.hidden);
  };
  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    }, { threshold: 0 });
    heroObserver.observe(hero);
  }
  document.addEventListener("visibilitychange", updatePlayback);
  updatePlayback();
})();

