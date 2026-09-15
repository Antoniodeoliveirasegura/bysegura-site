/* ─────────────────────────────────────────────────────────────
   site.js: shared behaviour for every page on bysegura.com
   Theme toggle, particle background, boot intro, scroll reveals,
   card spotlight, live-site embeds, and the contact form.
   Loaded with `defer`, so the DOM is parsed when this runs.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  window.__site = true; // tells the <head> failsafe that we loaded

  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var each = function (sel, fn, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn);
  };

  var bg = background();
  theme();
  header();
  boot();
  reveals();
  spotlight();
  embeds();
  contactForm();

  // ─── Theme ───
  function theme() {
    var btn = document.querySelector(".theme-toggle");
    var meta = document.querySelector('meta[name="theme-color"]');

    function apply(t) {
      html.setAttribute("data-theme", t);
      if (meta) meta.setAttribute("content", t === "light" ? "#f7f7f4" : "#0b0c0f");
      bg.recolor();
    }
    apply(html.getAttribute("data-theme") === "light" ? "light" : "dark");

    if (btn) {
      btn.addEventListener("click", function () {
        var next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
        try { localStorage.setItem("theme", next); } catch (e) {}
        wipe(btn, function () { apply(next); });
      });
    }

    // Follow the OS setting until the visitor picks a theme themselves.
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (saved !== "light" && saved !== "dark") apply(e.matches ? "light" : "dark");
    });
  }

  var wipeToken = 0;
  function wipe(origin, update) {
    if (reduce || typeof document.startViewTransition !== "function") {
      update();
      return;
    }
    var r = origin.getBoundingClientRect();
    html.style.setProperty("--vt-x", r.left + r.width / 2 + "px");
    html.style.setProperty("--vt-y", r.top + r.height / 2 + "px");
    html.classList.add("theme-vt");
    var token = ++wipeToken;
    // finished can reject when the browser aborts the transition (hidden tab);
    // the DOM update still ran, so just clean up.
    document.startViewTransition(update).finished.catch(function () {}).then(function () {
      if (token === wipeToken) html.classList.remove("theme-vt");
    });
  }

  // ─── Header border once the page scrolls ───
  function header() {
    var el = document.querySelector(".site-header");
    if (!el) return;
    var onScroll = function () { el.classList.toggle("scrolled", window.scrollY > 4); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ─── Particle background: drifting stars, faint links to the cursor ───
  function background() {
    var canvas = document.getElementById("bg");
    var noop = { recolor: function () {} };
    if (!canvas || !canvas.getContext) return noop;

    var ctx = canvas.getContext("2d");
    var pts = [];
    var w = 0, h = 0, dpr = 1, raf = 0;
    var rgb = "255, 255, 255", alpha = 1;
    var mouse = { x: -1e4, y: -1e4 };
    var LINK = 150;

    function target() {
      return Math.min(150, Math.round((w * h) / 10000));
    }

    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.1 + 0.35,
        a: Math.random() * 0.5 + 0.25,
        t: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = target();
      while (pts.length < n) pts.push(spawn());
      pts.length = n;
      if (reduce) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          p.t += 0.012;
          if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4;
          if (p.y < -4) p.y = h + 4; else if (p.y > h + 4) p.y = -4;
        }
        var a = p.a * (0.7 + 0.3 * Math.sin(p.t)) * alpha;
        ctx.fillStyle = "rgba(" + rgb + "," + a.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = "rgba(" + rgb + "," + ((1 - d / LINK) * 0.3 * alpha).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
    }

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    function recolor() {
      var cs = getComputedStyle(html);
      rgb = cs.getPropertyValue("--particle").trim() || rgb;
      alpha = parseFloat(cs.getPropertyValue("--particle-alpha")) || 1;
      if (reduce) draw();
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    resize();
    recolor();

    if (!reduce) {
      window.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });
      document.addEventListener("pointerleave", function () { mouse.x = mouse.y = -1e4; });
      document.addEventListener("visibilitychange", function () {
        cancelAnimationFrame(raf);
        if (!document.hidden) loop();
      });
      loop();
    }

    return { recolor: recolor };
  }

  // ─── Boot intro (first load per tab; html.intro decided pre-paint) ───
  function boot() {
    if (!html.classList.contains("intro")) return;
    try { sessionStorage.setItem("booted", "1"); } catch (e) {}

    var items = document.querySelectorAll("[data-boot]");
    Array.prototype.forEach.call(items, function (el, i) { el.style.setProperty("--i", i); });

    var delay = 0;
    var cmd = document.querySelector("[data-type]");
    if (cmd) {
      var text = cmd.textContent;
      var speed = 55;
      cmd.textContent = "";
      var n = 0;
      var timer = setInterval(function () {
        cmd.textContent = text.slice(0, ++n);
        if (n >= text.length) clearInterval(timer);
      }, speed);
      delay = text.length * speed + 120;
    }

    setTimeout(function () {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("in"); });
      each("[data-scramble]", scramble);
    }, delay);
  }

  // Terminal-style decode: each text node resolves from random glyphs and
  // always ends on its exact original value.
  function scramble(el) {
    var nodes = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim()) nodes.push({ node: walker.currentNode, text: walker.currentNode.nodeValue });
    }
    var glyphs = "abcdefghijklmnopqrstuvwxyz#%&*+=/<>_";
    var offset = 0;
    nodes.forEach(function (n) { n.start = offset; offset += n.text.length; });
    var last = 3 + offset * 1.6 + 2;
    var frame = 0;
    var id = setInterval(function () {
      nodes.forEach(function (n) {
        var out = "";
        for (var i = 0; i < n.text.length; i++) {
          var ch = n.text.charAt(i);
          out += ch === " " || frame >= 3 + (n.start + i) * 1.6
            ? ch
            : glyphs.charAt((Math.random() * glyphs.length) | 0);
        }
        n.node.nodeValue = out;
      });
      if (frame++ >= last) {
        clearInterval(id);
        nodes.forEach(function (n) { n.node.nodeValue = n.text; });
      }
    }, 32);
  }

  // ─── Scroll reveals ───
  function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    var show = function (el) { el.classList.add("in"); };

    // Stagger siblings that share a parent.
    Array.prototype.forEach.call(els, function (el) {
      var i = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.classList.contains("reveal");
      }).indexOf(el);
      el.style.setProperty("--i", i % 6);
    });

    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, show);
      return;
    }

    // During the intro, hold in-view content until the hero has started.
    var hold = html.classList.contains("intro") ? 650 : 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (hold) setTimeout(show, hold, entry.target);
        else show(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
    setTimeout(function () { hold = 0; }, 1200);
  }

  // ─── Card spotlight follows the pointer ───
  function spotlight() {
    if (reduce) return;
    each(".card", function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  // ─── Live-site embeds: scale a 1280px-wide page down to its frame ───
  function embeds() {
    var frames = document.querySelectorAll(".embed-frame");
    if (!frames.length || !("ResizeObserver" in window)) return;
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        var iframe = entry.target.querySelector("iframe");
        if (iframe) iframe.style.transform = "scale(" + entry.contentRect.width / 1280 + ")";
      });
    });
    Array.prototype.forEach.call(frames, function (f) { ro.observe(f); });
  }

  // ─── Contact form: submit over fetch, draw a check on success ───
  function contactForm() {
    var form = document.querySelector("form.form");
    if (!form || !window.fetch) return; // native POST is the fallback

    var btn = form.querySelector('button[type="submit"]');
    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("sending")) return;
      form.classList.add("sending");
      form.classList.remove("error");
      if (btn) btn.disabled = true;
      if (status) status.textContent = "";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) return success();
          return res.json().then(function (data) {
            var errs = data && data.errors;
            throw new Error(errs && errs.length
              ? errs.map(function (x) { return x.message; }).join(", ")
              : "Something went wrong, please try again.");
          });
        })
        .catch(function (err) {
          form.classList.remove("sending");
          if (btn) btn.disabled = false;
          if (status) status.textContent = (err && err.message) || "Network error, please try again.";
          void form.offsetWidth; // reflow so the shake replays
          form.classList.add("error");
        });
    });

    function success() {
      var panel = document.createElement("div");
      panel.className = "form-success";
      panel.setAttribute("role", "status");
      panel.innerHTML =
        '<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/>' +
        '<path d="M14 27l8 8 16-16"/></svg><span>message sent, thanks!</span>';
      form.replaceWith(panel);
    }
  }
})();
