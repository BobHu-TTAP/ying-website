/* =====================================================================
   YING — site behaviour. Vanilla JS, no dependencies.
   Progressive enhancement: the page is fully usable with JS disabled.
   ===================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function setMenu(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) {
      mobileNav.hidden = false;
    } else {
      // allow the close transition to finish before hiding from AT
      window.setTimeout(function () {
        if (navToggle.getAttribute("aria-expanded") === "false") mobileNav.hidden = true;
      }, prefersReduced ? 0 : 260);
    }
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        navToggle.focus();
      }
    });
    // Reset menu if resized up to desktop
    window.matchMedia("(min-width: 880px)").addEventListener("change", function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- Logo → smooth scroll to the very top ----------
     #top is the sticky header, which the browser treats as already in view, so a plain
     anchor jump won't scroll. Handle the click explicitly. */
  var brandLink = document.querySelector(".brand");
  if (brandLink) {
    brandLink.addEventListener("click", function (e) {
      e.preventDefault();
      setMenu(false);
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    });
  }

  /* ---------- Scroll-spy: active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = "#" + entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- Language toggle (EN / 中文 scaffold) ----------
     Swaps text on any element carrying BOTH data-en and data-zh.
     Elements that contain child elements should put the attributes on a
     leaf <span> so child icons/markup are preserved.
     Body copy without data-zh stays English until professional translation
     is supplied — see the <!-- TODO(content) --> markers in index.html. */
  var STORE_KEY = "ying-lang";
  var i18nEls = Array.prototype.slice.call(document.querySelectorAll("[data-en][data-zh]"));
  var langToggle = document.getElementById("langToggle");

  function applyLang(lang) {
    var zh = lang === "zh";
    i18nEls.forEach(function (el) {
      var val = zh ? el.getAttribute("data-zh") : el.getAttribute("data-en");
      if (val != null) el.textContent = val;
    });
    document.documentElement.lang = zh ? "zh" : "en";
    if (langToggle) {
      langToggle.setAttribute("aria-label", zh ? "切换语言为 English" : "Switch language to 中文");
      var en = langToggle.querySelector(".lang-en");
      var z = langToggle.querySelector(".lang-zh");
      if (en) en.classList.toggle("is-inactive", zh);
      if (z) z.classList.toggle("is-inactive", !zh);
    }
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  if (langToggle) {
    var saved = "en";
    try { saved = localStorage.getItem(STORE_KEY) || "en"; } catch (e) {}
    if (saved === "zh") applyLang("zh");
    langToggle.addEventListener("click", function () {
      applyLang(document.documentElement.lang === "zh" ? "en" : "zh");
    });
  }

  /* ---------- Contact form (client-side validation) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function setError(input, msgId, message) {
    var field = input.closest(".field");
    var err = document.getElementById(msgId);
    if (field) field.classList.toggle("field--error", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) err.textContent = message || "";
    return !message;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"];
      var email = form.elements["email"];
      var message = form.elements["message"];
      var ok = true;

      ok = setError(name, "name-err", name.value.trim() ? "" : "Please enter your name.") && ok;
      var emailVal = email.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      ok = setError(email, "email-err", emailOk ? "" : "Please enter a valid email address.") && ok;
      ok = setError(message, "msg-err", message.value.trim() ? "" : "Please tell us how we can help.") && ok;

      if (!ok) {
        if (status) { status.textContent = "Please fix the highlighted fields."; status.dataset.state = "err"; }
        var firstErr = form.querySelector(".field--error input, .field--error textarea");
        if (firstErr) firstErr.focus();
        return;
      }

      // --- No endpoint wired yet. ---
      // To go live: set the form's data-endpoint (or action) to a Formspree URL or a
      // Cloudflare Pages Function / Worker, then POST here with fetch(). Example:
      //
      //   var endpoint = form.getAttribute("data-endpoint");
      //   fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      //     .then(function (r) { /* handle success / error */ });
      //
      if (status) {
        status.textContent = "Thanks — your message is ready to send. (Demo: connect a form endpoint to deliver it.)";
        status.dataset.state = "ok";
      }
      form.reset();
    });

    // Clear an error as the user corrects the field
    ["name", "email", "message"].forEach(function (n) {
      var el = form.elements[n];
      if (el) el.addEventListener("input", function () {
        var map = { name: "name-err", email: "email-err", message: "msg-err" };
        setError(el, map[n], "");
        if (status) { status.textContent = ""; status.removeAttribute("data-state"); }
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
