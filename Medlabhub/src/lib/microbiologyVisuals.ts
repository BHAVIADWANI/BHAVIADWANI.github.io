// Visual indicators for microbiology options

export const gramStainVisuals: Record<string, { color: string; emoji: string; description: string }> = {
  "Gram Positive": { color: "bg-purple-600", emoji: "🟣", description: "Retains crystal violet — appears purple" },
  "Gram Negative": { color: "bg-pink-500", emoji: "🔴", description: "Takes safranin counterstain — appears pink/red" },
  "Variable": { color: "bg-amber-500", emoji: "🟡", description: "Inconsistent staining reaction" },
  "Not Applicable": { color: "bg-gray-400", emoji: "⚪", description: "Non-bacterial or special staining required" },
};

export const cellShapeVisuals: Record<string, { emoji: string; description: string }> = {
  "Cocci": { emoji: "🔵", description: "Spherical / round cells" },
  "Bacilli": { emoji: "🧫", description: "Rod-shaped cells" },
  "Coccobacilli": { emoji: "💊", description: "Short oval rods" },
  "Spirilla": { emoji: "🌀", description: "Rigid spiral / helical cells" },
  "Vibrio": { emoji: "🌊", description: "Comma-shaped / curved rods" },
  "Pleomorphic": { emoji: "🔷", description: "Variable / irregular shapes" },
  "Yeast": { emoji: "🍄", description: "Oval budding fungal cells" },
  "Filamentous": { emoji: "🧬", description: "Branching thread-like hyphae" },
  "Diplococci": { emoji: "👯", description: "Paired spherical cells" },
  "Viral": { emoji: "🦠", description: "Obligate intracellular particles" },
  "Archaeal": { emoji: "🌋", description: "Ancient prokaryotic cells" },
  "Dimorphic": { emoji: "🔄", description: "Temperature-dependent yeast/mold transition" },
  "Helminth": { emoji: "🪱", description: "Multicellular parasitic worms" },
  "Spore": { emoji: "💨", description: "Resistant dormant structures" },
  "Protozoan": { emoji: "🔬", description: "Single-celled eukaryotic parasites" },
};

export const arrangementVisuals: Record<string, { emoji: string; description: string }> = {
  "Singles": { emoji: "⚫", description: "Individual separated cells" },
  "Pairs": { emoji: "👯", description: "Two cells together (diplococci/diplobacilli)" },
  "Chains": { emoji: "⛓️", description: "Linear chains (streptococci)" },
  "Clusters": { emoji: "🍇", description: "Grape-like clusters (staphylococci)" },
  "Tetrads": { emoji: "🔲", description: "Groups of four in a square" },
  "Palisades": { emoji: "🏗️", description: "Side-by-side like a picket fence" },
  "Diplococci": { emoji: "🫧", description: "Paired round cells" },
  "Chinese Letters": { emoji: "🀄", description: "Angular / V-shaped snapping division" },
  "Filamentous": { emoji: "🕸️", description: "Long branching filaments" },
};

export const oxygenVisuals: Record<string, { emoji: string; description: string }> = {
  "Obligate Aerobe": { emoji: "🌬️", description: "Requires oxygen for growth" },
  "Facultative Anaerobe": { emoji: "🔄", description: "Grows with or without oxygen" },
  "Obligate Anaerobe": { emoji: "🚫", description: "Killed by oxygen exposure" },
  "Microaerophilic": { emoji: "💨", description: "Requires low levels of oxygen" },
  "Aerobe": { emoji: "💨", description: "Grows in presence of oxygen" },
  "Obligate Intracellular": { emoji: "🔬", description: "Grows only inside host cells" },
};

export const motilityVisuals: Record<string, { emoji: string; description: string }> = {
  "Motile": { emoji: "🏃", description: "Capable of self-propelled movement (flagella)" },
  "Non-motile": { emoji: "🧱", description: "Stationary / no flagella" },
};

export const colonyColorVisuals: Record<string, { color: string; emoji: string }> = {
  "White/Cream": { color: "bg-amber-50 border-amber-200", emoji: "⬜" },
  "Yellow": { color: "bg-yellow-300 border-yellow-500", emoji: "🟡" },
  "Golden": { color: "bg-amber-400 border-amber-600", emoji: "🟠" },
  "Orange": { color: "bg-orange-400 border-orange-600", emoji: "🟠" },
  "Pink/Red": { color: "bg-pink-400 border-pink-600", emoji: "🔴" },
  "Green": { color: "bg-green-500 border-green-700", emoji: "🟢" },
  "Blue-green": { color: "bg-teal-400 border-teal-600", emoji: "🔵" },
  "Mucoid": { color: "bg-gray-200 border-gray-400", emoji: "💧" },
  "Non-pigmented": { color: "bg-gray-100 border-gray-300", emoji: "⚪" },
};

export const hemolysisVisuals: Record<string, { emoji: string; color: string; description: string }> = {
  "Alpha (α)": { emoji: "🟢", color: "bg-green-500", description: "Partial lysis — greenish discoloration" },
  "Beta (β)": { emoji: "🔴", color: "bg-red-500", description: "Complete lysis — clear zone around colonies" },
  "Gamma (γ)": { emoji: "⚪", color: "bg-gray-300", description: "No hemolysis — no change in blood agar" },
  "Double zone": { emoji: "🎯", color: "bg-orange-400", description: "Two concentric zones of hemolysis" },
  "None / Not applicable": { emoji: "➖", color: "bg-gray-200", description: "Not tested or not relevant" },
};

export const biochemicalTestVisuals: Record<string, { emoji: string }> = {
  "Lactose Fermentation": { emoji: "🥛" },
  "Glucose Fermentation": { emoji: "🍬" },
  "Sucrose Fermentation": { emoji: "🍭" },
  "Mannitol Fermentation": { emoji: "🧪" },
  "Indole Production": { emoji: "🔴" },
  "Methyl Red": { emoji: "🟥" },
  "Voges-Proskauer": { emoji: "🟨" },
  "Citrate Utilization": { emoji: "🟦" },
  "Urease": { emoji: "🩷" },
  "H2S Production": { emoji: "⚫" },
  "Nitrate Reduction": { emoji: "🧫" },
  "Gelatin Hydrolysis": { emoji: "🫠" },
  "Starch Hydrolysis": { emoji: "🌾" },
  "Coagulase": { emoji: "🩸" },
  "DNase": { emoji: "🧬" },
  "Lipase": { emoji: "🫧" },
  "Bile Esculin": { emoji: "🟤" },
  "CAMP Test": { emoji: "🏕️" },
  "PYR Test": { emoji: "🅿️" },
  "Optochin Susceptibility": { emoji: "💊" },
  "Bacitracin Susceptibility": { emoji: "💉" },
  "Novobiocin Susceptibility": { emoji: "🧴" },
  "Hippurate Hydrolysis": { emoji: "🐴" },
  "Quellung Reaction": { emoji: "🎈" },
};

export const catalaseVisuals: Record<string, { emoji: string; description: string }> = {
  "Positive": { emoji: "🫧", description: "Bubbles — produces catalase enzyme" },
  "Negative": { emoji: "➖", description: "No bubbles — lacks catalase" },
};

export const oxidaseVisuals: Record<string, { emoji: string; description: string }> = {
  "Positive": { emoji: "🟣", description: "Purple color change — cytochrome c oxidase present" },
  "Negative": { emoji: "➖", description: "No color change — oxidase absent" },
};

// Sample type to organism mapping
export const sampleTypeOrganisms: Record<string, string[]> = {
  "Blood": [
    "Staphylococcus aureus", "Staphylococcus epidermidis", "Streptococcus pyogenes",
    "Streptococcus pneumoniae", "Streptococcus agalactiae", "Enterococcus faecalis",
    "Escherichia coli", "Klebsiella pneumoniae", "Pseudomonas aeruginosa",
    "Acinetobacter baumannii", "Candida albicans", "Neisseria meningitidis",
    "Listeria monocytogenes", "Brucella melitensis", "Salmonella typhi",
    "Candida auris", "Candida glabrata", "Candida parapsilosis",
    "Staphylococcus lugdunensis", "Streptococcus gallolyticus",
  ],
  "Urine": [
    "Escherichia coli", "Klebsiella pneumoniae", "Proteus mirabilis",
    "Staphylococcus saprophyticus", "Enterococcus faecalis", "Pseudomonas aeruginosa",
    "Candida albicans", "Serratia marcescens", "Enterobacter cloacae",
    "Citrobacter freundii", "Candida glabrata", "Candida tropicalis",
    "Aerococcus urinae",
  ],
  "Sputum / Respiratory": [
    "Streptococcus pneumoniae", "Haemophilus influenzae", "Moraxella catarrhalis",
    "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "Mycobacterium tuberculosis",
    "Legionella pneumophila", "Mycoplasma pneumoniae", "Bordetella pertussis",
    "Nocardia asteroides", "Aspergillus fumigatus", "Staphylococcus aureus",
    "Pneumocystis jirovecii", "Histoplasma capsulatum", "Coccidioides immitis",
    "Blastomyces dermatitidis", "SARS-CoV-2", "Influenza A virus",
    "Measles virus", "Mucor species",
  ],
  "CSF (Cerebrospinal Fluid)": [
    "Neisseria meningitidis", "Streptococcus pneumoniae", "Haemophilus influenzae",
    "Listeria monocytogenes", "Escherichia coli", "Streptococcus agalactiae",
    "Cryptococcus neoformans", "Mycobacterium tuberculosis",
    "Herpes Simplex Virus 1 (HSV-1)", "Cytomegalovirus (CMV)",
  ],
  "Wound / Skin / Abscess": [
    "Staphylococcus aureus", "Streptococcus pyogenes", "Pseudomonas aeruginosa",
    "Clostridium perfringens", "Bacteroides fragilis", "Pasteurella multocida",
    "Nocardia asteroides", "Sporothrix schenckii",
    "Mucor species", "Rhizopus species", "Fusarium species",
    "Trichophyton rubrum", "Microsporum canis",
  ],
  "Stool / GI": [
    "Salmonella enterica", "Salmonella typhi", "Shigella flexneri",
    "Campylobacter jejuni", "Vibrio cholerae", "Clostridioides difficile",
    "Escherichia coli", "Yersinia enterocolitica", "Helicobacter pylori",
    "Entamoeba histolytica", "Giardia lamblia",
    "Norovirus", "Rotavirus",
  ],
  "Genital / STI": [
    "Neisseria gonorrhoeae", "Treponema pallidum", "Chlamydia trachomatis",
    "Gardnerella vaginalis", "Candida albicans", "Trichomonas vaginalis",
    "Streptococcus agalactiae",
    "Human Immunodeficiency Virus (HIV-1)", "Human Papillomavirus (HPV)",
    "Herpes Simplex Virus 1 (HSV-1)",
  ],
  "Throat / Nasopharynx": [
    "Streptococcus pyogenes", "Corynebacterium diphtheriae",
    "Neisseria meningitidis", "Bordetella pertussis",
    "Haemophilus influenzae", "Streptococcus pneumoniae",
    "Epstein-Barr Virus (EBV)", "SARS-CoV-2", "Influenza A virus",
  ],
  "Eye": [
    "Staphylococcus aureus", "Pseudomonas aeruginosa", "Haemophilus influenzae",
    "Neisseria gonorrhoeae", "Chlamydia trachomatis", "Moraxella lacunata",
    "Fusarium species", "Aspergillus flavus",
    "Herpes Simplex Virus 1 (HSV-1)", "Cytomegalovirus (CMV)",
  ],
  "Ear": [
    "Streptococcus pneumoniae", "Haemophilus influenzae", "Moraxella catarrhalis",
    "Pseudomonas aeruginosa", "Staphylococcus aureus",
    "Aspergillus niger", "Candida auris",
  ],
  "Skin / Nails / Hair": [
    "Trichophyton rubrum", "Trichophyton mentagrophytes", "Microsporum canis",
    "Epidermophyton floccosum", "Malassezia furfur",
    "Sporothrix schenckii", "Human Papillomavirus (HPV)",
    "Varicella-Zoster Virus (VZV)", "Monkeypox virus (Mpox)",
  ],
};

export const sampleTypeIcons: Record<string, string> = {
  "Blood": "🩸",
  "Urine": "🧪",
  "Sputum / Respiratory": "🫁",
  "CSF (Cerebrospinal Fluid)": "🧠",
  "Wound / Skin / Abscess": "🩹",
  "Stool / GI": "🦠",
  "Genital / STI": "🔬",
  "Throat / Nasopharynx": "👅",
  "Eye": "👁️",
  "Ear": "👂",
  "Skin / Nails / Hair": "💅",
};
