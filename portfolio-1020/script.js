const STORAGE_PREFIX = "oto-studio-text-v1:";

let editToggle = null;
let editReset = null;
let editableText = [];
let defaultText = new Map();

function setupEditablePage() {
  document.querySelectorAll(".work-item p").forEach((label, index) => {
    label.dataset.editable = "";
    label.dataset.editKey = `work-label-${String(index + 1).padStart(2, "0")}`;
  });

  editToggle = document.querySelector(".edit-toggle");
  editReset = document.querySelector(".edit-reset");
  editableText = [...document.querySelectorAll("[data-editable]")];
  defaultText = new Map(
    editableText.map((element) => [element.dataset.editKey, element.textContent])
  );

  editableText.forEach((element) => {
    const savedText = localStorage.getItem(`${STORAGE_PREFIX}${element.dataset.editKey}`);
    if (savedText !== null) element.textContent = savedText;
    if (element.dataset.editEventsBound === "true") return;
    element.dataset.editEventsBound = "true";

    element.addEventListener("input", () => {
      localStorage.setItem(
        `${STORAGE_PREFIX}${element.dataset.editKey}`,
        element.textContent.replace(/\n/g, " ")
      );
    });

    element.addEventListener("paste", (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain").replace(/\s+/g, " ");
      document.execCommand("insertText", false, text);
    });
  });

  if (!editToggle || !editReset || editToggle.dataset.editEventsBound === "true") return;
  editToggle.dataset.editEventsBound = "true";
  editToggle.addEventListener("click", () => {
    setEditing(editToggle.getAttribute("aria-pressed") !== "true");
  });
  editReset.addEventListener("click", () => {
    editableText.forEach((element) => {
      const key = element.dataset.editKey;
      element.textContent = defaultText.get(key);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    });
  });
}

function setEditing(isEditing) {
  if (!editToggle || !editReset) return;
  document.body.classList.toggle("is-editing", isEditing);
  editToggle.setAttribute("aria-pressed", String(isEditing));
  editToggle.textContent = isEditing ? "完成编辑" : "编辑文字";
  editReset.hidden = !isEditing;

  editableText.forEach((element) => {
    if (isEditing) {
      element.setAttribute("contenteditable", "true");
      element.setAttribute("spellcheck", "false");
    } else {
      element.removeAttribute("contenteditable");
      element.removeAttribute("spellcheck");
    }
  });

  if (!isEditing && document.activeElement?.matches("[data-editable]")) {
    document.activeElement.blur();
  }
}

setupEditablePage();

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

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("is-editing")) return;
  if (event.target.closest("a")) event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("is-editing")) {
    setEditing(false);
  }
});

const ambientAudio = document.createElement("audio");
ambientAudio.src = "./assets/musinova-minimal-techno-ambient-483372.mp3";
ambientAudio.loop = true;
ambientAudio.preload = "auto";
ambientAudio.volume = 0.18;

const AUDIO_ENABLED_KEY = "oto-studio-audio-enabled";
const AUDIO_POSITION_KEY = "oto-studio-audio-position";
const AUDIO_UPDATED_KEY = "oto-studio-audio-updated-at";
let isRestoringAudio = true;

const ambientAudioControl = document.createElement("div");
ambientAudioControl.className = "ambient-audio";
ambientAudioControl.innerHTML = `
  <button class="ambient-audio__toggle" type="button" aria-label="播放背景音乐" aria-pressed="false">
    <span class="ambient-audio__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="ambient-audio__label">SOUND OFF</span>
  </button>
`;
ambientAudioControl.append(ambientAudio);
document.body.append(ambientAudioControl);

const ambientAudioToggle = ambientAudioControl.querySelector(".ambient-audio__toggle");
const ambientAudioLabel = ambientAudioControl.querySelector(".ambient-audio__label");

function setAudioState(isPlaying, persist = true) {
  ambientAudioControl.classList.toggle("is-playing", isPlaying);
  ambientAudioToggle.setAttribute("aria-pressed", String(isPlaying));
  ambientAudioToggle.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
  ambientAudioLabel.textContent = isPlaying ? "SOUND ON" : "SOUND OFF";
  if (persist) localStorage.setItem(AUDIO_ENABLED_KEY, String(isPlaying));
}

function saveAudioProgress() {
  if (!Number.isFinite(ambientAudio.currentTime)) return;
  localStorage.setItem(AUDIO_POSITION_KEY, String(ambientAudio.currentTime));
  localStorage.setItem(AUDIO_UPDATED_KEY, String(Date.now()));
}

function waitForAudioMetadata() {
  if (ambientAudio.readyState >= 1) return Promise.resolve();

  return new Promise((resolve) => {
    ambientAudio.addEventListener("loadedmetadata", resolve, { once: true });
    ambientAudio.addEventListener("error", resolve, { once: true });
  });
}

async function restoreAudioProgress(advanceWithElapsedTime) {
  await waitForAudioMetadata();

  const savedPosition = Number.parseFloat(localStorage.getItem(AUDIO_POSITION_KEY) || "0");
  const savedAt = Number.parseInt(localStorage.getItem(AUDIO_UPDATED_KEY) || "0", 10);
  let nextPosition = Number.isFinite(savedPosition) ? savedPosition : 0;

  if (advanceWithElapsedTime && savedAt > 0) {
    nextPosition += Math.max(0, Date.now() - savedAt) / 1000;
  }

  if (Number.isFinite(ambientAudio.duration) && ambientAudio.duration > 0) {
    nextPosition %= ambientAudio.duration;
  }

  if (Number.isFinite(nextPosition)) ambientAudio.currentTime = nextPosition;
  isRestoringAudio = false;
}

async function playAmbientAudio(restoreFromStorage = false) {
  try {
    if (restoreFromStorage) await restoreAudioProgress(true);
    await ambientAudio.play();
    setAudioState(true);
    clearAutoplayFallback();
  } catch {
    setAudioState(false, false);
    installAutoplayFallback();
  }
}

let autoplayFallbackInstalled = false;

function clearAutoplayFallback() {
  if (!autoplayFallbackInstalled) return;
  autoplayFallbackInstalled = false;
  document.removeEventListener("pointerdown", unlockAutoplay, true);
  document.removeEventListener("keydown", unlockAutoplay, true);
}

function unlockAutoplay(event) {
  if (event.target instanceof Element && event.target.closest(".ambient-audio__toggle")) return;
  clearAutoplayFallback();
  playAmbientAudio();
}

function installAutoplayFallback() {
  if (autoplayFallbackInstalled) return;
  autoplayFallbackInstalled = true;
  document.addEventListener("pointerdown", unlockAutoplay, true);
  document.addEventListener("keydown", unlockAutoplay, true);
}

ambientAudioToggle.addEventListener("click", () => {
  if (ambientAudio.paused) {
    playAmbientAudio();
  } else {
    ambientAudio.pause();
    saveAudioProgress();
    setAudioState(false);
  }
});

let lastAudioSave = 0;
ambientAudio.addEventListener("timeupdate", () => {
  if (isRestoringAudio) return;
  if (Date.now() - lastAudioSave < 750) return;
  lastAudioSave = Date.now();
  saveAudioProgress();
});

window.addEventListener("pagehide", saveAudioProgress);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveAudioProgress();
});

playAmbientAudio(true);

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
