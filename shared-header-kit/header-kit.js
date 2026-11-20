/**
 * ============================================================================
 * Standard App Header Component Kit (header-kit.js)
 * ============================================================================
 * Zero-dependency UI Controller for Modern Navigation Headers:
 * - Theme management (Light / Dark with localStorage persistence)
 * - Language switcher (Circular flags dropdown)
 * - Offline / Online connectivity tracking
 * - License badge state (Pro / Free)
 * - Version badge display
 * - Responsive title controller
 * ============================================================================
 */

(function (global) {
  "use strict";

  const HeaderKit = {
    config: {
      storagePrefix: "app_header_",
      defaultLang: "ko",
      defaultTheme: "light",
      isPro: false,
      version: "v1.0",
      onThemeChange: null,
      onLanguageChange: null,
      onLicenseClick: null,
      onHelpClick: null
    },

    state: {
      lang: "ko",
      theme: "light",
      isPro: false,
      isOnline: navigator.onLine
    },

    init(options = {}) {
      this.config = Object.assign({}, this.config, options);

      // 1. Initialize Theme
      const savedTheme = localStorage.getItem(this.config.storagePrefix + "theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.state.theme = savedTheme || (prefersDark ? "dark" : this.config.defaultTheme);
      this.applyTheme(this.state.theme);

      // 2. Initialize Language
      const savedLang = localStorage.getItem(this.config.storagePrefix + "lang");
      this.state.lang = savedLang || this.config.defaultLang;

      // 3. Initialize License
      this.state.isPro = !!this.config.isPro;
      this.updateLicenseBadge();

      // 4. Initialize Version
      if (this.config.version) {
        this.setVersion(this.config.version);
      }

      // 5. Bind DOM Events
      this.bindEvents();
      this.updateNetworkStatus();

      return this;
    },

    bindEvents() {
      // Dark Mode Toggle
      const themeBtn = document.getElementById("btnDarkMode");
      if (themeBtn) {
        themeBtn.addEventListener("click", () => {
          const next = this.state.theme === "dark" ? "light" : "dark";
          this.setTheme(next);
        });
      }

      // License Badge Click
      const proBadge = document.getElementById("proBadge");
      if (proBadge) {
        proBadge.addEventListener("click", () => {
          if (typeof this.config.onLicenseClick === "function") {
            this.config.onLicenseClick(this.state.isPro);
          }
        });
      }

      // Help Button Click
      const helpBtn = document.getElementById("btnManual") || document.getElementById("btnHelp");
      if (helpBtn) {
        helpBtn.addEventListener("click", () => {
          if (typeof this.config.onHelpClick === "function") {
            this.config.onHelpClick();
          }
        });
      }

      // Language Dropdown
      const langWrap = document.querySelector(".lang-dropdown-wrap");
      const langBtn = document.getElementById("btnLangDropdown");
      const langMenu = document.getElementById("langDropdownMenu");

      if (langBtn && langWrap && langMenu) {
        langBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          langWrap.classList.toggle("open");
          langMenu.classList.toggle("hidden");
        });

        document.querySelectorAll(".lang-item").forEach(item => {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            const selectedLang = item.getAttribute("data-lang");
            this.setLanguage(selectedLang);
            langWrap.classList.remove("open");
            langMenu.classList.add("hidden");
          });
        });

        document.addEventListener("click", (e) => {
          if (!langWrap.contains(e.target)) {
            langWrap.classList.remove("open");
            langMenu.classList.add("hidden");
          }
        });
      }

      // App Logo Click: Scroll Top & Enlarge Logo
      const logoBox = document.querySelector(".app-logo-box");
      if (logoBox) {
        logoBox.style.cursor = "pointer";
        logoBox.addEventListener("click", (e) => {
          e.stopPropagation();
          window.scrollTo({ top: 0, behavior: "smooth" });
          const img = logoBox.querySelector("img");
          if (img && img.src) {
            let overlay = document.getElementById("hkLogoPreviewOverlay");
            if (!overlay) {
              overlay = document.createElement("div");
              overlay.id = "hkLogoPreviewOverlay";
              overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.62);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);";
              overlay.innerHTML = `<div style="background:#ffffff;border-radius:18px;padding:18px;box-shadow:0 18px 48px rgba(0,0,0,0.32);max-width:340px;width:90%;text-align:center;"><img id="hkLogoPreviewImg" src="" alt="" style="width:240px;height:240px;object-fit:contain;border-radius:14px;display:block;margin:0 auto;" /><div style="margin-top:12px;"><button type="button" id="hkLogoPreviewClose" style="padding:6px 18px;border:none;border-radius:8px;background:#ff7f00;color:#fff;font-weight:800;font-size:12.5px;cursor:pointer;">닫기 / Close</button></div></div>`;
              document.body.appendChild(overlay);
              overlay.addEventListener("click", (ev) => {
                if (ev.target === overlay || ev.target.id === "hkLogoPreviewClose") overlay.style.display = "none";
              });
              document.addEventListener("keydown", (ev) => {
                if (ev.key === "Escape" && overlay.style.display !== "none") overlay.style.display = "none";
              });
            }
            const imgEl = document.getElementById("hkLogoPreviewImg");
            if (imgEl) { imgEl.src = img.src; imgEl.alt = img.alt || "App Logo"; }
            overlay.style.display = "flex";
            if (window._hkLogoTimer) clearTimeout(window._hkLogoTimer);
            window._hkLogoTimer = setTimeout(() => { overlay.style.display = "none"; }, 2000);
          }
        });
      }

      // Online / Offline Listeners
      window.addEventListener("online", () => {
        this.state.isOnline = true;
        this.updateNetworkStatus();
      });
      window.addEventListener("offline", () => {
        this.state.isOnline = false;
        this.updateNetworkStatus();
      });
    },

    setTheme(theme) {
      this.state.theme = theme;
      localStorage.setItem(this.config.storagePrefix + "theme", theme);
      this.applyTheme(theme);
      if (typeof this.config.onThemeChange === "function") {
        this.config.onThemeChange(theme);
      }
    },

    applyTheme(theme) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    setLanguage(lang) {
      this.state.lang = lang;
      localStorage.setItem(this.config.storagePrefix + "lang", lang);

      // Update current flag icon
      const curFlag = document.getElementById("currentFlagIcon");
      if (curFlag) {
        const flagImg = curFlag.querySelector("img");
        if (flagImg) {
          flagImg.src = `icons/flag_${lang}.png`;
          flagImg.alt = lang.toUpperCase();
        }
      }

      // Update active class on dropdown items
      document.querySelectorAll(".lang-item").forEach(item => {
        item.classList.toggle("active", item.getAttribute("data-lang") === lang);
      });

      if (typeof this.config.onLanguageChange === "function") {
        this.config.onLanguageChange(lang);
      }
    },

    setLicense(isPro) {
      this.state.isPro = !!isPro;
      this.updateLicenseBadge();
    },

    updateLicenseBadge() {
      const badge = document.getElementById("proBadge");
      if (!badge) return;

      if (this.state.isPro) {
        badge.textContent = "Pro";
        badge.classList.add("is-pro");
        badge.title = "License: PRO Active";
      } else {
        badge.textContent = "Free";
        badge.classList.remove("is-pro");
        badge.title = "License: Free Version";
      }
    },

    setVersion(verText) {
      const verBadge = document.getElementById("appVersionBadge");
      if (verBadge) {
        verBadge.textContent = verText;
        verBadge.title = "App Version " + verText;
      }
    },

    setTitle(fullTitle, shortTitle) {
      const fullEl = document.querySelector("#appTitle .title-full");
      const shortEl = document.querySelector("#appTitle .title-short");
      if (fullEl) fullEl.textContent = fullTitle;
      if (shortEl) shortEl.textContent = shortTitle;
      document.title = fullTitle;
    },

    updateNetworkStatus() {
      const badge = document.getElementById("netStatusBadge");
      if (!badge) return;

      if (this.state.isOnline) {
        badge.classList.remove("offline");
        badge.classList.add("online");
        badge.title = "Online & Offline Ready";
      } else {
        badge.classList.remove("online");
        badge.classList.add("offline");
        badge.title = "Offline Mode";
      }
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HeaderKit;
  } else {
    global.HeaderKit = HeaderKit;
  }
})(typeof window !== "undefined" ? window : this);
