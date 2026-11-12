/**
 * WCL - User Manual & Legal Disclaimer Modal Data
 */

const HelpManual = {
  getSections(lang = "ko") {
    const t = (typeof I18N !== "undefined" && I18N[lang]) ? I18N[lang] : {};
    return [
      { id: "m1", title: t.m1title, body: t.m1body, isWarning: false },
      { id: "m2", title: t.m2title, body: t.m2body, isWarning: false },
      { id: "m3", title: t.m3title, body: t.m3body, isWarning: false },
      { id: "m4", title: t.m4title, body: t.m4body, isWarning: false },
      { id: "m5", title: t.m5title, body: t.m5body, isWarning: false },
      { id: "m6", title: t.m6title, body: t.m6body, isWarning: false },
      { id: "m7", title: t.m7title, body: t.m7body, isWarning: false },
      { id: "m8", title: t.m8title, body: t.m8body, isWarning: false },
      { id: "m9", title: t.m9title, body: t.m9body, isWarning: false },
      { id: "m10", title: t.m10title, body: t.m10body, isWarning: false },
      { id: "m11", title: t.m11title, body: t.m11body, isWarning: false },
      { id: "m12", title: t.m12title, body: t.m12body, isWarning: true }
    ];
  }
};

if (typeof module !== "undefined") {
  module.exports = HelpManual;
}
