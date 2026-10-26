const params = new URLSearchParams(window.location.search);
const requestedIndex = Number.parseInt(params.get("video") ?? "1", 10);
const videoCount = 10;
const videoIndex = Math.min(Math.max(Number.isFinite(requestedIndex) ? requestedIndex : 1, 1), videoCount);
const paddedIndex = String(videoIndex).padStart(2, "0");
const previousIndex = videoIndex === 1 ? videoCount : videoIndex - 1;
const nextIndex = videoIndex === videoCount ? 1 : videoIndex + 1;
const video = document.querySelector(".student-video-viewer__video");
const title = document.querySelector(".student-video-viewer__title");
const previousLink = document.querySelector(".student-video-viewer__arrow--previous");
const nextLink = document.querySelector(".student-video-viewer__arrow--next");

video.src = `./assets/student-videos/student-video-${paddedIndex}.mp4`;
title.textContent = `AIGC MOTION ${paddedIndex}`;
previousLink.href = `./student-video.html?video=${String(previousIndex).padStart(2, "0")}`;
nextLink.href = `./student-video.html?video=${String(nextIndex).padStart(2, "0")}`;
document.title = `AIGC Motion ${paddedIndex} — OTO Studio`;

video.play().catch(() => {});

const videoViewer = document.querySelector(".student-video-viewer");
const studentWorksLink = document.querySelector(".student-video-viewer__meta a");

function closeStudentVideo() {
  video.pause();
  window.location.assign(studentWorksLink.href);
}

// Require the gesture to start and end on the backdrop, away from media controls.
let startedOnVideoBackdrop = false;
videoViewer.addEventListener("pointerdown", (event) => {
  startedOnVideoBackdrop = event.isPrimary && event.button === 0 && event.target === videoViewer;
});
videoViewer.addEventListener("pointercancel", () => {
  startedOnVideoBackdrop = false;
});
videoViewer.addEventListener("click", (event) => {
  const shouldClose = startedOnVideoBackdrop && event.button === 0 && event.target === videoViewer;
  startedOnVideoBackdrop = false;
  if (shouldClose) closeStudentVideo();
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("student-video-page")) return;
  if (event.key === "ArrowLeft") window.otoNavigate?.(previousLink.href);
  if (event.key === "ArrowRight") window.otoNavigate?.(nextLink.href);
  if (event.key === "Escape" && !document.fullscreenElement) {
    event.preventDefault();
    closeStudentVideo();
  }
});
