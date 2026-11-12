/**
 * WCL - Storage & Export Manager
 * Handles LocalStorage persistence, Pro plan activation, and CSV export.
 */

const STORAGE_KEYS = {
  RECORDS: "mwp_records_v2",
  PLAN: "mwp_plan_v1",
  THEME: "HI_DARK_MODE",
  LANG: "mwp_lang_v1",
  PLAN_HEADER: "mwp_plan_header_v1",
  LAST_STATE: "mwp_last_state_v1"
};

const PLAN_LIMITS = {
  free: 10,
  pro: Infinity // Pro는 무제한 저장
};

const DataStore = {
  getPlan() {
    try {
      return localStorage.getItem(STORAGE_KEYS.PLAN) || "free";
    } catch (e) {
      return "free";
    }
  },

  setPlan(plan) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, plan);
    } catch (e) {}
  },

  getPlanLimit() {
    const plan = this.getPlan();
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  },

  getRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveRecord(record) {
    const records = this.getRecords();
    const limit = this.getPlanLimit();
    if (records.length >= limit) {
      return { success: false, reason: "limit_reached", limit };
    }
    const newRecord = {
      id: Date.now().toString(),
      savedAt: this.formatNow(),
      ...record
    };
    records.unshift(newRecord);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {}
    return { success: true, record: newRecord, total: records.length };
  },

  deleteRecord(id) {
    let records = this.getRecords();
    records = records.filter(r => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {}
    return records;
  },

  getRecordById(id) {
    const records = this.getRecords();
    return records.find(r => r.id === id) || null;
  },

  updateRecord(id, updatedFields) {
    const records = this.getRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        ...updatedFields,
        updatedAt: this.formatNow()
      };
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      } catch (e) {}
      return { success: true, record: records[idx] };
    }
    return { success: false, reason: "not_found" };
  },

  clearAllRecords() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, "[]");
    } catch (e) {}
    return [];
  },

  getPlanHeader() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAN_HEADER) || "{}");
    } catch (e) {
      return {};
    }
  },

  setPlanHeader(headerData) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN_HEADER, JSON.stringify(headerData));
    } catch (e) {}
  },

  getLastState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setLastState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
    } catch (e) {}
  },

  formatNow() {
    const d = new Date();
    const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  },

  exportCSV(records) {
    if (!records || records.length === 0) return;
    const header = [
      "No",
      "Saved At",
      "Material",
      "Shape",
      "W",
      "H",
      "t",
      "B",
      "tf",
      "tw",
      "a",
      "b",
      "D",
      "L",
      "Volume(m3)",
      "Weight(kg)",
      "Weight(ton)",
      "Lift Angle(deg)",
      "Effective Load(ton)",
      "Shackle(SWL)",
      "Wire Rope(SWL)",
      "Chain Sling(SWL)",
      "Textile Sling(SWL)",
      "Crane Type",
      "Crane Required SWL(ton)"
    ].join(",");

    const rows = records.map((r, idx) => {
      const p = r.dims || {};
      const volM3 = r.volMm3 ? (r.volMm3 * 1e-9).toFixed(6) : (r.vol ? (r.vol / 1e9).toFixed(6) : "");
      const wKg = r.wKg != null ? Number(r.wKg).toFixed(3) : "";
      const wTon = r.wKg != null ? (Number(r.wKg) / 1000).toFixed(6) : "";
      const gear = r.gear || {};
      return [
        idx + 1,
        `"${r.savedAt}"`,
        `"${r.material || ""}"`,
        `"${r.shape || ""}"`,
        p.W || "",
        p.H || "",
        p.t || "",
        p.B || "",
        p.tf || "",
        p.tw || "",
        p.a || "",
        p.b || "",
        p.D || "",
        p.L || "",
        volM3,
        wKg,
        wTon,
        r.angle != null ? r.angle : 0,
        r.effLoadTon != null ? r.effLoadTon : (gear.effLoadTon || ""),
        `"${gear.shackle || ""}"`,
        `"${gear.wireRope || ""}"`,
        `"${gear.chainSling || ""}"`,
        `"${gear.textileSling || ""}"`,
        `"${r.craneType || gear.craneType || ""}"`,
        gear.craneSwl || ""
      ].join(",");
    });

    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MWL_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

if (typeof module !== "undefined") {
  module.exports = { STORAGE_KEYS, PLAN_LIMITS, DataStore };
}
