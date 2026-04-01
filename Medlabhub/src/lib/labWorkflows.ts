export type WorkflowDepartment =
  | "Microbiology"
  | "Molecular Biology"
  | "Clinical Chemistry"
  | "Hematology"
  | "Immunology / Serology"
  | "Blood Bank"
  | "Histopathology";

export interface StepChoice {
  label: string;
  correct: boolean;
  result: string;
  detail?: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
  instruction: string;
  choices: StepChoice[];
  explanation: string;
  icon: string;
}

export interface LabWorkflow {
  id: string;
  title: string;
  department: WorkflowDepartment;
  scenario: string;
  patient?: string;
  sampleType: string;
  reference: string;
  steps: WorkflowStep[];
}

export const labWorkflows: LabWorkflow[] = [
  // ═══════════════════════════════════════════════════
  // MICROBIOLOGY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "micro-uti",
    title: "Urinary Tract Infection Diagnostic Workflow",
    department: "Microbiology",
    scenario: "A 28-year-old female presents with dysuria, frequency, and suprapubic pain. A midstream clean-catch urine sample is submitted to the microbiology lab.",
    patient: "28F, dysuria, frequency, fever 38.2°C",
    sampleType: "Midstream Urine",
    reference: "Bailey & Scott's Diagnostic Microbiology, 15th Ed.",
    steps: [
      {
        title: "Sample Reception & Assessment",
        description: "A urine specimen arrives in the lab. Assess specimen adequacy.",
        instruction: "What is the first step upon receiving this urine specimen?",
        choices: [
          { label: "Check labeling, volume, and transport time", correct: true, result: "Specimen is properly labeled, adequate volume (≥1 mL), received within 2 hours. Acceptable for processing.", detail: "Proper specimen assessment prevents errors and ensures reliable results." },
          { label: "Immediately inoculate culture media", correct: false, result: "Skipping assessment may process a compromised or mislabeled specimen, leading to unreliable results." },
          { label: "Refrigerate for 24 hours first", correct: false, result: "Unnecessary delay. Urine should be processed within 2 hours or refrigerated at 4°C if delay is expected." },
          { label: "Centrifuge and discard supernatant", correct: false, result: "Centrifugation is for sediment analysis, not the first step in culture workflow." }
        ],
        explanation: "Specimen assessment is critical in pre-analytical quality. Per CLSI M22, urine must be properly labeled, collected by appropriate method, and transported within 2 hours or refrigerated.",
        icon: "📋"
      },
      {
        title: "Sample Preparation",
        description: "Prepare the urine for inoculation and direct examination.",
        instruction: "How should you prepare this urine sample for culture?",
        choices: [
          { label: "Use a calibrated loop (0.001 mL) for semi-quantitative culture", correct: true, result: "Using a 0.001 mL calibrated loop allows colony counting. Each colony = 1,000 CFU/mL. This is the standard method for urine cultures.", detail: "Semi-quantitative culture is the gold standard for UTI diagnosis." },
          { label: "Pour plate technique", correct: false, result: "Pour plates are not standard for urine culture in clinical labs." },
          { label: "Swab the specimen onto agar", correct: false, result: "Swab inoculation does not allow quantitative colony counting needed for UTI diagnosis." },
          { label: "Filter the urine through membrane", correct: false, result: "Membrane filtration is used for sterile fluid or water testing, not routine urine cultures." }
        ],
        explanation: "Semi-quantitative urine culture using a calibrated loop (0.001 mL or 0.01 mL) is the standard. A count of ≥10⁵ CFU/mL indicates significant bacteriuria (Kass criteria).",
        icon: "🧪"
      },
      {
        title: "Gram Staining",
        description: "Perform a Gram stain on the uncentrifuged urine specimen.",
        instruction: "What is the correct Gram stain procedure sequence?",
        choices: [
          { label: "Crystal violet → Iodine → Decolorizer → Safranin", correct: true, result: "Gram stain reveals Gram-negative rods, many per field. WBCs present (>10/HPF), indicating pyuria. No squamous epithelial cells seen — specimen is acceptable.", detail: "The presence of bacteria on uncentrifuged Gram stain correlates with ≥10⁵ CFU/mL." },
          { label: "Safranin → Iodine → Crystal violet → Decolorizer", correct: false, result: "Incorrect sequence. The primary stain (crystal violet) must be applied first." },
          { label: "Crystal violet → Decolorizer → Iodine → Safranin", correct: false, result: "Incorrect. Iodine (mordant) must be applied before decolorization to fix the crystal violet–iodine complex." },
          { label: "Methylene blue → Iodine → Alcohol → Carbol fuchsin", correct: false, result: "This is not a Gram stain procedure. Methylene blue is a simple stain; carbol fuchsin is used in acid-fast staining." }
        ],
        explanation: "The Gram stain sequence is: Crystal violet (primary, 1 min) → Gram's iodine (mordant, 1 min) → Acetone-alcohol (decolorizer, seconds) → Safranin (counterstain, 30 sec). Gram-negatives lose the crystal violet-iodine complex and take up safranin (pink/red).",
        icon: "🔬"
      },
      {
        title: "Culture Media Selection",
        description: "Based on Gram stain findings (Gram-negative rods), select appropriate culture media.",
        instruction: "Which media combination is most appropriate for this urine culture?",
        choices: [
          { label: "Blood Agar + MacConkey Agar", correct: true, result: "After 18–24h at 37°C aerobically:\n• Blood Agar: Large, grey-white, smooth colonies with slight hemolysis\n• MacConkey: Bright pink/red colonies (lactose fermenter)\n• Colony count: >100 colonies with 0.001 mL loop = >10⁵ CFU/mL → Significant bacteriuria", detail: "BAP supports all uropathogens; MacConkey differentiates lactose fermenters from non-fermenters." },
          { label: "Chocolate Agar + Thayer-Martin", correct: false, result: "Chocolate agar is for fastidious organisms (Haemophilus, Neisseria). Thayer-Martin is selective for Neisseria gonorrhoeae — not appropriate for routine UTI culture." },
          { label: "Sabouraud Dextrose Agar only", correct: false, result: "SDA is for fungal cultures. While Candida can cause UTI, it would not be the primary media for bacterial culture." },
          { label: "Mannitol Salt Agar + EMB", correct: false, result: "MSA is selective for Staphylococci. While EMB could work, the standard combination is BAP + MacConkey for urine cultures." }
        ],
        explanation: "The standard urine culture uses Blood Agar Plate (BAP) as a non-selective enriched medium and MacConkey agar as a selective/differential medium. MacConkey inhibits Gram-positives and differentiates lactose fermenters (pink) from non-fermenters (colorless).",
        icon: "🧫"
      },
      {
        title: "Incubation",
        description: "Set incubation conditions for the inoculated plates.",
        instruction: "What are the correct incubation conditions for routine urine culture?",
        choices: [
          { label: "35–37°C, aerobic, 18–24 hours", correct: true, result: "Plates incubated at 37°C in ambient air. After 18–24 hours, growth is visible on both BAP and MacConkey.", detail: "Most uropathogens grow well under these standard conditions." },
          { label: "25°C, aerobic, 5–7 days", correct: false, result: "25°C is too low for most bacterial uropathogens; used for fungal cultures." },
          { label: "37°C, anaerobic, 48 hours", correct: false, result: "Anaerobic incubation is not standard for urine culture. Most uropathogens are facultative anaerobes that grow well aerobically." },
          { label: "42°C, CO₂ enriched, 72 hours", correct: false, result: "42°C with CO₂ is used for Campylobacter isolation, not urine culture." }
        ],
        explanation: "Routine urine cultures are incubated at 35–37°C in ambient air for 18–24 hours. Most significant uropathogens (E. coli, Klebsiella, Proteus, Enterococcus) grow well under these conditions.",
        icon: "🌡️"
      },
      {
        title: "Colony Morphology Observation",
        description: "After incubation, examine the plates for colonial morphology and hemolysis patterns.",
        instruction: "You observe large, pink mucoid colonies on MacConkey and grey colonies with no hemolysis on BAP. What does this suggest?",
        choices: [
          { label: "Lactose-fermenting Gram-negative rod (likely E. coli or Klebsiella)", correct: true, result: "Pink colonies on MacConkey = lactose fermenter. Grey non-hemolytic colonies on BAP. Colony count >10⁵ CFU/mL. Proceed to biochemical identification.", detail: "Pink/red colonies on MacConkey indicate acid production from lactose fermentation." },
          { label: "Staphylococcus aureus", correct: false, result: "S. aureus would show golden pigmented colonies on BAP with beta-hemolysis and would not grow well on MacConkey (Gram-positive)." },
          { label: "Pseudomonas aeruginosa", correct: false, result: "Pseudomonas is a non-lactose fermenter — colonies would be colorless on MacConkey, often with blue-green pigment and grape-like odor." },
          { label: "Streptococcus pyogenes", correct: false, result: "S. pyogenes is Gram-positive and would not grow on MacConkey. On BAP, it shows small colonies with beta-hemolysis." }
        ],
        explanation: "Lactose fermentation on MacConkey agar produces acid, causing the pH indicator (neutral red) to turn pink/red. Common LF organisms: E. coli, Klebsiella, Enterobacter, Citrobacter. Non-LF: Proteus, Salmonella, Shigella, Pseudomonas.",
        icon: "👁️"
      },
      {
        title: "Biochemical Testing",
        description: "Perform biochemical tests to identify the lactose-fermenting Gram-negative rod.",
        instruction: "Which biochemical test panel is most appropriate for identifying Enterobacteriaceae?",
        choices: [
          { label: "IMViC tests (Indole, Methyl Red, Voges-Proskauer, Citrate)", correct: true, result: "IMViC Results:\n• Indole: POSITIVE (red ring with Kovac's reagent)\n• Methyl Red: POSITIVE (red color, mixed acid fermentation)\n• Voges-Proskauer: NEGATIVE (no red color)\n• Citrate: NEGATIVE (green, no growth)\n\nIMViC pattern: + + − − = Escherichia coli", detail: "The IMViC pattern ++−− is the classic profile for E. coli." },
          { label: "Coagulase and catalase tests", correct: false, result: "Coagulase and catalase are used for Gram-positive cocci (Staphylococcus identification), not Enterobacteriaceae." },
          { label: "Oxidase test only", correct: false, result: "While oxidase is useful (Enterobacteriaceae are oxidase-negative), it alone cannot identify to species level." },
          { label: "Bile esculin and 6.5% NaCl", correct: false, result: "These tests are for differentiating Enterococcus from Streptococcus, not for Enterobacteriaceae identification." }
        ],
        explanation: "The IMViC tests are classical biochemical tests for differentiating Enterobacteriaceae. E. coli: ++−− (biotype I). Klebsiella pneumoniae: −−++ . Enterobacter aerogenes: −−++. These are supplemented by TSI, urease, motility, and other tests.",
        icon: "⚗️"
      },
      {
        title: "Antimicrobial Susceptibility Testing",
        description: "Perform AST on the identified E. coli isolate using Kirby-Bauer disk diffusion.",
        instruction: "What is the correct procedure for Kirby-Bauer disk diffusion?",
        choices: [
          { label: "Prepare 0.5 McFarland suspension, inoculate Mueller-Hinton agar, apply disks, incubate 16–18h", correct: true, result: "AST Results (zone diameters):\n• Ampicillin: 8mm (Resistant)\n• Ciprofloxacin: 28mm (Susceptible)\n• Trimethoprim-Sulfamethoxazole: 10mm (Resistant)\n• Nitrofurantoin: 20mm (Susceptible)\n• Ceftriaxone: 26mm (Susceptible)\n• Gentamicin: 18mm (Susceptible)\n\nInterpretation per CLSI M100 breakpoints.", detail: "The 0.5 McFarland standard ensures standardized inoculum density." },
          { label: "Use undiluted colony directly on nutrient agar", correct: false, result: "Unstandardized inoculum on nutrient agar would give unreliable results. Mueller-Hinton is the standard medium for AST." },
          { label: "Broth microdilution with visual reading after 4 hours", correct: false, result: "While broth microdilution is a reference method, it requires 16–20 hours incubation, not 4 hours." },
          { label: "E-test on blood agar incubated anaerobically", correct: false, result: "Blood agar is not standard for AST. Mueller-Hinton is required. Anaerobic incubation is incorrect for E. coli." }
        ],
        explanation: "Kirby-Bauer method per CLSI M02: Use Mueller-Hinton agar, 0.5 McFarland inoculum, apply disks within 15 minutes, incubate 35°C aerobically for 16–18 hours. Measure zone diameters and interpret using CLSI M100 breakpoint tables.",
        icon: "💊"
      },
      {
        title: "Final Identification & Reporting",
        description: "Compile all findings into a final laboratory report.",
        instruction: "Based on all results, what is the final report?",
        choices: [
          { label: "E. coli, >10⁵ CFU/mL, with AST showing ampicillin and TMP-SMX resistance", correct: true, result: "FINAL REPORT:\n━━━━━━━━━━━━━━━━━━━\nOrganism: Escherichia coli\nColony Count: >10⁵ CFU/mL (significant bacteriuria)\nSusceptible: Ciprofloxacin, Nitrofurantoin, Ceftriaxone, Gentamicin\nResistant: Ampicillin, Trimethoprim-Sulfamethoxazole\n━━━━━━━━━━━━━━━━━━━\nClinical correlation: Consistent with uncomplicated UTI. Recommend nitrofurantoin or ciprofloxacin based on susceptibility.", detail: "Complete reporting includes organism ID, quantitation, and full AST results." },
          { label: "Klebsiella pneumoniae, mixed flora", correct: false, result: "Incorrect. Biochemical tests confirmed E. coli (IMViC ++−−), not Klebsiella (IMViC −−++)." },
          { label: "Normal flora, no significant growth", correct: false, result: "Incorrect. >10⁵ CFU/mL of a single organism in a symptomatic patient is significant bacteriuria." },
          { label: "Contaminated specimen, request recollection", correct: false, result: "The specimen showed proper collection criteria (no squamous cells) with a single organism at significant count." }
        ],
        explanation: "A final report must include: organism identification, colony count with clinical significance, and complete AST results with interpretation per CLSI standards. For uncomplicated UTI, nitrofurantoin is a first-line empiric agent per IDSA guidelines.",
        icon: "📝"
      }
    ]
  },
  {
    id: "micro-blood",
    title: "Blood Culture Sepsis Workup",
    department: "Microbiology",
    scenario: "A 65-year-old male with fever (39.5°C), chills, hypotension, and altered mental status. Two sets of blood cultures are collected from separate venipuncture sites.",
    patient: "65M, fever, chills, hypotension, confusion",
    sampleType: "Blood (2 sets, aerobic + anaerobic)",
    reference: "Bailey & Scott's Diagnostic Microbiology, 15th Ed.; CLSI M47",
    steps: [
      {
        title: "Blood Culture Collection Assessment",
        description: "Blood culture bottles arrive in the lab. Evaluate collection adequacy.",
        instruction: "How many blood culture sets should be collected for suspected sepsis?",
        choices: [
          { label: "2–3 sets from separate venipuncture sites", correct: true, result: "Two sets received: each set contains 1 aerobic + 1 anaerobic bottle. Collected from separate sites (left and right antecubital). Volume: 8–10 mL per bottle. Adequate for processing.", detail: "Multiple sets from different sites help distinguish true bacteremia from contamination." },
          { label: "1 set from a single site", correct: false, result: "A single set has poor sensitivity (65–80%) and cannot help differentiate contamination from true bacteremia." },
          { label: "4 sets from the same arm", correct: false, result: "Collecting from the same site increases contamination risk without improving diagnostic yield." },
          { label: "Collect only aerobic bottles", correct: false, result: "Anaerobic bottles are essential for detecting obligate anaerobes which cause ~5% of bloodstream infections." }
        ],
        explanation: "CLSI M47 recommends 2–3 blood culture sets (each = aerobic + anaerobic bottle) from separate venipuncture sites. Adequate blood volume (20–30 mL total per set in adults) is the single most important factor for detection.",
        icon: "🩸"
      },
      {
        title: "Automated Blood Culture Monitoring",
        description: "Bottles are loaded into the automated blood culture system (e.g., BACTEC, BacT/ALERT).",
        instruction: "The aerobic bottle from Set 1 flags positive at 12 hours. What should be done next?",
        choices: [
          { label: "Perform Gram stain and subculture immediately", correct: true, result: "Gram stain of positive broth reveals: Gram-positive cocci in clusters. This is critical information reported immediately to the clinician as a preliminary result.", detail: "Time to positivity <14 hours suggests high-grade bacteremia." },
          { label: "Wait for all bottles to flag positive", correct: false, result: "Delaying workup of positive bottles can worsen patient outcomes. Each positive bottle should be processed immediately upon flagging." },
          { label: "Discard and recollect", correct: false, result: "A positive bottle should never be discarded — it must be processed for identification and susceptibility." },
          { label: "Add antibiotics to the bottle", correct: false, result: "Antibiotics should never be added to culture bottles. Treatment decisions are clinical." }
        ],
        explanation: "When a blood culture flags positive, immediate Gram stain and subculture are performed. Gram stain results are called to the physician as a critical value, as this guides empiric therapy before full identification is available.",
        icon: "🖥️"
      },
      {
        title: "Subculture & Identification",
        description: "Gram stain shows Gram-positive cocci in clusters. Subculture onto appropriate media.",
        instruction: "Which tests differentiate Staphylococcus aureus from coagulase-negative staphylococci?",
        choices: [
          { label: "Coagulase test (tube coagulase) and catalase test", correct: true, result: "Results:\n• Catalase: POSITIVE (bubbles with H₂O₂) — confirms Staphylococcus\n• Tube coagulase: POSITIVE (clot formation at 4h) — confirms S. aureus\n• Mannitol Salt Agar: Yellow halo (mannitol fermenter)\n• DNase: POSITIVE\n\nIdentification: Staphylococcus aureus", detail: "Tube coagulase is the gold standard for S. aureus identification." },
          { label: "Oxidase and bile esculin", correct: false, result: "Oxidase tests for Gram-negative non-fermenters. Bile esculin is for Enterococcus/Group D Streptococcus." },
          { label: "Optochin and bacitracin sensitivity", correct: false, result: "These tests differentiate Streptococcus pneumoniae (optochin-sensitive) from S. pyogenes (bacitracin-sensitive), not Staphylococci." },
          { label: "Indole and urease", correct: false, result: "These are biochemical tests for Enterobacteriaceae identification, not Staphylococci." }
        ],
        explanation: "Staphylococcus identification: Catalase-positive (differentiates from Streptococcus). Coagulase-positive = S. aureus. Coagulase-negative = CoNS (S. epidermidis, S. saprophyticus, etc.). Additional confirmatory tests include DNase, mannitol fermentation, and latex agglutination.",
        icon: "🔬"
      },
      {
        title: "MRSA Screening",
        description: "Check for methicillin resistance in the S. aureus isolate.",
        instruction: "What is the standard method for detecting MRSA?",
        choices: [
          { label: "Cefoxitin disk diffusion (30μg) per CLSI guidelines", correct: true, result: "Cefoxitin disk zone: 18mm → RESISTANT (MRSA breakpoint: ≤21mm)\n\nThis isolate is MRSA (Methicillin-Resistant Staphylococcus aureus). The mecA gene encodes PBP2a, an altered penicillin-binding protein with low affinity for β-lactams.", detail: "Cefoxitin is a better inducer of mecA expression than oxacillin." },
          { label: "Penicillin disk diffusion", correct: false, result: "Penicillin resistance does not predict methicillin resistance. Many S. aureus produce penicillinase but remain methicillin-susceptible (MSSA)." },
          { label: "Vancomycin disk diffusion", correct: false, result: "Vancomycin susceptibility is not determined by disk diffusion for staphylococci per CLSI. MIC testing is required." },
          { label: "Bacitracin sensitivity", correct: false, result: "Bacitracin is used for Group A Streptococcus presumptive identification, not MRSA detection." }
        ],
        explanation: "CLSI recommends cefoxitin disk diffusion as the preferred method for MRSA screening (≤21mm = resistant). Cefoxitin is a better inducer of the mecA gene than oxacillin. Confirmatory methods include mecA PCR or PBP2a latex agglutination.",
        icon: "🛡️"
      },
      {
        title: "Final Report & Clinical Correlation",
        description: "Compile results into the final blood culture report.",
        instruction: "What is the appropriate final report for this case?",
        choices: [
          { label: "MRSA bacteremia (2/2 sets positive), with full AST including vancomycin MIC", correct: true, result: "FINAL REPORT:\n━━━━━━━━━━━━━━━━━━━\nBlood Culture: POSITIVE (2/2 sets, aerobic bottles)\nOrganism: Staphylococcus aureus (MRSA)\nTime to positivity: 12 hours\nSusceptible: Vancomycin (MIC 1.0 μg/mL), Linezolid, Daptomycin, TMP-SMX\nResistant: Oxacillin, Cefazolin, all β-lactams\n━━━━━━━━━━━━━━━━━━━\nClinical note: MRSA bacteremia requires repeat cultures at 48–72h. Echocardiography recommended to rule out endocarditis.", detail: "Growth in 2/2 sets confirms true bacteremia, not contamination." },
          { label: "Probable contamination, no treatment needed", correct: false, result: "Incorrect. S. aureus in 2/2 sets is almost always clinically significant (>90% true bacteremia rate)." },
          { label: "MSSA bacteremia, treat with cefazolin", correct: false, result: "Incorrect. Cefoxitin resistance confirms MRSA. β-lactams including cefazolin are ineffective." },
          { label: "Report as normal flora", correct: false, result: "S. aureus is never considered normal flora in blood cultures." }
        ],
        explanation: "MRSA bacteremia requires IV vancomycin with monitoring of trough levels (target 15–20 μg/mL) or AUC/MIC-guided dosing. Repeat cultures every 48–72h until clearance. Echocardiography is essential to rule out infective endocarditis, especially with persistent bacteremia.",
        icon: "📝"
      }
    ]
  },
  {
    id: "micro-resp",
    title: "Respiratory Culture — Sputum Analysis",
    department: "Microbiology",
    scenario: "A 55-year-old male smoker with productive cough, rusty sputum, fever (38.8°C), and right lower lobe consolidation on chest X-ray. Sputum sample submitted for culture.",
    patient: "55M, smoker, productive cough, fever, RLL consolidation",
    sampleType: "Sputum",
    reference: "Jawetz, Melnick & Adelberg's Medical Microbiology, 28th Ed.",
    steps: [
      {
        title: "Sputum Quality Assessment",
        description: "Evaluate sputum quality before processing using the Q-score (Bartlett's criteria).",
        instruction: "How do you determine if a sputum specimen is acceptable for culture?",
        choices: [
          { label: "Count PMNs and squamous epithelial cells per LPF (10×)", correct: true, result: "Microscopy at 10× (LPF):\n• >25 PMNs per LPF\n• <10 squamous epithelial cells per LPF\n→ ACCEPTABLE specimen (Q-score positive)\nSpecimen represents lower respiratory tract secretions.", detail: ">25 PMNs and <10 SEC per LPF = acceptable sputum quality." },
          { label: "Only check color and consistency", correct: false, result: "Visual assessment alone is insufficient. Microscopic evaluation is required per Murray & Washington criteria." },
          { label: "Culture all specimens regardless", correct: false, result: "Culturing saliva-contaminated specimens leads to misleading results and inappropriate antibiotic use." },
          { label: "Reject if not blood-tinged", correct: false, result: "Blood-tinged sputum is not a quality criterion. Microscopic cell counts determine acceptability." }
        ],
        explanation: "The Murray-Washington / Bartlett grading system evaluates sputum quality by counting PMNs and squamous epithelial cells at low power. Specimens with >25 squamous cells/LPF are rejected as saliva-contaminated.",
        icon: "📋"
      },
      {
        title: "Gram Stain Examination",
        description: "Perform Gram stain on the accepted sputum specimen.",
        instruction: "Gram stain shows Gram-positive lancet-shaped diplococci with a surrounding clear zone (capsule). What is the most likely organism?",
        choices: [
          { label: "Streptococcus pneumoniae", correct: true, result: "Gram-positive lancet-shaped diplococci with capsule visible as a clear halo. Abundant PMNs present. This morphology is classic for S. pneumoniae.", detail: "The capsule of S. pneumoniae appears as a clear zone surrounding the diplococci on Gram stain." },
          { label: "Staphylococcus aureus", correct: false, result: "S. aureus appears as Gram-positive cocci in clusters, not lancet-shaped diplococci." },
          { label: "Haemophilus influenzae", correct: false, result: "H. influenzae is a Gram-negative coccobacillus, not Gram-positive diplococci." },
          { label: "Klebsiella pneumoniae", correct: false, result: "Klebsiella is a Gram-negative rod, not Gram-positive diplococci." }
        ],
        explanation: "S. pneumoniae is the most common cause of community-acquired pneumonia. Classic Gram stain morphology: Gram-positive lancet-shaped (elongated) diplococci, often with a visible capsule appearing as a clear halo.",
        icon: "🔬"
      },
      {
        title: "Culture & Identification",
        description: "Inoculate BAP and chocolate agar. After incubation, observe colonies.",
        instruction: "On BAP you see small, alpha-hemolytic colonies with a central depression (draughtsman/checkers shape). Which confirmatory test is standard?",
        choices: [
          { label: "Optochin (P disk) sensitivity test", correct: true, result: "Optochin disk (5μg ethylhydrocuprein): Zone of inhibition = 18mm (≥14mm = sensitive)\n\n→ Optochin-sensitive + alpha-hemolysis = Streptococcus pneumoniae CONFIRMED\n\nAdditional: Bile solubility test POSITIVE (colonies dissolve in 10% sodium deoxycholate).", detail: "Optochin sensitivity (≥14mm with 6mm disk) is the standard presumptive test for S. pneumoniae." },
          { label: "Coagulase test", correct: false, result: "Coagulase is for Staphylococcus aureus identification, not Streptococcus." },
          { label: "Oxidase test", correct: false, result: "Oxidase differentiates Gram-negative organisms (e.g., Pseudomonas = oxidase+). Streptococci are not tested with oxidase." },
          { label: "CAMP test", correct: false, result: "CAMP test identifies Group B Streptococcus (S. agalactiae), not S. pneumoniae." }
        ],
        explanation: "S. pneumoniae identification: alpha-hemolysis on BAP + optochin-sensitive (≥14mm zone) + bile-soluble. Viridans streptococci are optochin-resistant and bile-insoluble. The bile solubility test uses sodium deoxycholate to lyse pneumococcal cells.",
        icon: "🧫"
      },
      {
        title: "AST & Final Report",
        description: "Perform susceptibility testing and compile the final report.",
        instruction: "For S. pneumoniae, which method determines penicillin susceptibility?",
        choices: [
          { label: "Oxacillin disk screen (1μg), then penicillin MIC if resistant", correct: true, result: "Oxacillin disk screen: 22mm (≥20mm = susceptible to penicillin for non-meningitis)\n\nFINAL REPORT:\n━━━━━━━━━━━━━━━━━━━\nOrganism: Streptococcus pneumoniae\nPenicillin: Susceptible (MIC ≤0.06 μg/mL)\nAlso susceptible: Ceftriaxone, Levofloxacin, Vancomycin\n━━━━━━━━━━━━━━━━━━━", detail: "The oxacillin disk is a surrogate screen for penicillin susceptibility in S. pneumoniae." },
          { label: "Penicillin disk diffusion directly", correct: false, result: "CLSI does not recommend direct penicillin disk diffusion for S. pneumoniae. The oxacillin disk screen is used." },
          { label: "Methicillin disk", correct: false, result: "Methicillin/cefoxitin disk is for MRSA detection in Staphylococcus, not for Streptococcus." },
          { label: "Ampicillin E-test only", correct: false, result: "Ampicillin is not the surrogate used. The standard approach is oxacillin 1μg disk screen, with penicillin MIC if screen is resistant." }
        ],
        explanation: "For S. pneumoniae, CLSI recommends an oxacillin 1μg disk screen. If zone ≥20mm, the isolate is susceptible to penicillin, amoxicillin, and certain cephalosporins for non-meningitis infections. If <20mm, penicillin MIC must be determined by broth microdilution or E-test.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // MOLECULAR BIOLOGY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "mol-pcr",
    title: "PCR-Based Pathogen Detection Workflow",
    department: "Molecular Biology",
    scenario: "A 30-year-old immunocompromised patient (HIV+) with persistent cough, night sweats, and weight loss. AFB smear is negative. A molecular test is ordered to rule out Mycobacterium tuberculosis.",
    patient: "30M, HIV+, persistent cough, night sweats, weight loss",
    sampleType: "Sputum (for molecular testing)",
    reference: "Molecular Cloning: A Laboratory Manual (Sambrook & Russell); CLSI MM03",
    steps: [
      {
        title: "Nucleic Acid Extraction",
        description: "Extract DNA from the sputum sample for PCR testing.",
        instruction: "Which extraction method is most appropriate for mycobacterial DNA from sputum?",
        choices: [
          { label: "Mechanical lysis (bead beating) + silica column purification", correct: true, result: "DNA extraction performed:\n• Mechanical lysis disrupts the tough mycobacterial cell wall (mycolic acid layer)\n• Silica membrane column purifies DNA\n• NanoDrop results: Concentration = 45 ng/μL, A260/280 = 1.85 (good purity)\n• Ready for PCR amplification.", detail: "Mycobacteria have a thick waxy cell wall (mycolic acids) that requires mechanical disruption." },
          { label: "Simple boiling lysis", correct: false, result: "Simple boiling may not adequately lyse mycobacterial cells due to their thick mycolic acid cell wall, leading to poor DNA yield." },
          { label: "Alkaline lysis (plasmid prep)", correct: false, result: "Alkaline lysis is used for plasmid DNA extraction from bacterial cultures, not for clinical sample processing." },
          { label: "Direct sample addition to PCR (no extraction)", correct: false, result: "Sputum contains many PCR inhibitors (mucin, cellular debris). Direct addition typically leads to inhibition and false negatives." }
        ],
        explanation: "Mycobacterial DNA extraction requires robust lysis due to the mycolic acid-rich cell wall. Methods include bead beating, enzymatic lysis (proteinase K + SDS), or commercial kits with mechanical disruption. Quality assessment via spectrophotometry (A260/280 ratio 1.8–2.0) ensures PCR-ready DNA.",
        icon: "🧬"
      },
      {
        title: "PCR Setup — Master Mix Preparation",
        description: "Prepare the PCR reaction targeting the IS6110 insertion sequence of M. tuberculosis complex.",
        instruction: "What are the essential components of a PCR master mix?",
        choices: [
          { label: "Template DNA, primers, dNTPs, Taq polymerase, MgCl₂, buffer", correct: true, result: "PCR Master Mix prepared (25μL reaction):\n• Buffer (1×) + MgCl₂ (1.5 mM)\n• dNTPs (200 μM each)\n• Forward & reverse primers targeting IS6110 (0.4 μM each)\n• Taq DNA polymerase (1.25 U)\n• Template DNA (5 μL = ~50 ng)\n• Positive control: M. tuberculosis H37Rv DNA\n• Negative control: Nuclease-free water", detail: "IS6110 is present in multiple copies (6–20) in the M. tuberculosis genome, enhancing sensitivity." },
          { label: "Template DNA and primers only", correct: false, result: "Missing critical components: polymerase, dNTPs, and buffer/MgCl₂ are all essential for the PCR reaction." },
          { label: "RNA, reverse transcriptase, and primers", correct: false, result: "This describes RT-PCR setup for RNA targets, not standard PCR for DNA detection." },
          { label: "Template DNA, restriction enzymes, and ligase", correct: false, result: "Restriction enzymes and ligase are used in cloning, not PCR amplification." }
        ],
        explanation: "A complete PCR reaction requires: template DNA, specific primers (forward & reverse), dNTPs (dATP, dTTP, dGTP, dCTP), thermostable DNA polymerase (Taq), MgCl₂ (cofactor), and reaction buffer. Controls are essential for validation.",
        icon: "🧪"
      },
      {
        title: "Thermal Cycling",
        description: "Program the thermal cycler for IS6110 PCR amplification.",
        instruction: "What is the correct order of PCR thermal cycling steps?",
        choices: [
          { label: "Initial denaturation → [Denaturation → Annealing → Extension] × 35 cycles → Final extension", correct: true, result: "Thermal cycling program:\n• Initial denaturation: 95°C × 5 min\n• 35 cycles of:\n  — Denaturation: 95°C × 30 sec\n  — Annealing: 58°C × 30 sec\n  — Extension: 72°C × 45 sec\n• Final extension: 72°C × 7 min\n• Hold at 4°C\n\nTotal run time: ~2 hours", detail: "Each cycle theoretically doubles the target DNA — 35 cycles yield ~34 billion copies from a single template." },
          { label: "Annealing → Extension → Denaturation (repeated)", correct: false, result: "Incorrect order. Denaturation must come first to separate DNA strands before primers can anneal." },
          { label: "Constant temperature at 72°C for 2 hours", correct: false, result: "PCR requires thermal cycling between three temperatures. A constant temperature would not work." },
          { label: "Extension → Denaturation → Annealing (repeated)", correct: false, result: "Incorrect sequence. The logical order is: denature (separate) → anneal (primers bind) → extend (polymerase copies)." }
        ],
        explanation: "PCR thermal cycling: Denaturation (94–95°C) separates double-stranded DNA. Annealing (50–65°C, primer-dependent) allows primers to bind complementary sequences. Extension (72°C) is the optimal temperature for Taq polymerase to synthesize new DNA strands.",
        icon: "🌡️"
      },
      {
        title: "Gel Electrophoresis & Result Interpretation",
        description: "Run PCR products on agarose gel electrophoresis.",
        instruction: "How do you prepare and interpret the gel electrophoresis results?",
        choices: [
          { label: "1.5% agarose gel with DNA stain, run alongside molecular weight ladder", correct: true, result: "Gel electrophoresis results:\n• Lane 1: DNA ladder (100bp marker)\n• Lane 2: Positive control — Band at 123bp ✓\n• Lane 3: Negative control — No band ✓\n• Lane 4: Patient sample — Band at 123bp ✓\n\n→ IS6110 target DETECTED\n→ M. tuberculosis complex DNA POSITIVE", detail: "The IS6110 PCR product is 123bp. A band at this size in the patient lane with valid controls confirms detection." },
          { label: "Run on SDS-PAGE gel", correct: false, result: "SDS-PAGE is for protein separation, not DNA. Agarose gel electrophoresis is used for nucleic acids." },
          { label: "Direct visualization under UV without gel", correct: false, result: "DNA cannot be visualized without separation on a gel matrix and a DNA-binding fluorescent dye." },
          { label: "Western blot transfer and antibody detection", correct: false, result: "Western blot is for protein detection. Southern blot would be used for DNA, but gel electrophoresis with staining is sufficient for PCR products." }
        ],
        explanation: "PCR products are separated by size on agarose gels (1–2%). DNA stains (ethidium bromide or safer alternatives like SYBR Safe) allow UV visualization. A molecular weight ladder provides size reference. Valid results require: positive control band at expected size, no band in negative control.",
        icon: "📊"
      },
      {
        title: "Result Reporting",
        description: "Issue the molecular test report with clinical interpretation.",
        instruction: "How should this molecular result be reported?",
        choices: [
          { label: "MTB complex DNA DETECTED by PCR. Recommend culture for viability and drug susceptibility testing.", correct: true, result: "MOLECULAR REPORT:\n━━━━━━━━━━━━━━━━━━━\nTest: PCR for M. tuberculosis complex (IS6110 target)\nResult: DETECTED\nInterpretation: M. tuberculosis complex DNA present in specimen\nNote: PCR detects DNA from viable and non-viable organisms. Culture and DST recommended for treatment guidance.\nTurnaround time: 4 hours\n━━━━━━━━━━━━━━━━━━━\nReference: CLSI MM03; WHO guidelines on TB molecular diagnostics", detail: "Molecular results are available in hours vs. weeks for culture, enabling rapid treatment initiation." },
          { label: "Patient has active TB, start treatment immediately without further testing", correct: false, result: "While PCR supports diagnosis, culture is still needed for drug susceptibility testing (DST) and to confirm viability." },
          { label: "Negative for TB, no further workup", correct: false, result: "The PCR result is positive, indicating MTB DNA was detected." },
          { label: "Inconclusive, repeat AFB smear only", correct: false, result: "The molecular test provides a definitive result. It is more sensitive than AFB smear, especially in smear-negative TB." }
        ],
        explanation: "Molecular TB testing (GeneXpert, conventional PCR) provides rapid results (hours vs. weeks). However, culture remains the gold standard for confirming viability and performing drug susceptibility testing. PCR cannot distinguish live from dead organisms.",
        icon: "📝"
      }
    ]
  },
  {
    id: "mol-seqanalysis",
    title: "16S rRNA Gene Sequencing for Bacterial Identification",
    department: "Molecular Biology",
    scenario: "An unusual Gram-positive rod is isolated from a brain abscess in a 45-year-old immunocompromised patient. Conventional biochemical tests are inconclusive. 16S rRNA gene sequencing is requested for definitive identification.",
    patient: "45M, immunocompromised, brain abscess",
    sampleType: "Bacterial isolate from brain abscess",
    reference: "Bergey's Manual of Systematic Bacteriology; CLSI MM18",
    steps: [
      {
        title: "DNA Extraction from Pure Culture",
        description: "Extract genomic DNA from the pure bacterial isolate.",
        instruction: "What is the recommended approach for DNA extraction from a pure bacterial culture?",
        choices: [
          { label: "Enzymatic lysis (lysozyme + proteinase K) followed by column purification", correct: true, result: "Colony picked from pure culture, suspended in TE buffer.\nLysozyme digestion (37°C, 30 min) → Proteinase K + SDS (56°C, 1h) → Column purification\nDNA yield: 85 ng/μL, A260/280 = 1.92 — excellent quality for PCR and sequencing.", detail: "Enzymatic lysis is gentle and effective for most Gram-positive and Gram-negative bacteria." },
          { label: "Phenol-chloroform extraction without cell lysis", correct: false, result: "Cell lysis is a prerequisite. Phenol-chloroform without prior lysis would give poor yields from intact cells." },
          { label: "RNA extraction kit", correct: false, result: "16S rRNA gene sequencing requires DNA, not RNA. An RNA kit would purify RNA and degrade DNA." },
          { label: "Freeze-thaw cycles only", correct: false, result: "Freeze-thaw alone may be insufficient for complete lysis of Gram-positive organisms with thick peptidoglycan walls." }
        ],
        explanation: "For Gram-positive bacteria, lysozyme cleaves the peptidoglycan layer, and proteinase K degrades proteins. Gram-negative bacteria can be lysed with proteinase K + SDS alone (thinner peptidoglycan). Column-based kits provide high-purity DNA suitable for PCR and sequencing.",
        icon: "🧬"
      },
      {
        title: "PCR Amplification of 16S rRNA Gene",
        description: "Amplify the ~1,500bp 16S rRNA gene using universal primers.",
        instruction: "Which primers are used for 16S rRNA gene amplification?",
        choices: [
          { label: "Universal primers 27F and 1492R targeting conserved regions", correct: true, result: "PCR with universal primers:\n• 27F (5'-AGAGTTTGATCMTGGCTCAG-3')\n• 1492R (5'-TACGGYTACCTTGTTACGACTT-3')\n• Target: Nearly full-length 16S rRNA gene (~1,465bp)\n\nGel electrophoresis: Strong band at ~1,500bp ✓", detail: "Universal primers bind conserved regions flanking the variable regions (V1–V9) of the 16S rRNA gene." },
          { label: "mecA gene primers", correct: false, result: "mecA primers detect methicillin resistance genes, not the 16S rRNA gene for identification." },
          { label: "ITS region primers", correct: false, result: "ITS primers target the Internal Transcribed Spacer region used for fungal identification, not bacterial 16S rRNA." },
          { label: "Random hexamer primers", correct: false, result: "Random hexamers are used for cDNA synthesis in RT-PCR, not for targeted 16S gene amplification." }
        ],
        explanation: "The 16S rRNA gene (~1,542bp in E. coli) has conserved regions (for universal primer binding) interspersed with 9 hypervariable regions (V1–V9) that provide species-specific sequences. The 27F/1492R primer pair amplifies nearly the full gene for maximum phylogenetic resolution.",
        icon: "🧪"
      },
      {
        title: "Sanger Sequencing",
        description: "Submit the purified PCR product for Sanger sequencing.",
        instruction: "What must be done to the PCR product before Sanger sequencing?",
        choices: [
          { label: "Purify to remove excess primers, dNTPs, and polymerase", correct: true, result: "PCR product purified using spin column (removes primers, dNTPs, salts).\nSubmitted for bidirectional Sanger sequencing with 27F and 1492R primers.\nSequencing completed: ~1,400bp of high-quality sequence obtained (Phred score >20).", detail: "Excess primers and dNTPs interfere with the sequencing reaction and must be removed." },
          { label: "Denature at 95°C and sequence immediately", correct: false, result: "Denaturation alone does not remove interfering components. Purification is required." },
          { label: "Clone into a plasmid first", correct: false, result: "Cloning is unnecessary for direct Sanger sequencing of PCR products. It adds time and complexity." },
          { label: "Digest with restriction enzymes", correct: false, result: "Restriction digestion is for cloning or RFLP analysis, not for sequencing preparation." }
        ],
        explanation: "PCR cleanup removes residual primers (would cause mixed signal), unused dNTPs (compete with ddNTPs in sequencing reaction), and polymerase. Methods: spin columns, enzymatic cleanup (ExoSAP-IT), or bead-based purification. Bidirectional sequencing provides consensus sequence.",
        icon: "📊"
      },
      {
        title: "Sequence Analysis & BLAST",
        description: "Analyze the obtained sequence using bioinformatics tools.",
        instruction: "How do you identify the organism from the 16S rRNA sequence?",
        choices: [
          { label: "BLAST against NCBI GenBank or curated databases (e.g., EzBioCloud, RDP)", correct: true, result: "BLAST Results:\n━━━━━━━━━━━━━━━━━━━\nTop hit: Nocardia farcinica (99.6% identity, 100% coverage)\n2nd hit: Nocardia nova (97.2% identity)\n3rd hit: Nocardia cyriacigeorgica (96.8% identity)\n━━━━━━━━━━━━━━━━━━━\n\n≥99% identity with type strain = species-level identification\n97–99% = genus-level identification\n<97% = potential novel species\n\nIdentification: Nocardia farcinica", detail: "EzBioCloud contains curated type strain sequences, providing more reliable identification than raw GenBank." },
          { label: "Visual comparison of chromatograms", correct: false, result: "Visual inspection alone cannot identify species. Computational alignment against reference databases is required." },
          { label: "Submit to protein database (UniProt)", correct: false, result: "UniProt is a protein database. 16S rRNA is a nucleotide sequence — use nucleotide databases like GenBank." },
          { label: "Run through metabolic pathway software", correct: false, result: "Metabolic pathway tools (e.g., KEGG) analyze functional genes, not 16S rRNA for taxonomic identification." }
        ],
        explanation: "16S rRNA sequences are compared against curated databases. Thresholds per CLSI MM18: ≥99.0% identity = species identification, 97–99% = genus level. EzBioCloud and RDP are curated databases preferred over raw GenBank for clinical identification.",
        icon: "💻"
      },
      {
        title: "Clinical Reporting",
        description: "Issue the sequencing-based identification report.",
        instruction: "What should the final molecular identification report include?",
        choices: [
          { label: "Organism ID, % identity, database used, gene target, and clinical significance", correct: true, result: "MOLECULAR IDENTIFICATION REPORT:\n━━━━━━━━━━━━━━━━━━━\nMethod: 16S rRNA gene sequencing (Sanger)\nTarget: ~1,400bp of 16S rRNA gene\nDatabase: EzBioCloud (type strains)\nResult: Nocardia farcinica (99.6% identity to type strain)\nClinical significance: N. farcinica causes pulmonary and disseminated nocardiosis in immunocompromised patients. Known for CNS involvement. Often resistant to many antibiotics; susceptibility testing recommended.\nRecommended: TMP-SMX + imipenem or amikacin for CNS disease\n━━━━━━━━━━━━━━━━━━━", detail: "Comprehensive reporting ensures clinicians understand the method limitations and clinical relevance." },
          { label: "Just report the organism name without methodology", correct: false, result: "Reports must include methodology, database, and percent identity for traceability and quality assurance." },
          { label: "Report as 'unidentifiable organism'", correct: false, result: "The 99.6% match to N. farcinica type strain provides confident species-level identification." },
          { label: "Report only the genus, never species", correct: false, result: "At 99.6% identity to type strain, species-level identification is appropriate and clinically important for treatment decisions." }
        ],
        explanation: "Molecular identification reports per CLSI MM18 should include: method, gene target, sequence quality, database used, top matches with % identity, and clinical interpretation. Species-level reporting requires ≥99% identity to the type strain sequence.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // CLINICAL CHEMISTRY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "chem-cmp",
    title: "Comprehensive Metabolic Panel (CMP) Workflow",
    department: "Clinical Chemistry",
    scenario: "A 60-year-old male with diabetes, hypertension, and fatigue. A CMP is ordered to evaluate renal function, liver function, and electrolyte status.",
    patient: "60M, diabetic, hypertensive, fatigue",
    sampleType: "Serum (Gold-top SST tube)",
    reference: "Tietz Textbook of Clinical Chemistry and Molecular Diagnostics, 7th Ed.",
    steps: [
      {
        title: "Specimen Collection & Handling",
        description: "Evaluate the specimen received for CMP analysis.",
        instruction: "What tube type and conditions are required for a CMP?",
        choices: [
          { label: "Gold-top SST or red-top tube; fasting preferred; avoid hemolysis", correct: true, result: "Specimen received: Gold-top SST, fasting ×10h confirmed.\nCentrifuged at 1500×g for 10 minutes. Serum separated.\nVisual inspection: Clear, non-hemolyzed, non-lipemic, non-icteric.\n→ Acceptable for analysis.", detail: "Hemolysis falsely elevates potassium, LDH, and AST. Fasting is important for glucose accuracy." },
          { label: "Lavender-top EDTA tube", correct: false, result: "EDTA tubes are for hematology (CBC). EDTA chelates calcium, making it unmeasurable, and interferes with many chemistry assays." },
          { label: "Blue-top citrate tube", correct: false, result: "Citrate tubes are for coagulation studies. Citrate chelates calcium and dilutes the specimen." },
          { label: "Any tube type, non-fasting is fine", correct: false, result: "Tube type matters — additives interfere with specific analytes. Fasting affects glucose and triglyceride results." }
        ],
        explanation: "CMP requires serum (SST/red-top) or lithium heparin plasma. The specimen must be centrifuged promptly (within 30 min) and checked for hemolysis (H), icterus (I), and lipemia (L) — the HIL index. Hemolysis is the #1 pre-analytical error in clinical chemistry.",
        icon: "🩸"
      },
      {
        title: "Quality Control Verification",
        description: "Before running patient samples, verify QC results are acceptable.",
        instruction: "QC Level 1 glucose result is 2.8 SD above the mean. What action is required per Westgard rules?",
        choices: [
          { label: "Investigate — 1-2s is a warning; check 1-3s and trend rules before rejection", correct: true, result: "QC evaluation using Westgard multi-rules:\n• 1-2s: WARNING — single QC >2SD (not an automatic rejection)\n• 1-3s: Not violated (result is 2.8 SD, not >3 SD)\n• 2-2s: Check previous run — if also >2SD in same direction → reject\n• R-4s: Check if both levels show >4SD range between them\n\nPrevious QC was within 1SD → No systematic error. Accept run with monitoring.", detail: "The 1-2s rule is a warning, not a rejection rule. Apply Westgard multi-rules systematically." },
          { label: "Reject immediately and recalibrate", correct: false, result: "The 1-2s rule alone is a warning with a 5% false rejection rate. Immediate rejection wastes resources." },
          { label: "Ignore and run patient samples", correct: false, result: "QC warnings should never be ignored. Systematic evaluation of multi-rules is required." },
          { label: "Report patient results with a disclaimer", correct: false, result: "Patient results cannot be reported until QC status is resolved and determined acceptable." }
        ],
        explanation: "Westgard multi-rules minimize false rejections while detecting true errors. 1-2s = warning (5% false rejection if used as rejection rule). 1-3s, 2-2s, R-4s, 4-1s, 10-x = rejection rules. Systematic application prevents unnecessary recalibration while catching real analytical errors.",
        icon: "📊"
      },
      {
        title: "Analyzer Run & Result Review",
        description: "Run the CMP on the automated chemistry analyzer and review results.",
        instruction: "Review the following results. Which finding is most clinically significant?\n\nGlucose: 210 mg/dL (H) | BUN: 38 mg/dL (H) | Creatinine: 2.1 mg/dL (H) | Na: 138 | K: 5.8 mEq/L (H) | Cl: 100 | CO₂: 18 mEq/L (L) | Ca: 8.2 mg/dL (L) | ALT: 32 | AST: 28 | Alk Phos: 95 | Albumin: 3.0 g/dL (L)",
        choices: [
          { label: "Potassium 5.8 mEq/L — critical value requiring immediate notification", correct: true, result: "CRITICAL VALUE ALERT: Potassium = 5.8 mEq/L\n• Critical high threshold: >5.5 mEq/L\n• Verify: specimen not hemolyzed ✓, not collected from IV arm ✓\n• Read-back verified with ordering physician at [time]\n\nAdditional significant findings:\n• eGFR: 32 mL/min/1.73m² → CKD Stage 3b\n• Hyperglycemia (poorly controlled diabetes)\n• Metabolic acidosis (low CO₂) with hyperkalemia — concerning for diabetic complications", detail: "Hyperkalemia >5.5 mEq/L is a critical value — can cause fatal cardiac arrhythmias." },
          { label: "Glucose 210 mg/dL — most important", correct: false, result: "Elevated glucose is significant but not a critical value. Potassium 5.8 is immediately life-threatening and takes priority." },
          { label: "BUN 38 — needs dialysis", correct: false, result: "While BUN is elevated indicating renal impairment, it is not a critical value requiring immediate notification. The hyperkalemia is more urgent." },
          { label: "Albumin 3.0 — critical finding", correct: false, result: "Low albumin indicates chronic disease or malnutrition but is not a critical value requiring immediate notification." }
        ],
        explanation: "Critical values are results that may represent life-threatening conditions requiring immediate clinical action. Hyperkalemia >5.5 mEq/L can cause cardiac arrhythmias (peaked T waves, widened QRS, sine wave → cardiac arrest). Labs must verify the result and notify the physician within a defined timeframe (typically 30 minutes).",
        icon: "⚠️"
      },
      {
        title: "Clinical Interpretation & Reporting",
        description: "Interpret the CMP results as a complete clinical picture.",
        instruction: "Based on all CMP results, what is the integrated clinical interpretation?",
        choices: [
          { label: "Diabetic nephropathy with CKD Stage 3b: hyperglycemia, elevated creatinine/BUN, hyperkalemia, metabolic acidosis", correct: true, result: "INTEGRATED INTERPRETATION:\n━━━━━━━━━━━━━━━━━━━\nRenal: eGFR 32 mL/min → CKD Stage 3b\n  BUN/Cr ratio 18:1 (renal cause)\n  Hyperkalemia (impaired renal K+ excretion)\n  Metabolic acidosis (impaired H+ excretion)\nMetabolic: Uncontrolled diabetes (glucose 210)\nNutrition: Hypoalbuminemia (chronic disease/proteinuria)\nCalcium: Low (corrected Ca = 9.0 → secondary to hypoalbuminemia)\n━━━━━━━━━━━━━━━━━━━\nDiagnosis: Diabetic nephropathy with Stage 3b CKD", detail: "The combination of diabetic hyperglycemia with progressive renal failure is a hallmark of diabetic nephropathy." },
          { label: "Liver failure with hepatorenal syndrome", correct: false, result: "Liver enzymes (ALT, AST, Alk Phos) are all normal. This is not a hepatic presentation." },
          { label: "Acute kidney injury from dehydration", correct: false, result: "The BUN/Cr ratio of ~18:1 and low eGFR suggest chronic kidney disease rather than pre-renal AKI (where ratio would be >20:1 with normal GFR)." },
          { label: "Normal results for a 60-year-old", correct: false, result: "Multiple values are significantly abnormal. These results are not age-related normal variations." }
        ],
        explanation: "CMP interpretation requires integrating multiple analytes: renal function (BUN, creatinine, eGFR), electrolytes (Na, K, Cl, CO₂), liver function (ALT, AST, Alk Phos, albumin), and glucose. Pattern recognition: Diabetes + progressive renal decline + hyperkalemia + metabolic acidosis = classic diabetic nephropathy.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // HEMATOLOGY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "heme-cbc",
    title: "Complete Blood Count (CBC) Workflow",
    department: "Hematology",
    scenario: "A 22-year-old female presents with fatigue, pallor, and shortness of breath on exertion. CBC with differential and peripheral blood smear review ordered.",
    patient: "22F, fatigue, pallor, dyspnea on exertion",
    sampleType: "EDTA whole blood (Lavender-top)",
    reference: "Rodak's Hematology: Clinical Principles and Applications, 6th Ed.",
    steps: [
      {
        title: "Specimen Assessment",
        description: "Evaluate the EDTA blood specimen for adequacy.",
        instruction: "What should be checked when receiving a CBC specimen?",
        choices: [
          { label: "EDTA tube fill volume, clot check, labeling, and time from collection", correct: true, result: "Specimen assessment:\n• Lavender-top EDTA tube, properly labeled ✓\n• Fill volume adequate (~3 mL for standard tube) ✓\n• No visible clots (gently inverted, checked with applicator stick) ✓\n• Collected 30 minutes ago ✓\n→ Acceptable for analysis.", detail: "Under-filled EDTA tubes cause EDTA-excess artifact: falsely low MCV, falsely low hematocrit, and crenated RBCs on smear." },
          { label: "Only check if the tube has blood in it", correct: false, result: "Incomplete assessment. Clots, improper filling, and delays can all cause erroneous results." },
          { label: "Centrifuge immediately and check plasma color", correct: false, result: "CBC is performed on whole blood — centrifugation is not part of the CBC pre-analytical process." },
          { label: "Refrigerate at -20°C", correct: false, result: "Freezing destroys cells. EDTA blood should be stored at room temperature and analyzed within 4–6 hours for optimal results." }
        ],
        explanation: "Pre-analytical variables in hematology: EDTA concentration (proper fill volume), clot formation (causes falsely low counts), specimen age (>4h: platelet swelling, WBC degenerating), and temperature (RT for counting, refrigerate if delay >4h). Clotted specimens must be rejected.",
        icon: "📋"
      },
      {
        title: "Automated Analyzer Run",
        description: "Run the specimen on the automated hematology analyzer.",
        instruction: "The analyzer reports flags for low RBC indices and anisocytosis. Review the results:\n\nWBC: 6.2 × 10³/μL | RBC: 3.8 × 10⁶/μL (L) | Hgb: 8.2 g/dL (L) | Hct: 26% (L) | MCV: 68 fL (L) | MCH: 21.6 pg (L) | MCHC: 31.5 g/dL (L) | RDW: 18.5% (H) | Plt: 420 × 10³/μL (H)\n\nWhat type of anemia is indicated?",
        choices: [
          { label: "Microcytic hypochromic anemia (likely iron deficiency)", correct: true, result: "Classification:\n• MCV 68 fL (<80) = Microcytic\n• MCH 21.6 pg (<27) = Hypochromic\n• MCHC 31.5 g/dL (<32) = Hypochromic\n• RDW 18.5% (>14.5) = Anisocytosis (variation in RBC size)\n• Thrombocytosis (420K) — reactive, common in iron deficiency\n\nDifferential for microcytic anemia: Iron deficiency, thalassemia, chronic disease, sideroblastic anemia.\nMentzer index: MCV/RBC = 68/3.8 = 17.9 (>13 = favors iron deficiency over thalassemia).", detail: "Iron deficiency is the most common cause of microcytic anemia worldwide." },
          { label: "Macrocytic anemia (B12 deficiency)", correct: false, result: "MCV of 68 fL is microcytic, not macrocytic. B12 deficiency causes MCV >100 fL." },
          { label: "Normocytic normochromic anemia (acute blood loss)", correct: false, result: "MCV 68 and MCH 21.6 are clearly below normal, indicating microcytic hypochromic anemia, not normocytic." },
          { label: "Hemolytic anemia", correct: false, result: "While hemolytic anemia can have varied indices, the low MCV and MCH strongly suggest iron deficiency or thalassemia rather than hemolysis." }
        ],
        explanation: "Anemias are classified by MCV: Microcytic (<80fL) — iron deficiency, thalassemia, ACD, sideroblastic; Normocytic (80–100fL) — acute blood loss, ACD, hemolysis; Macrocytic (>100fL) — B12/folate deficiency, MDS, liver disease. RDW helps: high RDW + microcytic favors iron deficiency over thalassemia trait (normal RDW).",
        icon: "🖥️"
      },
      {
        title: "Peripheral Blood Smear Preparation & Review",
        description: "Prepare and examine a peripheral blood smear.",
        instruction: "What is the correct technique for making a peripheral blood smear?",
        choices: [
          { label: "Wedge/push method: small drop, 30–45° spreader angle, smooth single stroke", correct: true, result: "Smear prepared using wedge technique. Stained with Wright-Giemsa.\n\nSmear review (oil immersion, 100×):\n• RBCs: Microcytic, hypochromic with central pallor >1/3 cell diameter\n• Marked anisocytosis and poikilocytosis\n• Target cells present\n• Pencil cells (elliptocytes) noted\n• Platelets: Adequate to increased\n• WBCs: Normal morphology, no blasts\n\n→ Consistent with iron deficiency anemia.", detail: "The feathered edge should have a smooth, gradually thinning monolayer for optimal morphology evaluation." },
          { label: "Spin smear technique at high speed", correct: false, result: "Cytospin preparations are for concentrated specimens (CSF, fluids), not routine peripheral blood." },
          { label: "Thick drop method (like malaria prep)", correct: false, result: "Thick smears are used for malaria parasite detection. Routine CBC smear review requires a thin wedge preparation." },
          { label: "Just place a large drop and coverslip", correct: false, result: "This method does not create the graduated thickness needed for proper cell morphology evaluation." }
        ],
        explanation: "Wedge technique: Place small drop near frosted end, hold spreader at 30–45°, push smoothly in one motion. Result: head → body → feathered edge. Examine the monolayer (body-to-feathered edge transition) where RBCs barely touch/overlap. Wright-Giemsa stain: Fix in methanol → Wright stain → buffer → rinse.",
        icon: "🔬"
      },
      {
        title: "Iron Studies Correlation",
        description: "Correlate CBC findings with iron studies to confirm diagnosis.",
        instruction: "The iron panel shows: Serum iron = 25 μg/dL (L), TIBC = 450 μg/dL (H), Ferritin = 8 ng/mL (L), Transferrin saturation = 5.6% (L). What do these results confirm?",
        choices: [
          { label: "Iron deficiency anemia: low iron, low ferritin, high TIBC, low % saturation", correct: true, result: "CONFIRMED: Iron Deficiency Anemia\n━━━━━━━━━━━━━━━━━━━\n• Ferritin 8 ng/mL (depleted iron stores) — most sensitive/specific single test\n• Serum iron 25 μg/dL (decreased circulating iron)\n• TIBC 450 μg/dL (increased = body trying to absorb more iron)\n• % Transferrin saturation 5.6% (markedly decreased)\n• sTfR (soluble transferrin receptor) would be elevated\n\nPattern: ↓Fe, ↑TIBC, ↓Ferritin, ↓%Sat = Classic iron deficiency\n\nRecommend: Evaluate for cause (menstrual loss, GI bleeding, dietary insufficiency)", detail: "Ferritin is an acute phase reactant — it may be falsely normal in iron deficiency with concurrent inflammation." },
          { label: "Anemia of chronic disease", correct: false, result: "ACD shows: low iron, LOW TIBC, normal/high ferritin, low %sat. The HIGH TIBC and LOW ferritin here confirm iron deficiency." },
          { label: "Thalassemia trait", correct: false, result: "Thalassemia trait typically has normal iron studies. The markedly abnormal iron panel here confirms iron deficiency." },
          { label: "Sideroblastic anemia", correct: false, result: "Sideroblastic anemia shows HIGH serum iron and HIGH ferritin with ring sideroblasts. This patient has LOW iron and ferritin." }
        ],
        explanation: "Iron study patterns — IDA: ↓Fe, ↑TIBC, ↓Ferritin, ↓%Sat. ACD: ↓Fe, ↓TIBC, ↑Ferritin, ↓%Sat. Sideroblastic: ↑Fe, N-TIBC, ↑Ferritin, ↑%Sat. Thalassemia: Normal iron studies. Ferritin <30 ng/mL is virtually diagnostic of iron deficiency (sensitivity 92%, specificity 98%).",
        icon: "📝"
      }
    ]
  },
  {
    id: "heme-coag",
    title: "Coagulation Studies Workflow",
    department: "Hematology",
    scenario: "A 50-year-old male on warfarin therapy presents for routine coagulation monitoring. Bleeding from gums noted. PT/INR and aPTT ordered.",
    patient: "50M, warfarin therapy, gum bleeding",
    sampleType: "Citrated plasma (Blue-top, 3.2% sodium citrate)",
    reference: "Rodak's Hematology, 6th Ed.; CLSI H21-A5",
    steps: [
      {
        title: "Specimen Collection Verification",
        description: "Verify the citrate tube specimen for coagulation testing.",
        instruction: "What is the critical pre-analytical requirement for coagulation specimens?",
        choices: [
          { label: "9:1 blood-to-citrate ratio; fill to line; process within 4 hours", correct: true, result: "Specimen check:\n• Blue-top 3.2% sodium citrate ✓\n• Filled to line (9:1 ratio) ✓\n• No clots detected ✓\n• Centrifuged at 1500×g × 15 min → platelet-poor plasma\n• Processed within 1 hour of collection ✓", detail: "Under-filled citrate tubes have excess anticoagulant, causing falsely prolonged PT and aPTT." },
          { label: "Any fill level is acceptable", correct: false, result: "Incorrect. Under-filling (<90% of draw volume) causes excess citrate relative to blood, falsely prolonging clotting times." },
          { label: "EDTA tube can substitute for citrate", correct: false, result: "EDTA irreversibly chelates calcium and cannot be used for coagulation testing. Citrate's chelation is reversible with excess calcium in the reagent." },
          { label: "Freeze immediately at -80°C", correct: false, result: "Fresh specimens should be tested within 4 hours at room temperature. Freezing is for storage when testing is delayed beyond 4 hours." }
        ],
        explanation: "Coagulation pre-analytics per CLSI H21: 3.2% sodium citrate, 9:1 ratio, avoid contamination with tissue thromboplastin (discard tube if using butterfly), centrifuge to platelet-poor plasma (<10,000/μL platelets), test within 4 hours (24h if frozen at -20°C or below).",
        icon: "📋"
      },
      {
        title: "PT/INR Testing",
        description: "Perform the Prothrombin Time (PT) and calculate INR.",
        instruction: "PT result is 28.5 seconds (reference: 11–13.5 sec), INR = 3.8. How do you interpret this for a patient on warfarin?",
        choices: [
          { label: "Supratherapeutic INR (target 2.0–3.0 for most indications); risk of bleeding", correct: true, result: "PT/INR Interpretation:\n• PT: 28.5 sec (prolonged)\n• INR: 3.8 (supratherapeutic)\n• Target INR for most indications: 2.0–3.0\n• Target INR for mechanical heart valve: 2.5–3.5\n\nINR 3.8 = Increased bleeding risk\n→ Critical value if >4.0 at many institutions\n→ Contact physician for warfarin dose adjustment\n\nThe PT measures the extrinsic pathway (Factor VII) and common pathway (X, V, prothrombin, fibrinogen).", detail: "INR standardizes PT results across different thromboplastin reagents using the ISI (International Sensitivity Index)." },
          { label: "Therapeutic INR, no action needed", correct: false, result: "INR 3.8 exceeds the therapeutic range of 2.0–3.0 for most indications. This represents supratherapeutic anticoagulation." },
          { label: "Subtherapeutic, increase warfarin dose", correct: false, result: "INR 3.8 is above the therapeutic range. Increasing the dose would worsen the bleeding risk." },
          { label: "PT is normal for someone on warfarin", correct: false, result: "While warfarin prolongs PT, the INR of 3.8 exceeds therapeutic targets and correlates with the patient's gum bleeding." }
        ],
        explanation: "INR = (Patient PT / Mean Normal PT)^ISI. Warfarin inhibits vitamin K-dependent factors (II, VII, IX, X). PT primarily reflects Factor VII (shortest half-life, first to decrease). INR >3.0 carries significant bleeding risk. INR >5.0 is a medical emergency.",
        icon: "⏱️"
      },
      {
        title: "aPTT Testing",
        description: "Run the activated Partial Thromboplastin Time (aPTT).",
        instruction: "aPTT result is 42 seconds (reference: 25–35 sec). What does this indicate in a warfarin patient?",
        choices: [
          { label: "Mildly prolonged aPTT consistent with warfarin effect on factor IX", correct: true, result: "aPTT: 42 sec (mildly prolonged)\n\nWarfarin affects both extrinsic (PT) and intrinsic (aPTT) pathways because it inhibits factors II, VII, IX, and X.\n\n• PT/INR: More affected (Factor VII = shortest half-life)\n• aPTT: Mildly prolonged due to factors IX and X involvement\n\nCoagulation pathway summary:\n• Extrinsic: VII → common pathway (measured by PT)\n• Intrinsic: XII, XI, IX, VIII → common pathway (measured by aPTT)\n• Common: X, V, II (prothrombin), I (fibrinogen)", detail: "aPTT is not the primary monitoring test for warfarin but is often affected at supratherapeutic levels." },
          { label: "Indicates heparin contamination", correct: false, result: "While heparin prolongs aPTT, the mild prolongation here is consistent with supratherapeutic warfarin affecting factor IX." },
          { label: "Normal aPTT, no warfarin effect", correct: false, result: "42 seconds exceeds the reference range of 25–35 seconds. This is a prolonged aPTT." },
          { label: "Factor VIII deficiency (hemophilia A)", correct: false, result: "The clinical context (warfarin therapy, supratherapeutic INR) explains the aPTT prolongation without invoking a factor deficiency." }
        ],
        explanation: "Warfarin inhibits vitamin K epoxide reductase, preventing carboxylation of factors II, VII, IX, X (and proteins C, S). PT is the primary monitoring test because Factor VII (half-life 6h) is first affected. aPTT may also prolong at high warfarin levels due to factor IX depletion.",
        icon: "🧪"
      },
      {
        title: "Reporting & Clinical Action",
        description: "Report results with appropriate clinical context.",
        instruction: "What is the appropriate action for INR 3.8 with minor bleeding?",
        choices: [
          { label: "Report as critical/priority; hold warfarin, recheck INR in 1–2 days; consider vitamin K if bleeding worsens", correct: true, result: "COAGULATION REPORT:\n━━━━━━━━━━━━━━━━━━━\nPT: 28.5 sec (Ref: 11.0–13.5)\nINR: 3.8 (Target: 2.0–3.0)\naPTT: 42 sec (Ref: 25–35)\n━━━━━━━━━━━━━━━━━━━\nInterpretation: Supratherapeutic anticoagulation\nClinical note: Patient reports gum bleeding\nRecommendation: Hold warfarin, recheck INR in 24–48h\nIf INR >5.0 with no bleeding: oral vitamin K 1–2.5mg\nIf major bleeding: IV vitamin K + 4-factor PCC or FFP", detail: "Management per ACCP guidelines depends on INR level and presence/absence of bleeding." },
          { label: "No action needed, routine recheck in 1 month", correct: false, result: "INR 3.8 with active bleeding requires immediate intervention, not a 1-month follow-up." },
          { label: "Administer heparin for bridging", correct: false, result: "The patient is already over-anticoagulated. Adding heparin would dramatically increase bleeding risk." },
          { label: "Transfuse platelets", correct: false, result: "The issue is factor deficiency from warfarin, not thrombocytopenia. Platelets would not correct the INR." }
        ],
        explanation: "Management of supratherapeutic INR (ACCP guidelines): INR 3.0–4.5 without bleeding: hold warfarin, monitor. INR 4.5–10 without bleeding: hold warfarin ± low-dose oral vitamin K. INR >10 or serious bleeding: IV vitamin K + 4-factor PCC. Life-threatening bleeding: IV vitamin K + PCC or FFP immediately.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // IMMUNOLOGY / SEROLOGY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "immuno-hiv",
    title: "HIV Diagnostic Testing Algorithm",
    department: "Immunology / Serology",
    scenario: "A 28-year-old male requests HIV testing after potential exposure 4 weeks ago. The CDC-recommended diagnostic algorithm is followed.",
    patient: "28M, potential HIV exposure 4 weeks ago",
    sampleType: "Serum (SST tube)",
    reference: "Janeway's Immunobiology, 9th Ed.; CDC HIV Testing Algorithm (2014 update)",
    steps: [
      {
        title: "Initial Screening Test",
        description: "Perform the first step of the CDC HIV diagnostic algorithm.",
        instruction: "What is the recommended initial screening test for HIV per the current CDC algorithm?",
        choices: [
          { label: "4th generation HIV-1/2 Ag/Ab combination immunoassay", correct: true, result: "4th Generation HIV-1/2 Ag/Ab Combo Assay performed.\nResult: REACTIVE\n\nThis assay detects:\n• HIV-1 p24 antigen (detectable ~2 weeks post-infection)\n• HIV-1 antibodies (detectable ~3-4 weeks)\n• HIV-2 antibodies\n\nSensitivity: >99.5% | Window period: ~2 weeks (vs. 3-4 weeks for antibody-only tests)\n\n→ Proceed to supplemental testing per CDC algorithm.", detail: "4th generation assays detect acute infection earlier by including p24 antigen detection." },
          { label: "Rapid antibody test (OraQuick)", correct: false, result: "Rapid antibody-only tests are 3rd generation and have a longer window period (~4 weeks). The CDC algorithm recommends 4th generation Ag/Ab combo as the initial test." },
          { label: "Western blot as first test", correct: false, result: "Western blot is no longer recommended in the CDC algorithm. It has been replaced by the HIV-1/HIV-2 differentiation immunoassay." },
          { label: "Viral culture", correct: false, result: "HIV culture is complex, expensive, and not used for routine diagnosis. It is a research tool." }
        ],
        explanation: "The 2014 CDC algorithm uses 4th generation Ag/Ab combo immunoassay as the initial screen. It detects p24 antigen + antibodies, reducing the window period to ~2 weeks. This replaced the previous algorithm that used 3rd generation antibody-only tests with Western blot confirmation.",
        icon: "🧪"
      },
      {
        title: "Supplemental Differentiation Test",
        description: "The initial screen is reactive. Proceed to the supplemental test.",
        instruction: "Per the CDC algorithm, what is the next step after a reactive 4th generation screen?",
        choices: [
          { label: "HIV-1/HIV-2 antibody differentiation immunoassay", correct: true, result: "HIV-1/HIV-2 Differentiation Immunoassay performed.\nResult: HIV-1 POSITIVE, HIV-2 NEGATIVE\n\n→ Diagnosis: HIV-1 infection CONFIRMED\n\nIf the differentiation assay were negative/indeterminate:\n→ Would proceed to HIV-1 NAT (nucleic acid test) to detect acute infection.", detail: "This replaces the traditional Western blot in the current CDC algorithm." },
          { label: "Repeat the same 4th generation test", correct: false, result: "Repeating the same test does not provide additional information. The algorithm requires a different, supplemental test." },
          { label: "Western blot", correct: false, result: "Western blot is no longer part of the recommended CDC algorithm. It was replaced due to poor sensitivity for acute/early infection." },
          { label: "CD4 count", correct: false, result: "CD4 count is for staging HIV disease, not for diagnostic confirmation." }
        ],
        explanation: "CDC algorithm step 2: HIV-1/HIV-2 differentiation immunoassay (e.g., Geenius, Multispot). This identifies whether the infection is HIV-1, HIV-2, or undifferentiated. If negative or indeterminate on the differentiation assay, proceed to HIV-1 NAT (RNA PCR) to detect acute infection.",
        icon: "🔬"
      },
      {
        title: "Result Interpretation & Reporting",
        description: "Compile and report the final HIV diagnostic result.",
        instruction: "The 4th gen screen is reactive, and the differentiation assay confirms HIV-1 positive. What should be reported?",
        choices: [
          { label: "HIV-1 infection confirmed; recommend CD4 count, viral load, and referral for treatment", correct: true, result: "HIV DIAGNOSTIC REPORT:\n━━━━━━━━━━━━━━━━━━━\nInitial screen (4th gen Ag/Ab): REACTIVE\nSupplemental (differentiation): HIV-1 POSITIVE\nFinal interpretation: HIV-1 INFECTION CONFIRMED\n━━━━━━━━━━━━━━━━━━━\nRecommendations:\n• CD4+ T-cell count (staging)\n• HIV-1 RNA viral load (quantitative)\n• Genotypic resistance testing\n• Referral to infectious disease for ART initiation\n• Partner notification per local requirements", detail: "Current guidelines recommend ART initiation regardless of CD4 count ('treat all' approach)." },
          { label: "Report as 'possible infection, retest in 6 months'", correct: false, result: "A reactive 4th gen screen confirmed by HIV-1/2 differentiation assay constitutes definitive diagnosis. No further confirmation is needed." },
          { label: "Report as indeterminate", correct: false, result: "Both the screening and supplemental tests are clearly positive. This is a confirmed positive, not indeterminate." },
          { label: "Run a Western blot to triple-confirm", correct: false, result: "Western blot is no longer recommended per CDC guidelines. The current two-step algorithm (4th gen + differentiation assay) is the standard." }
        ],
        explanation: "The CDC algorithm provides definitive diagnosis with reactive 4th gen screen + positive differentiation assay. Post-diagnosis workup includes CD4 count for staging, viral load for monitoring, and resistance genotyping for ART selection. Current WHO and DHHS guidelines recommend immediate ART initiation regardless of CD4 count.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // BLOOD BANK WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "bb-typing",
    title: "ABO/Rh Blood Typing & Crossmatch Workflow",
    department: "Blood Bank",
    scenario: "A 45-year-old female requires 2 units of RBCs for symptomatic anemia (Hgb 6.5 g/dL) pre-surgery. Type and crossmatch ordered.",
    patient: "45F, symptomatic anemia, Hgb 6.5 g/dL, pre-surgical",
    sampleType: "EDTA whole blood + clotted serum",
    reference: "AABB Technical Manual, 20th Ed.",
    steps: [
      {
        title: "Specimen Requirements",
        description: "Verify specimens for blood bank testing.",
        instruction: "What are the specimen requirements for a type and crossmatch?",
        choices: [
          { label: "EDTA tube for cell typing + serum/plasma for antibody testing; both within 3 days", correct: true, result: "Specimens received:\n• Lavender EDTA tube: For forward (cell) typing\n• Gold SST or pink EDTA tube: For reverse (serum) typing, antibody screen, and crossmatch\n• Both specimens collected within 3 days ✓\n• Patient ID verified (two independent identifiers) ✓\n• Blood bank band on patient ✓", detail: "The 3-day rule ensures the antibody screen reflects current status — new antibodies can develop rapidly after transfusion." },
          { label: "Any tube type collected at any time", correct: false, result: "Blood bank has strict specimen requirements. EDTA is required for cell typing, and the specimen must be ≤3 days old for crossmatch." },
          { label: "Only a fingerstick capillary sample", correct: false, result: "Capillary samples are insufficient for complete blood bank testing including crossmatch." },
          { label: "Specimen from 2 weeks ago is acceptable", correct: false, result: "Specimens >3 days old are rejected per AABB standards due to potential for new antibody development." }
        ],
        explanation: "AABB standards require: properly labeled specimen with two independent patient identifiers, EDTA or clotted blood, collected within 3 days (72 hours) of transfusion if patient was transfused or pregnant in the previous 3 months. Positive patient ID is the #1 safety priority in blood banking.",
        icon: "📋"
      },
      {
        title: "ABO/Rh Forward & Reverse Typing",
        description: "Perform ABO and Rh typing using forward (cell) and reverse (serum) grouping.",
        instruction: "Forward typing: Anti-A = 4+, Anti-B = 0, Anti-D = 4+. Reverse typing: A1 cells = 0, B cells = 4+. What is the blood type?",
        choices: [
          { label: "A Positive (A+)", correct: true, result: "Blood Type: A Rh-Positive\n━━━━━━━━━━━━━━━━━━━\nForward (cell) typing:\n• Anti-A: 4+ (A antigen present)\n• Anti-B: 0 (no B antigen)\n• Anti-D: 4+ (D antigen present → Rh-positive)\n\nReverse (serum) typing:\n• A1 cells: 0 (no anti-A in serum ✓)\n• B cells: 4+ (anti-B present in serum ✓)\n\nForward and reverse typing AGREE → Type A Rh-Positive confirmed.", detail: "Landsteiner's law: Serum contains antibodies against the ABO antigens absent from the patient's red cells." },
          { label: "B Positive (B+)", correct: false, result: "Incorrect. Anti-A is 4+ (A antigen present) and Anti-B is 0 (no B antigen). This is type A, not B." },
          { label: "O Positive (O+)", correct: false, result: "Type O would show 0 with both Anti-A and Anti-B in forward typing, and 4+ with both A1 and B cells in reverse." },
          { label: "AB Positive (AB+)", correct: false, result: "Type AB would show 4+ with both Anti-A and Anti-B, and 0 with both A1 and B cells in reverse." }
        ],
        explanation: "ABO typing requires agreement between forward (patient cells + known antisera) and reverse (patient serum + known cells) typing. Type A: A antigen on cells, anti-B in serum. Discrepancies must be resolved before transfusion. Rh typing uses Anti-D; positive = Rh-positive.",
        icon: "🩸"
      },
      {
        title: "Antibody Screen",
        description: "Perform indirect antiglobulin test (IAT) antibody screen using screening cells.",
        instruction: "The antibody screen is POSITIVE with 2 of 3 screening cells. What is the next step?",
        choices: [
          { label: "Perform antibody identification panel using 10+ panel cells", correct: true, result: "Antibody identification performed with 11-cell panel:\n\nPattern analysis:\n• Positive cells: Express Jkᵃ (Kidd) antigen\n• Negative cells: Lack Jkᵃ antigen\n\n→ Anti-Jkᵃ identified (clinically significant!)\n\nCharacteristics of anti-Jkᵃ:\n• IgG antibody, detected at IAT phase\n• Known for causing delayed hemolytic transfusion reactions\n• Can show dosage effect\n• Notorious for eluding detection (wax and wane)", detail: "Anti-Jkᵃ is one of the most clinically significant and dangerous antibodies — known for causing severe delayed hemolytic reactions." },
          { label: "Ignore the positive screen and crossmatch anyway", correct: false, result: "A positive antibody screen MUST be investigated before crossmatch. Transfusing incompatible blood can cause fatal hemolytic reactions." },
          { label: "Repeat the screen; if still positive, cancel transfusion", correct: false, result: "Repeating confirms the finding but doesn't identify the antibody. A panel is needed to determine which antigens to avoid." },
          { label: "Switch to O-negative blood automatically", correct: false, result: "O-negative avoids ABO/Rh issues but doesn't address other alloantibodies like anti-Jkᵃ, which can still cause hemolysis." }
        ],
        explanation: "Antibody identification uses a panel of 10+ reagent red cells with known antigen profiles. The pattern of positive and negative reactions is compared to the antigen chart to identify the antibody specificity. Rule-out and rule-in procedures follow the rule of three (3 antigen-positive and 3 antigen-negative cells for confirmation).",
        icon: "🔬"
      },
      {
        title: "Crossmatch & Unit Selection",
        description: "Select antigen-negative units and perform crossmatch.",
        instruction: "Anti-Jkᵃ has been identified. How should compatible units be selected?",
        choices: [
          { label: "Select Jkᵃ-negative, ABO/Rh compatible units; perform full AHG crossmatch", correct: true, result: "Unit selection:\n• 2 units of A-positive, Jkᵃ-negative RBCs identified from inventory\n• Antigen-typed and confirmed negative for Jkᵃ antigen\n• Full AHG crossmatch performed at 37°C and IAT phase\n\nCrossmatch results:\n• Unit #1: COMPATIBLE (no agglutination at any phase) ✓\n• Unit #2: COMPATIBLE ✓\n\n→ 2 units cleared for transfusion\n\nFINAL REPORT:\n━━━━━━━━━━━━━━━━━━━\nType: A Rh-Positive\nAntibody: Anti-Jkᵃ\nUnits: 2 A+, Jkᵃ-negative, crossmatch compatible\n━━━━━━━━━━━━━━━━━━━", detail: "For patients with clinically significant antibodies, antigen-negative units must be confirmed by phenotyping before crossmatch." },
          { label: "Use any ABO-compatible unit with electronic crossmatch", correct: false, result: "Electronic crossmatch is only permitted when the antibody screen is NEGATIVE. With a positive screen and identified antibody, a serologic AHG crossmatch is required." },
          { label: "Use group O-negative units without crossmatch", correct: false, result: "O-negative addresses ABO/Rh but anti-Jkᵃ can still react if the O-negative units are Jkᵃ-positive." },
          { label: "Autologous donation only", correct: false, result: "The patient has Hgb 6.5 and needs blood pre-surgically. Autologous donation is not feasible in this acute scenario." }
        ],
        explanation: "For patients with clinically significant antibodies, units must be: ABO/Rh compatible, antigen-negative for the corresponding antibody, and crossmatch-compatible at the AHG phase. The crossmatch detects antibodies not identified by the screen. Kidd antibodies are clinically significant — they cause delayed hemolytic transfusion reactions and hemolytic disease of the fetus/newborn.",
        icon: "📝"
      }
    ]
  },

  // ═══════════════════════════════════════════════════
  // HISTOPATHOLOGY WORKFLOWS
  // ═══════════════════════════════════════════════════
  {
    id: "histo-biopsy",
    title: "Tissue Processing & H&E Staining Workflow",
    department: "Histopathology",
    scenario: "A breast lump biopsy from a 52-year-old female is submitted for histopathological examination. The specimen must be processed from fresh tissue to stained slide for diagnosis.",
    patient: "52F, breast lump, biopsy submitted",
    sampleType: "Breast tissue (core needle biopsy)",
    reference: "Bancroft's Theory and Practice of Histological Techniques, 8th Ed.",
    steps: [
      {
        title: "Specimen Reception & Fixation",
        description: "Receive the tissue specimen and initiate fixation.",
        instruction: "What fixative and conditions are appropriate for this breast biopsy?",
        choices: [
          { label: "10% neutral buffered formalin (NBF), 6–24 hours for core biopsy", correct: true, result: "Specimen received in 10% NBF (3.7% formaldehyde in phosphate buffer, pH 7.0).\n• Tissue-to-fixative ratio: 1:10 (minimum)\n• Fixation time: 6–24h for core biopsy (per ASCO/CAP guidelines)\n• Cold ischemia time documented: 45 minutes (within 1-hour recommendation)\n\nNote: Breast specimens require strict fixation control for accurate ER/PR/HER2 IHC testing.", detail: "Under-fixation (<6h) or over-fixation (>72h) adversely affects immunohistochemistry results, particularly ER/PR and HER2." },
          { label: "Bouin's fixative for 48 hours", correct: false, result: "Bouin's contains picric acid and is used for testicular biopsies and embryo tissue. It degrades DNA and is not standard for breast biopsies requiring IHC." },
          { label: "Fresh-frozen immediately without fixation", correct: false, result: "Fresh-frozen sections are for intraoperative consultation, not routine diagnosis. They lack the morphologic detail of permanent (FFPE) sections." },
          { label: "95% ethanol fixation", correct: false, result: "Ethanol fixation is used for cytology specimens (Pap smears), not tissue biopsies. It causes excessive tissue shrinkage." }
        ],
        explanation: "10% NBF is the gold standard fixative for histopathology. It cross-links proteins, preserving morphology and most antigens. For breast biopsies, ASCO/CAP mandates 6–72h fixation in 10% NBF for valid ER/PR/HER2 testing. Cold ischemia time (specimen removal to fixation) must be minimized.",
        icon: "🧪"
      },
      {
        title: "Tissue Processing",
        description: "Process the fixed tissue through the tissue processor.",
        instruction: "What is the correct sequence of tissue processing?",
        choices: [
          { label: "Dehydration (graded alcohols) → Clearing (xylene) → Infiltration (paraffin wax)", correct: true, result: "Automated tissue processing (overnight, ~12h):\n\n1. DEHYDRATION (graded ethanol):\n   70% → 80% → 95% → 100% × 2 (removes water)\n\n2. CLEARING (xylene × 2):\n   Removes alcohol, makes tissue transparent\n   Xylene is miscible with both alcohol and paraffin\n\n3. INFILTRATION (molten paraffin wax × 2):\n   56–60°C, penetrates tissue\n   Provides support for sectioning\n\n→ Tissue ready for embedding.", detail: "The clearing agent must be miscible with both the dehydrant (alcohol) and the embedding medium (paraffin)." },
          { label: "Clearing → Dehydration → Infiltration", correct: false, result: "Incorrect sequence. Clearing agents (xylene) are not miscible with water. Dehydration must come first to remove water." },
          { label: "Direct paraffin immersion without dehydration", correct: false, result: "Water is not miscible with paraffin. Without dehydration, paraffin cannot infiltrate the tissue." },
          { label: "Freeze-drying, then plastic embedding", correct: false, result: "This is an electron microscopy preparation technique, not routine histopathology processing." }
        ],
        explanation: "Tissue processing removes water (dehydration in graded alcohols), replaces alcohol with a paraffin-miscible agent (clearing in xylene), and infiltrates with molten paraffin (infiltration). Each step is a gradual transition: water → alcohol → xylene → paraffin. This provides a solid matrix for thin sectioning.",
        icon: "⚙️"
      },
      {
        title: "Embedding & Microtomy",
        description: "Embed the tissue in paraffin and cut sections on the microtome.",
        instruction: "What section thickness is standard for routine H&E histology?",
        choices: [
          { label: "4–5 micrometers (μm)", correct: true, result: "Tissue embedded in paraffin block (correctly oriented).\nSectioned on rotary microtome at 4μm thickness.\n\nSection quality checks:\n• Ribbon formation: Even, no wrinkles ✓\n• Section floated on 45°C water bath → mounted on charged glass slide\n• Dried at 56°C × 30 min → ready for staining\n\nNote: Thinner sections (3μm) may be used for IHC; thicker (6–8μm) for frozen sections.", detail: "4–5μm is optimal — thin enough for single-cell-layer clarity, thick enough for adequate tissue architecture." },
          { label: "20–30 micrometers", correct: false, result: "Sections this thick would have too many cell layers for clear microscopic examination. They are used for some neurological stains, not routine H&E." },
          { label: "0.1 micrometers (100 nm)", correct: false, result: "Ultra-thin sections (50–100nm) are for electron microscopy, not light microscopy." },
          { label: "50 micrometers", correct: false, result: "Far too thick for routine histology. This would create opaque sections with overlapping cells." }
        ],
        explanation: "Routine histological sections are 4–5μm for optimal light microscopy. This thickness provides single-cell-layer clarity while preserving tissue architecture. The rotary microtome uses a steel or disposable blade. Sections are floated on a warm water bath (42–45°C) to flatten, then picked up on glass slides.",
        icon: "🔪"
      },
      {
        title: "H&E Staining",
        description: "Stain the sections with Hematoxylin and Eosin (H&E).",
        instruction: "What does hematoxylin stain, and what does eosin stain?",
        choices: [
          { label: "Hematoxylin stains nuclei blue/purple (basophilic); Eosin stains cytoplasm pink (eosinophilic)", correct: true, result: "H&E Staining Protocol:\n1. Deparaffinize (xylene) → Rehydrate (graded alcohols → water)\n2. Hematoxylin (Harris) × 5–10 min → Blue nuclei\n3. Differentiate in acid alcohol\n4. Blue in Scott's water (alkaline)\n5. Eosin Y × 1–2 min → Pink cytoplasm\n6. Dehydrate → Clear → Mount with DPX/Permount\n\nMicroscopic examination:\n• Nuclei: Blue/purple\n• Cytoplasm: Pink/red\n• Collagen: Pink\n• Red blood cells: Orange-red\n• Muscle: Deep pink", detail: "Hematoxylin is a basic/cationic dye that binds acidic structures (DNA/RNA). Eosin is an acidic/anionic dye that binds basic structures (proteins)." },
          { label: "Both stain nuclei different shades of blue", correct: false, result: "Eosin is a red/pink counterstain for cytoplasm and extracellular matrix. It does not stain nuclei." },
          { label: "Hematoxylin stains cytoplasm, eosin stains nuclei", correct: false, result: "This is reversed. Hematoxylin = nuclei (blue), Eosin = cytoplasm (pink)." },
          { label: "Neither stains nuclei; a third stain is needed", correct: false, result: "Hematoxylin is specifically a nuclear stain. H&E is a complete routine stain." }
        ],
        explanation: "H&E is the most widely used stain in histopathology. Hematoxylin (basic dye) binds nucleic acids (acidic/basophilic structures) → blue/purple nuclei. Eosin (acidic dye) binds basic proteins → pink cytoplasm, collagen, muscle. Harris hematoxylin requires differentiation and bluing steps for optimal nuclear detail.",
        icon: "🎨"
      },
      {
        title: "Microscopic Examination & Reporting",
        description: "The pathologist examines the H&E slide and issues a diagnosis.",
        instruction: "H&E examination reveals infiltrating nests and cords of pleomorphic cells with high nuclear-to-cytoplasmic ratio, irregular nuclei, and desmoplastic stroma. What is the likely diagnosis?",
        choices: [
          { label: "Invasive ductal carcinoma (invasive carcinoma of no special type)", correct: true, result: "PATHOLOGY REPORT:\n━━━━━━━━━━━━━━━━━━━\nDiagnosis: Invasive ductal carcinoma (IDC), no special type\nGrade: Nottingham Grade 2 (moderately differentiated)\n  - Tubule formation: Score 3 (minimal)\n  - Nuclear pleomorphism: Score 2 (moderate)\n  - Mitotic count: Score 2 (moderate)\n\nNext steps: Immunohistochemistry (IHC) for:\n• ER (estrogen receptor)\n• PR (progesterone receptor)\n• HER2\n• Ki-67 (proliferation index)\n━━━━━━━━━━━━━━━━━━━\nThese markers guide treatment decisions (hormonal therapy, HER2-targeted therapy).", detail: "IDC (now termed 'invasive breast carcinoma of no special type') accounts for ~70–80% of all breast cancers." },
          { label: "Fibroadenoma (benign)", correct: false, result: "Fibroadenoma shows well-circumscribed, biphasic epithelial-stromal proliferation without pleomorphism or invasion." },
          { label: "Normal breast tissue", correct: false, result: "Normal breast tissue has organized lobules and ducts without pleomorphic cells, high N:C ratio, or desmoplastic reaction." },
          { label: "Fat necrosis", correct: false, result: "Fat necrosis shows foamy macrophages, lipid cysts, and fibrosis — not infiltrating nests of pleomorphic cells." }
        ],
        explanation: "Invasive ductal carcinoma features: infiltrating nests/cords of malignant epithelial cells, nuclear pleomorphism, high mitotic activity, desmoplastic stromal reaction, and possible lymphovascular invasion. Graded by Nottingham system (tubule formation, nuclear grade, mitotic rate). IHC for ER/PR/HER2/Ki-67 is mandatory for treatment planning.",
        icon: "📝"
      }
    ]
  }
];
