/**
 * WCL - Calculation Engine & Lookup Standards
 * Handles volume, weight, sling angles, rigging selection (shackle, wire rope, chain, textile sling) and crane SWL.
 */

// Rigging load factor by lift angle (two-leg sling)
const ANGLE_FACTORS = {
  0: 1.0,
  30: 1.035,
  45: 1.082,
  60: 1.155,
  90: 1.414,
  120: 2.0
};
const ANGLE_LIST = [0, 30, 45, 60, 90, 120];

// Crane safety factors
const CRANE_FACTORS = {
  mobile: 1.25,
  eot: 1.10,
  marine: 1.50
};
const CRANE_TYPES = ["mobile", "eot", "marine"];

// Material densities (kg/m³)
const MATERIAL_DENSITIES = {
  carbon: 7850,
  stainless: 7930,
  aluminum: 2700,
  copper: 8960
};
const MATERIAL_KEYS = ["carbon", "stainless", "aluminum", "copper"];

// Shapes supported
const SHAPE_KEYS = [
  "plate",
  "hbeam",
  "angle",
  "tbar",
  "bulb",
  "squareBar",
  "roundBar",
  "tubular",
  "squareTube",
  "box"
];

// Material card metadata
const MATERIAL_META = {
  carbon: {
    nameKey: "carbon",
    density: "7,850 kg/m³",
    std: "EN 10025 / KS D 3515",
    color: "#ff7f00",
    dot: "#ff7f00"
  },
  stainless: {
    nameKey: "stainless",
    density: "7,930 kg/m³",
    std: "EN 10088 / STS304",
    color: "#64748b",
    dot: "#94a3b8"
  },
  aluminum: {
    nameKey: "aluminum",
    density: "2,700 kg/m³",
    std: "EN 485 / KS D 6701",
    color: "#0284c7",
    dot: "#38bdf8"
  },
  copper: {
    nameKey: "copper",
    density: "8,960 kg/m³",
    std: "EN 13601 / KS D 5101",
    color: "#ea580c",
    dot: "#fb923c"
  }
};

/**
 * Returns dimension field specifications for a given shape
 * Each spec has key, labelKey, and optional isDualUnit flag
 */
function getShapeDimensionSpecs(shape) {
  const L = { key: "L", labelKey: "length", isDualUnit: true };
  switch (shape) {
    case "plate":
      return [
        { key: "W", labelKey: "width", isDualUnit: true },
        { key: "t", labelKey: "plateThick", isDualUnit: false },
        L
      ];
    case "hbeam":
      return [
        { key: "B", labelKey: "flangeWidth", isDualUnit: false },
        { key: "H", labelKey: "webHeight", isDualUnit: false },
        { key: "tf", labelKey: "flangeThick", isDualUnit: false },
        { key: "tw", labelKey: "webThick", isDualUnit: false },
        L
      ];
    case "angle":
      return [
        { key: "a", labelKey: "legA", isDualUnit: false },
        { key: "b", labelKey: "legB", isDualUnit: false },
        { key: "t", labelKey: "thickness", isDualUnit: false },
        L
      ];
    case "tbar":
      return [
        { key: "B", labelKey: "flangeWidth", isDualUnit: false },
        { key: "H", labelKey: "webHeight", isDualUnit: false },
        { key: "tf", labelKey: "flangeThick", isDualUnit: false },
        { key: "tw", labelKey: "webThick", isDualUnit: false },
        L
      ];
    case "bulb":
      return [
        { key: "H", labelKey: "webHeight", isDualUnit: false },
        { key: "t", labelKey: "webThick", isDualUnit: false },
        L
      ];
    case "squareBar":
      return [
        { key: "W", labelKey: "width", isDualUnit: false },
        { key: "H", labelKey: "height", isDualUnit: false },
        L
      ];
    case "roundBar":
      return [
        { key: "D", labelKey: "diameter", isDualUnit: false },
        L
      ];
    case "tubular":
      return [
        { key: "D", labelKey: "diameter", isDualUnit: false },
        { key: "t", labelKey: "wallThick", isDualUnit: false },
        L
      ];
    case "squareTube":
      return [
        { key: "W", labelKey: "width", isDualUnit: false },
        { key: "H", labelKey: "height", isDualUnit: false },
        { key: "t", labelKey: "wallThick", isDualUnit: false },
        L
      ];
    case "box":
      return [
        { key: "W", labelKey: "boxW", isDualUnit: true },
        { key: "H", labelKey: "boxH", isDualUnit: false },
        { key: "D", labelKey: "boxD", isDualUnit: false },
        { key: "t", labelKey: "plateThick", isDualUnit: false }
      ];
    default:
      return [];
  }
}

/**
 * Calculates net cross-sectional volume (in mm³)
 * Note: input dimensions dims are in mm, except dims.L which is in mm when passed here.
 */
function calculateVolumeMm3(shape, dims) {
  const {
    W = 0,
    H = 0,
    t = 0,
    B = 0,
    tf = 0,
    tw = 0,
    a = 0,
    b = 0,
    D = 0,
    L = 0
  } = dims;

  let area = 0;
  switch (shape) {
    case "plate":
      area = W * t;
      break;
    case "hbeam":
      area = 2 * B * tf + Math.max(0, H - 2 * tf) * tw;
      break;
    case "angle":
      area = a * t + Math.max(0, b - t) * t;
      break;
    case "tbar":
      area = B * tf + Math.max(0, H - tf) * tw;
      break;
    case "bulb":
      // EN 10067 / KS D 3585 Hot-rolled Bulb Flats:
      // Section Area = H * t * 1.15 + 1.35 * t^2
      area = H * t * 1.15 + 1.35 * t * t;
      break;
    case "squareBar":
      area = W * H;
      break;
    case "roundBar":
      area = Math.PI * (D / 2) * (D / 2);
      break;
    case "tubular": {
      const R = D / 2;
      const r = Math.max(0, D / 2 - t);
      area = Math.PI * (R * R - r * r);
      break;
    }
    case "squareTube": {
      const outer = W * H;
      const inner = Math.max(0, W - 2 * t) * Math.max(0, H - 2 * t);
      area = outer - inner;
      break;
    }
    case "box": {
      // Hollow box: W × H × D minus inner hollow
      const outer = W * H * D;
      const inner = Math.max(0, W - 2 * t) * Math.max(0, H - 2 * t) * Math.max(0, D - 2 * t);
      return Math.max(0, outer - inner);
    }
    default:
      return 0;
  }
  return area * L;
}

/**
 * Computes weight in kg, weight in tons, volume in m³
 * @param {string} shape
 * @param {Object} rawDims - dimensions where L is in Meters (or box D in mm)
 * @param {number} qty - piece count
 * @param {string} material - material key
 */
function calculateWeightAndVolume(shape, rawDims, qty, material) {
  if (!shape || qty <= 0) {
    return { wKg: 0, wTon: 0, volM3: 0, volMm3: 0 };
  }

  // Ensure L is converted from meters to mm for calculation
  const dimsInMm = { ...rawDims, L: (Number(rawDims.L) || 0) * 1000 };
  const volMm3One = calculateVolumeMm3(shape, dimsInMm);
  const totalVolMm3 = volMm3One * (Number(qty) || 1);

  const density = MATERIAL_DENSITIES[material] || 7850;
  // 1 mm³ = 1e-9 m³
  const wKg = totalVolMm3 * density * 1e-9;
  const wTon = wKg / 1000;
  const volM3 = totalVolMm3 * 1e-9;

  return {
    wKg: Number(wKg.toFixed(3)),
    wTon: Number(wTon.toFixed(6)),
    volM3: Number(volM3.toFixed(4)),
    volMm3: totalVolMm3
  };
}

/**
 * Rigging gear selection based on weight, sling angle, crane type
 */
function calculateRiggingGear(weightKg, angleDeg, craneType, i18nTexts) {
  const wTon = weightKg / 1000;
  const angleFactor = ANGLE_FACTORS[angleDeg] || 1.0;
  const effLoadTon = wTon * angleFactor;

  // 1. Shackle selection (EN 13889 / US Fed RR-C-271)
  const SHACKLE_TABLE = [
    { wll: 0.50, s: "G209 6mm / 0.5t" },
    { wll: 1.00, s: "G209 9.5mm / 1t" },
    { wll: 2.00, s: "G209 13mm / 2t" },
    { wll: 3.25, s: "G209 16mm / 3.25t" },
    { wll: 4.75, s: "G209 19mm / 4.75t" },
    { wll: 6.50, s: "G209 22mm / 6.5t" },
    { wll: 8.50, s: "G209 25mm / 8.5t" },
    { wll: 12.0, s: "G209 28mm / 12t" },
    { wll: 17.0, s: "G209 32mm / 17t" },
    { wll: 25.0, s: "G209 38mm / 25t" }
  ];
  const shMatch = SHACKLE_TABLE.find(item => item.wll >= effLoadTon);
  const shackleStr = shMatch ? shMatch.s : `Special ≥${effLoadTon.toFixed(1)}t`;
  const shackleWll = shMatch ? shMatch.wll.toFixed(2) : effLoadTon.toFixed(2);

  // 2. Wire rope selection (EN 12385)
  const WIRE_ROPE_TABLE = [
    { d: 8, wll: 0.80 },
    { d: 10, wll: 1.25 },
    { d: 12, wll: 1.80 },
    { d: 14, wll: 2.44 },
    { d: 16, wll: 3.20 },
    { d: 18, wll: 4.05 },
    { d: 20, wll: 5.00 },
    { d: 22, wll: 6.05 },
    { d: 24, wll: 7.20 },
    { d: 26, wll: 8.45 },
    { d: 28, wll: 9.80 },
    { d: 32, wll: 12.8 },
    { d: 36, wll: 16.2 },
    { d: 40, wll: 20.0 }
  ];
  const wrMatch = WIRE_ROPE_TABLE.find(item => item.wll >= effLoadTon);
  const wrStr = wrMatch ? `φ${wrMatch.d}mm / WLL ${wrMatch.wll}t` : `φ≥40mm / ${effLoadTon.toFixed(1)}t`;
  const wrWll = wrMatch ? wrMatch.wll.toFixed(2) : effLoadTon.toFixed(2);
  const wrQuick = `φ${Math.ceil(Math.sqrt(effLoadTon / 0.008))}mm (0.008×D²)`;

  // 3. Chain sling selection (Grade 80 / EN 818-2)
  const CHAIN_TABLE = [
    { d: 6, wll: 1.12 },
    { d: 7, wll: 1.50 },
    { d: 8, wll: 2.00 },
    { d: 10, wll: 3.15 },
    { d: 13, wll: 5.00 },
    { d: 16, wll: 8.00 },
    { d: 19, wll: 11.2 },
    { d: 22, wll: 15.0 },
    { d: 26, wll: 21.2 },
    { d: 32, wll: 32.0 }
  ];
  const chMatch = CHAIN_TABLE.find(item => item.wll >= effLoadTon);
  const chStr = chMatch ? `G80 φ${chMatch.d}mm / WLL ${chMatch.wll}t` : `G80 φ≥32mm / ${effLoadTon.toFixed(1)}t`;
  const chWll = chMatch ? chMatch.wll.toFixed(2) : effLoadTon.toFixed(2);

  // 4. Textile sling belt selection (EN 1492-1 / 1492-2)
  const TEXTILE_TABLE = [
    { cap: 1, s: "1t Flat" },
    { cap: 2, s: "2t Flat" },
    { cap: 3, s: "3t Flat" },
    { cap: 5, s: "5t Flat" },
    { cap: 8, s: "8t Flat" },
    { cap: 10, s: "10t Flat" },
    { cap: 15, s: "15t Round" },
    { cap: 20, s: "20t Round" },
    { cap: 25, s: "25t Round" },
    { cap: 35, s: "35t Round" }
  ];
  const txMatch = TEXTILE_TABLE.find(item => item.cap >= effLoadTon);
  const txStr = txMatch ? `${txMatch.s} / WLL ${txMatch.cap}t` : `${Math.ceil(effLoadTon)}t Round`;
  const txWll = txMatch ? txMatch.cap.toFixed(2) : Math.ceil(effLoadTon).toFixed(2);

  // 5. Crane selection
  const craneFactor = CRANE_FACTORS[craneType] || 1.25;
  const craneSwl = (wTon * craneFactor).toFixed(2);

  // Recommendation level
  const rec = wTon < 1 ? (i18nTexts.rec_light || "경량급 — 섬유 슬링 단독 가능")
    : wTon < 5 ? (i18nTexts.rec_medium || "중량급 — 와이어로프 또는 체인 슬링 권장")
    : wTon < 20 ? (i18nTexts.rec_heavy || "중중량급 — 체인 슬링 + 샵클 필수")
    : (i18nTexts.rec_superheavy || "초중량급 — 전문 리깅 엔지니어 필수");

  const recColor = wTon < 1 ? "#12b886" : wTon < 5 ? "#ff7f00" : wTon < 20 ? "#ea580c" : "#e03131";

  return {
    wTon: Number(wTon.toFixed(3)),
    effLoadTon: Number(effLoadTon.toFixed(3)),
    angleFactor,
    shackle: shackleStr,
    shackleWll,
    wireRope: wrStr,
    wireRopeWll: wrWll,
    wireRopeQuick: wrQuick,
    chainSling: chStr,
    chainSlingWll: chWll,
    textileSling: txStr,
    textileSlingWll: txWll,
    craneType,
    craneFactor,
    craneSwl,
    recommendation: rec,
    recColor
  };
}

const WclCalc = {
  ANGLE_FACTORS,
  ANGLE_LIST,
  CRANE_FACTORS,
  CRANE_TYPES,
  MATERIAL_DENSITIES,
  MATERIAL_KEYS,
  MATERIAL_META,
  SHAPE_KEYS,
  getShapeDimensionSpecs,
  calculateVolumeMm3,
  calculateWeightAndVolume,
  calculateRiggingGear
};

if (typeof module !== "undefined") {
  module.exports = WclCalc;
}
