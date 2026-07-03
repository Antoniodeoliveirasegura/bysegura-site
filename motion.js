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
    cardTilt();
    enhanceContactForm();
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
      if (isHome) scrambleName(document.querySelector(".antonio"));
    }, startAt);
  }

  // Terminal-style decode: the hero name resolves from random glyphs as it
  // fades up. The text always ends identical to the DOM value, so nothing
  // changes for crawlers or the reduced-motion path (which never calls this).
  function scrambleName(el) {
    if (!el) return;
    var finalText = el.textContent;
    var glyphs = "abcdefghijklmnopqrstuvwxyz#%&*+=/<>_";
    var letters = finalText.split("");
    var lockAt = letters.map(function (_, i) { return 3 + i * 2; }); // frame each letter settles
    var maxFrame = lockAt[lockAt.length - 1] + 3;
    var frame = 0;
    var id = setInterval(function () {
      var out = "";
      for (var i = 0; i < letters.length; i++) {
        if (letters[i] === " " || frame >= lockAt[i]) out += letters[i];
        else out += glyphs.charAt((Math.random() * glyphs.length) | 0);
      }
      el.textContent = out;
      if (frame++ >= maxFrame) {
        clearInterval(id);
        el.textContent = finalText; // guarantee the exact name
      }
    }, 34);
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
  // A "group" is one trigger element whose viewport position gates the reveal
  // of one-or-more member elements; each member carries its own --i so it can
  // stagger. Simple sections are their own single member; an .achievements
  // block cascades its heading then each bullet.
  function scrollReveal() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // During the one-time boot, hold in-view reveals until the hero has begun,
    // so content cascades top-down instead of racing the header decode.
    var introHold = html.classList.contains("intro") ? 700 : 0;
    var io = ("IntersectionObserver" in window)
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              show(entry.target._revealMembers || [entry.target]);
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
      : null;

    function show(members) {
      members.forEach(function (el) { el.classList.add("in"); });
    }

    function register(trigger, members) {
      members.forEach(function (el) { el.classList.add("reveal-item"); });
      if (trigger.getBoundingClientRect().top < vh * 0.92 || !io) {
        // Already in view (or no observer): reveal after the intro hold.
        setTimeout(function () { show(members); }, introHold);
      } else {
        trigger._revealMembers = members;
        io.observe(trigger);
      }
    }

    // Achievements: cascade heading + each bullet (stagger restarts per block).
    Array.prototype.forEach.call(document.querySelectorAll(".achievements"), function (block) {
      var members = [];
      var heading = block.querySelector("h2");
      if (heading) members.push(heading);
      Array.prototype.forEach.call(block.querySelectorAll("li"), function (li) { members.push(li); });
      members.forEach(function (el, i) { el.style.setProperty("--i", i); });
      register(block, members);
    });

    // Simple targets: each element reveals itself.
    Array.prototype.forEach.call(
      document.querySelectorAll(".project, .future-idea, section > h2"),
      function (el, i) {
        el.style.setProperty("--i", i % 5);
        register(el, [el]);
      }
    );
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

  // ─── Project-card tilt (pointer-tracked 3D lift; mouse pointers only) ───
  function cardTilt() {
    if (reduce) return;
    var cards = document.querySelectorAll(".project-grid .project");
    var MAX = 6; // deg
    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener("pointermove", function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        var rx = (-py * MAX).toFixed(2);
        var ry = (px * MAX).toFixed(2);
        card.style.transition = "transform 0s";
        card.style.transform =
          "perspective(720px) rotateX(" + rx + "deg) rotateY(" + ry +
          "deg) translateY(-6px) scale(1.02)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform var(--dur-hover) var(--ease-spring)";
        card.style.transform = "";
      });
    });
  }

  // ─── Contact form: submit over fetch so the page never leaves; draw a
  //     success check on 200, shake + inline message on failure. ───
  function enhanceContactForm() {
    var form = document.querySelector(".contact-section form");
    if (!form || !window.fetch) return; // native submit is the fallback

    var submitBtn = form.querySelector('button[type="submit"]');
    var status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "alert");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("sending")) return;
      form.classList.add("sending");
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) { showSuccess(); return; }
          return res.json().then(function (data) {
            var errs = data && data.errors;
            throw new Error(
              errs && errs.length
                ? errs.map(function (x) { return x.message; }).join(", ")
                : "Something went wrong — please try again."
            );
          });
        })
        .catch(function (err) {
          form.classList.remove("sending");
          if (submitBtn) submitBtn.disabled = false;
          status.textContent =
            (err && err.message) || "Network error — please try again.";
          form.classList.remove("error");
          void form.offsetWidth; // reflow so the shake can replay on retries
          form.classList.add("error");
        });
    });

    function showSuccess() {
      var panel = document.createElement("div");
      panel.className = "form-success";
      panel.setAttribute("role", "status");
      panel.innerHTML =
        '<svg class="check" viewBox="0 0 52 52" aria-hidden="true">' +
        '<circle cx="26" cy="26" r="24" fill="none"/>' +
        '<path fill="none" d="M14 27l8 8 16-16"/></svg>' +
        "<span>message sent — thanks!</span>";
      form.replaceWith(panel);
    }
  }
})();
