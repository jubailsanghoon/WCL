/**
 * WCL - Main UI Application Controller
 * Handles user interactions, reactivity, language switching, theme toggling, and calculations.
 */

const FLAGS_SVG = {
  ko: `<img src="icons/flag_ko.png" alt="KO" class="flag-img" />`,
  en: `<img src="icons/flag_en.png" alt="EN" class="flag-img" />`,
  zh: `<img src="icons/flag_zh.png" alt="ZH" class="flag-img" />`,
  ja: `<img src="icons/flag_ja.png" alt="JA" class="flag-img" />`,
  es: `<img src="icons/flag_es.png" alt="ES" class="flag-img" />`
};

const App = {
  state: {
    lang: "ko",
    theme: "light",
    material: "carbon",
    shape: "plate",
    dims: { W: 3000, t: 20, L: 3 }, // initial sample
    qty: 1,
    angle: 45, // Default 45° for safety
    craneType: "mobile",
    records: [],
    plan: "free"
  },

  // Temporary buffer for dual-unit typing
  dualBuffer: {},

  init() {
    // 1. Load settings & records
    const savedTheme = localStorage.getItem("HI_DARK_MODE");
    if (savedTheme === "true") {
      this.state.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      this.state.theme = "light";
      document.documentElement.classList.remove("dark");
    }

    const savedLang = localStorage.getItem("mwp_lang_v1");
    if (savedLang && (typeof I18N !== "undefined" && I18N[savedLang])) {
      this.state.lang = savedLang;
    }

    this.state.plan = (typeof LicenseManager !== "undefined") ? LicenseManager.syncSavedLicense() : DataStore.getPlan();
    this.state.records = DataStore.getRecords();

    // Restore last user selections if available
    const last = DataStore.getLastState();
    if (last) {
      if (last.material && MATERIAL_KEYS.includes(last.material)) {
        this.state.material = last.material;
      }
      if (last.shape && SHAPE_KEYS.includes(last.shape)) {
        this.state.shape = last.shape;
      }
      if (last.dims && typeof last.dims === "object" && Object.keys(last.dims).length > 0) {
        this.state.dims = { ...last.dims };
      }
      if (last.qty != null && Number(last.qty) > 0) {
        this.state.qty = Number(last.qty);
      }
      if (last.angle != null && [0, 30, 45, 60, 90, 120].includes(Number(last.angle))) {
        this.state.angle = Number(last.angle);
      }
      if (last.craneType && ["mobile", "overhead", "marine"].includes(last.craneType)) {
        this.state.craneType = last.craneType;
      }
    }

    // 2. Setup DOM Event Listeners
    this.bindEvents();

    // Synchronize initial active classes on angle buttons
    document.querySelectorAll(".angle-btn").forEach(btn => {
      const a = Number(btn.getAttribute("data-angle"));
      btn.classList.toggle("active", a === this.state.angle);
    });

    // Synchronize initial active classes on crane buttons
    document.querySelectorAll(".crane-btn").forEach(btn => {
      const t = btn.getAttribute("data-crane");
      btn.classList.toggle("active", t === this.state.craneType);
    });

    // 3. Render initial views
    this.applyLanguage();
    this.renderMaterialList();
    this.renderShapeList();
    this.renderDimensionFields();
    this.updateCalculation();
    this.renderRecordsTable();
    this.updatePlanBadge();
  },

  t(key) {
    const langObj = (typeof I18N !== "undefined" && I18N[this.state.lang]) || {};
    return langObj[key] || key;
  },

  bindEvents() {
    // Dark mode toggle
    const darkBtn = document.getElementById("btnDarkMode");
    if (darkBtn) {
      darkBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Circular Flag Language Dropdown
    const langBtn = document.getElementById("btnLangDropdown");
    const langMenu = document.getElementById("langDropdownMenu");
    if (langBtn && langMenu) {
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !langMenu.classList.contains("hidden");
        if (isOpen) {
          langMenu.classList.add("hidden");
          langBtn.classList.remove("open");
        } else {
          langMenu.classList.remove("hidden");
          langBtn.classList.add("open");
        }
      });

      document.querySelectorAll(".lang-item").forEach(item => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const lang = item.getAttribute("data-lang");
          this.setLanguage(lang);
          langMenu.classList.add("hidden");
          langBtn.classList.remove("open");
        });
      });

      document.addEventListener("click", (e) => {
        if (!langMenu.classList.contains("hidden") && !langMenu.contains(e.target) && e.target !== langBtn) {
          langMenu.classList.add("hidden");
          langBtn.classList.remove("open");
        }
      });
    }

    // Manual modal
    const manualBtn = document.getElementById("btnManual");
    if (manualBtn) {
      manualBtn.addEventListener("click", () => this.openManualModal());
    }

    // Close modal
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => this.closeModal());
    }
    const modalOverlay = document.getElementById("subPageModal");
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
    }

    // Angle buttons
    document.querySelectorAll(".angle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const val = Number(btn.getAttribute("data-angle"));
        this.setAngle(val);
      });
    });

    // Crane buttons
    document.querySelectorAll(".crane-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const type = btn.getAttribute("data-crane");
        this.setCraneType(type);
      });
    });

    // Save button
    const saveBtn = document.getElementById("btnSave");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveCurrentRecord());
    }

    // PDF 인양작업계획서 버튼 (PRO 전용 특권)
    const planBtn = document.getElementById("btnExportPlan");
    if (planBtn) {
      planBtn.addEventListener("click", () => this.handleExportLiftingPlan());
    }

    // Export CSV
    const exportBtn = document.getElementById("btnExportCSV");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => DataStore.exportCSV(this.state.records));
    }

    // Clear all records
    const clearBtn = document.getElementById("btnClearAll");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (window.confirm(this.t("confirmDelete"))) {
          this.state.records = DataStore.clearAllRecords();
          this.renderRecordsTable();
        }
      });
    }

    // Pro badge click to upgrade/toggle
    const proBadge = document.getElementById("proBadge");
    if (proBadge) {
      proBadge.addEventListener("click", () => this.openUpgradeModal());
    }

    // Safety guidelines unlock button
    const btnUnlockSafety = document.getElementById("btnUnlockSafety");
    if (btnUnlockSafety) {
      btnUnlockSafety.addEventListener("click", () => this.openUpgradeModal("SAFETY"));
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    this.state.theme = isDark ? "dark" : "light";
    try {
      localStorage.setItem("HI_DARK_MODE", isDark ? "true" : "false");
    } catch (e) {}
    this.renderDiagram();
  },

  setLanguage(lang) {
    if (!I18N[lang]) return;
    this.state.lang = lang;
    try {
      localStorage.setItem("mwp_lang_v1", lang);
    } catch (e) {}
    this.applyLanguage();
    this.renderMaterialList();
    this.renderShapeList();
    this.renderDimensionFields();
    this.updateCalculation();
    this.renderRecordsTable();
  },

  applyLanguage() {
    const t = (key) => this.t(key);
    // Dynamic text replacements
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    // Dynamic title attribute replacements
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      el.setAttribute("title", t(key));
    });

    // Header title (Full & Short responsive titles)
    const fullTitleEl = document.querySelector("#appTitle .title-full");
    if (fullTitleEl) fullTitleEl.textContent = t("appTitleFull");
    const shortTitleEl = document.querySelector("#appTitle .title-short");
    if (shortTitleEl) shortTitleEl.textContent = t("appTitleShort");
    if (!fullTitleEl && !shortTitleEl) {
      const appTitleEl = document.getElementById("appTitle");
      if (appTitleEl) appTitleEl.textContent = t("appName");
    }
    document.title = t("appTitleFull");

    // Update Pro badge & Plan button text in current language
    this.updatePlanBadge();

    // Update circular flag icon & dropdown items
    const curFlagEl = document.getElementById("currentFlagIcon");
    if (curFlagEl && FLAGS_SVG[this.state.lang]) {
      curFlagEl.innerHTML = FLAGS_SVG[this.state.lang];
    }
    document.querySelectorAll(".lang-item").forEach(item => {
      const l = item.getAttribute("data-lang");
      item.classList.toggle("active", l === this.state.lang);
      const iconEl = item.querySelector(".flag-icon-circle");
      if (iconEl && FLAGS_SVG[l]) {
        iconEl.innerHTML = FLAGS_SVG[l];
      }
    });
  },

  // ----------------------------------------------------
  // MATERIALS (Dropdown Selector)
  // ----------------------------------------------------
  renderMaterialList() {
    const select = document.getElementById("materialSelectDropdown");
    const container = document.getElementById("materialGrid");
    const matBadge = document.getElementById("matBadge");

    if (select) {
      select.innerHTML = MATERIAL_KEYS.map(key => {
        const meta = MATERIAL_META[key];
        const isSelected = this.state.material === key ? "selected" : "";
        const densityLabel = meta ? meta.density : "";
        const stdLabel = meta ? meta.std : "";
        return `<option value="${key}" ${isSelected}>${this.t(key)} (${densityLabel}) - ${stdLabel}</option>`;
      }).join("");

      select.value = this.state.material;

      if (!select.dataset.bound) {
        select.dataset.bound = "true";
        select.addEventListener("change", (e) => {
          this.state.material = e.target.value;
          this.updateCalculation();
          this.saveUserState();
          this.renderMaterialList();
        });
      }
    }

    if (matBadge && MATERIAL_META[this.state.material]) {
      const curMeta = MATERIAL_META[this.state.material];
      matBadge.textContent = curMeta.density;
    }

    if (container) {
      container.innerHTML = MATERIAL_KEYS.map(key => {
        const meta = MATERIAL_META[key];
        const isActive = this.state.material === key;
        const isDefault = key === "carbon" ? `<span class="mat-default-tag">DEFAULT</span>` : "";
        return `
          <div class="material-card ${isActive ? "active" : ""}" data-mat="${key}">
            <div class="mat-title-row">
              <div class="mat-name-wrap">
                <span class="mat-dot" style="background-color: ${meta.dot};"></span>
                <span class="mat-name">${this.t(key)}</span>
              </div>
              ${isDefault}
            </div>
            <div class="mat-density">${meta.density}</div>
            <div class="mat-std">${meta.std}</div>
          </div>
        `;
      }).join("");

      container.querySelectorAll(".material-card").forEach(el => {
        el.addEventListener("click", () => {
          this.state.material = el.getAttribute("data-mat");
          this.renderMaterialList();
          this.updateCalculation();
          this.saveUserState();
        });
      });
    }
  },

  // ----------------------------------------------------
  // SHAPES (Dropdown Selector)
  // ----------------------------------------------------
  renderShapeList() {
    const select = document.getElementById("shapeSelectDropdown");
    const container = document.getElementById("shapeGrid");

    if (select) {
      select.innerHTML = SHAPE_KEYS.map(key => {
        const isSelected = this.state.shape === key ? "selected" : "";
        return `<option value="${key}" ${isSelected}>${this.t(key)}</option>`;
      }).join("");

      select.value = this.state.shape;

      if (!select.dataset.bound) {
        select.dataset.bound = "true";
        select.addEventListener("change", (e) => {
          this.setShape(e.target.value);
        });
      }
    }

    if (container) {
      container.innerHTML = SHAPE_KEYS.map(key => {
        const isActive = this.state.shape === key;
        return `
          <button type="button" class="shape-btn ${isActive ? "active" : ""}" data-shape="${key}">
            ${this.t(key)}
          </button>
        `;
      }).join("");

      container.querySelectorAll(".shape-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setShape(btn.getAttribute("data-shape"));
        });
      });
    }
  },

  setShape(shapeKey) {
    this.state.shape = shapeKey;
    const defaultDimsByShape = {
      plate: { W: 3000, t: 20, L: 3 },
      hbeam: { B: 200, H: 200, tf: 12, tw: 8, L: 6 },
      angle: { a: 100, b: 100, t: 10, L: 6 },
      tbar: { B: 150, H: 150, tf: 12, tw: 9, L: 6 },
      bulb: { H: 200, t: 9, L: 6 },
      squareBar: { W: 100, H: 100, L: 6 },
      roundBar: { D: 100, L: 6 },
      tubular: { D: 216.3, t: 8.2, L: 6 },
      squareTube: { W: 150, H: 150, t: 6, L: 6 },
      box: { W: 1000, H: 800, D: 600, t: 12, L: 6 }
    };
    const specs = WclCalc.getShapeDimensionSpecs(shapeKey);
    const shapeDef = defaultDimsByShape[shapeKey] || {};
    specs.forEach(s => {
      if (this.state.dims[s.key] == null || this.state.dims[s.key] === "") {
        this.state.dims[s.key] = shapeDef[s.key] != null ? shapeDef[s.key] : 10;
      }
    });
    this.renderShapeList();
    this.renderDimensionFields();
    this.updateCalculation();
  },

  // ----------------------------------------------------
  // DIMENSION INPUTS & DUAL UNITS
  // ----------------------------------------------------
  renderDimensionFields() {
    const container = document.getElementById("dimFieldsGrid");
    if (!container) return;

    const specs = WclCalc.getShapeDimensionSpecs(this.state.shape);

    let html = `
      <!-- Qty Stepper -->
      <div class="field-wrapper">
        <label class="field-lbl">${this.t("qty")}</label>
        <div class="stepper-box">
          <div class="stepper-info">
            <input type="number" id="inputQty" min="1" step="1" value="${this.state.qty}" />
          </div>
          <div class="stepper-btns">
            <button type="button" class="step-btn" id="qtyPlus">+</button>
            <button type="button" class="step-btn" id="qtyMinus">-</button>
          </div>
        </div>
      </div>
    `;

    specs.forEach(spec => {
      const currentVal = this.state.dims[spec.key] != null ? this.state.dims[spec.key] : "";
      const label = this.t(spec.labelKey);

      if (spec.isDualUnit) {
        // Dual Unit Box (M ⇄ mm)
        const isL = spec.key === "L";
        const curNum = Number(currentVal) || 0;
        const valM = currentVal === "" ? "" : (isL ? curNum : parseFloat((curNum / 1000).toFixed(6)));
        const valMm = currentVal === "" ? "" : (isL ? parseFloat((curNum * 1000).toFixed(3)) : curNum);

        html += `
          <div class="field-wrapper full-col">
            <label class="field-lbl">${label.replace(/\s*,\s*(mm|M|m)\)/, ")")} · M ⇄ mm</label>
            <div class="dual-unit-wrap">
              <div class="unit-field">
                <input type="number" step="any" min="0" class="unit-input dual-input" data-key="${spec.key}" data-unit="m" value="${valM}" placeholder="0" />
                <span class="unit-tag">M</span>
              </div>
              <div class="unit-field">
                <input type="number" step="any" min="0" class="unit-input dual-input" data-key="${spec.key}" data-unit="mm" value="${valMm}" placeholder="0" />
                <span class="unit-tag">mm</span>
              </div>
            </div>
            ${isL ? `<div id="lengthWarnBox" class="length-warn-box hidden"></div>` : ""}
          </div>
        `;
      } else {
        // Standard Stepper Box (mm)
        html += `
          <div class="field-wrapper">
            <label class="field-lbl">${label}</label>
            <div class="stepper-box">
              <div class="stepper-info">
                <input type="number" step="any" min="0" class="dim-input" data-key="${spec.key}" value="${currentVal}" placeholder="0" />
              </div>
              <div class="stepper-btns">
                <button type="button" class="step-btn step-plus" data-key="${spec.key}">+</button>
                <button type="button" class="step-btn step-minus" data-key="${spec.key}">-</button>
              </div>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    this.renderDiagram();
    this.bindDimensionInputEvents();
  },

  renderDiagram() {
    const box = document.getElementById("diagramBox");
    if (!box) return;
    const isDark = document.documentElement.classList.contains("dark");
    box.innerHTML = ShapeDiagrams.render(this.state.shape, isDark, this.state.lang);
  },

  bindDimensionInputEvents() {
    // Qty
    const qInput = document.getElementById("inputQty");
    if (qInput) {
      qInput.addEventListener("input", (e) => {
        this.state.qty = Math.max(1, parseInt(e.target.value, 10) || 1);
        this.updateCalculation();
      });
      document.getElementById("qtyPlus")?.addEventListener("click", () => {
        this.state.qty = (Number(this.state.qty) || 1) + 1;
        qInput.value = this.state.qty;
        this.updateCalculation();
      });
      document.getElementById("qtyMinus")?.addEventListener("click", () => {
        this.state.qty = Math.max(1, (Number(this.state.qty) || 1) - 1);
        qInput.value = this.state.qty;
        this.updateCalculation();
      });
    }

    // Standard Dim Inputs
    document.querySelectorAll(".dim-input").forEach(input => {
      const key = input.getAttribute("data-key");
      input.addEventListener("input", (e) => {
        const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
        this.state.dims[key] = val;
        this.updateCalculation();
      });
    });

    document.querySelectorAll(".step-plus").forEach(btn => {
      const key = btn.getAttribute("data-key");
      btn.addEventListener("click", () => {
        const cur = Number(this.state.dims[key]) || 0;
        const next = Math.round((cur + 1) * 100) / 100;
        this.state.dims[key] = next;
        const input = document.querySelector(`.dim-input[data-key="${key}"]`);
        if (input) input.value = next;
        this.updateCalculation();
      });
    });

    document.querySelectorAll(".step-minus").forEach(btn => {
      const key = btn.getAttribute("data-key");
      btn.addEventListener("click", () => {
        const cur = Number(this.state.dims[key]) || 0;
        const next = Math.max(0, Math.round((cur - 1) * 100) / 100);
        this.state.dims[key] = next;
        const input = document.querySelector(`.dim-input[data-key="${key}"]`);
        if (input) input.value = next;
        this.updateCalculation();
      });
    });

    // Dual Unit Inputs (M ⇄ mm)
    document.querySelectorAll(".dual-input").forEach(input => {
      const key = input.getAttribute("data-key");
      const unit = input.getAttribute("data-unit");
      const isL = key === "L";

      input.addEventListener("input", (e) => {
        const rawVal = e.target.value;
        const n = rawVal === "" ? "" : Math.max(0, Number(rawVal));

        // Save internal model (L is stored in M, others like W in mm)
        if (n === "") {
          this.state.dims[key] = "";
        } else {
          if (unit === "m") {
            this.state.dims[key] = isL ? n : parseFloat((n * 1000).toFixed(6));
          } else {
            this.state.dims[key] = isL ? parseFloat((n / 1000).toFixed(9)) : n;
          }
        }

        // Sync sibling input field
        const siblingUnit = unit === "m" ? "mm" : "m";
        const sibling = document.querySelector(`.dual-input[data-key="${key}"][data-unit="${siblingUnit}"]`);
        if (sibling && n !== "") {
          if (unit === "m") {
            sibling.value = parseFloat((n * 1000).toFixed(3));
          } else {
            sibling.value = parseFloat((n / 1000).toFixed(6));
          }
        } else if (sibling && n === "") {
          sibling.value = "";
        }

        this.updateCalculation();
      });
    });

    this.checkLengthWarning();
  },

  // ----------------------------------------------------
  // CALCULATION & GEAR DISPLAY
  // ----------------------------------------------------
  updateCalculation() {
    const { shape, dims, qty, material, angle, craneType } = this.state;
    const calc = WclCalc.calculateWeightAndVolume(shape, dims, qty, material);
    const gear = WclCalc.calculateRiggingGear(calc.wKg, angle, craneType, (typeof I18N !== "undefined" && I18N[this.state.lang]) || {});

    // 1. Result values
    const resTonEl = document.getElementById("resWeightTon");
    const resKgEl = document.getElementById("resWeightKg");
    const resVolEl = document.getElementById("resVolume");

    if (resTonEl) resTonEl.textContent = calc.wTon.toLocaleString("ko-KR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    if (resKgEl) resKgEl.textContent = calc.wKg.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (resVolEl) resVolEl.textContent = calc.volM3.toLocaleString("ko-KR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

    // 2. Rigging cards
    const gearShackleEl = document.getElementById("gearShackle");
    const gearShackleWllEl = document.getElementById("gearShackleWll");
    if (gearShackleEl) gearShackleEl.textContent = gear.shackle;
    if (gearShackleWllEl) gearShackleWllEl.textContent = `SWL ≥ ${gear.shackleWll}t`;

    const gearWireEl = document.getElementById("gearWire");
    const gearWireWllEl = document.getElementById("gearWireWll");
    if (gearWireEl) gearWireEl.textContent = gear.wireRope;
    if (gearWireWllEl) gearWireWllEl.textContent = `SWL ≥ ${gear.wireRopeWll}t`;

    const gearChainEl = document.getElementById("gearChain");
    const gearChainWllEl = document.getElementById("gearChainWll");
    if (gearChainEl) gearChainEl.textContent = gear.chainSling;
    if (gearChainWllEl) gearChainWllEl.textContent = `SWL ≥ ${gear.chainSlingWll}t`;

    const gearTextileEl = document.getElementById("gearTextile");
    const gearTextileWllEl = document.getElementById("gearTextileWll");
    if (gearTextileEl) gearTextileEl.textContent = gear.textileSling;
    if (gearTextileWllEl) gearTextileWllEl.textContent = `SWL ≥ ${gear.textileSlingWll}t`;

    // 3. Crane
    const craneSwlEl = document.getElementById("craneSwlVal");
    if (craneSwlEl) craneSwlEl.textContent = `${gear.craneSwl} ton (Factor ${gear.craneFactor})`;

    // 4. Angle Warning Box
    const warnBox = document.getElementById("angleWarnBox");
    if (warnBox) {
      if (angle <= 60) {
        warnBox.className = "angle-warn-box ok";
        warnBox.textContent = `✓ ${this.t("angleWarn60")}`;
      } else if (angle <= 90) {
        warnBox.className = "angle-warn-box warn";
        warnBox.textContent = `⚠ ${this.t("angleWarn90")}`;
      } else {
        warnBox.className = "angle-warn-box danger";
        warnBox.textContent = `🔴 ${this.t("angleWarn120")}`;
      }
    }

    // 5. Length Warning Check
    this.checkLengthWarning();

    // Persist last used user selections
    this.saveUserState();
  },

  checkLengthWarning() {
    const box = document.getElementById("lengthWarnBox");
    if (!box) return;

    const L = Number(this.state.dims.L) || 0;
    // Standard transport / commercial structural steel lengths are <= 24m~30m.
    // If L >= 30, it is very likely the user mistakenly entered mm (e.g. 3000mm = 3m, 6000mm = 6m)
    if (L >= 30) {
      const suggestedM = parseFloat((L / 1000).toFixed(6));
      const msgPattern = this.t("warnExcessiveLength") || "입력 길이({val}m)가 일반 규격(30m)보다 큽니다. 혹시 mm 단위({val}mm → {sug}m)인가요?";
      const btnPattern = this.t("btnConvertLength") || "👉 {sug}m 로 자동 변환";

      const msg = msgPattern
        .replace(/{val}/g, L.toLocaleString())
        .replace(/{sug}/g, suggestedM.toLocaleString());
      const btnText = btnPattern
        .replace(/{sug}/g, suggestedM.toLocaleString());

      box.innerHTML = `
        <div class="length-warn-content">
          <span class="length-warn-icon">⚠️</span>
          <div class="length-warn-text">
            <span>${msg}</span>
            <button type="button" class="btn-convert-length" id="btnAutoConvertLength">${btnText}</button>
          </div>
        </div>
      `;
      box.classList.remove("hidden");

      const btn = document.getElementById("btnAutoConvertLength");
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          this.state.dims.L = suggestedM;
          const inputM = document.querySelector(`.dual-input[data-key="L"][data-unit="m"]`);
          if (inputM) inputM.value = suggestedM;
          const inputMm = document.querySelector(`.dual-input[data-key="L"][data-unit="mm"]`);
          if (inputMm) inputMm.value = parseFloat((suggestedM * 1000).toFixed(3));
          this.updateCalculation();
          box.classList.add("hidden");
        };
      }
    } else {
      box.classList.add("hidden");
      box.innerHTML = "";
    }
  },

  saveUserState() {
    try {
      DataStore.setLastState({
        material: this.state.material,
        shape: this.state.shape,
        dims: this.state.dims,
        qty: this.state.qty,
        angle: this.state.angle,
        craneType: this.state.craneType
      });
    } catch (e) {}
  },

  setAngle(deg) {
    this.state.angle = deg;
    document.querySelectorAll(".angle-btn").forEach(btn => {
      const a = Number(btn.getAttribute("data-angle"));
      btn.classList.toggle("active", a === deg);
    });
    this.updateCalculation();
  },

  setCraneType(type) {
    this.state.craneType = type;
    document.querySelectorAll(".crane-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-crane") === type);
    });
    this.updateCalculation();
  },

  // ----------------------------------------------------
  // RECORD MANAGEMENT & TABLE
  // ----------------------------------------------------
  saveCurrentRecord() {
    const calc = WclCalc.calculateWeightAndVolume(this.state.shape, this.state.dims, this.state.qty, this.state.material);
    if (calc.wKg <= 0) {
      alert(this.t("enterDimensionsFirst"));
      return;
    }

    const gear = WclCalc.calculateRiggingGear(
      calc.wKg,
      this.state.angle,
      this.state.craneType,
      (typeof I18N !== "undefined" && I18N[this.state.lang]) || {}
    );

    const res = DataStore.saveRecord({
      material: this.state.material,
      shape: this.state.shape,
      dims: { ...this.state.dims },
      qty: this.state.qty,
      wKg: calc.wKg,
      volMm3: calc.volMm3,
      angle: this.state.angle,
      effLoadTon: gear.effLoadTon,
      craneType: this.state.craneType,
      gear: {
        shackle: gear.shackle,
        shackleWll: gear.shackleWll,
        wireRope: gear.wireRope,
        wireRopeWll: gear.wireRopeWll,
        chainSling: gear.chainSling,
        chainSlingWll: gear.chainSlingWll,
        textileSling: gear.textileSling,
        textileSlingWll: gear.textileSlingWll,
        craneType: gear.craneType,
        craneFactor: gear.craneFactor,
        craneSwl: gear.craneSwl
      }
    });

    if (!res.success) {
      this.openUpgradeModal("DATA_LIMIT");
      return;
    }

    this.state.records = DataStore.getRecords();
    this.renderRecordsTable();

    // Visual feedback
    const saveBtn = document.getElementById("btnSave");
    if (saveBtn) {
      const orig = saveBtn.textContent;
      saveBtn.textContent = this.t("saveSuccess");
      saveBtn.style.backgroundColor = "var(--pro-green)";
      setTimeout(() => {
        saveBtn.textContent = orig;
        saveBtn.style.backgroundColor = "";
      }, 1000);
    }
  },

  renderRecordsTable() {
    const tbody = document.getElementById("recordsTbody");
    const countEl = document.getElementById("recordsCount");
    const limit = DataStore.getPlanLimit();

    if (countEl) {
      countEl.textContent = this.state.plan === "pro" ? `(${this.state.records.length} / ∞)` : `(${this.state.records.length}/${limit})`;
    }
    if (!tbody) return;

    if (this.state.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-records">${this.t("noSaved")}</td></tr>`;
      return;
    }

    tbody.innerHTML = this.state.records.map((r, idx) => {
      const wKg = r.wKg != null ? Number(r.wKg).toFixed(2) : "0.00";
      const wTon = (Number(wKg) / 1000).toFixed(3);
      const angle = r.angle != null ? r.angle : 0;
      const gear = r.gear || {};
      const craneTypeStr = r.craneType ? this.t(r.craneType) : (gear.craneType ? this.t(gear.craneType) : "-");
      const craneSwl = gear.craneSwl ? `SWL ≥ ${gear.craneSwl}t` : "-";

      // Rigging gear brief (Shackle & Wire Rope)
      const gearBrief = gear.shackle ? `${gear.shackle} · ${gear.wireRope || ""}` : "-";

      return `
        <tr data-id="${r.id}">
          <td class="rec-cell-idx"><span>#${idx + 1}</span><span class="rec-mobile-date">${r.savedAt || "-"}</span></td>
          <td class="rec-cell-date" data-label="${this.t("savedAt")}">${r.savedAt || "-"}</td>
          <td class="rec-cell-mat" data-label="${this.t("material")}"><strong>${this.t(r.material)}</strong></td>
          <td class="rec-cell-shape" data-label="${this.t("shape")}">${this.t(r.shape)}</td>
          <td class="rec-cell-ton" data-label="TON" style="text-align:right; font-weight:800; color:var(--brand-orange);">${wTon} t</td>
          <td class="rec-cell-kg" data-label="KG" style="text-align:right; font-weight:800; color:var(--pro-green);">${wKg} kg</td>
          <td class="rec-cell-angle" data-label="${this.t("angleLabel")}" style="font-weight:800; color:#2563eb;">${angle}°</td>
          <td class="rec-cell-gear" data-label="${this.t("riggingSummary")}" style="font-size:12px; font-weight:700;">${gearBrief}</td>
          <td class="rec-cell-crane" data-label="${this.t("craneSummary")}" style="font-size:12px; font-weight:800; color:#dc2626;">${craneTypeStr} (${craneSwl})</td>
          <td class="rec-action-cell" onclick="event.stopPropagation();">
            <button type="button" class="tbl-btn edit" data-action="edit" data-id="${r.id}" title="${this.t('editRecord')}">
              ✏️ ${this.t('edit')}
            </button>
            <button type="button" class="tbl-btn load" data-action="load" data-id="${r.id}" title="${this.t('loadToCalc')}">
              📥
            </button>
            <button type="button" class="tbl-btn del" data-action="del" data-id="${r.id}" title="${this.t('deleteRecord')}">
              🗑
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Clicking a row restores inputs (재질, 형상, 치수, 수량, 인양각도, 크레인형식 일괄 복원)
    tbody.querySelectorAll("tr").forEach(tr => {
      tr.addEventListener("click", () => {
        const id = tr.getAttribute("data-id");
        this.loadRecordToCalculator(id);
      });
    });

    // Action button listeners
    tbody.querySelectorAll(".tbl-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");
        if (action === "edit") {
          this.openEditRecordModal(id);
        } else if (action === "load") {
          this.loadRecordToCalculator(id);
        } else if (action === "del") {
          if (window.confirm(this.t("confirmDelete") || "삭제하시겠습니까?")) {
            this.state.records = DataStore.deleteRecord(id);
            this.renderRecordsTable();
          }
        }
      });
    });
  },

  loadRecordToCalculator(id) {
    const rec = this.state.records.find(item => item.id === id);
    if (rec) {
      this.state.material = rec.material;
      this.state.shape = rec.shape;
      this.state.dims = { ...rec.dims };
      this.state.qty = rec.qty || 1;
      if (rec.angle != null) this.setAngle(rec.angle);
      if (rec.craneType) this.setCraneType(rec.craneType);
      this.renderMaterialList();
      this.renderShapeList();
      this.renderDimensionFields();
      this.updateCalculation();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  openEditRecordModal(id) {
    const rec = DataStore.getRecordById(id);
    if (!rec) return;

    const title = this.t("editModalTitle");
    const shapeSpecs = WclCalc.getShapeDimensionSpecs(rec.shape);
    const materials = WclCalc.MATERIAL_KEYS || ["carbon", "stainless", "aluminum", "copper"];

    let editMaterial = rec.material || "carbon";
    let editDims = { ...rec.dims };
    let editQty = rec.qty || 1;
    let editAngle = rec.angle != null ? rec.angle : 0;
    let editCrane = rec.craneType || "mobile";

    const computeEditCalc = () => {
      const calc = WclCalc.calculateWeightAndVolume(rec.shape, editDims, editQty, editMaterial);
      const gear = WclCalc.calculateRiggingGear(calc.wKg, editAngle, editCrane, (typeof I18N !== "undefined" && I18N[this.state.lang]) || {});
      return { calc, gear };
    };

    const buildUpdatedPayload = () => {
      const { calc, gear } = computeEditCalc();
      return {
        material: editMaterial,
        dims: { ...editDims },
        qty: editQty,
        wKg: calc.wKg,
        volMm3: calc.volMm3,
        angle: editAngle,
        effLoadTon: gear.effLoadTon,
        craneType: editCrane,
        gear: {
          shackle: gear.shackle,
          shackleWll: gear.shackleWll,
          wireRope: gear.wireRope,
          chainSling: gear.chainSling,
          textileSling: gear.textileSling,
          craneType: editCrane,
          craneSwl: gear.craneSwl,
          craneFactor: gear.craneFactor
        }
      };
    };

    const { calc: initCalc, gear: initGear } = computeEditCalc();

    const dimInputsHtml = shapeSpecs.map(s => {
      const val = editDims[s.key] != null ? editDims[s.key] : "";
      const unit = s.key === "L" ? "M" : "mm";
      return `
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:12px; font-weight:800; color:var(--text-muted);">${this.t(s.labelKey)} (${unit})</label>
          <input type="number" step="any" min="0" class="plan-setup-input edit-dim-inp" data-key="${s.key}" value="${val}" />
        </div>
      `;
    }).join("");

    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Target Info Header -->
        <div style="background:var(--bg-soft); border:1px solid var(--border-light); border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--text-muted);">${this.t("shape")}</div>
            <strong style="font-size:14.5px; color:var(--brand-orange);">${this.t(rec.shape)}</strong>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; font-weight:700; color:var(--text-muted);">${this.t("savedAt")}</div>
            <div style="font-size:12px; font-weight:700;">${rec.savedAt || "-"}</div>
          </div>
        </div>

        <!-- Material & Qty -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; font-weight:800; color:var(--text-muted);">${this.t("material")}</label>
            <select id="editMaterialSel" class="plan-setup-input" style="height:38px;">
              ${materials.map(m => `<option value="${m}" ${m === editMaterial ? "selected" : ""}>${this.t(m)}</option>`).join("")}
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; font-weight:800; color:var(--text-muted);">${this.t("qty")}</label>
            <input type="number" min="1" step="1" id="editQtyInp" class="plan-setup-input" value="${editQty}" />
          </div>
        </div>

        <!-- Dimensions -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          ${dimInputsHtml}
        </div>

        <!-- Angle & Crane -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:12px; font-weight:800; color:var(--text-muted);">${this.t("angleLabel")}</label>
            <select id="editAngleSel" class="plan-setup-input" style="height:38px;">
              ${[0, 30, 45, 60, 90, 120].map(a => `<option value="${a}" ${a === editAngle ? "selected" : ""}>${a}°</option>`).join("")}
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:12px; font-weight:800; color:var(--text-muted);">${this.t("crane")}</label>
            <select id="editCraneSel" class="plan-setup-input" style="height:38px;">
              <option value="mobile" ${editCrane === "mobile" ? "selected" : ""}>${this.t("mobile")}</option>
              <option value="eot" ${editCrane === "eot" ? "selected" : ""}>${this.t("eot")}</option>
              <option value="marine" ${editCrane === "marine" ? "selected" : ""}>${this.t("marine")}</option>
            </select>
          </div>
        </div>

        <!-- Live Recalculated Summary Banner -->
        <div style="background:var(--bg-soft); border:1.5px solid var(--border-light); border-radius:10px; padding:12px 16px; display:grid; grid-template-columns: repeat(3, 1fr); text-align:center; gap:8px;">
          <div>
            <div style="font-size:11px; font-weight:800; color:var(--brand-orange);">TON</div>
            <div id="editSummaryTon" style="font-size:16px; font-weight:900; color:var(--brand-orange);">${(initCalc.wTon || 0).toFixed(3)} t</div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:800; color:var(--pro-green);">KG</div>
            <div id="editSummaryKg" style="font-size:16px; font-weight:900; color:var(--pro-green);">${(initCalc.wKg || 0).toLocaleString()} kg</div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:800; color:#dc2626;">MIN SWL</div>
            <div id="editSummarySwl" style="font-size:16px; font-weight:900; color:#dc2626;">${initGear.craneSwl} t</div>
          </div>
        </div>

        <!-- Buttons -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
          <button type="button" id="btnSaveEditedRecord" class="plan-gen-btn" style="height:44px; background:#2563eb;">
            ${this.t("saveChanges")}
          </button>
          <button type="button" id="btnLoadEditedToCalc" class="plan-gen-btn" style="height:44px; background:var(--brand-orange);">
            📥 ${this.t("loadToCalc")}
          </button>
        </div>
      </div>
    `;

    this.openModal(title, bodyHtml);

    const container = document.getElementById("subPageBody");
    if (!container) return;

    const syncInputsAndSummary = () => {
      editMaterial = document.getElementById("editMaterialSel")?.value || editMaterial;
      const qtyVal = parseInt(document.getElementById("editQtyInp")?.value, 10);
      editQty = !isNaN(qtyVal) && qtyVal > 0 ? qtyVal : 1;
      container.querySelectorAll(".edit-dim-inp").forEach(inp => {
        const k = inp.getAttribute("data-key");
        const v = parseFloat(inp.value);
        editDims[k] = !isNaN(v) ? v : 0;
      });
      editAngle = parseInt(document.getElementById("editAngleSel")?.value, 10) || 0;
      editCrane = document.getElementById("editCraneSel")?.value || "mobile";

      const { calc, gear } = computeEditCalc();
      const tonEl = document.getElementById("editSummaryTon");
      const kgEl = document.getElementById("editSummaryKg");
      const swlEl = document.getElementById("editSummarySwl");
      if (tonEl) tonEl.textContent = `${(calc.wTon || 0).toFixed(3)} t`;
      if (kgEl) kgEl.textContent = `${(calc.wKg || 0).toLocaleString()} kg`;
      if (swlEl) swlEl.textContent = `${gear.craneSwl} t`;
    };

    container.querySelectorAll(".edit-dim-inp, #editQtyInp").forEach(inp => {
      inp.addEventListener("input", syncInputsAndSummary);
    });
    document.getElementById("editMaterialSel")?.addEventListener("change", syncInputsAndSummary);
    document.getElementById("editAngleSel")?.addEventListener("change", syncInputsAndSummary);
    document.getElementById("editCraneSel")?.addEventListener("change", syncInputsAndSummary);

    document.getElementById("btnSaveEditedRecord")?.addEventListener("click", () => {
      syncInputsAndSummary();
      DataStore.updateRecord(id, buildUpdatedPayload());
      this.state.records = DataStore.getRecords();
      this.renderRecordsTable();
      this.closeModal();
    });

    document.getElementById("btnLoadEditedToCalc")?.addEventListener("click", () => {
      syncInputsAndSummary();
      DataStore.updateRecord(id, buildUpdatedPayload());
      this.state.records = DataStore.getRecords();
      this.renderRecordsTable();
      this.loadRecordToCalculator(id);
      this.closeModal();
    });
  },

  handleExportLiftingPlan() {
    // 치수 및 중량 확인
    const calc = WclCalc.calculateWeightAndVolume(this.state.shape, this.state.dims, this.state.qty, this.state.material);
    if (calc.wKg <= 0) {
      alert(this.t("enterDimensionsFirst"));
      return;
    }

    // PRO 권한 체크 (Free 사용자의 경우 업그레이드 안내 모달 호출)
    if (this.state.plan !== "pro") {
      this.openUpgradeModal("PDF_PLAN");
      return;
    }

    // PRO 사용자는 계획서 기본정보(공사명, 작업일시, 부서, 작업지휘자) 입력 모달을 먼저 오픈
    this.openPlanSetupModal(calc);
  },

  isDefaultProject(val) {
    if (!val) return true;
    const defaults = [
      "○○ 현장 플랜트 / 구조물 제작 및 설치 공사",
      "Heavy Industrial Structure Erection & Heavy Lift Operations",
      "重点工业钢结构及重大设备吊装工程",
      "構造物製作・揚重据付工事 (現場プラント)",
      "Montaje Industrial de Estructuras Pesadas"
    ];
    return defaults.includes(val);
  },

  isDefaultDept(val) {
    if (!val) return true;
    const defaults = [
      "현장 안전관리부 / 양중작업팀",
      "Rigging Operations & Site HSE Dept.",
      "工程安全监督管理部 / 吊装班组",
      "安全衛生推進室 / 揚重作業班",
      "Operaciones de Izaje / Seguridad HSE"
    ];
    return defaults.includes(val);
  },

  isDefaultMgr(val) {
    if (!val) return true;
    const defaults = [
      "홍길동 (신호수 배치 완료)",
      "John Doe (Designated Signal Person assigned)",
      "张三 (持证专职起重指挥员)",
      "山田 太郎 (玉掛け有資格者・専任合図員)",
      "Carlos López (Rigger Certificado asignado)",
      "작업지휘자 (신호수 배치 완료)",
      "Certified Lift Director (Designated Signal Person assigned)",
      "持证专职起重指挥员 (设专业信号工)",
      "作業指揮者 (玉掛け有資格者・専任合図員配置)",
      "Supervisor de Maniobra (Rigger Certificado asignado)"
    ];
    return defaults.includes(val);
  },

  openPlanSetupModal(calc) {
    const savedHeader = DataStore.getPlanHeader();
    const today = new Date().toISOString().slice(0, 10);

    const title = this.t("planModalTitle");
    const sub = this.t("planModalSubtitle");

    const projectVal = (savedHeader.isCustomProject && savedHeader.projectName && !this.isDefaultProject(savedHeader.projectName))
      ? savedHeader.projectName
      : this.t("projectValDefault");

    const workDate = savedHeader.workDate || today;

    const deptVal = (savedHeader.isCustomDept && savedHeader.deptName && !this.isDefaultDept(savedHeader.deptName))
      ? savedHeader.deptName
      : this.t("deptValDefault");

    const managerVal = (savedHeader.isCustomMgr && savedHeader.managerName && !this.isDefaultMgr(savedHeader.managerName))
      ? savedHeader.managerName
      : this.t("mgrValDefault");

    const body = `
      <div style="padding: 4px 0;">
        <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px; line-height:1.5;">${sub}</p>
        <div class="plan-setup-table-wrap">
          <table class="plan-setup-table">
            <tbody>
              <tr>
                <th>${this.t("projectLabel")}</th>
                <td colspan="3">
                  <input type="text" id="inpPlanProject" class="plan-setup-input" value="${projectVal}" placeholder="${this.t("projectValDefault")}" />
                </td>
              </tr>
              <tr>
                <th>${this.t("dateLabel")}</th>
                <td>
                  <input type="date" id="inpPlanDate" class="plan-setup-input" value="${workDate}" />
                </td>
                <th>${this.t("deptLabel")}</th>
                <td>
                  <input type="text" id="inpPlanDept" class="plan-setup-input" value="${deptVal}" placeholder="${this.t("deptValDefault")}" />
                </td>
              </tr>
              <tr>
                <th>${this.t("mgrLabel")}</th>
                <td colspan="3">
                  <input type="text" id="inpPlanMgr" class="plan-setup-input" value="${managerVal}" placeholder="${this.t("mgrValDefault")}" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button type="button" id="btnConfirmGeneratePlan" class="plan-gen-btn">
          📄 ${this.t("btnGeneratePlan")}
        </button>
      </div>
    `;

    this.openModal(title, body);

    document.getElementById("btnConfirmGeneratePlan")?.addEventListener("click", () => {
      const enteredProject = document.getElementById("inpPlanProject")?.value.trim() || projectVal;
      const enteredDate = document.getElementById("inpPlanDate")?.value || workDate;
      const enteredDept = document.getElementById("inpPlanDept")?.value.trim() || deptVal;
      const enteredMgr = document.getElementById("inpPlanMgr")?.value.trim() || managerVal;

      const isCustomProject = !this.isDefaultProject(enteredProject);
      const isCustomDept = !this.isDefaultDept(enteredDept);
      const isCustomMgr = !this.isDefaultMgr(enteredMgr);

      const headerInfo = {
        projectName: enteredProject,
        isCustomProject,
        workDate: enteredDate,
        deptName: enteredDept,
        isCustomDept,
        managerName: enteredMgr,
        isCustomMgr
      };

      // 기기 로컬에 저장하여 다음 작성 시 자동 유지
      DataStore.setPlanHeader(headerInfo);
      this.closeModal();

      // 작업계획서 팝업창 오픈
      const gear = WclCalc.calculateRiggingGear(calc.wKg, this.state.angle, this.state.craneType, (typeof I18N !== "undefined" && I18N[this.state.lang]) || {});
      const matMeta = WclCalc.MATERIAL_META[this.state.material] || {};

      const planData = {
        headerInfo,
        material: this.state.material,
        materialName: this.t(this.state.material),
        materialStd: matMeta.std || "Standard",
        shape: this.state.shape,
        shapeName: this.t(this.state.shape),
        dims: { ...this.state.dims },
        qty: this.state.qty,
        wKg: calc.wKg,
        wTon: calc.wTon,
        volM3: calc.volM3,
        angleDeg: this.state.angle,
        angleFactor: gear.angleFactor,
        effLoadTon: gear.effLoadTon,
        gear: gear,
        craneType: this.state.craneType,
        craneName: this.t(this.state.craneType)
      };

      // Expose fallback for popup-blocked environments
      window.showPlanInModal = (html) => this.showPlanInModal(html);
      LiftingPlan.openPlanWindow(planData, this.state.lang);
    });
  },

  showPlanInModal(htmlContent) {
    const title = this.t("planCardTitle") || "인양작업계획서";
    const iframeHtml = `
      <div style="width:100%; height:75vh; position:relative; overflow:hidden; border-radius:8px;">
        <iframe id="planModalFrame" style="width:100%; height:100%; border:none; background:#fff;" srcdoc="${htmlContent.replace(/"/g, '&quot;')}"></iframe>
      </div>
    `;
    this.openModal(title, iframeHtml);
  },

  updatePlanBadge() {
    const badge = document.getElementById("proBadge");
    const countEl = document.getElementById("recordsCount");
    const planBtnText = document.getElementById("lblPlanBtnText");
    const planBadge = document.getElementById("liftingPlanBadge");
    const safetyBadge = document.getElementById("safetyBadge");
    const safetyCard = document.getElementById("safetyGuidelinesCard");
    const isPro = this.state.plan === "pro";

    if (badge) {
      badge.textContent = isPro ? "Pro" : "Free";
      badge.setAttribute("title", isPro ? this.t("proBadgeUnlimited") : this.t("proBadgeFree"));
      badge.classList.toggle("is-pro", isPro);
    }
    if (countEl) {
      countEl.textContent = isPro ? `(${this.state.records.length} / ∞)` : `(${this.state.records.length}/10)`;
    }
    if (planBtnText) {
      planBtnText.textContent = isPro ? this.t("planBtnPro") : this.t("planBtnFree");
    }
    if (planBadge) {
      planBadge.textContent = isPro ? `${this.t("planCardBadge")} · PRO` : "PRO 🔒";
      planBadge.style.background = isPro ? "#eff6ff" : "#fef2f2";
      planBadge.style.color = isPro ? "#2563eb" : "#dc2626";
      planBadge.style.borderColor = isPro ? "#bfdbfe" : "#fecaca";
    }

    if (safetyCard) {
      safetyCard.classList.toggle("is-locked", !isPro);
    }
    if (safetyBadge) {
      safetyBadge.textContent = isPro ? this.t("proUnlockedBadge") : "PRO 🔒";
      safetyBadge.style.background = isPro ? "#ecfdf5" : "#fef2f2";
      safetyBadge.style.color = isPro ? "#059669" : "#dc2626";
      safetyBadge.style.borderColor = isPro ? "#a7f3d0" : "#fecaca";
    }
  },

  openUpgradeModal(context = "") {
    const isPro = this.state.plan === "pro";
    const title = isPro ? this.t("proModalTitleManage") : this.t("proModalTitleUnlock");

    let subNotice = "";
    if (context === "SAFETY") {
      subNotice = `<div style="background:#fee2e2; color:#b91c1c; padding:10px 14px; border-radius:8px; font-weight:800; font-size:12px; margin-bottom:14px; border:1px solid #fecaca; text-align:left;">
        🔒 ${this.t("safetyLockedNotice")}<br>
        <span style="font-weight:normal; font-size:11.5px; opacity:0.9;">${this.t("safetyLockedSub")}</span>
      </div>`;
    } else if (context === "PDF_PLAN") {
      subNotice = `<div style="background:#eff6ff; color:#1e40af; padding:10px 14px; border-radius:8px; font-weight:800; font-size:12px; margin-bottom:14px; border:1px solid #bfdbfe; text-align:left;">
        ${this.t("proModalLockNotice")}
      </div>`;
    } else if (context === "DATA_LIMIT") {
      subNotice = `<div style="background:#fef3c7; color:#92400e; padding:10px 14px; border-radius:8px; font-weight:800; font-size:12px; margin-bottom:14px; border:1px solid #fde68a; text-align:left;">
        ⚠️ ${this.t("dataLimitNotice")}
      </div>`;
    }

    const savedLic = (typeof LicenseManager !== "undefined") ? LicenseManager.getSavedLicense() : null;
    const devCode = (typeof LicenseManager !== "undefined") ? LicenseManager.getDeviceCode() : "00000";
    const prevName = savedLic && savedLic.name ? savedLic.name.replace(/"/g, "&quot;") : "";
    const prevCode = savedLic && savedLic.code ? savedLic.code.replace(/"/g, "&quot;") : "";

    const activeBanner = isPro ? `
      <div style="background:#ebfbee; border:1.5px solid #38d9a9; border-radius:10px; padding:10px 12px; font-size:12.5px; font-weight:800; color:#087f5b; margin-bottom:14px; text-align:left;">
        ${this.t("proActiveBanner").replace("{dev}", devCode)}
      </div>` : "";

    const body = `
      <div style="padding: 4px 0; text-align:left;">
        ${subNotice}
        ${activeBanner}
        <div style="background:var(--bg-soft); border:1px solid var(--border-light); border-radius:10px; padding:12px 14px; font-size:12.5px; line-height:1.6; margin-bottom:14px;">
          <strong style="color:var(--brand-orange);">${this.t("proModalBenefitsTitle")}</strong><br>
          ${this.t("proModalBenefit1")}<br>
          ${this.t("proModalBenefit2")}<br>
          ${this.t("proModalBenefit3")}
        </div>

        <div style="background:#e7f5ff; border:1.5px solid #74c0fc; border-radius:12px; padding:12px 14px; margin-bottom:12px;">
          <div style="font-size:13px; font-weight:900; color:#1864ab; margin-bottom:8px;">📧 ${this.t("proStep1Title")}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <div>
              <label style="display:block; font-size:11px; font-weight:800; color:#495057; margin-bottom:4px;">${this.t("proStep1Dev")}</label>
              <input type="text" value="${devCode}" readonly style="width:100%; padding:9px; font-family:monospace; font-size:15px; font-weight:900; color:var(--brand-orange); background:#f8f9fa; border:1.5px solid #ced4da; border-radius:8px; text-align:center; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:800; color:#495057; margin-bottom:4px;">${this.t("proStep1Name")} <span style="color:#e03131;">*</span></label>
              <input type="text" id="wclProRegName" value="${prevName}" placeholder="${this.t("proStep1NamePh")}" style="width:100%; padding:9px; font-size:13px; font-weight:700; border:1.5px solid #adb5bd; border-radius:8px; background:#fff; color:#111; box-sizing:border-box;">
            </div>
          </div>
          <label style="display:block; font-size:11px; font-weight:800; color:#495057; margin-bottom:4px;">${this.t("proStep1Email")} <span style="color:#e03131;">*</span></label>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <input type="email" id="wclEmailApplyInput" placeholder="${this.t("proStep1EmailPh")}" style="flex:1; min-width:170px; padding:9px 10px; font-size:13px; font-weight:700; border:1.5px solid #adb5bd; border-radius:8px; background:#fff; color:#111; box-sizing:border-box;">
            <button type="button" id="wclBtnApplyEmail" style="background:#1864ab; color:#fff; border:none; border-radius:8px; padding:9px 14px; font-size:12.5px; font-weight:900; cursor:pointer; white-space:nowrap;">${this.t("proStep1BtnGet")}</button>
          </div>
          <div id="wclEmailApplyStatus" style="margin-top:8px; font-size:11.5px; color:#495057; line-height:1.5;">
            ${this.t("proStep1Guide")}<br>
            <span style="color:#e03131; font-weight:700;">${this.t("proStep1Spam")}</span>
          </div>
        </div>

        <div style="border:1.5px solid var(--border-light); border-radius:12px; padding:12px 14px; margin-bottom:12px; background:var(--bg-card);">
          <div style="font-size:13px; font-weight:900; margin-bottom:8px;">${this.t("proStep2Title")}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <a href="https://qr.kakaopay.com/FLfFztgIX" target="_blank" rel="noopener" style="display:flex; align-items:center; justify-content:center; background:#FEE500; color:#191919; text-decoration:none; padding:10px 8px; border-radius:8px; font-size:12.5px; font-weight:900; border:1.5px solid #e6cf00;">${this.t("proStep2Kakao")}</a>
            <a href="https://buymeacoffee.com/iskorea" target="_blank" rel="noopener" style="display:flex; align-items:center; justify-content:center; background:#FFDD00; color:#000000; text-decoration:none; padding:10px 8px; border-radius:8px; font-size:12.5px; font-weight:900; border:1.5px solid #ebd000;">${this.t("proStep2Bmac")}</a>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-soft); padding:7px 10px; border-radius:8px; font-size:11.5px;">
            <span>${this.t("proStep2Inquiry")}</span>
            <a href="https://pf.kakao.com/_hALxeX" target="_blank" rel="noopener" style="color:var(--brand-orange); font-weight:800; text-decoration:underline;">${this.t("proStep2Chat")}</a>
          </div>
        </div>

        <div style="background:var(--bg-soft); border:1.5px solid var(--border-light); border-radius:12px; padding:12px 14px;">
          <div style="font-size:13px; font-weight:900; margin-bottom:4px;">${this.t("proStep3Title")}</div>
          <div style="font-size:11.5px; opacity:0.8; margin-bottom:8px;">${this.t("proStep3Desc")}</div>
          <input type="text" id="wclProRegCode" value="${prevCode}" placeholder="WCL-${devCode}-XXXXX-XXXXX" oninput="this.value=this.value.toUpperCase()" style="width:100%; font-family:monospace; font-weight:900; font-size:14px; letter-spacing:1.2px; text-align:center; color:#065f46; background:#fff; padding:10px; border:1.5px solid #adb5bd; border-radius:8px; box-sizing:border-box; margin-bottom:10px;">
          <button type="button" id="wclBtnVerifyPro" style="width:100%; height:44px; border:none; border-radius:8px; background:var(--brand-orange); color:#fff; font-size:14px; font-weight:900; cursor:pointer;">${this.t("proModalBtnActivate")}</button>
          <div id="wclProAuthMessage" style="margin-top:8px; font-size:12.5px; font-weight:800; text-align:center;"></div>
        </div>
      </div>
    `;
    this.openModal(title, body);

    document.getElementById("wclBtnApplyEmail")?.addEventListener("click", () => {
      if (typeof LicenseManager !== "undefined") {
        LicenseManager.applyByEmail((k) => this.t(k));
      }
    });

    document.getElementById("wclBtnVerifyPro")?.addEventListener("click", () => {
      if (typeof LicenseManager === "undefined") return;
      const res = LicenseManager.verifyAndActivate((k) => this.t(k));
      if (res.ok) {
        this.state.plan = res.plan;
        this.updatePlanBadge();
        this.renderRecordsTable();
        setTimeout(() => {
          this.closeModal();
          if (res.plan === "pro" && context === "PDF_PLAN") {
            this.handleExportLiftingPlan();
          }
        }, 650);
      }
    });
  },

  openManualModal() {
    const isPro = this.state.plan === "pro";
    const lang = this.state.lang;
    const t = (k) => this.t(k);

    let proGuideHtml = "";
    if (!isPro) {
      proGuideHtml = `
        <div class="manual-pro-guide-card">
          <div class="manual-pro-header">
            <div class="manual-pro-badge">${t("proGuideBadge")}</div>
            <h3 class="manual-pro-title">${t("proGuideTitle")}</h3>
            <p class="manual-pro-desc">${t("proGuideDesc")}</p>
          </div>

          <div class="manual-pro-features-grid">
            <div class="manual-pro-feat-item">
              <div class="manual-pro-feat-title">${t("proFeat1Title")}</div>
              <div class="manual-pro-feat-desc">${t("proFeat1Desc")}</div>
            </div>
            <div class="manual-pro-feat-item">
              <div class="manual-pro-feat-title">${t("proFeat2Title")}</div>
              <div class="manual-pro-feat-desc">${t("proFeat2Desc")}</div>
            </div>
            <div class="manual-pro-feat-item">
              <div class="manual-pro-feat-title">${t("proFeat3Title")}</div>
              <div class="manual-pro-feat-desc">${t("proFeat3Desc")}</div>
            </div>
          </div>

          <div class="manual-pro-sample-wrap">
            <div class="manual-pro-sample-header">
              <div class="manual-pro-sample-title">${t("proPlanSampleTitle")}</div>
              <div class="manual-pro-sample-sub">${t("proPlanSampleSub")}</div>
            </div>
            <div class="manual-pro-sample-img-box" onclick="window.App.openImagePreview('icons/sample_plan_${lang}.png')">
              <img src="icons/sample_plan_${lang}.png" alt="Sample Plan (${lang})" class="manual-pro-sample-img" />
              <div class="manual-pro-img-overlay">
                <span>${t("proSampleClickZoom")}</span>
              </div>
            </div>
          </div>

          <div class="manual-pro-cta-wrap">
            <button type="button" class="btn-pro-activate-cta" onclick="window.App.openUpgradeModal('MANUAL')">
              ${t("proUpgradeBtn")}
            </button>
          </div>
        </div>
      `;
    } else {
      proGuideHtml = `
        <div class="manual-pro-active-banner">
          <div class="pro-active-badge">👑 PRO ACTIVE</div>
          <div class="pro-active-title">${lang === "ko" ? "PRO 라이선스 활성화 상태입니다" : "PRO License is Active"}</div>
          <div class="pro-active-desc">${lang === "ko" ? "데이터 무제한 저장·편집, 현장 안전 지침 상시 노출, A4 법정 인양작업계획서(PDF 출력 및 1초 공유) 기능이 모두 활성화되어 있습니다." : "Unlimited storage & editing, full safety guidelines, and A4 certified critical lift plan generator are fully unlocked."}</div>
        </div>
      `;
    }

    const sections = HelpManual.getSections(this.state.lang);

    const manualHtml = sections.map(s => `
      <div class="manual-sec">
        <div class="manual-sec-title ${s.isWarning ? "warning" : ""}">${s.title}</div>
        <div class="manual-sec-body ${s.isWarning ? "warning" : ""}">${s.body}</div>
      </div>
    `).join("");

    this.openModal(this.t("manualTitle"), proGuideHtml + manualHtml);
  },

  openImagePreview(src) {
    const modal = document.getElementById("subPageModal");
    if (!modal) return;
    const overlayHtml = `
      <div class="img-lightbox-wrap">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <span style="font-size:13px; font-weight:800; color:var(--text-primary);">${this.t("proPlanSampleTitle")}</span>
          <button type="button" class="btn-secondary" style="padding:5px 12px; font-size:12px; border-radius:6px; cursor:pointer;" onclick="window.App.openManualModal()">← ${this.t("close") || "설명서로 돌아가기"}</button>
        </div>
        <div style="border:1.5px solid #94a3b8; border-radius:8px; overflow:hidden; background:#fff; box-shadow:0 6px 20px rgba(0,0,0,0.15);">
          <img src="${src}" alt="Plan Preview" style="display:block; width:100%; height:auto;" />
        </div>
      </div>
    `;
    this.openModal(this.t("proPlanSampleTitle"), overlayHtml);
  },

  openModal(title, contentHtml) {
    const modal = document.getElementById("subPageModal");
    const titleEl = document.getElementById("subPageTitle");
    const bodyEl = document.getElementById("subPageBody");
    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = title;
    bodyEl.innerHTML = contentHtml;
    modal.classList.remove("hidden");
  },

  closeModal() {
    const modal = document.getElementById("subPageModal");
    if (modal) modal.classList.add("hidden");
  }
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.App = App;
  App.init();
});

if (typeof module !== "undefined") {
  module.exports = App;
}
