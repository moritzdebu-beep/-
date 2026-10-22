const gallery = document.querySelector(".teacher-gallery");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const lightbox = document.querySelector(".work-lightbox");
const lightboxImage = lightbox.querySelector(".work-lightbox__image");
const lightboxCaption = lightbox.querySelector(".work-lightbox__caption");
const lightboxClose = lightbox.querySelector(".work-lightbox__close");
const lightboxPrevious = lightbox.querySelector(".work-lightbox__nav--previous");
const lightboxNext = lightbox.querySelector(".work-lightbox__nav--next");

const categoryMap = {
  "包装设计": "packaging",
  "品牌设计": "branding",
  "字体设计": "typography",
};

const categoryLabelMap = {
  "包装设计": "PACKAGING",
  "品牌设计": "BRANDING",
  "字体设计": "TYPOGRAPHY",
};

let allItems = [];
let activeFilter = "all";
let activeLightboxIndex = -1;
let lightboxTrigger = null;

function updateLightbox(index) {
  const total = allItems.length;
  if (!total) return;
  activeLightboxIndex = (index + total) % total;
  const item = allItems[activeLightboxIndex];
  lightboxImage.src = `./assets/teacher-works/${item.file}`;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = `${categoryLabelMap[item.category] || "WORK"} · ${activeLightboxIndex + 1} / ${total}`;
}

function openLightbox(index, trigger) {
  if (document.body.classList.contains("is-editing")) return;
  lightboxTrigger = trigger;
  updateLightbox(index);
  lightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
  lightboxClose.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("is-lightbox-open");
  lightboxImage.src = "";
  lightboxTrigger?.focus();
  lightboxTrigger = null;
}

function renderGallery(items) {
  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    if (index % 12 === 0) {
      const group = document.createElement("section");
      group.className = "teacher-rhythm-group";
      group.setAttribute("aria-label", `Work group ${Math.floor(index / 12) + 1}`);
      fragment.append(group);
    }

    const group = fragment.lastElementChild;
    const figure = document.createElement("figure");
    const previewButton = document.createElement("button");
    const image = document.createElement("img");
    figure.className = "teacher-card";
    figure.dataset.category = categoryMap[item.category] || "all";
    previewButton.className = "teacher-card__preview";
    previewButton.type = "button";
    previewButton.setAttribute("aria-label", `放大查看：${item.alt}`);
    previewButton.addEventListener("click", () => openLightbox(index, previewButton));
    image.src = `./assets/teacher-works/${item.file}`;
    image.width = item.width;
    image.height = item.height;
    image.alt = item.alt;
    image.title = item.alt;
    image.loading = "lazy";
    previewButton.append(image);
    figure.append(previewButton);
    group.append(figure);
  });

  gallery.replaceChildren(fragment);
}

function showFilter(filter, commit = false) {
  if (commit) activeFilter = filter;

  document.querySelectorAll(".teacher-card").forEach((card) => {
    const muted = filter !== "all" && card.dataset.category !== filter;
    card.classList.toggle("is-muted", muted);
  });

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("pointerenter", () => {
    if (document.body.classList.contains("is-editing")) return;
    showFilter(button.dataset.filter);
  });

  button.addEventListener("focus", () => {
    if (document.body.classList.contains("is-editing")) return;
    showFilter(button.dataset.filter);
  });

  button.addEventListener("click", () => {
    if (document.body.classList.contains("is-editing")) return;
    showFilter(button.dataset.filter, true);
  });
});

document.querySelector(".work-filters").addEventListener("pointerleave", () => {
  showFilter(activeFilter);
});

document.querySelector(".work-filters").addEventListener("focusout", (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) showFilter(activeFilter);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrevious.addEventListener("click", () => updateLightbox(activeLightboxIndex - 1));
lightboxNext.addEventListener("click", () => updateLightbox(activeLightboxIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") updateLightbox(activeLightboxIndex - 1);
  if (event.key === "ArrowRight") updateLightbox(activeLightboxIndex + 1);
});

fetch("./assets/teacher-works/manifest.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load work");
    return response.json();
  })
  .then((items) => {
    allItems = items;
    renderGallery(allItems);
    showFilter(activeFilter);
  })
  .catch(() => {
    gallery.innerHTML = '<p class="gallery-status">Work is temporarily unavailable.</p>';
  });
