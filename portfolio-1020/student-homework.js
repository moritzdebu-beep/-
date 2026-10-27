const studentGrid = document.querySelector(".student-work-grid");

const studentCategories = [
  "packaging",
  "branding",
  "visual",
  "campaign",
];

const studentCategoryLabels = {
  packaging: "PACKAGING",
  branding: "BRANDING",
  visual: "VISUAL IDENTITY",
  campaign: "CAMPAIGN",
};

function createContinuationNote(modifier, editKey) {
  const note = document.createElement("div");
  const text = document.createElement("p");
  const icon = document.createElement("img");

  note.className = `student-continuation-note ${modifier}`;
  note.setAttribute("aria-label", "更多作品，正在发生。。。");
  text.textContent = "更多作品，正在发生。。。";
  text.dataset.editable = "";
  text.dataset.editKey = editKey;
  icon.className = "student-continuation-note__icon";
  icon.src = "./assets/emoji/student-continuation-car.webp";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  note.append(text, icon);
  return note;
}

const studentLongFormSources = {
  1: "./assets/originals-student/student-01-long.jpg",
  2: "./assets/originals-student/student-02-long.jpg",
  3: "./assets/originals-student/student-03-long.jpg",
  4: "./assets/originals-student/student-04-long.jpg",
  5: "./assets/originals-student/student-05-long.jpg",
  6: "./assets/originals-student/student-06-long.jpg",
  7: "./assets/originals-student/student-07-long.jpg",
  8: "./assets/originals-student/student-08-long.jpg",
  9: "./assets/originals-student/student-09-long.jpg",
  11: "./assets/originals-student/student-11-long.jpg",
  13: "./assets/originals-student/student-13-long.jpg",
  14: "./assets/originals-student/student-14-long.jpg",
  15: "./assets/originals-student/student-15-long.jpg",
  16: "./assets/originals-student/student-16-long.jpg",
  17: "./assets/originals-student/student-17-long.jpg",
  18: "./assets/originals-student/student-18-long.jpg",
  19: "./assets/originals-student/student-19-long.jpg",
  20: "./assets/originals-student/student-20-long.jpg",
  21: "./assets/originals-student/student-21-long.jpg",
  22: "./assets/originals-student/student-22-long.jpg",
  23: "./assets/originals-student/student-23-long.jpg",
  24: "./assets/originals-student/student-24-long.jpg",
  25: "./assets/originals-student/student-25-long.jpg",
  26: "./assets/originals-student/student-26-long.jpg",
  27: "./assets/originals-student/student-27-long.jpg",
  28: "./assets/originals-student/student-28-long.jpg",
  29: "./assets/originals-student/student-29-long.jpg",
  30: "./assets/originals-student/student-30-long.jpg",
  32: "./assets/originals-student/student-32-long.jpg",
  33: "./assets/originals-student/student-33-long.jpg",
};

const additionalStudentPairs = {
  26: {
    primary: "./assets/originals-student/student-26a.png",
  },
  27: {
    primary: "./assets/originals-student/student-27a.png",
  },
  28: {
    primary: "./assets/originals-student/student-28a.png",
  },
  29: {
    primary: "./assets/originals-student/student-29a.png",
  },
  30: {
    primary: "./assets/originals-student/student-30a.png",
  },
  31: {
    primary: "./assets/originals-student/student-31a.png",
  },
  32: {
    primary: "./assets/originals-student/student-32a.jpg",
  },
  33: {
    primary: "./assets/originals-student/student-33a.jpg",
  },
};

const studentCards = [];
let visibleStudentWorkCount = 0;
studentGrid.id = "student-gallery-projects";

const studentDetailProjects = {
  38: {
    id: "student-weirdo-candy",
    href: "./weirdo-candy.html",
    image: "./assets/student-projects/weirdo-candy/12.webp",
    title: "WEIRDO CANDY 果汁饮品品牌包装设计",
    subtitle: "Fruit Juice Branding & Packaging Design",
    width: 2000,
    height: 2829,
  },
  35: {
    id: "student-wild-sip",
    href: "./wild-sip.html",
    image: "./assets/student-projects/wild-sip/04.webp",
    title: "WILD SIP 精酿啤酒包装设计",
    subtitle: "Craft Beer Packaging Design",
    width: 1400,
    height: 1867,
  },
  36: {
    id: "student-odd-beans",
    href: "./odd-beans.html",
    image: "./assets/student-projects/odd-beans/04.webp",
    title: "ODD BEANS 怪豆司咖啡品牌包装设计",
    subtitle: "Coffee Branding & Packaging Design",
    width: 1400,
    height: 1867,
  },
  37: {
    id: "student-paopao",
    href: "./paopao.html",
    image: "./assets/student-projects/paopao/04.webp",
    title: "PAOPAO 泡个泡泡洗护品牌包装设计",
    subtitle: "Personal Care Branding & Packaging Design",
    width: 2918,
    height: 3890,
  },
  34: {
    id: "student-vinova",
    href: "./vinova.html",
    image: "./assets/projects/vinova/vinova-01.webp",
    title: "VINOVA 太空来信巧克力包装设计",
    subtitle: "Letters from Space",
    width: 5834,
    height: 7709,
  },
};
const studentWorkOrder = [38, 35, 36, 37, 34, ...Array.from({ length: 33 }, (_, index) => index + 1)];

for (const index of studentWorkOrder) {
  const project = studentDetailProjects[index];
  const category = index > 25
    ? "packaging"
    : studentCategories[Math.min(Math.floor((index - 1) / 7), 3)];
  const figure = document.createElement("figure");
  const previewButton = document.createElement(project ? "a" : "button");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const paddedIndex = String(index).padStart(2, "0");
  const primarySource = project?.image ?? additionalStudentPairs[index]?.primary ?? `./assets/originals-student/student-${paddedIndex}.png`;
  const longFormSource = studentLongFormSources[index];

  figure.className = "student-work-card";
  figure.hidden = true;
  figure.dataset.category = category;
  previewButton.className = "student-work-card__preview work-item--reveal";
  if (project) {
    figure.id = project.id;
    previewButton.href = project.href;
    previewButton.setAttribute("aria-label", `查看${project.title}`);
    image.width = project.width;
    image.height = project.height;
  } else {
    previewButton.type = "button";
    previewButton.setAttribute("aria-label", longFormSource
      ? `查看学生作业 ${paddedIndex} 完整长图`
      : `放大查看学生作业 ${paddedIndex}`);
  }
  image.src = primarySource;
  image.alt = project?.title ?? `Student homework ${paddedIndex}`;
  image.dataset.workIndex = paddedIndex;
  if (longFormSource) image.dataset.longSrc = longFormSource;
  image.loading = studentCards.length < 4 ? "eager" : "lazy";

  const overlay = document.createElement("span");
  overlay.className = "work-item__overlay";
  const overlayCaption = document.createElement("span");
  overlayCaption.className = "work-item__caption";
  const title = document.createElement("span");
  title.className = "work-item__title";
  title.lang = "zh-CN";
  title.textContent = project?.title ?? "刺猬包装设计";
  const divider = document.createElement("span");
  divider.className = "work-item__divider";
  const subtitle = document.createElement("span");
  subtitle.className = "work-item__subtitle";
  subtitle.lang = "en";
  subtitle.dataset.pixelInitials = "off";
  subtitle.textContent = project?.subtitle ?? "CiWei packaging design";
  overlayCaption.append(title, divider, subtitle);
  overlay.append(overlayCaption);
  previewButton.append(image, overlay);

  caption.textContent = studentCategoryLabels[category];
  caption.dataset.editable = "";
  caption.dataset.editKey = `student-card-${paddedIndex}`;
  figure.append(previewButton, caption);
  studentGrid.append(figure);
  studentCards.push(figure);
}

const studentMore = document.createElement("div");
studentMore.className = "catalog-more student-gallery__more";
studentMore.id = "more-student-projects";
studentMore.innerHTML = `
  <button class="catalog-more__link" type="button" lang="zh-CN" aria-controls="student-gallery-projects">
    <span>加载更多项目</span>
    <span class="catalog-more__folder" aria-hidden="true"><img src="./assets/emoji/folder-pixel-yellow-v1.svg" alt="" width="35" height="27" loading="lazy" /></span>
  </button>`;
const studentMoreButton = studentMore.querySelector("button");
studentGrid.after(studentMore);

function loadNextThreeStudentRows() {
  // Match the case gallery: reveal three rows using the current column count.
  const columnCount = getComputedStyle(studentGrid).gridTemplateColumns.trim().split(/\s+/).length;
  const firstNewIndex = visibleStudentWorkCount;
  visibleStudentWorkCount = Math.min(studentCards.length, visibleStudentWorkCount + columnCount * 3);
  studentCards.slice(firstNewIndex, visibleStudentWorkCount).forEach((card) => {
    card.hidden = false;
  });
  const finished = visibleStudentWorkCount === studentCards.length;
  const restoreFocus = finished && document.activeElement === studentMoreButton;
  studentMore.hidden = finished;
  if (restoreFocus) {
    studentCards[firstNewIndex]?.querySelector("a, button")?.focus({ preventScroll: true });
  }
}

studentMoreButton.addEventListener("click", loadNextThreeStudentRows);
loadNextThreeStudentRows();

const studentLightbox = document.querySelector(".student-lightbox");
const studentLightboxImage = document.querySelector(".student-lightbox__image");
const studentLightboxCaption = document.querySelector(".student-lightbox__caption");
const studentLightboxClose = document.querySelector(".student-lightbox__close");
const studentLightboxPrevious = document.querySelector(".student-lightbox__arrow--previous");
const studentLightboxNext = document.querySelector(".student-lightbox__arrow--next");
let studentLightboxTrigger = null;
let studentLightboxIndex = 0;

function getVisibleStudentImages() {
  return [...studentGrid.querySelectorAll(".student-work-card:not([hidden]) button.student-work-card__preview > img")];
}

function showStudentLightboxImage(index) {
  const studentWorkImages = getVisibleStudentImages();
  if (!studentWorkImages.length) return;
  studentLightboxIndex = (index + studentWorkImages.length) % studentWorkImages.length;
  const image = studentWorkImages[studentLightboxIndex];
  const caption = image.closest("figure")?.querySelector("figcaption")?.textContent ?? "";
  const longFormSource = image.dataset.longSrc;
  studentLightbox.classList.toggle("is-long-form", Boolean(longFormSource));
  studentLightbox.scrollTop = 0;
  studentLightboxImage.src = longFormSource || image.currentSrc || image.src;
  studentLightboxImage.alt = longFormSource ? `${image.alt} 完整项目长图` : image.alt;
  studentLightboxCaption.textContent = longFormSource ? `${caption} · 完整项目长图` : caption;
}

function openStudentLightbox(previewButton) {
  if (document.body.classList.contains("is-editing")) return;
  const image = previewButton.querySelector("img");
  const index = getVisibleStudentImages().indexOf(image);
  if (index < 0) return;
  studentLightboxTrigger = previewButton;
  showStudentLightboxImage(index);
  studentLightbox.hidden = false;
  document.body.classList.add("has-student-lightbox");
  studentLightboxClose.focus();
}

function closeStudentLightbox() {
  if (studentLightbox.hidden) return;
  studentLightbox.hidden = true;
  studentLightboxImage.removeAttribute("src");
  studentLightbox.classList.remove("is-long-form");
  document.body.classList.remove("has-student-lightbox");
  studentLightboxTrigger?.focus();
  studentLightboxTrigger = null;
}

studentGrid.addEventListener("click", (event) => {
  const previewButton = event.target.closest("button.student-work-card__preview");
  if (previewButton) openStudentLightbox(previewButton);
});

studentLightboxClose.addEventListener("click", closeStudentLightbox);
studentLightboxPrevious.addEventListener("click", () => {
  showStudentLightboxImage(studentLightboxIndex - 1);
});
studentLightboxNext.addEventListener("click", () => {
  showStudentLightboxImage(studentLightboxIndex + 1);
});
studentLightbox.addEventListener("click", (event) => {
  if (event.target === studentLightbox) closeStudentLightbox();
});

document.addEventListener("keydown", (event) => {
  if (studentLightbox.hidden) return;
  if (event.key === "Escape") closeStudentLightbox();
  if (event.key === "ArrowLeft") showStudentLightboxImage(studentLightboxIndex - 1);
  if (event.key === "ArrowRight") showStudentLightboxImage(studentLightboxIndex + 1);
});

const studentMotionGrid = document.querySelector(".student-motion-grid");
studentMotionGrid.id = "student-motion-projects";
const studentMotionCards = [];
let visibleStudentMotionCount = 0;
for (let index = 1; index <= 10; index += 1) {
  const paddedIndex = String(index).padStart(2, "0");
  const figure = document.createElement("figure");
  const link = document.createElement("a");
  const preview = document.createElement("img");

  figure.className = "student-motion-card";
  figure.hidden = true;
  link.className = "student-motion-card__button work-item--reveal";
  link.href = `./student-video.html?video=${paddedIndex}`;
  link.setAttribute("aria-label", `进入学生动态作品 ${paddedIndex} 观看页面`);
  preview.className = "student-motion-card__preview";
  preview.src = `./assets/student-videos/posters/student-video-${paddedIndex}.png`;
  preview.alt = `学生动态作品 ${paddedIndex}`;
  preview.loading = "lazy";

  const overlay = document.createElement("span");
  overlay.className = "work-item__overlay";
  const overlayCaption = document.createElement("span");
  overlayCaption.className = "work-item__caption";
  const title = document.createElement("span");
  title.className = "work-item__title";
  title.lang = "zh-CN";
  title.textContent = "学生动态作品";
  const divider = document.createElement("span");
  divider.className = "work-item__divider";
  const subtitle = document.createElement("span");
  subtitle.className = "work-item__subtitle";
  subtitle.lang = "en";
  subtitle.dataset.pixelInitials = "off";
  subtitle.textContent = `AIGC Motion ${paddedIndex}`;
  subtitle.dataset.editable = "";
  subtitle.dataset.editKey = `student-motion-${paddedIndex}`;
  overlayCaption.append(title, divider, subtitle);
  overlay.append(overlayCaption);

  link.append(preview, overlay);
  figure.append(link);
  studentMotionGrid.append(figure);
  studentMotionCards.push(figure);
}

const studentMotionMore = document.createElement("div");
studentMotionMore.className = "catalog-more student-gallery__more";
studentMotionMore.id = "more-student-motion-projects";
studentMotionMore.innerHTML = `
  <button class="catalog-more__link" type="button" lang="zh-CN" aria-controls="student-motion-projects">
    <span>加载更多项目</span>
    <span class="catalog-more__folder" aria-hidden="true"><img src="./assets/emoji/folder-pixel-yellow-v1.svg" alt="" width="35" height="27" loading="lazy" /></span>
  </button>`;
const studentMotionMoreButton = studentMotionMore.querySelector("button");
studentMotionGrid.after(studentMotionMore);

function loadNextThreeStudentMotionRows() {
  const columnCount = getComputedStyle(studentMotionGrid).gridTemplateColumns.trim().split(/\s+/).length;
  const firstNewIndex = visibleStudentMotionCount;
  visibleStudentMotionCount = Math.min(studentMotionCards.length, visibleStudentMotionCount + columnCount * 3);
  studentMotionCards.slice(firstNewIndex, visibleStudentMotionCount).forEach((card) => {
    card.hidden = false;
  });
  const finished = visibleStudentMotionCount === studentMotionCards.length;
  const restoreFocus = finished && document.activeElement === studentMotionMoreButton;
  studentMotionMore.hidden = finished;
  if (restoreFocus) {
    studentMotionCards[firstNewIndex]?.querySelector("a").focus({ preventScroll: true });
  }
}

studentMotionMoreButton.addEventListener("click", loadNextThreeStudentMotionRows);
loadNextThreeStudentMotionRows();
