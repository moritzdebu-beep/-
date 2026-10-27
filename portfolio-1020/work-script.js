const gallery = document.querySelector(".teacher-gallery");
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
let visibleWorkCount = 0;
let activeLightboxIndex = -1;
let lightboxTrigger = null;

function updateLightbox(index) {
  const total = visibleWorkCount;
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
  const group = document.createElement("section");
  group.className = "teacher-rhythm-group";
  group.id = "more-work-projects";
  group.setAttribute("aria-label", "案例作品");
  const cards = [];
  visibleWorkCount = 0;

  items.forEach((item, index) => {
    const figure = document.createElement("figure");
    const previewButton = document.createElement(item.projectUrl ? "a" : "button");
    const image = document.createElement("img");
    figure.className = "teacher-card";    const projectSlug = item.projectUrl?.match(/\/([a-z0-9-]+)\.html$/)?.[1];    if (projectSlug) {      figure.id = `work-${projectSlug}`;      figure.style.scrollMarginTop = "calc(var(--header-height) + 24px)";    }
    figure.hidden = true;
    figure.dataset.category = categoryMap[item.category] || "all";
    previewButton.className = "teacher-card__preview work-item--reveal";
    if (item.projectUrl) {
      previewButton.href = item.projectUrl;
      previewButton.setAttribute("aria-label", `查看项目：${item.alt}`);
    } else {
      previewButton.type = "button";
      previewButton.setAttribute("aria-label", `放大查看：${item.alt}`);
      previewButton.addEventListener("click", () => openLightbox(index, previewButton));
    }
    image.src = `./assets/teacher-works/${item.file}`;
    image.width = item.width;
    image.height = item.height;
    image.alt = item.alt;
    image.loading = "lazy";
    previewButton.append(image);
    const overlay = document.createElement('span');
    overlay.className = 'work-item__overlay';
    const caption = document.createElement('span');
    caption.className = 'work-item__caption';
    const title = document.createElement('span');
    title.className = 'work-item__title';
    title.lang = 'zh-CN';
    title.textContent = /\.(?:jpe?g|png|webp)$/i.test(item.alt) ? `${item.category}作品` : item.alt;
    const divider = document.createElement('span');
    divider.className = 'work-item__divider';
    const subtitle = document.createElement('span');
    subtitle.className = 'work-item__subtitle';
    subtitle.lang = 'en';
    subtitle.textContent = { packaging: 'Packaging Design', branding: 'Brand Identity', typography: 'Typography Design' }[categoryMap[item.category]] || 'Selected Work';
    caption.append(title, divider, subtitle);
    overlay.append(caption);
    previewButton.append(overlay);
    figure.append(previewButton);
    group.append(figure);
    cards.push(figure);
  });

  const more = document.createElement("div");
  more.className = "catalog-more teacher-gallery__more";
  more.id = "more-teacher-projects";
  more.innerHTML = `
    <button class="catalog-more__link" type="button" lang="zh-CN" aria-controls="more-work-projects">
      <span class="teacher-gallery__more-label">加载更多项目</span>
      <span class="catalog-more__folder" aria-hidden="true"><img src="./assets/emoji/folder-pixel-yellow-v1.svg" alt="" width="35" height="27" loading="lazy" /></span>
    </button>`;
  const button = more.querySelector("button");

  function loadNextThreeRows() {
    // Read the actual grid so each batch is three rows on desktop and mobile.
    const columnCount = getComputedStyle(group).gridTemplateColumns.trim().split(/\s+/).length;
    const firstNewIndex = visibleWorkCount;
    visibleWorkCount = Math.min(items.length, visibleWorkCount + columnCount * 3);
    cards.slice(firstNewIndex, visibleWorkCount).forEach((card) => {
      card.hidden = false;
    });
    const finished = visibleWorkCount === items.length;
    const restoreFocus = finished && document.activeElement === button;
    more.hidden = finished;
    if (restoreFocus) {
      cards[firstNewIndex]?.querySelector("a, button").focus({ preventScroll: true });
    }
  }

  button.addEventListener("click", loadNextThreeRows);
  gallery.replaceChildren(group, more);
  loadNextThreeRows();  function revealLinkedProject() {    const anchor = window.location.hash.slice(1);    if (!anchor) return;    const index = cards.findIndex((card) => card.id === anchor);    if (index < 0) return;    while (visibleWorkCount <= index) loadNextThreeRows();    requestAnimationFrame(() => cards[index].scrollIntoView({ block: "start" }));  }  window.addEventListener("hashchange", revealLinkedProject);  revealLinkedProject();
}

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

fetch("./assets/teacher-works/manifest.json?v=cakecrush-type-20261027")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load work");
    return response.json();
  })
  .then((items) => {
    allItems = items;
    renderGallery(allItems);
  })
  .catch(() => {
    gallery.innerHTML = '<p class="gallery-status">Work is temporarily unavailable.</p>';
  });
