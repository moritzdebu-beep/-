(() => {
  const tabs = document.querySelector(".course-tabs");
  if (!tabs) return;

  const header = document.querySelector(".site-header");
  const links = [...tabs.querySelectorAll("a[data-course-section]")];
  const entries = links.map((link) => {
    const href = link.getAttribute("href");
    const section = href?.startsWith("#")
      ? document.getElementById(href.slice(1))
      : null;
    return { link, section };
  }).filter(({ section }) => section?.matches("section[data-course-section]"));
  if (!entries.length) return;

  let currentLink = null;
  let frame = 0;

  function updateCurrentSection() {
    frame = 0;
    const threshold = (header?.getBoundingClientRect().height ?? 0)
      + tabs.getBoundingClientRect().height + 24;
    let activeLink = entries[0].link;

    for (const { link, section } of entries) {
      if (section.getBoundingClientRect().top <= threshold) activeLink = link;
    }

    if (activeLink === currentLink) return;
    currentLink = activeLink;
    for (const link of links) {
      const isCurrent = link === activeLink;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("pageshow", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  scheduleUpdate();
})();
