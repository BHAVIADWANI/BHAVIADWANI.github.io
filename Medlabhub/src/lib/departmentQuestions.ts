export type Department =
  | "microbiology"
  | "clinical-chemistry"
  | "hematology"
  | "blood-bank"
  | "molecular-biology";

export interface DepartmentInfo {
  id: Department;
  label: string;
  description: string;
}

export const departments: DepartmentInfo[] = [
  { id: "microbiology", label: "Microbiology", description: "Organism identification, Gram stains, biochemical tests" },
  { id: "clinical-chemistry", label: "Clinical Chemistry", description: "Metabolic panels, enzymes, electrolytes, QC" },
  { id: "hematology", label: "Hematology", description: "CBC, cell morphology, coagulation studies" },
  { id: "blood-bank", label: "Blood Bank", description: "ABO/Rh, compatibility testing, transfusion" },
  { id: "molecular-biology", label: "Molecular Biology", description: "PCR, DNA extraction, sequencing, CRISPR" },
];

export interface DepartmentQuestion {
  id: string;
  prompt: string;
  clues: string[];
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clinicalChemistryQuestions: DepartmentQuestion[] = [
  { id: "cc-1", prompt: "Which enzyme is most specific for myocardial infarction?", clues: [], options: ["Troponin I", "CK-MB", "LDH", "AST"], correctAnswer: "Troponin I", explanation: "Troponin I is the gold standard biomarker for MI due to its high cardiac specificity.", category: "Cardiac Markers" },
  { id: "cc-2", prompt: "What does an elevated BUN/Creatinine ratio (>20:1) suggest?", clues: [], options: ["Pre-renal azotemia", "Renal failure", "Post-renal obstruction", "Normal finding"], correctAnswer: "Pre-renal azotemia", explanation: "A BUN/Cr ratio >20:1 suggests pre-renal causes like dehydration or heart failure where urea reabsorption increases.", category: "Renal" },
  { id: "cc-3", prompt: "Which Westgard rule detects a systematic shift?", clues: [], options: ["10x", "1-2s", "1-3s", "R-4s"], correctAnswer: "10x", explanation: "The 10x rule flags when 10 consecutive controls fall on the same side of the mean, indicating systematic shift.", category: "Quality Control" },
  { id: "cc-4", prompt: "An elevated direct bilirubin primarily indicates:", clues: [], options: ["Obstructive jaundice", "Hemolytic anemia", "Gilbert syndrome", "Neonatal jaundice"], correctAnswer: "Obstructive jaundice", explanation: "Direct (conjugated) bilirubin rises in hepatobiliary obstruction because conjugated bilirubin cannot be excreted into the intestine.", category: "Liver" },
  { id: "cc-5", prompt: "Which electrolyte abnormality causes tall, peaked T waves on ECG?", clues: [], options: ["Hyperkalemia", "Hypokalemia", "Hypercalcemia", "Hyponatremia"], correctAnswer: "Hyperkalemia", explanation: "Hyperkalemia (>5.5 mEq/L) causes tall peaked T waves and can progress to fatal cardiac arrhythmias.", category: "Electrolytes" },
  { id: "cc-6", prompt: "HbA1c reflects glucose control over what time period?", clues: [], options: ["2-3 months", "1-2 weeks", "6 months", "24 hours"], correctAnswer: "2-3 months", explanation: "HbA1c reflects average glucose over the 120-day lifespan of red blood cells, approximately 2-3 months.", category: "Diabetes" },
  { id: "cc-7", prompt: "Which liver enzyme is most specific for biliary obstruction?", clues: [], options: ["GGT", "ALT", "AST", "Albumin"], correctAnswer: "GGT", explanation: "GGT (gamma-glutamyl transferase) is highly sensitive for biliary obstruction and cholestatic disease.", category: "Liver" },
  { id: "cc-8", prompt: "In a CMP, which analyte primarily reflects synthetic liver function?", clues: [], options: ["Albumin", "ALT", "Bilirubin", "Glucose"], correctAnswer: "Albumin", explanation: "Albumin is synthesized by the liver. Low albumin indicates impaired hepatic synthetic function.", category: "Liver" },
  { id: "cc-9", prompt: "What does an anion gap >12 mEq/L indicate?", clues: [], options: ["Metabolic acidosis with unmeasured anions", "Respiratory alkalosis", "Metabolic alkalosis", "Normal acid-base status"], correctAnswer: "Metabolic acidosis with unmeasured anions", explanation: "High anion gap metabolic acidosis (HAGMA) is caused by accumulation of unmeasured anions (ketoacids, lactate, toxins). Mnemonic: MUDPILES.", category: "Acid-Base" },
  { id: "cc-10", prompt: "Which specimen type is preferred for glucose testing to prevent glycolysis?", clues: [], options: ["Sodium fluoride (gray top)", "EDTA (lavender top)", "Serum (red top)", "Heparin (green top)"], correctAnswer: "Sodium fluoride (gray top)", explanation: "Sodium fluoride inhibits enolase in the glycolytic pathway, preserving glucose levels in the specimen.", category: "Pre-Analytical" },
  { id: "cc-11", prompt: "Elevated lipase with normal amylase most likely indicates:", clues: [], options: ["Pancreatitis (lipase is more specific)", "Salivary gland disease", "Macroamylasemia", "Renal failure"], correctAnswer: "Pancreatitis (lipase is more specific)", explanation: "Lipase is more specific and stays elevated longer than amylase in pancreatitis. Amylase can be normal in chronic pancreatitis.", category: "Pancreatic" },
  { id: "cc-12", prompt: "The Henderson-Hasselbalch equation relates:", clues: [], options: ["pH to bicarbonate and pCO2", "pH to pO2", "Anion gap to sodium", "Osmolality to BUN"], correctAnswer: "pH to bicarbonate and pCO2", explanation: "pH = 6.1 + log([HCO3-] / (0.03 × pCO2)). This equation is fundamental to acid-base interpretation.", category: "Acid-Base" },
  { id: "cc-13", prompt: "Which tumor marker is used to monitor testicular cancer?", clues: [], options: ["AFP and hCG", "PSA", "CA-125", "CEA"], correctAnswer: "AFP and hCG", explanation: "Alpha-fetoprotein (AFP) and human chorionic gonadotropin (hCG) are key markers for testicular germ cell tumors.", category: "Tumor Markers" },
  { id: "cc-14", prompt: "A 1-3s Westgard violation means:", clues: [], options: ["One control >3 SD from mean (reject run)", "One control >2 SD (warning)", "Shift of 10 controls", "Range exceeds 4 SD"], correctAnswer: "One control >3 SD from mean (reject run)", explanation: "1-3s is a rejection rule indicating random error. The run must be rejected and the error investigated.", category: "Quality Control" },
  { id: "cc-15", prompt: "Which is the first cardiac biomarker to rise after MI?", clues: [], options: ["Myoglobin", "Troponin I", "CK-MB", "LDH"], correctAnswer: "Myoglobin", explanation: "Myoglobin rises within 1-3 hours but lacks cardiac specificity. Troponin rises at 3-6 hours and is more specific.", category: "Cardiac Markers" },
  { id: "cc-16", prompt: "Hemolysis in a blood sample falsely elevates which analyte?", clues: [], options: ["Potassium", "Sodium", "Chloride", "Glucose"], correctAnswer: "Potassium", explanation: "RBCs contain high intracellular potassium. Hemolysis releases potassium, causing falsely elevated results.", category: "Pre-Analytical" },
  { id: "cc-17", prompt: "What is the critical low value for serum calcium?", clues: [], options: ["<6.0 mg/dL", "<8.0 mg/dL", "<10.0 mg/dL", "<4.0 mg/dL"], correctAnswer: "<6.0 mg/dL", explanation: "Serum calcium <6.0 mg/dL is a critical value requiring immediate notification due to risk of tetany and cardiac arrest.", category: "Electrolytes" },
  { id: "cc-18", prompt: "Which test differentiates Type 1 from Type 2 diabetes?", clues: [], options: ["C-peptide level", "Fasting glucose", "HbA1c", "Oral glucose tolerance test"], correctAnswer: "C-peptide level", explanation: "C-peptide reflects endogenous insulin production. It's low/absent in Type 1 (beta cell destruction) and normal/high in Type 2.", category: "Diabetes" },
  { id: "cc-19", prompt: "An elevated CK-MB with a CK-MB/total CK ratio >5% suggests:", clues: [], options: ["Myocardial injury", "Skeletal muscle injury", "Brain injury", "Liver damage"], correctAnswer: "Myocardial injury", explanation: "CK-MB relative index >5% points to cardiac origin. Skeletal muscle injury raises total CK but keeps the ratio low.", category: "Cardiac Markers" },
  { id: "cc-20", prompt: "Cerebrospinal fluid (CSF) glucose is normally what fraction of blood glucose?", clues: [], options: ["60-70%", "90-100%", "30-40%", "10-20%"], correctAnswer: "60-70%", explanation: "Normal CSF glucose is 60-70% of serum glucose. Low CSF glucose suggests bacterial meningitis.", category: "Body Fluids" },
];

const hematologyQuestions: DepartmentQuestion[] = [
  { id: "hem-1", prompt: "Auer rods in blast cells are pathognomonic for:", clues: [], options: ["Acute myeloid leukemia (AML)", "Acute lymphoblastic leukemia (ALL)", "Chronic myeloid leukemia (CML)", "Multiple myeloma"], correctAnswer: "Acute myeloid leukemia (AML)", explanation: "Auer rods are crystallized granules found exclusively in myeloid blasts, making them pathognomonic for AML.", category: "Leukemia" },
  { id: "hem-2", prompt: "What does an elevated RDW with normal MCV suggest?", clues: [], options: ["Early iron deficiency or mixed deficiency", "Thalassemia trait", "Chronic disease", "B12 deficiency"], correctAnswer: "Early iron deficiency or mixed deficiency", explanation: "Elevated RDW with normal MCV suggests early iron deficiency (before MCV drops) or combined iron + B12 deficiency.", category: "Anemia" },
  { id: "hem-3", prompt: "Schistocytes on peripheral smear indicate:", clues: [], options: ["Microangiopathic hemolytic anemia (MAHA)", "Iron deficiency", "Megaloblastic anemia", "Thalassemia"], correctAnswer: "Microangiopathic hemolytic anemia (MAHA)", explanation: "Schistocytes (fragmented RBCs) are caused by mechanical shearing in conditions like TTP, HUS, and DIC.", category: "Morphology" },
  { id: "hem-4", prompt: "Which coagulation test monitors heparin therapy?", clues: [], options: ["aPTT", "PT/INR", "Thrombin time", "Fibrinogen"], correctAnswer: "aPTT", explanation: "aPTT monitors the intrinsic pathway and is used to monitor unfractionated heparin therapy. Therapeutic range is 1.5-2.5x normal.", category: "Coagulation" },
  { id: "hem-5", prompt: "Target cells are characteristically seen in:", clues: [], options: ["Thalassemia and liver disease", "Iron deficiency only", "B12 deficiency only", "Sickle cell disease only"], correctAnswer: "Thalassemia and liver disease", explanation: "Target cells (codocytes) are seen in thalassemia, liver disease, hemoglobin C disease, and post-splenectomy states.", category: "Morphology" },
  { id: "hem-6", prompt: "What does a positive direct antiglobulin test (DAT) indicate?", clues: [], options: ["Antibodies or complement bound to patient RBCs", "Free antibodies in serum", "Platelet antibodies", "WBC antibodies"], correctAnswer: "Antibodies or complement bound to patient RBCs", explanation: "DAT detects IgG and/or C3d already attached to the patient's red cells, seen in autoimmune hemolytic anemia and HDN.", category: "Immunohematology" },
  { id: "hem-7", prompt: "Elevated D-dimer with prolonged PT and aPTT suggests:", clues: [], options: ["Disseminated intravascular coagulation (DIC)", "Hemophilia A", "Von Willebrand disease", "Vitamin K deficiency"], correctAnswer: "Disseminated intravascular coagulation (DIC)", explanation: "DIC causes consumption of clotting factors (prolonged PT/aPTT) and fibrinolysis (elevated D-dimer) simultaneously.", category: "Coagulation" },
  { id: "hem-8", prompt: "Reed-Sternberg cells are diagnostic of:", clues: [], options: ["Hodgkin lymphoma", "Non-Hodgkin lymphoma", "CLL", "Hairy cell leukemia"], correctAnswer: "Hodgkin lymphoma", explanation: "Reed-Sternberg cells (large binucleated 'owl-eye' cells) are the hallmark of classical Hodgkin lymphoma.", category: "Lymphoma" },
  { id: "hem-9", prompt: "In iron deficiency anemia, serum ferritin is:", clues: [], options: ["Decreased", "Increased", "Normal", "Variable"], correctAnswer: "Decreased", explanation: "Ferritin is the best single test for iron deficiency. It reflects total body iron stores and decreases early in deficiency.", category: "Anemia" },
  { id: "hem-10", prompt: "Which stain is used to identify iron in bone marrow?", clues: [], options: ["Prussian blue (Perl's)", "Wright-Giemsa", "PAS", "Sudan Black B"], correctAnswer: "Prussian blue (Perl's)", explanation: "Prussian blue stain reacts with ferric iron to produce blue granules, used to assess iron stores and detect ringed sideroblasts.", category: "Stains" },
  { id: "hem-11", prompt: "PT/INR is used to monitor which anticoagulant?", clues: [], options: ["Warfarin", "Heparin", "Enoxaparin", "Dabigatran"], correctAnswer: "Warfarin", explanation: "PT/INR monitors the extrinsic pathway affected by warfarin, which inhibits vitamin K-dependent factors (II, VII, IX, X).", category: "Coagulation" },
  { id: "hem-12", prompt: "Basophilic stippling is classically associated with:", clues: [], options: ["Lead poisoning", "Iron deficiency", "B12 deficiency", "Sickle cell disease"], correctAnswer: "Lead poisoning", explanation: "Basophilic stippling represents ribosomal RNA aggregates due to impaired RNA degradation, classically seen in lead poisoning and thalassemia.", category: "Morphology" },
  { id: "hem-13", prompt: "A platelet count <20,000/µL increases risk of:", clues: [], options: ["Spontaneous bleeding", "Thrombosis", "Infection", "Anemia"], correctAnswer: "Spontaneous bleeding", explanation: "Below 20,000/µL, patients are at significant risk for spontaneous mucosal and CNS bleeding. Transfusion threshold is typically 10,000/µL.", category: "Platelets" },
  { id: "hem-14", prompt: "Which hemoglobin is elevated in sickle cell disease?", clues: [], options: ["Hemoglobin S", "Hemoglobin A2", "Hemoglobin F", "Hemoglobin C"], correctAnswer: "Hemoglobin S", explanation: "Sickle cell disease (HbSS) has predominantly HbS due to a point mutation in the beta-globin gene (Glu→Val at position 6).", category: "Hemoglobinopathy" },
  { id: "hem-15", prompt: "Howell-Jolly bodies indicate:", clues: [], options: ["Asplenia or hyposplenia", "Iron deficiency", "Lead poisoning", "Megaloblastic anemia"], correctAnswer: "Asplenia or hyposplenia", explanation: "Howell-Jolly bodies are nuclear remnants normally removed by the spleen. Their presence indicates functional or anatomic asplenia.", category: "Morphology" },
  { id: "hem-16", prompt: "What is the Philadelphia chromosome associated with?", clues: [], options: ["CML (t(9;22) BCR-ABL)", "AML", "ALL in adults only", "CLL"], correctAnswer: "CML (t(9;22) BCR-ABL)", explanation: "The Philadelphia chromosome t(9;22) creates the BCR-ABL fusion gene, present in >95% of CML cases. Imatinib targets this.", category: "Leukemia" },
  { id: "hem-17", prompt: "Rouleaux formation is associated with:", clues: [], options: ["Multiple myeloma (elevated immunoglobulins)", "Dehydration only", "Iron deficiency", "Thalassemia"], correctAnswer: "Multiple myeloma (elevated immunoglobulins)", explanation: "Rouleaux (stacked coin RBCs) form due to elevated plasma proteins, especially immunoglobulins in multiple myeloma.", category: "Morphology" },
  { id: "hem-18", prompt: "Bleeding time is prolonged in:", clues: [], options: ["Platelet dysfunction", "Factor VIII deficiency", "Factor V Leiden", "Protein C deficiency"], correctAnswer: "Platelet dysfunction", explanation: "Bleeding time assesses primary hemostasis (platelet plug formation). It's prolonged in platelet disorders and von Willebrand disease.", category: "Coagulation" },
  { id: "hem-19", prompt: "Hypersegmented neutrophils (≥5 lobes) suggest:", clues: [], options: ["Megaloblastic anemia (B12/folate deficiency)", "Infection", "CML", "Iron deficiency"], correctAnswer: "Megaloblastic anemia (B12/folate deficiency)", explanation: "Hypersegmented neutrophils result from impaired DNA synthesis due to B12 or folate deficiency.", category: "Morphology" },
  { id: "hem-20", prompt: "Smudge cells on peripheral smear are characteristic of:", clues: [], options: ["Chronic lymphocytic leukemia (CLL)", "AML", "Hairy cell leukemia", "CML"], correctAnswer: "Chronic lymphocytic leukemia (CLL)", explanation: "Smudge cells are fragile lymphocytes that break during smear preparation, characteristically seen in CLL.", category: "Leukemia" },
];

const bloodBankQuestions: DepartmentQuestion[] = [
  { id: "bb-1", prompt: "What is the universal red blood cell donor type?", clues: [], options: ["O negative", "AB positive", "O positive", "A negative"], correctAnswer: "O negative", explanation: "O negative RBCs lack A, B, and D antigens, making them compatible with all recipients in emergencies.", category: "ABO/Rh" },
  { id: "bb-2", prompt: "Anti-D (Rh immune globulin/RhoGAM) is given to prevent:", clues: [], options: ["Hemolytic disease of the newborn (HDN)", "ABO incompatibility", "Transfusion reactions", "Graft vs host disease"], correctAnswer: "Hemolytic disease of the newborn (HDN)", explanation: "RhoGAM prevents Rh-negative mothers from forming anti-D antibodies that could attack Rh-positive fetal red cells.", category: "HDN" },
  { id: "bb-3", prompt: "The immediate spin crossmatch detects:", clues: [], options: ["ABO incompatibility", "Rh antibodies", "Warm autoantibodies", "Cold agglutinins"], correctAnswer: "ABO incompatibility", explanation: "Immediate spin crossmatch detects ABO incompatibility by testing patient serum with donor cells at room temperature.", category: "Compatibility" },
  { id: "bb-4", prompt: "Which antibody is clinically significant and shows dosage?", clues: [], options: ["Anti-Jka (Kidd)", "Anti-Le(a)", "Anti-M at room temp", "Anti-I"], correctAnswer: "Anti-Jka (Kidd)", explanation: "Anti-Jk(a) is IgG, clinically significant, shows dosage, and can cause delayed hemolytic transfusion reactions. It's notorious for 'disappearing'.", category: "Antibodies" },
  { id: "bb-5", prompt: "An acute hemolytic transfusion reaction is most commonly caused by:", clues: [], options: ["ABO incompatibility (clerical error)", "Rh incompatibility", "Bacterial contamination", "Allergic reaction"], correctAnswer: "ABO incompatibility (clerical error)", explanation: "AHTR is most often caused by clerical errors leading to ABO-incompatible transfusion. It can be fatal.", category: "Transfusion Reactions" },
  { id: "bb-6", prompt: "What is the shelf life of packed red blood cells stored in CPDA-1?", clues: [], options: ["35 days", "42 days", "21 days", "5 days"], correctAnswer: "35 days", explanation: "CPDA-1 preserves RBCs for 35 days at 1-6°C. Additive solutions (AS-1, AS-3) extend to 42 days.", category: "Storage" },
  { id: "bb-7", prompt: "The antibody screening test (indirect antiglobulin test) uses:", clues: [], options: ["Reagent RBCs with known antigens + patient serum", "Patient RBCs + anti-IgG", "Donor RBCs + donor serum", "Random donor cells"], correctAnswer: "Reagent RBCs with known antigens + patient serum", explanation: "The IAT/antibody screen incubates patient serum with reagent screening cells (known phenotypes) to detect unexpected antibodies.", category: "Compatibility" },
  { id: "bb-8", prompt: "Platelets are stored at what temperature?", clues: [], options: ["20-24°C with continuous agitation", "1-6°C", "−18°C or colder", "37°C"], correctAnswer: "20-24°C with continuous agitation", explanation: "Platelets must be stored at room temperature (20-24°C) with constant agitation. Shelf life is 5 days due to bacterial contamination risk.", category: "Storage" },
  { id: "bb-9", prompt: "Transfusion-associated graft-versus-host disease (TA-GVHD) is prevented by:", clues: [], options: ["Irradiation of blood products", "Leukoreduction", "Washing", "CMV-negative selection"], correctAnswer: "Irradiation of blood products", explanation: "Irradiation (25 Gy) inactivates donor lymphocytes that cause TA-GVHD, which is often fatal.", category: "Transfusion Safety" },
  { id: "bb-10", prompt: "In ABO blood grouping, the Bombay phenotype (Oh) lacks:", clues: [], options: ["H antigen (and thus no A or B)", "A antigen only", "B antigen only", "Rh antigens"], correctAnswer: "H antigen (and thus no A or B)", explanation: "Bombay phenotype lacks the H antigen precursor (h/h genotype), so A and B antigens cannot be formed. They have anti-A, anti-B, and anti-H.", category: "ABO/Rh" },
  { id: "bb-11", prompt: "TRALI (transfusion-related acute lung injury) is caused by:", clues: [], options: ["Donor antibodies against recipient HLA/HNA", "Volume overload", "Bacterial contamination", "ABO incompatibility"], correctAnswer: "Donor antibodies against recipient HLA/HNA", explanation: "TRALI occurs when donor anti-HLA or anti-HNA antibodies activate recipient neutrophils in the pulmonary vasculature, causing non-cardiogenic pulmonary edema.", category: "Transfusion Reactions" },
  { id: "bb-12", prompt: "Fresh frozen plasma (FFP) must be transfused within:", clues: [], options: ["24 hours of thawing", "6 hours of thawing", "48 hours of thawing", "Immediately"], correctAnswer: "24 hours of thawing", explanation: "Once thawed, FFP should be used within 24 hours (stored at 1-6°C). Labile factors V and VIII degrade over time.", category: "Storage" },
  { id: "bb-13", prompt: "Which antibody is associated with warm autoimmune hemolytic anemia?", clues: [], options: ["IgG (anti-e or anti-Rh specificity)", "IgM", "IgA", "IgE"], correctAnswer: "IgG (anti-e or anti-Rh specificity)", explanation: "Warm AIHA involves IgG autoantibodies that react at 37°C, often with broad Rh specificity (e.g., anti-e).", category: "Autoimmune" },
  { id: "bb-14", prompt: "Reverse grouping confirms:", clues: [], options: ["Expected antibodies in patient serum", "Antigens on patient RBCs", "Donor compatibility", "Rh status"], correctAnswer: "Expected antibodies in patient serum", explanation: "Reverse grouping tests patient serum against known A1 and B reagent cells to confirm Landsteiner's rule (expected isohemagglutinins).", category: "ABO/Rh" },
  { id: "bb-15", prompt: "Febrile non-hemolytic transfusion reactions are prevented by:", clues: [], options: ["Leukoreduction", "Irradiation", "Washing", "CMV testing"], correctAnswer: "Leukoreduction", explanation: "Leukoreduction removes donor WBCs and prevents cytokine accumulation, the main causes of FNHTR.", category: "Transfusion Safety" },
  { id: "bb-16", prompt: "Cold agglutinin disease involves which antibody class?", clues: [], options: ["IgM", "IgG", "IgA", "IgE"], correctAnswer: "IgM", explanation: "Cold agglutinin disease involves IgM autoantibodies (often anti-I) that react at 4°C and fix complement, causing intravascular hemolysis.", category: "Autoimmune" },
  { id: "bb-17", prompt: "The Kleihauer-Betke test detects:", clues: [], options: ["Fetal hemoglobin in maternal blood", "Maternal antibodies", "ABO discrepancy", "Bacterial contamination"], correctAnswer: "Fetal hemoglobin in maternal blood", explanation: "The Kleihauer-Betke acid elution test quantifies fetal-maternal hemorrhage to determine the RhoGAM dose needed.", category: "HDN" },
  { id: "bb-18", prompt: "Type and screen is valid for how many days?", clues: [], options: ["3 days (72 hours)", "7 days", "24 hours", "30 days"], correctAnswer: "3 days (72 hours)", explanation: "A type and screen is valid for 72 hours if the patient was transfused or pregnant in the past 3 months (to detect new antibodies).", category: "Compatibility" },
  { id: "bb-19", prompt: "Cryoprecipitate contains which clotting factors?", clues: [], options: ["Fibrinogen, Factor VIII, vWF, Factor XIII", "All clotting factors", "Factor VII and IX only", "Platelets and plasma"], correctAnswer: "Fibrinogen, Factor VIII, vWF, Factor XIII", explanation: "Cryoprecipitate is used primarily for fibrinogen replacement (<100 mg/dL) and contains Factor VIII, vWF, Factor XIII, and fibronectin.", category: "Components" },
  { id: "bb-20", prompt: "What causes ABO discrepancy between forward and reverse grouping?", clues: [], options: ["All of the below", "Weak or missing antibodies (neonates, elderly)", "Subgroups of A (A2, A3)", "Cold autoantibodies"], correctAnswer: "All of the below", explanation: "ABO discrepancies arise from weak/absent antibodies, A subgroups, cold autoantibodies, unexpected antibodies, or transfusion history.", category: "ABO/Rh" },
];

const molecularBiologyQuestions: DepartmentQuestion[] = [
  { id: "mb-1", prompt: "What is the purpose of the denaturation step in PCR?", clues: [], options: ["Separate double-stranded DNA into single strands", "Allow primer binding", "Extend new DNA strands", "Activate the polymerase"], correctAnswer: "Separate double-stranded DNA into single strands", explanation: "Denaturation at 94-98°C breaks hydrogen bonds between complementary bases, creating single-stranded DNA templates.", category: "PCR" },
  { id: "mb-2", prompt: "Taq polymerase is used in PCR because it:", clues: [], options: ["Is thermostable (withstands 95°C)", "Has 3'→5' proofreading activity", "Works at room temperature", "Is specific to RNA"], correctAnswer: "Is thermostable (withstands 95°C)", explanation: "Taq polymerase from Thermus aquaticus is heat-stable, surviving repeated denaturation cycles. It lacks proofreading (3'→5' exonuclease).", category: "PCR" },
  { id: "mb-3", prompt: "In gel electrophoresis, DNA migrates toward:", clues: [], options: ["Positive electrode (anode)", "Negative electrode (cathode)", "Both electrodes equally", "Neither electrode"], correctAnswer: "Positive electrode (anode)", explanation: "DNA is negatively charged due to phosphate groups. In an electric field, it migrates toward the positive anode. Smaller fragments migrate faster.", category: "Electrophoresis" },
  { id: "mb-4", prompt: "CRISPR-Cas9 creates breaks in DNA guided by:", clues: [], options: ["Guide RNA (gRNA)", "Restriction enzymes", "DNA polymerase", "Ligase"], correctAnswer: "Guide RNA (gRNA)", explanation: "CRISPR-Cas9 uses a ~20nt guide RNA complementary to the target sequence to direct Cas9 nuclease to create double-strand breaks.", category: "Gene Editing" },
  { id: "mb-5", prompt: "What does RT-PCR detect?", clues: [], options: ["RNA (via reverse transcription to cDNA)", "DNA mutations only", "Protein expression", "Epigenetic changes"], correctAnswer: "RNA (via reverse transcription to cDNA)", explanation: "RT-PCR first converts RNA to cDNA using reverse transcriptase, then amplifies it by standard PCR. Used for RNA viruses and gene expression.", category: "PCR" },
  { id: "mb-6", prompt: "Sanger sequencing uses which modified nucleotides?", clues: [], options: ["Dideoxynucleotides (ddNTPs)", "Deoxynucleotides (dNTPs)", "Ribonucleotides", "Modified amino acids"], correctAnswer: "Dideoxynucleotides (ddNTPs)", explanation: "ddNTPs lack the 3'-OH group needed for chain elongation, causing random chain termination at each base position.", category: "Sequencing" },
  { id: "mb-7", prompt: "The housekeeping gene GAPDH is used in qPCR as:", clues: [], options: ["An internal reference/control", "A target gene", "A primer", "A fluorescent probe"], correctAnswer: "An internal reference/control", explanation: "GAPDH (or beta-actin) is stably expressed across conditions and normalizes target gene expression in relative quantification (ΔΔCt method).", category: "qPCR" },
  { id: "mb-8", prompt: "Southern blotting detects:", clues: [], options: ["DNA", "RNA", "Protein", "Lipids"], correctAnswer: "DNA", explanation: "Southern blot = DNA (named after Edwin Southern). Northern blot = RNA. Western blot = Protein. The naming follows this convention.", category: "Blotting" },
  { id: "mb-9", prompt: "What is the annealing temperature in PCR determined by?", clues: [], options: ["Primer melting temperature (Tm)", "Template length", "Polymerase type", "Buffer pH"], correctAnswer: "Primer melting temperature (Tm)", explanation: "Annealing temperature is typically set 3-5°C below the primer Tm. Too low causes non-specific binding; too high prevents primer annealing.", category: "PCR" },
  { id: "mb-10", prompt: "Next-generation sequencing (NGS) advantage over Sanger:", clues: [], options: ["Massively parallel sequencing (millions of reads)", "Lower cost per read for single genes", "No need for library preparation", "Higher accuracy per read"], correctAnswer: "Massively parallel sequencing (millions of reads)", explanation: "NGS can sequence millions of DNA fragments simultaneously, enabling whole-genome sequencing, exome sequencing, and metagenomics.", category: "Sequencing" },
  { id: "mb-11", prompt: "Restriction enzymes recognize and cut:", clues: [], options: ["Specific palindromic DNA sequences", "Any DNA sequence", "RNA only", "Single-stranded DNA only"], correctAnswer: "Specific palindromic DNA sequences", explanation: "Restriction endonucleases (e.g., EcoRI: GAATTC) cut at specific palindromic recognition sites, producing sticky or blunt ends.", category: "Molecular Cloning" },
  { id: "mb-12", prompt: "In qPCR, the Ct (cycle threshold) value is inversely proportional to:", clues: [], options: ["Initial template quantity", "Amplicon length", "Primer concentration", "Annealing temperature"], correctAnswer: "Initial template quantity", explanation: "Lower Ct = more starting template. Each Ct difference of ~3.3 represents a 10-fold difference in initial copy number.", category: "qPCR" },
  { id: "mb-13", prompt: "DNA extraction with phenol-chloroform separates:", clues: [], options: ["DNA (aqueous phase) from proteins (organic phase)", "RNA from DNA", "Lipids from carbohydrates", "All nucleic acids from water"], correctAnswer: "DNA (aqueous phase) from proteins (organic phase)", explanation: "Phenol-chloroform denatures proteins to the organic phase while DNA remains in the aqueous phase. Ethanol precipitation then recovers DNA.", category: "Extraction" },
  { id: "mb-14", prompt: "FISH (fluorescence in situ hybridization) is used to detect:", clues: [], options: ["Specific chromosomal abnormalities", "Protein expression", "Enzyme activity", "Metabolites"], correctAnswer: "Specific chromosomal abnormalities", explanation: "FISH uses fluorescent probes complementary to specific chromosome regions to detect deletions, translocations, and amplifications.", category: "Cytogenetics" },
  { id: "mb-15", prompt: "What enzyme converts RNA to cDNA?", clues: [], options: ["Reverse transcriptase", "DNA polymerase", "RNA polymerase", "Helicase"], correctAnswer: "Reverse transcriptase", explanation: "Reverse transcriptase (from retroviruses) synthesizes complementary DNA (cDNA) from an RNA template. Essential for RT-PCR.", category: "Enzymes" },
  { id: "mb-16", prompt: "Multiplex PCR involves:", clues: [], options: ["Multiple primer pairs in one reaction", "Sequential PCR reactions", "Multiple thermal cyclers", "Different polymerases"], correctAnswer: "Multiple primer pairs in one reaction", explanation: "Multiplex PCR amplifies multiple targets simultaneously using different primer pairs, saving time and sample volume.", category: "PCR" },
  { id: "mb-17", prompt: "The A260/A280 ratio for pure DNA should be:", clues: [], options: ["~1.8", "~2.0", "~1.0", "~2.5"], correctAnswer: "~1.8", explanation: "A260/A280 ≈1.8 indicates pure DNA. Lower values suggest protein contamination. Pure RNA has a ratio of ~2.0.", category: "Quality Control" },
  { id: "mb-18", prompt: "What is a plasmid vector used for in molecular cloning?", clues: [], options: ["Carrying foreign DNA into host cells", "Cutting DNA", "Sequencing DNA", "Staining DNA"], correctAnswer: "Carrying foreign DNA into host cells", explanation: "Plasmid vectors are small circular DNA molecules that replicate independently in bacteria, carrying inserted genes of interest.", category: "Molecular Cloning" },
  { id: "mb-19", prompt: "Microarray technology measures:", clues: [], options: ["Expression of thousands of genes simultaneously", "Single gene expression", "Protein folding", "Cell division rate"], correctAnswer: "Expression of thousands of genes simultaneously", explanation: "DNA microarrays use thousands of immobilized probes to measure gene expression patterns across the entire genome.", category: "Genomics" },
  { id: "mb-20", prompt: "Which sequencing platform uses nanopore technology?", clues: [], options: ["Oxford Nanopore (MinION)", "Illumina", "Ion Torrent", "PacBio"], correctAnswer: "Oxford Nanopore (MinION)", explanation: "Oxford Nanopore passes single DNA/RNA strands through protein nanopores, detecting base changes via electrical current shifts. Enables real-time, long-read sequencing.", category: "Sequencing" },
];

// All non-microbiology questions indexed by department
const questionBanks: Record<Exclude<Department, "microbiology">, DepartmentQuestion[]> = {
  "clinical-chemistry": clinicalChemistryQuestions,
  hematology: hematologyQuestions,
  "blood-bank": bloodBankQuestions,
  "molecular-biology": molecularBiologyQuestions,
};

export function getDepartmentQuestions(
  department: Exclude<Department, "microbiology">,
  count: number
): DepartmentQuestion[] {
  const bank = questionBanks[department];
  return shuffleArray(bank).slice(0, Math.min(count, bank.length));
}

// Flashcard data for non-microbiology departments
export interface DepartmentFlashcard {
  id: string;
  department: Department;
  category: string;
  front: string; // question/clue
  clues: { label: string; value: string }[];
  answer: string;
  explanation: string;
}

export function getDepartmentFlashcards(
  department: Exclude<Department, "microbiology">,
  count: number
): DepartmentFlashcard[] {
  const questions = questionBanks[department];
  return shuffleArray(questions).slice(0, Math.min(count, questions.length)).map((q) => ({
    id: q.id,
    department,
    category: q.category,
    front: q.prompt,
    clues: q.clues.map((c) => ({ label: "Hint", value: c })),
    answer: q.correctAnswer,
    explanation: q.explanation,
  }));
}
