export interface TestParameter {
  name: string;
  unit: string;
  refRange: string;
  refLow?: number;
  refHigh?: number;
  category?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  shortName: string;
  description: string;
  parameters: TestParameter[];
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    shortName: "CBC",
    description: "Comprehensive blood cell analysis including RBC, WBC, platelets, and indices",
    parameters: [
      { name: "Hemoglobin", unit: "g/dL", refRange: "13.0–17.0 (M) / 12.0–15.5 (F)", refLow: 12.0, refHigh: 17.0 },
      { name: "RBC Count", unit: "million/µL", refRange: "4.5–5.5 (M) / 4.0–5.0 (F)", refLow: 4.0, refHigh: 5.5 },
      { name: "WBC Count", unit: "×10³/µL", refRange: "4.5–11.0", refLow: 4.5, refHigh: 11.0 },
      { name: "Platelet Count", unit: "×10³/µL", refRange: "150–400", refLow: 150, refHigh: 400 },
      { name: "Hematocrit (PCV)", unit: "%", refRange: "38–50 (M) / 36–44 (F)", refLow: 36, refHigh: 50 },
      { name: "MCV", unit: "fL", refRange: "80–100", refLow: 80, refHigh: 100 },
      { name: "MCH", unit: "pg", refRange: "27–33", refLow: 27, refHigh: 33 },
      { name: "MCHC", unit: "g/dL", refRange: "32–36", refLow: 32, refHigh: 36 },
      { name: "RDW", unit: "%", refRange: "11.5–14.5", refLow: 11.5, refHigh: 14.5 },
      { name: "Neutrophils", unit: "%", refRange: "40–70", refLow: 40, refHigh: 70, category: "Differential" },
      { name: "Lymphocytes", unit: "%", refRange: "20–40", refLow: 20, refHigh: 40, category: "Differential" },
      { name: "Monocytes", unit: "%", refRange: "2–8", refLow: 2, refHigh: 8, category: "Differential" },
      { name: "Eosinophils", unit: "%", refRange: "1–4", refLow: 1, refHigh: 4, category: "Differential" },
      { name: "Basophils", unit: "%", refRange: "0–1", refLow: 0, refHigh: 1, category: "Differential" },
      { name: "ESR", unit: "mm/hr", refRange: "0–15 (M) / 0–20 (F)", refLow: 0, refHigh: 20 },
    ],
  },
  {
    id: "lft",
    name: "Liver Function Test (LFT)",
    shortName: "LFT",
    description: "Assess liver health including enzymes, proteins, and bilirubin levels",
    parameters: [
      { name: "Total Bilirubin", unit: "mg/dL", refRange: "0.1–1.2", refLow: 0.1, refHigh: 1.2 },
      { name: "Direct Bilirubin", unit: "mg/dL", refRange: "0.0–0.3", refLow: 0.0, refHigh: 0.3 },
      { name: "Indirect Bilirubin", unit: "mg/dL", refRange: "0.1–0.9", refLow: 0.1, refHigh: 0.9 },
      { name: "SGOT (AST)", unit: "U/L", refRange: "8–40", refLow: 8, refHigh: 40 },
      { name: "SGPT (ALT)", unit: "U/L", refRange: "7–56", refLow: 7, refHigh: 56 },
      { name: "ALP", unit: "U/L", refRange: "44–147", refLow: 44, refHigh: 147 },
      { name: "GGT", unit: "U/L", refRange: "9–48", refLow: 9, refHigh: 48 },
      { name: "Total Protein", unit: "g/dL", refRange: "6.0–8.3", refLow: 6.0, refHigh: 8.3 },
      { name: "Albumin", unit: "g/dL", refRange: "3.5–5.5", refLow: 3.5, refHigh: 5.5 },
      { name: "Globulin", unit: "g/dL", refRange: "2.0–3.5", refLow: 2.0, refHigh: 3.5 },
      { name: "A/G Ratio", unit: "", refRange: "1.0–2.5", refLow: 1.0, refHigh: 2.5 },
    ],
  },
  {
    id: "rft",
    name: "Renal Function Test (RFT)",
    shortName: "RFT",
    description: "Evaluate kidney function including creatinine, BUN, and electrolytes",
    parameters: [
      { name: "Blood Urea", unit: "mg/dL", refRange: "15–40", refLow: 15, refHigh: 40 },
      { name: "BUN", unit: "mg/dL", refRange: "7–20", refLow: 7, refHigh: 20 },
      { name: "Serum Creatinine", unit: "mg/dL", refRange: "0.7–1.3", refLow: 0.7, refHigh: 1.3 },
      { name: "Uric Acid", unit: "mg/dL", refRange: "3.5–7.2", refLow: 3.5, refHigh: 7.2 },
      { name: "Sodium", unit: "mEq/L", refRange: "136–145", refLow: 136, refHigh: 145 },
      { name: "Potassium", unit: "mEq/L", refRange: "3.5–5.0", refLow: 3.5, refHigh: 5.0 },
      { name: "Chloride", unit: "mEq/L", refRange: "98–106", refLow: 98, refHigh: 106 },
      { name: "Calcium", unit: "mg/dL", refRange: "8.5–10.5", refLow: 8.5, refHigh: 10.5 },
      { name: "Phosphorus", unit: "mg/dL", refRange: "2.5–4.5", refLow: 2.5, refHigh: 4.5 },
      { name: "eGFR", unit: "mL/min/1.73m²", refRange: ">90", refLow: 90, refHigh: 999 },
    ],
  },
  {
    id: "lipid",
    name: "Lipid Profile",
    shortName: "Lipid",
    description: "Cholesterol and triglyceride levels for cardiovascular risk assessment",
    parameters: [
      { name: "Total Cholesterol", unit: "mg/dL", refRange: "<200 (Desirable)", refLow: 0, refHigh: 200 },
      { name: "HDL Cholesterol", unit: "mg/dL", refRange: ">40 (M) / >50 (F)", refLow: 40, refHigh: 999 },
      { name: "LDL Cholesterol", unit: "mg/dL", refRange: "<100 (Optimal)", refLow: 0, refHigh: 100 },
      { name: "VLDL Cholesterol", unit: "mg/dL", refRange: "5–40", refLow: 5, refHigh: 40 },
      { name: "Triglycerides", unit: "mg/dL", refRange: "<150 (Normal)", refLow: 0, refHigh: 150 },
      { name: "TC/HDL Ratio", unit: "", refRange: "<5.0", refLow: 0, refHigh: 5.0 },
      { name: "LDL/HDL Ratio", unit: "", refRange: "<3.5", refLow: 0, refHigh: 3.5 },
    ],
  },
  {
    id: "glucose",
    name: "Blood Glucose Profile",
    shortName: "Glucose",
    description: "Blood sugar levels including fasting, post-prandial, and HbA1c",
    parameters: [
      { name: "Fasting Blood Sugar", unit: "mg/dL", refRange: "70–100", refLow: 70, refHigh: 100 },
      { name: "Post Prandial Blood Sugar", unit: "mg/dL", refRange: "70–140", refLow: 70, refHigh: 140 },
      { name: "Random Blood Sugar", unit: "mg/dL", refRange: "70–140", refLow: 70, refHigh: 140 },
      { name: "HbA1c", unit: "%", refRange: "<5.7 (Normal)", refLow: 0, refHigh: 5.7 },
    ],
  },
  {
    id: "thyroid",
    name: "Thyroid Profile",
    shortName: "Thyroid",
    description: "Thyroid hormone levels to assess thyroid function",
    parameters: [
      { name: "TSH", unit: "µIU/mL", refRange: "0.4–4.0", refLow: 0.4, refHigh: 4.0 },
      { name: "T3 (Total)", unit: "ng/dL", refRange: "80–200", refLow: 80, refHigh: 200 },
      { name: "T4 (Total)", unit: "µg/dL", refRange: "5.0–12.0", refLow: 5.0, refHigh: 12.0 },
      { name: "Free T3", unit: "pg/mL", refRange: "2.3–4.2", refLow: 2.3, refHigh: 4.2 },
      { name: "Free T4", unit: "ng/dL", refRange: "0.8–1.8", refLow: 0.8, refHigh: 1.8 },
    ],
  },
  {
    id: "urine",
    name: "Urine Routine Examination",
    shortName: "Urine R/E",
    description: "Physical, chemical, and microscopic examination of urine",
    parameters: [
      { name: "Color", unit: "", refRange: "Pale Yellow to Yellow", refLow: undefined, refHigh: undefined },
      { name: "Appearance", unit: "", refRange: "Clear", refLow: undefined, refHigh: undefined },
      { name: "Specific Gravity", unit: "", refRange: "1.005–1.030", refLow: 1.005, refHigh: 1.030 },
      { name: "pH", unit: "", refRange: "4.5–8.0", refLow: 4.5, refHigh: 8.0 },
      { name: "Protein", unit: "", refRange: "Nil / Trace", refLow: undefined, refHigh: undefined },
      { name: "Glucose", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "Ketones", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "Bilirubin", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "Blood", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "RBC", unit: "/hpf", refRange: "0–2", refLow: 0, refHigh: 2 },
      { name: "WBC (Pus Cells)", unit: "/hpf", refRange: "0–5", refLow: 0, refHigh: 5 },
      { name: "Epithelial Cells", unit: "/hpf", refRange: "0–5", refLow: 0, refHigh: 5 },
      { name: "Casts", unit: "/lpf", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "Crystals", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
      { name: "Bacteria", unit: "", refRange: "Nil", refLow: undefined, refHigh: undefined },
    ],
  },
  {
    id: "micro",
    name: "Microbiology Report (Culture & Sensitivity)",
    shortName: "Culture/AST",
    description: "Culture results, organism identification, and antibiotic sensitivity",
    parameters: [
      { name: "Sample Type", unit: "", refRange: "-", refLow: undefined, refHigh: undefined },
      { name: "Gram Stain", unit: "", refRange: "-", refLow: undefined, refHigh: undefined },
      { name: "Culture Result", unit: "", refRange: "No Growth", refLow: undefined, refHigh: undefined },
      { name: "Organism Identified", unit: "", refRange: "-", refLow: undefined, refHigh: undefined },
      { name: "Colony Count", unit: "CFU/mL", refRange: "<10⁵", refLow: undefined, refHigh: undefined },
      { name: "Colony Morphology", unit: "", refRange: "-", refLow: undefined, refHigh: undefined },
    ],
  },
  {
    id: "fullbody",
    name: "Full Body Checkup",
    shortName: "Full Body",
    description: "Comprehensive health screening including CBC, LFT, RFT, Lipid, Glucose, and Thyroid",
    parameters: [
      // CBC essentials
      { name: "Hemoglobin", unit: "g/dL", refRange: "12.0–17.0", refLow: 12.0, refHigh: 17.0, category: "CBC" },
      { name: "WBC Count", unit: "×10³/µL", refRange: "4.5–11.0", refLow: 4.5, refHigh: 11.0, category: "CBC" },
      { name: "Platelet Count", unit: "×10³/µL", refRange: "150–400", refLow: 150, refHigh: 400, category: "CBC" },
      // LFT essentials
      { name: "SGOT (AST)", unit: "U/L", refRange: "8–40", refLow: 8, refHigh: 40, category: "LFT" },
      { name: "SGPT (ALT)", unit: "U/L", refRange: "7–56", refLow: 7, refHigh: 56, category: "LFT" },
      { name: "Total Bilirubin", unit: "mg/dL", refRange: "0.1–1.2", refLow: 0.1, refHigh: 1.2, category: "LFT" },
      // RFT essentials
      { name: "Serum Creatinine", unit: "mg/dL", refRange: "0.7–1.3", refLow: 0.7, refHigh: 1.3, category: "RFT" },
      { name: "Blood Urea", unit: "mg/dL", refRange: "15–40", refLow: 15, refHigh: 40, category: "RFT" },
      // Lipid
      { name: "Total Cholesterol", unit: "mg/dL", refRange: "<200", refLow: 0, refHigh: 200, category: "Lipid" },
      { name: "HDL Cholesterol", unit: "mg/dL", refRange: ">40", refLow: 40, refHigh: 999, category: "Lipid" },
      { name: "Triglycerides", unit: "mg/dL", refRange: "<150", refLow: 0, refHigh: 150, category: "Lipid" },
      // Glucose
      { name: "Fasting Blood Sugar", unit: "mg/dL", refRange: "70–100", refLow: 70, refHigh: 100, category: "Glucose" },
      { name: "HbA1c", unit: "%", refRange: "<5.7", refLow: 0, refHigh: 5.7, category: "Glucose" },
      // Thyroid
      { name: "TSH", unit: "µIU/mL", refRange: "0.4–4.0", refLow: 0.4, refHigh: 4.0, category: "Thyroid" },
      { name: "Free T4", unit: "ng/dL", refRange: "0.8–1.8", refLow: 0.8, refHigh: 1.8, category: "Thyroid" },
    ],
  },
];

export function getValueStatus(value: string, refLow?: number, refHigh?: number): "normal" | "abnormal" | "borderline" | "text" {
  if (refLow === undefined || refHigh === undefined) return "text";
  const num = parseFloat(value);
  if (isNaN(num)) return "text";
  
  const rangeDelta = (refHigh - refLow) * 0.1;
  
  if (num >= refLow && num <= refHigh) return "normal";
  if (
    (num < refLow && num >= refLow - rangeDelta) ||
    (num > refHigh && num <= refHigh + rangeDelta)
  ) return "borderline";
  return "abnormal";
}
