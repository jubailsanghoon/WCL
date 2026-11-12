/**
 * WCL - SVG Shape Diagrams & Mini Icons
 * Generates interactive, high-contrast engineering cross-section diagrams.
 */

const ShapeDiagrams = {
  render(shape, isDark = false, lang = "ko") {
    const stroke = "#ff7f00"; // Heat orange theme stroke
    const fill = isDark ? "rgba(255, 127, 0, 0.15)" : "rgba(255, 127, 0, 0.08)";
    const guide = isDark ? "#64748b" : "#94a3b8";
    const text = isDark ? "#cbd5e1" : "#475569";
    const cutout = isDark ? "#1e293b" : "#f1f3f5";

    const t = (typeof I18N !== "undefined" && I18N[lang]) ? I18N[lang] : {};
    const txtDiaD = t.diaDiaD || "D";
    const txtBoxDepth = t.diaBoxDepthThick || "D · t";
    const txtSelect = t.diaSelectShape || "Select shape";

    const pStyle = `fill="${fill}" stroke="${stroke}" stroke-width="2"`;
    const mStyle = `stroke="${guide}" stroke-width="1" stroke-dasharray="4,3"`;
    const tStyle = `fill="${text}" font-size="11" font-family="'Pretendard', sans-serif" font-weight="700"`;

    switch (shape) {
      case "plate":
        return `
          <svg viewBox="0 0 130 100" class="shape-svg">
            <rect x="10" y="42" width="100" height="24" rx="2" ${pStyle} />
            <line x1="10" y1="28" x2="110" y2="28" ${mStyle} />
            <line x1="10" y1="28" x2="10" y2="34" stroke="${guide}" stroke-width="1" />
            <line x1="110" y1="28" x2="110" y2="34" stroke="${guide}" stroke-width="1" />
            <text x="60" y="19" text-anchor="middle" ${tStyle}>W</text>
            <line x1="116" y1="42" x2="116" y2="66" ${mStyle} />
            <line x1="113" y1="42" x2="119" y2="42" stroke="${guide}" stroke-width="1" />
            <line x1="113" y1="66" x2="119" y2="66" stroke="${guide}" stroke-width="1" />
            <text x="120" y="58" ${tStyle}>t</text>
          </svg>
        `;

      case "hbeam":
        return `
          <svg viewBox="0 0 135 145" class="shape-svg">
            <!-- Top Flange -->
            <rect x="14" y="32" width="96" height="14" rx="1" ${pStyle} />
            <!-- Web -->
            <rect x="54" y="46" width="16" height="60" ${pStyle} />
            <!-- Bottom Flange -->
            <rect x="14" y="106" width="96" height="14" rx="1" ${pStyle} />
            <!-- B (Flange Width) -->
            <line x1="14" y1="20" x2="110" y2="20" ${mStyle} />
            <line x1="14" y1="20" x2="14" y2="26" stroke="${guide}" stroke-width="1" />
            <line x1="110" y1="20" x2="110" y2="26" stroke="${guide}" stroke-width="1" />
            <text x="62" y="14" text-anchor="middle" ${tStyle}>B</text>
            <!-- H (Total Height) -->
            <line x1="118" y1="32" x2="118" y2="120" ${mStyle} />
            <line x1="114" y1="32" x2="122" y2="32" stroke="${guide}" stroke-width="1" />
            <line x1="114" y1="120" x2="122" y2="120" stroke="${guide}" stroke-width="1" />
            <text x="124" y="80" ${tStyle}>H</text>
            <!-- tf / tw hints -->
            <text x="6" y="42" font-size="9" ${tStyle}>tf</text>
            <text x="74" y="80" font-size="9" ${tStyle}>tw</text>
          </svg>
        `;

      case "angle":
        return `
          <svg viewBox="0 0 115 118" class="shape-svg">
            <polygon points="18,20 18,100 98,100 98,86 32,86 32,20" ${pStyle} />
            <!-- Dimension a -->
            <line x1="8" y1="20" x2="8" y2="100" ${mStyle} />
            <line x1="5" y1="20" x2="11" y2="20" stroke="${guide}" stroke-width="1" />
            <line x1="5" y1="100" x2="11" y2="100" stroke="${guide}" stroke-width="1" />
            <text x="2" y="64" ${tStyle}>a</text>
            <!-- Dimension b -->
            <line x1="18" y1="108" x2="98" y2="108" ${mStyle} />
            <line x1="18" y1="105" x2="18" y2="111" stroke="${guide}" stroke-width="1" />
            <line x1="98" y1="105" x2="98" y2="111" stroke="${guide}" stroke-width="1" />
            <text x="58" y="115" text-anchor="middle" ${tStyle}>b</text>
            <!-- Dimension t -->
            <text x="36" y="58" font-size="9" ${tStyle}>t</text>
          </svg>
        `;

      case "tbar":
        return `
          <svg viewBox="0 0 135 130" class="shape-svg">
            <rect x="12" y="30" width="100" height="16" rx="1" ${pStyle} />
            <rect x="54" y="46" width="16" height="60" ${pStyle} />
            <!-- Dimension B (Top) -->
            <line x1="12" y1="19" x2="112" y2="19" ${mStyle} />
            <line x1="12" y1="19" x2="12" y2="24" stroke="${guide}" stroke-width="1" />
            <line x1="112" y1="19" x2="112" y2="24" stroke="${guide}" stroke-width="1" />
            <text x="62" y="13" text-anchor="middle" ${tStyle}>B</text>
            <!-- Dimension H (Right) -->
            <line x1="120" y1="30" x2="120" y2="106" ${mStyle} />
            <line x1="116" y1="30" x2="124" y2="30" stroke="${guide}" stroke-width="1" />
            <line x1="116" y1="106" x2="124" y2="106" stroke="${guide}" stroke-width="1" />
            <text x="125" y="72" ${tStyle}>H</text>
          </svg>
        `;

      case "bulb":
        return `
          <svg viewBox="0 0 120 120" class="shape-svg">
            <!-- Bulb Flat cross-section (EN 10067) -->
            <path d="M 40,104 L 52,104 L 52,42 C 52,34 70,38 70,26 C 70,18 58,18 46,19 C 41,20 40,24 40,28 Z" ${pStyle} />
            <!-- Dimension H (Total Height) -->
            <line x1="28" y1="20" x2="28" y2="104" ${mStyle} />
            <line x1="24" y1="20" x2="32" y2="20" stroke="${guide}" stroke-width="1" />
            <line x1="24" y1="104" x2="32" y2="104" stroke="${guide}" stroke-width="1" />
            <text x="20" y="66" ${tStyle}>H</text>
            <!-- Dimension t (Web Thickness) -->
            <line x1="40" y1="110" x2="52" y2="110" stroke="#ef4444" stroke-width="2" />
            <text x="46" y="117" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="800">t</text>
            <!-- Bulb Label -->
            <text x="75" y="26" font-size="8.5" fill="${stroke}" font-weight="800">Bulb</text>
          </svg>
        `;

      case "squareBar":
        return `
          <svg viewBox="0 0 118 122" class="shape-svg">
            <rect x="12" y="28" width="76" height="76" rx="2" ${pStyle} />
            <!-- Dimension W (Top) -->
            <line x1="12" y1="18" x2="88" y2="18" ${mStyle} />
            <line x1="12" y1="18" x2="12" y2="23" stroke="${guide}" stroke-width="1" />
            <line x1="88" y1="18" x2="88" y2="23" stroke="${guide}" stroke-width="1" />
            <text x="50" y="13" text-anchor="middle" ${tStyle}>W</text>
            <!-- Dimension H (Right) -->
            <line x1="95" y1="28" x2="95" y2="104" ${mStyle} />
            <line x1="91" y1="28" x2="98" y2="28" stroke="${guide}" stroke-width="1" />
            <line x1="91" y1="104" x2="98" y2="104" stroke="${guide}" stroke-width="1" />
            <text x="99" y="70" ${tStyle}>H</text>
          </svg>
        `;

      case "roundBar":
        return `
          <svg viewBox="0 0 115 118" class="shape-svg">
            <circle cx="54" cy="56" r="40" ${pStyle} />
            <line x1="14" y1="56" x2="94" y2="56" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="54" y1="56" x2="94" y2="56" stroke="#ff7f00" stroke-width="2" />
            <text x="74" y="50" text-anchor="middle" ${tStyle}>D/2</text>
            <text x="54" y="110" text-anchor="middle" ${tStyle}>${txtDiaD}</text>
          </svg>
        `;

      case "tubular":
        return `
          <svg viewBox="0 0 115 118" class="shape-svg">
            <circle cx="54" cy="56" r="40" ${pStyle} />
            <circle cx="54" cy="56" r="28" fill="${cutout}" stroke="${stroke}" stroke-width="2" />
            <line x1="54" y1="56" x2="94" y2="56" stroke="#ff7f00" stroke-width="1.5" />
            <text x="74" y="50" text-anchor="middle" ${tStyle}>D</text>
            <line x1="66" y1="56" x2="94" y2="56" stroke="#ef4444" stroke-width="2.5" />
            <text x="80" y="72" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="800">t</text>
          </svg>
        `;

      case "squareTube":
        return `
          <svg viewBox="0 0 118 122" class="shape-svg">
            <rect x="12" y="28" width="76" height="76" rx="2" ${pStyle} />
            <rect x="24" y="40" width="52" height="52" rx="1" fill="${cutout}" stroke="${stroke}" stroke-width="2" />
            <!-- Dimension W (Top) -->
            <line x1="12" y1="18" x2="88" y2="18" ${mStyle} />
            <line x1="12" y1="18" x2="12" y2="23" stroke="${guide}" stroke-width="1" />
            <line x1="88" y1="18" x2="88" y2="23" stroke="${guide}" stroke-width="1" />
            <text x="50" y="13" text-anchor="middle" ${tStyle}>W</text>
            <!-- Dimension H (Right) -->
            <line x1="95" y1="28" x2="95" y2="104" ${mStyle} />
            <line x1="91" y1="28" x2="98" y2="28" stroke="${guide}" stroke-width="1" />
            <line x1="91" y1="104" x2="98" y2="104" stroke="${guide}" stroke-width="1" />
            <text x="100" y="69" ${tStyle}>H</text>
            <!-- Dimension t (Thickness) -->
            <line x1="12" y1="66" x2="24" y2="66" stroke="#ef4444" stroke-width="2" />
            <text x="18" y="59" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="800">t</text>
          </svg>
        `;

      case "box":
        return `
          <svg viewBox="0 0 135 128" class="shape-svg">
            <rect x="10" y="30" width="102" height="78" rx="3" fill="none" stroke="${stroke}" stroke-width="3" />
            <rect x="18" y="38" width="86" height="62" fill="${fill}" stroke="${guide}" stroke-dasharray="3,3" />
            <!-- Dimension W (Top) -->
            <line x1="10" y1="19" x2="112" y2="19" ${mStyle} />
            <line x1="10" y1="19" x2="10" y2="24" stroke="${guide}" stroke-width="1" />
            <line x1="112" y1="19" x2="112" y2="24" stroke="${guide}" stroke-width="1" />
            <text x="61" y="13" text-anchor="middle" ${tStyle}>W</text>
            <!-- Dimension H (Right) -->
            <line x1="118" y1="30" x2="118" y2="108" ${mStyle} />
            <line x1="114" y1="30" x2="122" y2="30" stroke="${guide}" stroke-width="1" />
            <line x1="114" y1="108" x2="122" y2="108" stroke="${guide}" stroke-width="1" />
            <text x="123" y="72" ${tStyle}>H</text>
            <text x="61" y="72" text-anchor="middle" font-size="9" ${tStyle}>${txtBoxDepth}</text>
          </svg>
        `;

      default:
        return `<div class="empty-diagram-placeholder">${txtSelect}</div>`;
    }
  }
};

if (typeof module !== "undefined") {
  module.exports = ShapeDiagrams;
}
