/* Energy Plus transformers — nav, Formspree quote, SMS/email, desktop phone QR */
(function () {
  var data = window.EP_CONTACT || {};
  var phone = data.phone || "864-777-0688";
  var phoneTel = data.phoneTel || "tel:+18647770688";
  var email = data.email || "dan@yourenergyplus.com";
  var smsHref = data.smsHref || "";
  var emailHref = data.emailHref || ("mailto:" + email);
  var formspree = data.formspree || "";
  var smsBody = data.smsBody || "";

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.matchMedia("(max-width: 900px)").matches);
  }

  /* —— Mobile nav —— */
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-nav-mobile]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* —— Prefill product select —— */
  var params = new URLSearchParams(window.location.search);
  var product = params.get("product");
  var select = document.getElementById("product-select");
  if (product && select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === product) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  /* —— Quote form → Formspree —— */
  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var btn = form.querySelector('[type="submit"]');
      if (!formspree) {
        if (status) {
          status.hidden = false;
          status.className = "form-status form-status-error";
          status.textContent =
            "Quote form is not connected yet. Please email " + email + " or call " + phone + ".";
        }
        return;
      }
      var fd = new FormData(form);
      fd.append("_subject", "Transformer quote request — " + (fd.get("company") || fd.get("name") || "inquiry"));
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      if (status) {
        status.hidden = false;
        status.className = "form-status";
        status.textContent = "Sending your request…";
      }
      fetch(formspree, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          form.reset();
          if (status) {
            status.className = "form-status form-status-ok";
            status.textContent =
              "Thanks — your request was sent. We’ll follow up shortly. For urgent needs, call or text " +
              phone +
              ".";
          }
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Submit request";
          }
        })
        .catch(function () {
          if (status) {
            status.className = "form-status form-status-error";
            status.textContent =
              "Something went wrong sending the form. Please email " +
              email +
              " or call " +
              phone +
              ".";
          }
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Submit request";
          }
        });
    });
  }

  /* —— Phone: mobile SMS / desktop modal + QR —— */
  function ensurePhoneModal() {
    var existing = document.getElementById("phone-modal");
    if (existing) return existing;
    var wrap = document.createElement("div");
    wrap.id = "phone-modal";
    wrap.className = "phone-modal";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="phone-modal-backdrop" data-close-phone-modal></div>' +
      '<div class="phone-modal-panel" role="dialog" aria-modal="true" aria-labelledby="phone-modal-title">' +
      '  <button type="button" class="phone-modal-close" data-close-phone-modal aria-label="Close">×</button>' +
      '  <p class="eyebrow accent">Text Dan</p>' +
      '  <h2 id="phone-modal-title">Continue on your phone</h2>' +
      '  <p class="phone-modal-intro">On a phone, this opens Messages with a pre-filled note. On desktop, scan the QR code with your phone camera — or copy the message and text <strong></strong> yourself.</p>' +
      '  <div class="phone-modal-qr-wrap"><img class="phone-modal-qr" alt="QR code to open text message" width="200" height="200"></div>' +
      '  <p class="phone-modal-number"></p>' +
      '  <div class="phone-modal-msg-box">' +
      '    <p class="eyebrow">Message that will send</p>' +
      '    <p class="phone-modal-msg"></p>' +
      '    <button type="button" class="btn btn-outline btn-sm" data-copy-sms>Copy message</button>' +
      "  </div>" +
      '  <div class="phone-modal-actions">' +
      '    <a class="btn btn-accent" data-sms-open href="#">Open Messages</a>' +
      '    <a class="btn btn-outline" data-tel-open href="#">Call instead</a>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-close-phone-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        wrap.hidden = true;
        document.body.classList.remove("modal-open");
      });
    });
    wrap.querySelector("[data-copy-sms]").addEventListener("click", function () {
      var text = wrap.querySelector(".phone-modal-msg").textContent || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          wrap.querySelector("[data-copy-sms]").textContent = "Copied";
        });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !wrap.hidden) {
        wrap.hidden = true;
        document.body.classList.remove("modal-open");
      }
    });
    return wrap;
  }

  function openPhoneModal() {
    var modal = ensurePhoneModal();
    var qrImg = modal.querySelector(".phone-modal-qr");
    var msgEl = modal.querySelector(".phone-modal-msg");
    var numEl = modal.querySelector(".phone-modal-number");
    var introStrong = modal.querySelector(".phone-modal-intro strong");
    var smsOpen = modal.querySelector("[data-sms-open]");
    var telOpen = modal.querySelector("[data-tel-open]");

    msgEl.textContent = smsBody;
    numEl.textContent = phone;
    if (introStrong) introStrong.textContent = phone;
    smsOpen.href = smsHref || phoneTel;
    telOpen.href = phoneTel;

    // QR encodes the SMS deep link so phone camera opens Messages pre-filled
    var qrData = encodeURIComponent(smsHref || "sms:+18647770688");
    qrImg.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=" + qrData;
    qrImg.alt = "Scan to text " + phone;

    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a.contact-phone, a[data-contact='phone']");
    if (!a) return;
    e.preventDefault();
    if (isMobile() && smsHref) {
      window.location.href = smsHref;
      return;
    }
    openPhoneModal();
  });

  /* —— Ensure email links carry subject (progressive enhancement) —— */
  document.querySelectorAll("a.contact-email, a[data-contact='email']").forEach(function (a) {
    if (emailHref) a.setAttribute("href", emailHref);
  });
})();

/* Hero image preview picker + header densify + reveal */
(function () {
  function resolveHeroSrc(src) {
    if (!src) return src;
    try {
      // Always resolve against the page URL so /transformers/preview/ works
      return new URL(src, window.location.href).href;
    } catch (e) {
      return src;
    }
  }

  function initHeroPicker() {
    var img = document.querySelector("[data-hero-img]");
    var thumbs = document.querySelectorAll("[data-hero-src]");
    var label = document.querySelector("[data-hero-active-label]");
    if (!img || !thumbs.length) return;

    function setHero(src, title, btn) {
      var resolved = resolveHeroSrc(src);
      // Force visible swap even if browser caches
      img.style.opacity = "0.35";
      var next = resolved + (resolved.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
      var probe = new Image();
      probe.onload = function () {
        img.src = resolved;
        img.style.opacity = "1";
      };
      probe.onerror = function () {
        img.src = resolved;
        img.style.opacity = "1";
      };
      probe.src = next;

      thumbs.forEach(function (t) { t.classList.remove("is-active"); });
      if (btn) btn.classList.add("is-active");
      if (label) {
        label.textContent = title || "Hero option selected";
        label.hidden = false;
      }
      try { localStorage.setItem("ep-hero-preview", src); } catch (e) {}
    }

    // Restore last preview choice
    var stored = null;
    try { stored = localStorage.getItem("ep-hero-preview"); } catch (e) {}
    if (stored) {
      var match = null;
      thumbs.forEach(function (t) {
        if (t.getAttribute("data-hero-src") === stored) match = t;
      });
      if (match) {
        setHero(stored, match.getAttribute("title") || match.getAttribute("aria-label"), match);
      }
    }

    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var src = btn.getAttribute("data-hero-src");
        if (!src) return;
        setHero(src, btn.getAttribute("title") || btn.getAttribute("aria-label"), btn);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroPicker);
  } else {
    initHeroPicker();
  }

  // Keep legacy var block structure for following code — no-op placeholders
  var img = null;
  var thumbs = [];
  if (false) {
    // removed old inline block
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var els = document.querySelectorAll(".section, .value-strip, .cat-card, .steps li, .app-card, .feature-card, .table-wrap, .cta-panel");
    els.forEach(function (el) { el.classList.add("reveal"); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("is-in"); });
    }
  }
})();
