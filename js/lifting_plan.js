/**
 * WCL - Lifting Plan Generator (인양 작업계획서 모듈)
 * 5개 국어(한국어, 영어, 중국어, 일본어, 스페인어) 및 국가별 공식 표준 서식 100% 완전 번역 지원:
 *  - ko: 한국 산업안전보건기준에 관한 규칙 제38조 별표4 (중량물 취급 및 양중작업계획서)
 *  - en: 미국 OSHA 29 CFR 1926.1400 / ASME B30.5 Critical Lift Plan & Rigging Study
 *  - zh: 중국 建筑起重机械安全监督管理规定 / JGJ 276-2012 建筑起重吊装工程专项施工方案
 *  - ja: 일본 労働安全衛生規則 第66条の2 (クレーン等による揚重作業計画書)
 *  - es: ISO 12480-1 (Cranes - Safe Use) Plan de Izaje Crítico y Maniobra de Carga
 */

const PLAN_I18N = {
  ko: {
    countryCode: "KR",
    countryName: "대한민국 (KR)",
    standardLaw: "산업안전보건기준에 관한 규칙 제38조 (사전조사 및 작업계획서 작성)",
    formTitle: "중량물 취급 및 양중작업계획서 (법정 표준서식)",
    authorityBadge: "KOSHA GUIDE C-37 / 산안법 제38조 준용",
    approvalTitle: "결재",
    prepBy: "작성 (신호수)",
    revBy: "검토 (안전기사)",
    apprBy: "승인 (현장소장)",
    sign: "(서명)",
    seal: "(인)",
    sec1: "1. 작업 개요 및 기본 정보 (General Information)",
    sec2: "2. 인양 대상물 (화물) 사양 및 중량 제원 (Load Specifications)",
    sec3: "3. 줄걸이(Rigging) 및 인양 각도 선정 기준 (Sling & Gear Selection)",
    sec4: "4. 양중 기계(크레인) 요구 사양 (Crane Requirements)",
    sec5: "5. 현장 안전 수칙 및 작업 전 필수 확인 사항 (Safety Verification)",
    projectLabel: "공 사 명",
    projectVal: "○○ 현장 플랜트 / 구조물 제작 및 설치 공사",
    dateLabel: "작업 일시",
    dateValSuffix: "(당일 유효)",
    deptLabel: "시행 부서",
    deptVal: "현장 안전관리부 / 양중작업팀",
    mgrLabel: "작업 지휘자",
    mgrVal: "작업지휘자 (신호수 배치 완료)",
    matLabel: "강종 (재질)",
    shapeLabel: "형상 구분",
    qtyLabel: "수량",
    dimLabel: "치수 (Dimensions)",
    volLabel: "총 체적 (Volume)",
    unitWLabel: "단위 중량",
    totalWLabel: "총 실측 중량",
    methodLabel: "인양 방식",
    methodVal: "두줄걸이 (2-Leg Sling) 대칭 인양",
    angleLabel: "인양 각도",
    angleCoeff: "하중보정계수",
    effLoadLabel: "유효 보정하중",
    effLoadDesc: "(각도에 따른 실질 장력)",
    judgementLabel: "안전 판정",
    judgementPass: "✓ 적합 (각도 60° 이내 유지 권고)",
    shackleTitle: "🔗 샵클 / 훅 (SF ≥ 5)",
    wireTitle: "➰ 와이어로프 (SF ≥ 5)",
    chainTitle: "⛓ 체인 슬링 (SF ≥ 5)",
    textileTitle: "🎗 섬유 슬링벨트 (SF ≥ 7)",
    craneTypeLabel: "크레인 형식",
    craneSfLabel: "적용 안전율",
    craneSfVal: "안전계수 적용 (법정 기준)",
    minSwlLabel: "필요 최소 SWL",
    minSwlPrefix: "최소 정격 인양능력",
    minSwlSuffix: "이상 크레인 투입 필수",
    certPledge: "위와 같이 산업안전보건법 및 안전작업 절차를 준수하여 인양작업을 승인합니다.",
    dateSignLabel: "일자",
    officerSignLabel: "총괄책임자",
    btnShare: "📲 공유",
    btnPrint: "🖨️ 인쇄 / PDF 저장 (A4)",
    btnClose: "✕ 닫기",
    shareAlertCopy: "📋 인양 작업계획서 핵심 요약본이 클립보드에 복사되었습니다!\\n메신저 또는 SNS에 [붙여넣기]하여 공유하세요.",
    shareSummaryTitle: "[인양 작업계획서 승인요청]",
    rules: [
      "1. 권과방지장치, 과부하방지장치 등 방호장치 작동 상태 점검 완료",
      "2. 훅 해지장치 및 샤클 체결핀 분할핀(Split pin) 고정 여부 확인",
      "3. 와이어로프 소선 단선(10% 미만), 킹크, 부식 여부 점검 완료",
      "4. 인양물 상부 잔류물 및 하부 근로자 출입 통제선(20m 이내) 설치 확인",
      "5. 작업 전 지반 지지력 점검 및 아웃트리거 받침목(침목) 설치 확인"
    ]
  },
  en: {
    countryCode: "US",
    countryName: "United States (US) / International",
    standardLaw: "OSHA 29 CFR 1926.1400 / ASME B30.5 Compliance",
    formTitle: "CRITICAL LIFT PLAN & RIGGING STUDY (Standard Form)",
    authorityBadge: "OSHA 1926 / ASME B30 Certified Format",
    approvalTitle: "APPROVAL",
    prepBy: "Prepared (Rigger)",
    revBy: "Reviewed (Safety)",
    apprBy: "Approved (Site Mgr)",
    sign: "(Sign)",
    seal: "(Sign)",
    sec1: "1. General Information & Job Scope",
    sec2: "2. Load Specifications & Certified Weight",
    sec3: "3. Sling & Rigging Gear Selection",
    sec4: "4. Crane Requirements & Minimum SWL",
    sec5: "5. Pre-Lift Safety Verification Checklist",
    projectLabel: "Project Title",
    projectVal: "Heavy Industrial Structure Erection & Heavy Lift Operations",
    dateLabel: "Lift Date",
    dateValSuffix: "(Valid for date)",
    deptLabel: "Department",
    deptVal: "Rigging Operations & Site HSE Dept.",
    mgrLabel: "Lift Director",
    mgrVal: "Certified Lift Director (Designated Signal Person assigned)",
    matLabel: "Material",
    shapeLabel: "Shape / Type",
    qtyLabel: "Quantity",
    dimLabel: "Dimensions",
    volLabel: "Total Volume",
    unitWLabel: "Unit Weight",
    totalWLabel: "Total Net Weight",
    methodLabel: "Hitch Method",
    methodVal: "2-Leg Symmetrical Bridle Sling",
    angleLabel: "Included Angle",
    angleCoeff: "Load Factor",
    effLoadLabel: "Effective Tension",
    effLoadDesc: "(Tension under lift angle)",
    judgementLabel: "Assessment",
    judgementPass: "✓ Certified Safe (Within 60° recommendation)",
    shackleTitle: "🔗 Shackle / Hook (SF ≥ 5)",
    wireTitle: "➰ Wire Rope (SF ≥ 5)",
    chainTitle: "⛓ Chain Sling (SF ≥ 5)",
    textileTitle: "🎗 Synthetic Sling (SF ≥ 7)",
    craneTypeLabel: "Crane Type",
    craneSfLabel: "Safety Factor",
    craneSfVal: "Compliant with OSHA/ASME standard",
    minSwlLabel: "Min. Required SWL",
    minSwlPrefix: "Minimum Net Lifting Capacity",
    minSwlSuffix: "or greater required",
    certPledge: "This Critical Lift Plan complies with OSHA/ASME safety regulations and is certified for lifting operations.",
    dateSignLabel: "Date",
    officerSignLabel: "Site Manager",
    btnShare: "📲 Share",
    btnPrint: "🖨️ Print / Save as PDF (A4)",
    btnClose: "✕ Close",
    shareAlertCopy: "📋 Critical Lift Plan summary copied to clipboard!\\nPaste into messenger or email to share with Site Director.",
    shareSummaryTitle: "[Critical Lift Plan Approval Request]",
    rules: [
      "1. Load limiters, anti-two block (A2B), and boom angle indicators tested and verified.",
      "2. Shackle pins secured with safety cotter pins; hook safety latch fully functional.",
      "3. Wire ropes inspected: broken wires < 10%, no severe kinks, crushing, or corrosion.",
      "4. Barricades installed around entire swing radius and fall zone with dedicated spotters.",
      "5. Ground bearing capacity verified and outrigger pads / steel plates properly placed."
    ]
  },
  zh: {
    countryCode: "CN",
    countryName: "中国 (CN)",
    standardLaw: "建筑起重机械安全监督管理规定 / JGJ 276-2012 专项方案",
    formTitle: "建筑起重吊装工程专项施工方案 (作业计划书)",
    authorityBadge: "国家特种设备安全法 / JGJ 276 强制性标准",
    approvalTitle: "审批",
    prepBy: "编制人 (司索指挥)",
    revBy: "审核人 (安全员)",
    apprBy: "审批人 (项目经理)",
    sign: "(签字)",
    seal: "(签章)",
    sec1: "1. 工程概况与作业基本信息 (General Information)",
    sec2: "2. 吊装构件规格及重量参数 (Load Specifications)",
    sec3: "3. 吊索具选型及起吊角度验算 (Rigging Selection)",
    sec4: "4. 起重机械选型与额定起重量核算 (Crane Requirements)",
    sec5: "5. 吊装作业安全技术措施与核查 (Safety Verification)",
    projectLabel: "工程名称",
    projectVal: "重点工业钢结构及重大设备吊装工程",
    dateLabel: "作业日期",
    dateValSuffix: "(当日有效)",
    deptLabel: "实施部门",
    deptVal: "工程安全监督管理部 / 吊装班组",
    mgrLabel: "起重指挥员",
    mgrVal: "持证专职起重指挥员 (设专业信号工)",
    matLabel: "钢种材性",
    shapeLabel: "构件截面",
    qtyLabel: "数量",
    dimLabel: "外形尺寸",
    volLabel: "总体积",
    unitWLabel: "单件重量",
    totalWLabel: "构件总重量",
    methodLabel: "绑扎方式",
    methodVal: "两点对称双肢吊索绑扎 (2-Leg Sling)",
    angleLabel: "起吊夹角",
    angleCoeff: "载荷修正系数",
    effLoadLabel: "单肢有效张力",
    effLoadDesc: "(含角度效应计算负荷)",
    judgementLabel: "安全验算",
    judgementPass: "✓ 验算合格 (推荐夹角控制在60°以内)",
    shackleTitle: "🔗 卸扣 / 吊钩 (安全系数 ≥ 5)",
    wireTitle: "➰ 钢丝绳索具 (安全系数 ≥ 5)",
    chainTitle: "⛓ 起重链条 (安全系数 ≥ 5)",
    textileTitle: "🎗 合成纤维吊装带 (安全系数 ≥ 7)",
    craneTypeLabel: "起重机类型",
    craneSfLabel: "安全裕度",
    craneSfVal: "严格执行特种设备法定标准",
    minSwlLabel: "最小额定SWL",
    minSwlPrefix: "起重机工作半径内额定起重量须达",
    minSwlSuffix: "以上",
    certPledge: "本专项施工计划严格符合国家起重安全规程，核算无误，准予作业。",
    dateSignLabel: "签发日期",
    officerSignLabel: "项目技术负责人",
    btnShare: "📲 方案共享",
    btnPrint: "🖨️ 打印 / 保存为 PDF (A4)",
    btnClose: "✕ 关闭",
    shareAlertCopy: "📋 起重专项吊装计划书核心摘要已复制至剪贴板！\\n请粘贴发送至工作群进行共享。",
    shareSummaryTitle: "[专项吊装作业计划书审核备案]",
    rules: [
      "1. 起重机力矩限制器、高度限位及防坠落安全保护装置检测合格",
      "2. 钢丝绳断丝、压扁磨损检查合格 (未超过报废标准 GB/T 5972)",
      "3. 吊索具(卸扣、吊带)额定载荷标识完整，严禁超载起吊",
      "4. 吊装警戒区设立警示标志，专职安全员现场监护，无关人员严禁入内",
      "5. 支腿地基平整坚实，按规定垫放钢板或枕木，水平度符合规范要求"
    ]
  },
  ja: {
    countryCode: "JP",
    countryName: "日本 (JP)",
    standardLaw: "労働安全衛生規則 第66条の2 (重量物取扱作業計画策定)",
    formTitle: "クレーン等による揚重作業計画書 (労働安全基準様式)",
    authorityBadge: "安衛則第66条の2・クレーン構造規格適合",
    approvalTitle: "承認印",
    prepBy: "作成 (玉掛者)",
    revBy: "確認 (安全員)",
    apprBy: "承認 (所長)",
    sign: "(印)",
    seal: "(印)",
    sec1: "1. 作業概要および基本情報 (General Information)",
    sec2: "2. 揚重対象物(荷)の仕様・実測重量 (Load Specifications)",
    sec3: "3. 玉掛け用具の選定および吊り角度基準 (Sling Selection)",
    sec4: "4. クレーン揚重機械選定および必要定格荷重 (Crane Requirements)",
    sec5: "5. 作業前安全点検確認事項 (Safety Verification)",
    projectLabel: "工事名称",
    projectVal: "構造物製作・揚重据付工事 (現場プラント)",
    dateLabel: "作業日時",
    dateValSuffix: "(当日限り有効)",
    deptLabel: "施工部署",
    deptVal: "安全衛生推進室 / 揚重作業班",
    mgrLabel: "作業指揮者",
    mgrVal: "作業指揮者 (玉掛け有資格者・専任合図員配置)",
    matLabel: "材質 (鋼種)",
    shapeLabel: "断面形状",
    qtyLabel: "数量",
    dimLabel: "主要寸法",
    volLabel: "総体積",
    unitWLabel: "単体重量",
    totalWLabel: "実測総重量",
    methodLabel: "玉掛け工法",
    methodVal: "2本吊り対称玉掛け (2-Leg Sling)",
    angleLabel: "吊り角度",
    angleCoeff: "割増係数",
    effLoadLabel: "有効計算荷重",
    effLoadDesc: "(角度考慮後の張力)",
    judgementLabel: "判定結果",
    judgementPass: "✓ 適合 (吊り角度60度以内を厳守)",
    shackleTitle: "🔗 シャックル / フック (安全率 ≥ 5)",
    wireTitle: "➰ ワイヤロープ (安全率 ≥ 5)",
    chainTitle: "⛓ チェーンスリング (安全率 ≥ 5)",
    textileTitle: "🎗 ベルトスリング (安全率 ≥ 7)",
    craneTypeLabel: "クレーン種別",
    craneSfLabel: "安全率基準",
    craneSfVal: "労働安全衛生法基準適合",
    minSwlLabel: "必要最小SWL",
    minSwlPrefix: "定格荷重能力",
    minSwlSuffix: "以上のクレーン選定が必須",
    certPledge: "本揚重計画書は労働安全衛生法規を遵守し、事前の安全確認を完了の上承認します。",
    dateSignLabel: "承認日付",
    officerSignLabel: "統括安全衛生責任者",
    btnShare: "📲 計画書の共有",
    btnPrint: "🖨️ 印刷 / PDF保存 (A4)",
    btnClose: "✕ 閉じる",
    shareAlertCopy: "📋 揚重作業計画書の概要をクリップボードにコピーしました！\\nメッセンジャー等に貼り付けて共有してください。",
    shareSummaryTitle: "【揚重作業計画書 承認申請】",
    rules: [
      "1. 過負荷防止装置、巻過防止装置等セーフティリミットの作動確認済",
      "2. 玉掛け用ワイヤロープの素線素断・キンク等の廃棄基準適合確認済",
      "3. シャックルピン締結状態およびフック外れ止め装置の機能確認",
      "4. 揚重旋回半径内の立入禁止区画の設定および合図員の配置確認",
      "5. アウトリガーの最大張出および敷板・敷鉄板による地盤養生の確認"
    ]
  },
  es: {
    countryCode: "ES",
    countryName: "Español / ISO International",
    standardLaw: "ISO 12480-1 (Grúas - Prácticas de Trabajo Seguras)",
    formTitle: "PLAN DE IZAJE CRÍTICO Y MANIOBRA DE CARGA",
    authorityBadge: "Norma ISO 12480-1 / EN 13000 Formato Oficial",
    approvalTitle: "APROBACIÓN",
    prepBy: "Elaboró (Rigger)",
    revBy: "Revisó (Seguridad)",
    apprBy: "Aprobó (Supervisor)",
    sign: "(Firma)",
    seal: "(Sello)",
    sec1: "1. Información General del Proyecto (General Information)",
    sec2: "2. Especificaciones de la Carga y Peso (Load Specifications)",
    sec3: "3. Aparejo y Selección de Accesorios (Rigging Selection)",
    sec4: "4. Requisitos de Grúa y Capacidad Mínima (Crane Requirements)",
    sec5: "5. Lista de Verificación de Seguridad en Sitio (Safety Rules)",
    projectLabel: "Proyecto",
    projectVal: "Montaje Industrial de Estructuras Pesadas",
    dateLabel: "Fecha",
    dateValSuffix: "(Válido para la fecha)",
    deptLabel: "Departamento",
    deptVal: "Operaciones de Izaje / Seguridad HSE",
    mgrLabel: "Supervisor",
    mgrVal: "Supervisor de Maniobra (Rigger Certificado asignado)",
    matLabel: "Material",
    shapeLabel: "Forma / Perfil",
    qtyLabel: "Cantidad",
    dimLabel: "Dimensiones",
    volLabel: "Volumen Total",
    unitWLabel: "Peso Unitario",
    totalWLabel: "Peso Total Certificado",
    methodLabel: "Método de Izaje",
    methodVal: "Eslingado en 2 Ramales Simétricos (2-Leg Sling)",
    angleLabel: "Ángulo de Izaje",
    angleCoeff: "Factor de Carga",
    effLoadLabel: "Tensión Efectiva",
    effLoadDesc: "(Tensión bajo ángulo de maniobra)",
    judgementLabel: "Evaluación",
    judgementPass: "✓ Conforme (Ángulo recomendado ≤ 60°)",
    shackleTitle: "🔗 Grilletes / Gancho (FS ≥ 5)",
    wireTitle: "➰ Estrobos de Acero (FS ≥ 5)",
    chainTitle: "⛓ Eslingas de Cadena (FS ≥ 5)",
    textileTitle: "🎗 Eslingas de Cinta (FS ≥ 7)",
    craneTypeLabel: "Tipo de Grúa",
    craneSfLabel: "Factor de Seg.",
    craneSfVal: "Conforme a normas EN/ISO aplicables",
    minSwlLabel: "SWL Mínimo",
    minSwlPrefix: "Capacidad neta mínima requerida",
    minSwlSuffix: "o superior en el radio",
    certPledge: "El presente Plan de Izaje cumple estrictamente las normas técnicas de seguridad de maniobra.",
    dateSignLabel: "Fecha",
    officerSignLabel: "Director de Obra",
    btnShare: "📲 Compartir",
    btnPrint: "🖨️ Imprimir / Guardar PDF (A4)",
    btnClose: "✕ Cerrar",
    shareAlertCopy: "📋 ¡Resumen del Plan de Izaje copiado al portapapeles!\\nPéguelo en su aplicación de mensajería para compartir.",
    shareSummaryTitle: "[Solicitud de Aprobación - Plan de Izaje]",
    rules: [
      "1. Limitadores de carga y dispositivos fin de carrera inspeccionados y operativos.",
      "2. Pasadores de grilletes asegurados con chavetas; seguro de gancho verificado.",
      "3. Cables y eslingas inspeccionados sin roturas ni deformaciones fuera de norma.",
      "4. Radio de giro acordonado con vigías y prohibición total de paso bajo la carga.",
      "5. Verificación de capacidad portante del suelo y calzos bajo estabilizadores."
    ]
  }
};

const LiftingPlan = {
  getCountrySpecs(lang = "ko") {
    return PLAN_I18N[lang] || PLAN_I18N.ko;
  },

  generatePlanHtml(data, lang = "ko") {
    const t = this.getCountrySpecs(lang);
    const dateStr = new Date().toLocaleDateString(lang === "ko" ? "ko-KR" : (lang === "ja" ? "ja-JP" : (lang === "zh" ? "zh-CN" : "en-US")), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const docNo = "LIFT-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    const dimsText = Object.entries(data.dims || {})
      .filter(([k, v]) => v != null && v !== "")
      .map(([k, v]) => `${k}: ${v}${k === "L" ? "m" : "mm"}`)
      .join(" × ");

    // Safe project / dept / manager values
    const projectVal = (data.headerInfo && data.headerInfo.projectName)
      ? data.headerInfo.projectName
      : t.projectVal;
    const deptVal = (data.headerInfo && data.headerInfo.deptName)
      ? data.headerInfo.deptName
      : t.deptVal;
    const mgrVal = (data.headerInfo && data.headerInfo.managerName)
      ? data.headerInfo.managerName
      : t.mgrVal;
    const workDateVal = (data.headerInfo && data.headerInfo.workDate)
      ? data.headerInfo.workDate
      : dateStr;

    // JSON encoded strings to safely pass into script
    const safeTitle = JSON.stringify(t.formTitle);
    const safeSummaryTitle = JSON.stringify(t.shareSummaryTitle);
    const safeAlertCopy = JSON.stringify(t.shareAlertCopy);
    const safeStandardLaw = JSON.stringify(t.standardLaw);
    const safeDocNo = JSON.stringify(docNo);
    const safeLoad = JSON.stringify(`${data.shapeName} (${data.materialName})`);
    const safeWeight = JSON.stringify(`${(data.wTon || 0).toFixed(3)} ton (${data.wKg ? data.wKg.toLocaleString() : 0} kg)`);
    const safeAngle = JSON.stringify(`${data.angleDeg}° (${data.effLoadTon}t)`);
    const safeGear = JSON.stringify(`${data.gear.shackle} / ${data.gear.wireRope}`);
    const safeCrane = JSON.stringify(`${data.gear.craneSwl} ton`);

    return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t.formTitle} - ${docNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: 'Pretendard', 'Malgun Gothic', 'Noto Sans CJK SC', 'Noto Sans JP', 'Segoe UI', sans-serif;
      margin: 0; padding: 16px; color: #111; background: #fff; line-height: 1.35; font-size: 11.5px;
    }
    .print-sheet {
      max-width: 820px; margin: 0 auto; border: 2px solid #1e3a8a; padding: 18px 22px; background: #fff;
    }
    .top-bar {
      display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 12px; gap: 12px;
    }
    .top-title-wrap { flex: 1; }
    .top-title-wrap h1 {
      margin: 0; font-size: 19px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.4px;
    }
    .top-title-wrap .sub-law {
      font-size: 11px; font-weight: 700; color: #475569; margin-top: 3px;
    }
    .badge-gov {
      display: inline-block; background: #1e3a8a; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; margin-bottom: 4px;
    }
    .approval-table {
      border-collapse: collapse; font-size: 10.5px; text-align: center; flex-shrink: 0;
    }
    .approval-table th, .approval-table td {
      border: 1px solid #94a3b8; padding: 4px 8px; min-width: 68px;
    }
    .approval-table th { background: #f1f5f9; font-weight: 800; }
    .approval-table td { height: 40px; vertical-align: middle; color: #64748b; }

    .sec-title {
      font-size: 12.5px; font-weight: 900; color: #1e3a8a; border-left: 4px solid #2563eb; padding-left: 8px; margin: 12px 0 6px 0; display: flex; justify-content: space-between; align-items: center;
    }
    .data-table {
      width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1; padding: 5.5px 9px; text-align: left;
    }
    .data-table th {
      background: #f8fafc; font-weight: 800; color: #334155; width: 23%;
    }
    .data-table td.val-highlight {
      font-weight: 900; color: #1e3a8a; font-size: 12.5px;
    }

    .gear-box-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;
    }
    .gear-item {
      border: 1.5px solid #2563eb; border-radius: 6px; padding: 7px; background: #eff6ff; text-align: center;
    }
    .gear-item .g-title { font-size: 10px; font-weight: 800; color: #1d4ed8; margin-bottom: 3px; }
    .gear-item .g-val { font-size: 11.5px; font-weight: 900; color: #111; word-break: break-all; }
    .gear-item .g-std { font-size: 9.5px; color: #64748b; margin-top: 2px; }

    .rules-list {
      background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; font-size: 10.5px; line-height: 1.45; color: #334155;
    }
    .sign-row {
      margin-top: 12px; padding-top: 10px; border-top: 1.5px dashed #94a3b8; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 800;
    }
    .btn-bar {
      margin-top: 14px; display: flex; gap: 8px; justify-content: flex-end;
    }
    .btn-act {
      padding: 9px 18px; border: none; border-radius: 6px; font-size: 13px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px;
    }
    .btn-print { background: #2563eb; color: #fff; }
    .btn-share { background: #2563eb; color: #fff; }
    .btn-close { background: #64748b; color: #fff; }

    /* Toast overlay in plan window */
    .plan-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #111827; color: #fff; padding: 12px 24px; border-radius: 999px;
      font-size: 13px; font-weight: 800; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: none; z-index: 9999; animation: toastFadeIn 0.25s ease-out;
    }
    @keyframes toastFadeIn {
      from { opacity: 0; transform: translate(-50%, 15px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }

    @media print {
      body { padding: 0; background: #fff; }
      .print-sheet { border: 2px solid #000; box-shadow: none; padding: 8px 12px; }
      .btn-bar, .plan-toast { display: none !important; }
    }
  </style>
</head>
<body>

<div class="print-sheet">
  <!-- Top Bar -->
  <div class="top-bar">
    <div class="top-title-wrap">
      <span class="badge-gov">${t.authorityBadge}</span>
      <h1>${t.formTitle}</h1>
      <div class="sub-law">${t.standardLaw} · Doc: ${docNo}</div>
    </div>
    <table class="approval-table">
      <tr>
        <th rowspan="2" style="width:18px; writing-mode:vertical-rl; padding:2px;">${t.approvalTitle}</th>
        <th>${t.prepBy}</th>
        <th>${t.revBy}</th>
        <th>${t.apprBy}</th>
      </tr>
      <tr>
        <td>${t.sign}</td>
        <td>${t.sign}</td>
        <td>${t.seal}</td>
      </tr>
    </table>
  </div>

  <!-- Sec 1 -->
  <div class="sec-title">${t.sec1}</div>
  <table class="data-table">
    <tr>
      <th>${t.projectLabel}</th>
      <td contenteditable="true" title="Click to edit">${projectVal}</td>
      <th>${t.dateLabel}</th>
      <td contenteditable="true" title="Click to edit">${workDateVal} ${t.dateValSuffix}</td>
    </tr>
    <tr>
      <th>${t.deptLabel}</th>
      <td contenteditable="true" title="Click to edit">${deptVal}</td>
      <th>${t.mgrLabel}</th>
      <td contenteditable="true" title="Click to edit">${mgrVal}</td>
    </tr>
  </table>

  <!-- Sec 2 -->
  <div class="sec-title">
    <span>${t.sec2}</span>
  </div>
  <table class="data-table">
    <tr>
      <th>${t.matLabel}</th>
      <td><strong>${data.materialName}</strong> (${data.materialStd || "Standard Spec"})</td>
      <th>${t.shapeLabel}</th>
      <td><strong>${data.shapeName}</strong> (${t.qtyLabel}: ${data.qty} EA)</td>
    </tr>
    <tr>
      <th>${t.dimLabel}</th>
      <td>${dimsText}</td>
      <th>${t.volLabel}</th>
      <td>${(data.volM3 || 0).toFixed(4)} m³</td>
    </tr>
    <tr>
      <th>${t.unitWLabel}</th>
      <td>${((data.wKg || 0) / (data.qty || 1)).toFixed(2)} kg / EA</td>
      <th>${t.totalWLabel}</th>
      <td class="val-highlight">${data.wKg ? data.wKg.toLocaleString() : 0} kg (${(data.wTon || 0).toFixed(3)} ton)</td>
    </tr>
  </table>

  <!-- Sec 3 -->
  <div class="sec-title">${t.sec3}</div>
  <table class="data-table" style="margin-bottom:8px;">
    <tr>
      <th>${t.methodLabel}</th>
      <td>${t.methodVal}</td>
      <th>${t.angleLabel}</th>
      <td><strong>${data.angleDeg}°</strong> (${t.angleCoeff}: ×${data.angleFactor})</td>
    </tr>
    <tr>
      <th>${t.effLoadLabel}</th>
      <td class="val-highlight" style="color:#d97706;">${data.effLoadTon} ton ${t.effLoadDesc}</td>
      <th>${t.judgementLabel}</th>
      <td><span style="color:#16a34a; font-weight:900;">${t.judgementPass}</span></td>
    </tr>
  </table>

  <div class="gear-box-grid">
    <div class="gear-item">
      <div class="g-title">${t.shackleTitle}</div>
      <div class="g-val">${data.gear.shackle}</div>
      <div class="g-std">EN 13889 / RR-C-271</div>
    </div>
    <div class="gear-item">
      <div class="g-title">${t.wireTitle}</div>
      <div class="g-val">${data.gear.wireRope}</div>
      <div class="g-std">EN 12385 Spec</div>
    </div>
    <div class="gear-item">
      <div class="g-title">${t.chainTitle}</div>
      <div class="g-val">${data.gear.chainSling}</div>
      <div class="g-std">Grade 80 / EN 818</div>
    </div>
    <div class="gear-item">
      <div class="g-title">${t.textileTitle}</div>
      <div class="g-val">${data.gear.textileSling}</div>
      <div class="g-std">EN 1492-1 / 2 Ply</div>
    </div>
  </div>

  <!-- Sec 4 -->
  <div class="sec-title">${t.sec4}</div>
  <table class="data-table">
    <tr>
      <th>${t.craneTypeLabel}</th>
      <td><strong>${data.craneName}</strong></td>
      <th>${t.craneSfLabel}</th>
      <td>${t.craneSfVal} (Factor ${data.gear.craneFactor})</td>
    </tr>
    <tr>
      <th>${t.minSwlLabel}</th>
      <td colspan="3" class="val-highlight" style="color:#dc2626;">
        ${t.minSwlPrefix} <strong>${data.gear.craneSwl} ton</strong> ${t.minSwlSuffix}
      </td>
    </tr>
  </table>

  <!-- Sec 5 -->
  <div class="sec-title">${t.sec5}</div>
  <div class="rules-list">
    ${t.rules.map(r => `<div>${r}</div>`).join("")}
  </div>

  <!-- Sign Row -->
  <div class="sign-row">
    <div>${t.certPledge}</div>
    <div>${t.dateSignLabel}: ${dateStr} · ${t.officerSignLabel}: ____________________ ${t.sign}</div>
  </div>

  <!-- Action Buttons -->
  <div class="btn-bar">
    <button type="button" class="btn-act btn-share" onclick="sharePlan()">
      ${t.btnShare}
    </button>
    <button type="button" class="btn-act btn-print" onclick="window.print()">
      ${t.btnPrint}
    </button>
    <button type="button" class="btn-act btn-close" onclick="window.close()">
      ${t.btnClose}
    </button>
  </div>
</div>

<div id="toastEl" class="plan-toast"></div>

<script>
  function showToast(msg) {
    const t = document.getElementById('toastEl');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3200);
  }

  function sharePlan() {
    const title = ${safeTitle};
    const summaryText = ${safeSummaryTitle} + "\\n" +
      "• Doc No: " + ${safeDocNo} + "\\n" +
      "• Load: " + ${safeLoad} + "\\n" +
      "• Total Weight: " + ${safeWeight} + "\\n" +
      "• Angle: " + ${safeAngle} + "\\n" +
      "• Rigging: " + ${safeGear} + "\\n" +
      "• Crane Min SWL: " + ${safeCrane} + "\\n" +
      "• Standard: " + ${safeStandardLaw};

    const copyToClipboard = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText).then(() => {
          showToast(${safeAlertCopy});
        }).catch(() => fallbackCopy(summaryText));
      } else {
        fallbackCopy(summaryText);
      }
    };

    const fallbackCopy = (text) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast(${safeAlertCopy});
      } catch (err) {
        alert("Copy failed: " + err);
      }
      document.body.removeChild(ta);
    };

    if (navigator.share) {
      navigator.share({
        title: title,
        text: summaryText
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      });
    } else {
      copyToClipboard();
    }
  }
</script>
</body>
</html>
    `;
  },

  openPlanWindow(data, lang = "ko") {
    const htmlContent = this.generatePlanHtml(data, lang);
    let win = null;
    try {
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      win = window.open(blobUrl, "_blank");
    } catch (e) {}

    if (!win) {
      try {
        win = window.open("", "_blank");
        if (win) {
          win.document.open();
          win.document.write(htmlContent);
          win.document.close();
        }
      } catch (e) {}
    }

    if (!win) {
      if (typeof window.showPlanInModal === "function") {
        window.showPlanInModal(htmlContent);
      } else {
        alert(lang === "ko" ? "팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해 주세요." : "Popup blocked. Please allow popups for this site.");
      }
    }
  }
};

if (typeof module !== "undefined") {
  module.exports = LiftingPlan;
}
