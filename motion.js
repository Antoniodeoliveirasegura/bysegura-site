/* ─────────────────────────────────────────────────────────────
   motion.js — shared motion behaviour for bysegura.com
   IIFE-scoped so it never collides with the page scripts' globals.
   Handles: hero boot reveal, scroll reveals, magnetic touch-bar
   icons, and a helper the page scripts call for the theme wipe.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;

  // Helper the theme toggle handlers call (defined immediately so it's
  // available regardless of DOM-ready timing).
  var vtToken = 0;
  window.animateThemeChange = function (originEl, apply) {
    if (reduce || typeof document.startViewTransition !== "function") {
      apply();
      return;
    }
    try {
      var r = originEl.getBoundingClientRect();
      html.style.setProperty("--vt-x", r.left + r.width / 2 + "px");
      html.style.setProperty("--vt-y", r.top + r.height / 2 + "px");
    } catch (e) {}
    html.classList.add("theme-vt");
    var token = ++vtToken;
    var t = document.startViewTransition(apply);
    // Only the most recent transition clears the class, so rapid toggles
    // don't strip theme-vt out from under an in-flight wipe.
    t.finished.finally(function () {
      if (token === vtToken) html.classList.remove("theme-vt");
    });
  };

  var started = false;
  function init() {
    if (started) return;
    started = true;
    if (!reduce) {
      bootReveal();
      scrollReveal();
    }
    magneticIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ─── Hero boot reveal (once per tab) ───
  function bootReveal() {
    if (!html.classList.contains("intro")) return; // decided pre-paint in <head>
    try { sessionStorage.setItem("booted", "1"); } catch (e) {}

    var isHome = !!document.querySelector(".header");
    var selectors = isHome
      ? [".antonio", ".header > h2", ".header > p"]
      : [".page-header h1", ".page-header p"];

    var items = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        items.push(el);
      });
    });
    items.forEach(function (el, i) { el.style.setProperty("--i", i); });

    var startAt = isHome ? typeBootLine() : 0;
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("in"); });
    }, startAt);
  }

  // Types a short terminal "boot" line above the hero, then fades it out.
  // Returns the delay (ms) after which the hero should begin revealing.
  function typeBootLine() {
    var header = document.querySelector(".header");
    if (!header) return 0;
    var text = "> booting antonio.dev";
    var speed = 32; // ms per character

    var line = document.createElement("div");
    line.className = "boot-line";
    line.setAttribute("aria-hidden", "true");
    var body = document.createElement("span");
    var caret = document.createElement("span");
    caret.className = "boot-caret blink";
    caret.textContent = "█";
    line.appendChild(body);
    line.appendChild(caret);
    header.insertBefore(line, header.firstChild);

    var i = 0;
    var timer = setInterval(function () {
      body.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(timer);
        caret.classList.remove("blink"); // solid on completion
        setTimeout(function () {
          line.style.transition = "opacity 300ms";
          line.style.opacity = "0";
          setTimeout(function () { line.remove(); }, 320);
        }, 240);
      }
    }, speed);

    return text.length * speed; // hero starts as the line finishes typing
  }

  // ─── Scroll reveal for below-the-fold content ───
  function scrollReveal() {
    var targets = document.querySelectorAll(
      ".achievements, .project, .future-idea, section > h2"
    );
    if (!targets.length) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;
    var supportsIO = "IntersectionObserver" in window;
    var io = supportsIO
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
      : null;

    Array.prototype.forEach.call(targets, function (el, i) {
      var top = el.getBoundingClientRect().top;
      if (top < vh * 0.92) {
        // Already in view: show it (a one-frame hide gives it an entrance).
        el.classList.add("reveal-item");
        requestAnimationFrame(function () { el.classList.add("in"); });
      } else if (io) {
        el.style.setProperty("--i", i % 5);
        el.classList.add("reveal-item");
        io.observe(el);
      } else {
        el.classList.add("reveal-item", "in");
      }
    });
  }

  // ─── Magnetic + springy touch-bar icons (mouse pointers only) ───
  function magneticIcons() {
    var bar = document.querySelector(".touch-bar");
    if (!bar) return;
    var STRENGTH = 0.32;
    var MAX = 6; // px

    Array.prototype.forEach.call(bar.querySelectorAll("button"), function (btn) {
      if (reduce) return; // scale-only hover handled by CSS; no magnetic follow
      btn.addEventListener("pointermove", function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
        var dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
        dx = Math.max(-MAX, Math.min(MAX, dx));
        dy = Math.max(-MAX, Math.min(MAX, dy));
        btn.style.transition = "transform 0s";
        btn.style.transform = "translate3d(" + dx + "px," + dy + "px,0) scale(1.09)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transition = "transform var(--dur-hover) var(--ease-spring)";
        btn.style.transform = "";
      });
    });
  }
})();
