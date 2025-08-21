

document.body.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a || a.target === "_blank" || a.hostname !== location.hostname) return;
  e.preventDefault();
  loadPage(a.href);
});

// 2. Fade helpers
function fadeOut(el) {
  return new Promise(res => {
    el.classList.add("fade-out");
    el.addEventListener("transitionend", res, { once: true });
  });
}
function fadeIn(el) {
  el.classList.remove("fade-out");
  el.classList.add("fade-in");
}

// 3. Fetch + swap
async function fetchHTML(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  return res.text();
}
async function loadPage(url) {
  const container = document.getElementById("content");
  await fadeOut(container);
  const html = await fetchHTML(url);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const newContent = doc.getElementById("content");
  container.innerHTML = newContent.innerHTML;
  document.title = doc.title;
  history.pushState(null, "", url);
  fadeIn(container);
  // re-attach any JS you need on the new content
}

// 4. Back/forward support
window.addEventListener("popstate", () => loadPage(location.href));