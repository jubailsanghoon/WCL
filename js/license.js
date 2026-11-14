/**
 * WCL - Offline-Capable Device-Bound PRO License Manager
 * Uses deterministic hardware fingerprint (5-char Base32) + SHA-256 redeem code verification
 * and instant email delivery via Google Apps Script.
 */
const LicenseManager = (() => {
  const _B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const _SC_ENC = [157, 225, 147, 231, 152, 250, 158, 251, 146, 248];
  const _MS_ENC = [226, 227, 158, 154, 245, 231, 235, 249, 225, 245, 252, 158, 154];
  const _decBytes = arr => arr.map(b => String.fromCharCode(b ^ 0xAA)).join("");

  const LICENSE_KEY = "WCL_PRO_LICENSE_V1";
  const DEVICE_KEY = "WCL_DEVICE_ID_V1";
  const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwM6ExFgIRdOUP_POvhSQ1S0C5V9heKiSJ9fyuqKLRrIfy663qhhP8ULKQPk_00F_nFag/exec";

  const _pureSha256 = ascii => {
    const rightRotate = (v, a) => (v >>> a) | (v << (32 - a));
    const maxWord = Math.pow(2, 32);
    let i, j;
    const words = [], asciiBitLength = ascii.length * 8;
    let hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    ascii += "\x80";
    while (ascii.length % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return new Uint8Array(32);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      const w = words.slice(j, j += 16);
      const oldHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
        hash.pop();
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    const out = new Uint8Array(32);
    for (i = 0; i < 8; i++) {
      out[i * 4] = (hash[i] >>> 24) & 0xff;
      out[i * 4 + 1] = (hash[i] >>> 16) & 0xff;
      out[i * 4 + 2] = (hash[i] >>> 8) & 0xff;
      out[i * 4 + 3] = hash[i] & 0xff;
    }
    return out;
  };

  function getDeviceCode() {
    try {
      const savedLic = JSON.parse(localStorage.getItem(LICENSE_KEY) || "null");
      if (savedLic && typeof savedLic.code === "string") {
        const parts = savedLic.code.split("-");
        if (parts.length >= 2 && /^[0-9A-Z]{5}$/.test(parts[1]) && !parts[1].startsWith("VIP")) {
          localStorage.setItem(DEVICE_KEY, parts[1]);
          return parts[1];
        }
      }
      const saved = (localStorage.getItem(DEVICE_KEY) || "").trim().toUpperCase();
      if (/^[0-9A-Z]{5}$/.test(saved) && !saved.startsWith("VIP")) return saved;
    } catch (e) {}

    let glRenderer = "";
    try {
      const cnv = document.createElement("canvas");
      const gl = cnv.getContext("webgl") || cnv.getContext("experimental-webgl");
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        glRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "") : String(gl.getParameter(gl.RENDERER) || "");
      }
    } catch (e) {}

    let scrDim = "";
    try {
      if (typeof screen !== "undefined") {
        const sw = Math.min(screen.width || 0, screen.height || 0);
        const sh = Math.max(screen.width || 0, screen.height || 0);
        scrDim = `${sw}x${sh}x${screen.colorDepth || 24}`;
      }
    } catch (e) {}

    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1).toFixed(2) : "1.00";
    const navHw = typeof navigator !== "undefined" ? [
      navigator.platform || "",
      navigator.hardwareConcurrency || 4,
      navigator.maxTouchPoints || 0
    ].join("|") : "";

    let canvasFp = "";
    try {
      const c2 = document.createElement("canvas");
      c2.width = 160; c2.height = 30;
      const ctx = c2.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial, sans-serif";
        ctx.fillStyle = "#ff7f00";
        ctx.fillRect(0, 0, 80, 20);
        ctx.fillStyle = "#12b886";
        ctx.fillText("WCL-2026", 10, 4);
        canvasFp = c2.toDataURL();
      }
    } catch (e) {}

    const hwRaw = [scrDim, dpr, navHw, glRenderer, canvasFp].join("||");
    const hwHash = _pureSha256("WCL_HW_" + hwRaw);
    let code = "";
    for (let i = 0; i < 5; i++) code += _B32[hwHash[i] & 31];
    if (code.startsWith("VIP")) code = "V1P" + code.slice(3);

    try { localStorage.setItem(DEVICE_KEY, code); } catch (e) {}
    return code;
  }

  function generateCode(dev) {
    const devCode = (dev || getDeviceCode()).toUpperCase();
    const secretCore = _decBytes(_SC_ENC);
    const maskSalt = _decBytes(_MS_ENC);
    const mask = _pureSha256(maskSalt + "WCL" + devCode);
    let g23 = "";
    for (let i = 0; i < 10; i++) {
      const idx = _B32.indexOf(secretCore.charAt(i)) ^ (mask[i] & 31);
      g23 += _B32.charAt(idx);
    }
    return `WCL-${devCode}-${g23.slice(0, 5)}-${g23.slice(5, 10)}`;
  }

  function verifyCodeSync(rawCode) {
    const code = (rawCode || "").trim().toUpperCase();
    if (!/^([A-Z0-9]{3,5})-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code)) {
      return { ok: false, reason: "FORMAT" };
    }
    const parts = code.split("-");
    const prefix = parts[0];
    const g1 = parts[1];
    const devCode = getDeviceCode();
    if (prefix !== "WCL") {
      return { ok: false, reason: "APP_MISMATCH", prefix, codeDevice: g1, currentDevice: devCode };
    }
    if (g1 !== devCode) {
      return { ok: false, reason: "DEVICE_MISMATCH", codeDevice: g1, currentDevice: devCode };
    }
    return code === generateCode(devCode) ? { ok: true } : { ok: false, reason: "INVALID" };
  }

  function getSavedLicense() {
    try {
      const lic = JSON.parse(localStorage.getItem(LICENSE_KEY) || "null");
      if (lic && lic.code && verifyCodeSync(lic.code).ok) return lic;
    } catch (e) {}
    return null;
  }

  function syncSavedLicense() {
    const lic = getSavedLicense();
    const plan = lic ? "pro" : "free";
    if (typeof DataStore !== "undefined") DataStore.setPlan(plan);
    return plan;
  }

  async function applyByEmail(t) {
    const emailInp = document.getElementById("wclEmailApplyInput");
    const statusEl = document.getElementById("wclEmailApplyStatus");
    const nameInp = document.getElementById("wclProRegName");
    const btn = document.getElementById("wclBtnApplyEmail");
    const email = (emailInp ? emailInp.value : "").trim();
    const name = (nameInp && nameInp.value ? nameInp.value : "").trim();
    const dev = getDeviceCode();

    if (!name) {
      if (statusEl) {
        statusEl.innerHTML = `<div style="background:#fff5f5; border:1.5px solid #ff8787; border-radius:8px; padding:10px 12px; color:#c92a2a; font-weight:800; font-size:12px;">${t("proErrNameRequired")}</div>`;
      }
      if (nameInp) nameInp.focus();
      return;
    }
    if (!email || !email.includes("@")) {
      if (statusEl) {
        statusEl.innerHTML = `<div style="background:#fff5f5; border:1.5px solid #ff8787; border-radius:8px; padding:10px 12px; color:#c92a2a; font-weight:800; font-size:12px;">${t("proErrEmailInvalid")}</div>`;
      }
      if (emailInp) emailInp.focus();
      return;
    }

    const instantCode = generateCode(dev);
    const codeInp = document.getElementById("wclProRegCode");
    if (codeInp) codeInp.value = instantCode;

    if (btn) {
      btn.disabled = true;
      btn.style.opacity = "0.7";
      btn.innerHTML = t("proStatusSending");
    }
    if (statusEl) {
      statusEl.innerHTML = `<div style="background:#e7f5ff; border:1.5px solid #339af0; border-radius:10px; padding:10px 12px; font-size:12px; color:#1864ab; line-height:1.55;">
        <strong>${t("proStatusProcessing")}</strong><br>
        ${t("proStatusCodeReady")}<br>
        <span style="color:#e03131; font-weight:800;">${t("proStep1Spam")}</span>
      </div>`;
    }

    const reqUrl = `${DEFAULT_API_URL}?action=emailApply&email=${encodeURIComponent(email)}&dev=${encodeURIComponent(dev)}&name=${encodeURIComponent(name)}&app=WCL&t=${Date.now()}`;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.innerHTML = t("proBtnResend");
      }
      if (statusEl) {
        statusEl.innerHTML = `<div style="background:#ebfbee; border:1.5px solid #38d9a9; border-radius:10px; padding:10px 12px; font-size:12px; color:#087f5b; line-height:1.55;">
          <strong>🎉 ${t("proStatusSentTitle").replace("{email}", email)}</strong><br>
          ${t("proStatusSentLine1").replace("{code}", instantCode)}<br>
          ${t("proStatusSentLine2")}<br>
          <span style="color:#d9480f; font-weight:800;">${t("proStep1Spam")}</span>
        </div>`;
      }
    };
    const timer = setTimeout(finish, 6000);
    try {
      await fetch(reqUrl, { mode: "no-cors", cache: "no-store" });
    } catch (e) {}
    clearTimeout(timer);
    finish();
  }

  function verifyAndActivate(t) {
    const nameInput = document.getElementById("wclProRegName");
    const codeInput = document.getElementById("wclProRegCode");
    const msgEl = document.getElementById("wclProAuthMessage");
    const holderName = (nameInput && nameInput.value ? nameInput.value : "").trim();
    const rawCode = (codeInput ? codeInput.value : "").trim().toUpperCase();
    const devCode = getDeviceCode();

    if (rawCode === "FREEADMINTEST" || rawCode === "FREE-ADMIN-TEST") {
      try { localStorage.removeItem(LICENSE_KEY); } catch (e) {}
      if (typeof DataStore !== "undefined") DataStore.setPlan("free");
      return { ok: true, plan: "free" };
    }
    if (!holderName) {
      if (msgEl) { msgEl.style.color = "#e03131"; msgEl.textContent = t("proErrNameRequired"); }
      if (nameInput) nameInput.focus();
      return { ok: false };
    }
    const res = verifyCodeSync(rawCode);
    if (res.ok) {
      try {
        localStorage.setItem(LICENSE_KEY, JSON.stringify({ name: holderName, code: rawCode, device: devCode }));
      } catch (e) {}
      if (typeof DataStore !== "undefined") DataStore.setPlan("pro");
      if (msgEl) {
        msgEl.style.color = "#0ca678";
        msgEl.textContent = t("proMsgVerified").replace("{dev}", devCode);
      }
      return { ok: true, plan: "pro" };
    }
    if (msgEl) {
      msgEl.style.color = "#e03131";
      if (res.reason === "FORMAT") msgEl.textContent = t("proErrCodeFmt").replace("{dev}", devCode);
      else if (res.reason === "APP_MISMATCH") msgEl.textContent = t("proErrAppMismatch").replace("{prefix}", res.prefix || "");
      else if (res.reason === "DEVICE_MISMATCH") msgEl.textContent = t("proErrDevMismatch").replace("{codeDev}", res.codeDevice).replace("{curDev}", res.currentDevice);
      else msgEl.textContent = t("proErrInvalid");
    }
    return { ok: false };
  }

  return {
    getDeviceCode,
    getSavedLicense,
    syncSavedLicense,
    applyByEmail,
    verifyAndActivate
  };
})();
window.LicenseManager = LicenseManager;
