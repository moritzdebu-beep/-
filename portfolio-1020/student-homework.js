const studentGrid = document.querySelector(".student-work-grid");
const hoverPreviewQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

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

const studentAlternateSources = {
  1: "./assets/student-toggle/toggle-01.webp",
  2: "./assets/student-toggle/toggle-02.webp",
  3: "./assets/student-toggle/toggle-03.webp",
  4: "./assets/student-toggle/toggle-04.webp",
  5: "./assets/student-toggle/toggle-05.webp",
  7: "./assets/student-toggle/toggle-07.webp",
  8: "./assets/student-toggle/toggle-08.webp",
  9: "./assets/student-toggle/toggle-09.webp",
  10: "./assets/student-toggle/toggle-10.webp",
  11: "./assets/student-toggle/toggle-11.webp",
  12: "./assets/student-toggle/toggle-12.webp",
  13: "./assets/student-toggle/toggle-13.webp",
  14: "./assets/student-toggle/toggle-14.webp",
  15: "./assets/student-toggle/toggle-15.webp",
  16: "./assets/student-toggle/toggle-16.webp",
  17: "./assets/student-toggle/toggle-17.webp",
  18: "./assets/student-toggle/toggle-18.webp",
  19: "./assets/student-toggle/toggle-19.webp",
  20: "./assets/student-toggle/toggle-20.webp",
  21: "./assets/student-toggle/toggle-21.webp",
  22: "./assets/student-toggle/toggle-22.webp",
  23: "./assets/student-toggle/toggle-23.webp",
  24: "./assets/student-toggle/toggle-24.webp",
  25: "./assets/student-toggle/toggle-25.webp",
};

const studentLongFormSources = {
  1: "./assets/student-long/student-01-long.jpg",
  2: "./assets/student-long/student-02-long.jpg",
  3: "./assets/student-long/student-03-long.jpg",
  4: "./assets/student-long/student-04-long.jpg",
  5: "./assets/student-long/student-05-long.jpg",
  6: "./assets/student-long/student-06-long.jpg",
  7: "./assets/student-long/student-07-long.jpg",
  8: "./assets/student-long/student-08-long.jpg",
  9: "./assets/student-long/student-09-long.jpg",
  11: "./assets/student-long/student-11-long.jpg",
  13: "./assets/student-long/student-13-long.jpg",
  14: "./assets/student-long/student-14-long.jpg",
  15: "./assets/student-long/student-15-long.jpg",
  16: "./assets/student-long/student-16-long.jpg",
  17: "./assets/student-long/student-17-long.jpg",
  18: "./assets/student-long/student-18-long.jpg",
  19: "./assets/student-long/student-19-long.jpg",
  20: "./assets/student-long/student-20-long.jpg",
  21: "./assets/student-long/student-21-long.jpg",
  22: "./assets/student-long/student-22-long.jpg",
  23: "./assets/student-long/student-23-long.jpg",
  24: "./assets/student-long/student-24-long.jpg",
  25: "./assets/student-long/student-25-long.jpg",
  26: "./assets/student-long/student-26-long.jpg",
  27: "./assets/student-long/student-27-long.jpg",
  28: "./assets/student-long/student-28-long.jpg",
  29: "./assets/student-long/student-29-long.jpg",
  30: "./assets/student-long/student-30-long.jpg",
  32: "./assets/student-long/student-32-long.jpg",
  33: "./assets/student-long/student-33-long.jpg",
};

const additionalStudentPairs = {
  26: {
    primary: "./assets/student-toggle/student-26a.webp",
    alternate: "./assets/student-toggle/student-26b.webp",
  },
  27: {
    primary: "./assets/student-toggle/student-27a.webp",
    alternate: "./assets/student-toggle/student-27b.webp",
  },
  28: {
    primary: "./assets/student-toggle/student-28a.webp",
    alternate: "./assets/student-toggle/student-28b.webp",
  },
  29: {
    primary: "./assets/student-toggle/student-29a.webp",
    alternate: "./assets/student-toggle/student-29b.webp",
  },
  30: {
    primary: "./assets/student-toggle/student-30a.webp",
    alternate: "./assets/student-toggle/student-30b.webp",
  },
  31: {
    primary: "./assets/student-toggle/student-31a.webp",
    alternate: "./assets/student-toggle/student-31b.webp",
  },
  32: {
    primary: "./assets/student-toggle/student-32a.webp",
    alternate: "./assets/student-toggle/student-32b.webp",
  },
  33: {
    primary: "./assets/student-toggle/student-33a.webp",
    alternate: "./assets/student-toggle/student-33b.webp",
  },
};

for (let index = 1; index <= 33; index += 1) {
  const category = index > 25
    ? "packaging"
    : studentCategories[Math.min(Math.floor((index - 1) / 7), 3)];
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const paddedIndex = String(index).padStart(2, "0");
  const additionalPair = additionalStudentPairs[index];
  const primarySource = additionalPair?.primary ?? `./assets/student-works/student-${paddedIndex}.webp`;
  const alternateSource = additionalPair?.alternate ?? studentAlternateSources[index];
  const longFormSource = studentLongFormSources[index];

  figure.className = "student-work-card";
  figure.dataset.category = category;
  image.src = primarySource;
  image.alt = `Student homework ${paddedIndex}`;
  image.dataset.workIndex = paddedIndex;
  if (longFormSource) image.dataset.longSrc = longFormSource;
  image.loading = index <= 6 ? "eager" : "lazy";
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", longFormSource
    ? `查看学生作业 ${paddedIndex} 完整长图`
    : alternateSource
      ? `放大查看学生包装作业 ${paddedIndex}，悬停预览第二张图片`
      : `放大查看学生作业 ${paddedIndex}`);
  caption.textContent = studentCategoryLabels[category];
  caption.dataset.editable = "";
  caption.dataset.editKey = `student-card-${paddedIndex}`;

  if (alternateSource) {
    const preload = new Image();
    figure.classList.add("is-paired");
    image.dataset.primarySrc = primarySource;
    image.dataset.altSrc = alternateSource;
    image.dataset.showingAlt = "false";
    preload.src = alternateSource;
    image.addEventListener("mouseenter", () => {
      if (hoverPreviewQuery.matches) setStudentPairState(image, true);
    });
    image.addEventListener("mouseleave", () => {
      if (hoverPreviewQuery.matches) setStudentPairState(image, false);
    });
    figure.append(image, caption);
  } else {
    figure.append(image, caption);
  }
  studentGrid.append(figure);
}

studentGrid.append(createContinuationNote(
  "student-continuation-note--gallery",
  "student-gallery-continuation",
));

function setStudentPairState(image, showAlternate) {
  const showingAlt = image.dataset.showingAlt === "true";
  if (showingAlt === showAlternate) return;
  const nextSource = showAlternate ? image.dataset.altSrc : image.dataset.primarySrc;
  image.classList.add("is-switching");
  image.addEventListener("load", () => image.classList.remove("is-switching"), { once: true });
  image.src = nextSource;
  image.dataset.showingAlt = String(showAlternate);
}

const studentLightbox = document.querySelector(".student-lightbox");
const studentLightboxImage = document.querySelector(".student-lightbox__image");
const studentLightboxCaption = document.querySelector(".student-lightbox__caption");
const studentLightboxClose = document.querySelector(".student-lightbox__close");
const studentLightboxPrevious = document.querySelector(".student-lightbox__arrow--previous");
const studentLightboxNext = document.querySelector(".student-lightbox__arrow--next");
const studentWorkImages = [...studentGrid.querySelectorAll("img")];
let studentLightboxTrigger = null;
let studentLightboxIndex = 0;

function showStudentLightboxImage(index) {
  studentLightboxIndex = (index + studentWorkImages.length) % studentWorkImages.length;
  const image = studentWorkImages[studentLightboxIndex];
  const caption = image.closest("figure")?.querySelector("figcaption")?.textContent ?? "";
  const longFormSource = image.dataset.longSrc;
  studentLightboxTrigger = image;
  studentLightbox.classList.toggle("is-long-form", Boolean(longFormSource));
  studentLightbox.scrollTop = 0;
  studentLightboxImage.src = longFormSource || image.currentSrc || image.src;
  studentLightboxImage.alt = longFormSource ? `${image.alt} 完整项目长图` : image.alt;
  studentLightboxCaption.textContent = longFormSource ? `${caption} · 完整项目长图` : caption;
}

function openStudentLightbox(image) {
  showStudentLightboxImage(studentWorkImages.indexOf(image));
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
}

studentGrid.addEventListener("click", (event) => {
  const image = event.target.closest("img");
  if (!image) return;
  if (image.dataset.altSrc) {
    openStudentLightbox(image);
    return;
  }
  openStudentLightbox(image);
});

studentGrid.addEventListener("keydown", (event) => {
  const image = event.target.closest("img");
  if (!image || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  if (image.dataset.altSrc) {
    openStudentLightbox(image);
    return;
  }
  openStudentLightbox(image);
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
  if (event.key === "Escape") {
    closeStudentLightbox();
    return;
  }
  if (studentLightbox.hidden) return;
  if (event.key === "ArrowLeft") showStudentLightboxImage(studentLightboxIndex - 1);
  if (event.key === "ArrowRight") showStudentLightboxImage(studentLightboxIndex + 1);
});

const studentMotionGrid = document.querySelector(".student-motion-grid");
for (let index = 1; index <= 10; index += 1) {
  const paddedIndex = String(index).padStart(2, "0");
  const figure = document.createElement("figure");
  const link = document.createElement("a");
  const preview = document.createElement("video");
  const playMark = document.createElement("span");
  const caption = document.createElement("figcaption");

  figure.className = "student-motion-card";
  link.className = "student-motion-card__button";
  link.href = `./student-video.html?video=${paddedIndex}`;
  link.setAttribute("aria-label", `进入学生动态作品 ${paddedIndex} 观看页面`);
  preview.className = "student-motion-card__preview";
  preview.src = `./assets/student-videos/student-video-${paddedIndex}.mp4`;
  preview.muted = true;
  preview.playsInline = true;
  preview.preload = "metadata";
  preview.tabIndex = -1;
  preview.setAttribute("aria-hidden", "true");
  preview.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(preview.duration) && preview.duration > 0.3) {
      preview.currentTime = Math.min(0.5, preview.duration * 0.05);
    }
  }, { once: true });
  playMark.className = "student-motion-card__play";
  playMark.setAttribute("aria-hidden", "true");
  caption.textContent = `AIGC MOTION ${paddedIndex}`;
  caption.dataset.editable = "";
  caption.dataset.editKey = `student-motion-${paddedIndex}`;

  link.append(preview, playMark);
  figure.append(link, caption);
  studentMotionGrid.append(figure);
}

studentMotionGrid.append(createContinuationNote(
  "student-continuation-note--motion",
  "student-motion-continuation",
));
