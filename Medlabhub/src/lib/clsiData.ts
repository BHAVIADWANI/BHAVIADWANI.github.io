// CLSI M100 Performance Standards for Antimicrobial Susceptibility Testing
// Comprehensive breakpoint data for common organism-antibiotic combinations

export interface CLSIBreakpoint {
  antibiotic: string;
  organismGroup: string;
  susceptible: string;
  intermediate: string;
  resistant: string;
  method: "MIC" | "Disk";
  notes?: string;
}

export interface CLSIZoneBreakpoint {
  antibiotic: string;
  organismGroup: string;
  diskContent: string;
  susceptible: number; // zone diameter ≥ (mm)
  intermediate?: string; // range e.g. "15-17"
  resistant: number; // zone diameter ≤ (mm)
  notes?: string;
}

export const clsiBreakpoints: CLSIBreakpoint[] = [
  // ==================== Enterobacterales ====================
  { antibiotic: "Ampicillin", organismGroup: "Enterobacterales", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Amoxicillin-Clavulanate", organismGroup: "Enterobacterales", susceptible: "≤8/4", intermediate: "16/8", resistant: "≥32/16", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "Enterobacterales", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Cefotaxime", organismGroup: "Enterobacterales", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Ceftazidime", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Cefepime", organismGroup: "Enterobacterales", susceptible: "≤2", intermediate: "4-8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Cefoxitin", organismGroup: "Enterobacterales", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Cefazolin", organismGroup: "Enterobacterales", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC", notes: "Uncomplicated UTI: ≤16" },
  { antibiotic: "Aztreonam", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "Enterobacterales", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Imipenem", organismGroup: "Enterobacterales", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Ertapenem", organismGroup: "Enterobacterales", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Doripenem", organismGroup: "Enterobacterales", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "Enterobacterales", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "Enterobacterales", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Moxifloxacin", organismGroup: "Enterobacterales", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Gentamicin", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Amikacin", organismGroup: "Enterobacterales", susceptible: "≤16", intermediate: "32", resistant: "≥64", method: "MIC" },
  { antibiotic: "Tobramycin", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Enterobacterales", susceptible: "≤2/38", intermediate: "-", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Nitrofurantoin", organismGroup: "Enterobacterales", susceptible: "≤32", intermediate: "64", resistant: "≥128", method: "MIC", notes: "UTI isolates only" },
  { antibiotic: "Fosfomycin", organismGroup: "Enterobacterales", susceptible: "≤64", intermediate: "128", resistant: "≥256", method: "MIC", notes: "E. coli UTI isolates only" },
  { antibiotic: "Piperacillin-Tazobactam", organismGroup: "Enterobacterales", susceptible: "≤16/4", intermediate: "32/4-64/4", resistant: "≥128/4", method: "MIC" },
  { antibiotic: "Ampicillin-Sulbactam", organismGroup: "Enterobacterales", susceptible: "≤8/4", intermediate: "16/8", resistant: "≥32/16", method: "MIC" },
  { antibiotic: "Ceftazidime-Avibactam", organismGroup: "Enterobacterales", susceptible: "≤8/4", intermediate: "-", resistant: "≥16/4", method: "MIC" },
  { antibiotic: "Ceftolozane-Tazobactam", organismGroup: "Enterobacterales", susceptible: "≤2/4", intermediate: "4/4", resistant: "≥8/4", method: "MIC" },
  { antibiotic: "Meropenem-Vaborbactam", organismGroup: "Enterobacterales", susceptible: "≤4/8", intermediate: "8/8", resistant: "≥16/8", method: "MIC" },
  { antibiotic: "Imipenem-Relebactam", organismGroup: "Enterobacterales", susceptible: "≤1/4", intermediate: "2/4", resistant: "≥4/4", method: "MIC" },
  { antibiotic: "Cefiderocol", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Doxycycline", organismGroup: "Enterobacterales", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Tigecycline", organismGroup: "Enterobacterales", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC", notes: "FDA breakpoints" },
  { antibiotic: "Chloramphenicol", organismGroup: "Enterobacterales", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Colistin", organismGroup: "Enterobacterales", susceptible: "≤2", intermediate: "-", resistant: "≥4", method: "MIC", notes: "Broth microdilution only. No disk test" },

  // ==================== Staphylococcus ====================
  { antibiotic: "Penicillin", organismGroup: "Staphylococcus spp.", susceptible: "≤0.12", intermediate: "-", resistant: "≥0.25", method: "MIC" },
  { antibiotic: "Oxacillin", organismGroup: "S. aureus", susceptible: "≤2", intermediate: "-", resistant: "≥4", method: "MIC", notes: "MRSA screen: ≥4 = resistant" },
  { antibiotic: "Oxacillin", organismGroup: "CoNS", susceptible: "≤0.25", intermediate: "-", resistant: "≥0.5", method: "MIC", notes: "CoNS breakpoint differs from S. aureus" },
  { antibiotic: "Vancomycin", organismGroup: "S. aureus", susceptible: "≤2", intermediate: "4-8", resistant: "≥16", method: "MIC", notes: "No disk diffusion for Staph vancomycin" },
  { antibiotic: "Daptomycin", organismGroup: "S. aureus", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC", notes: "S only; no I or R defined. Nonsusceptible ≥2" },
  { antibiotic: "Linezolid", organismGroup: "Staphylococcus spp.", susceptible: "≤4", intermediate: "-", resistant: "≥8", method: "MIC" },
  { antibiotic: "Clindamycin", organismGroup: "Staphylococcus spp.", susceptible: "≤0.5", intermediate: "1-2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Erythromycin", organismGroup: "Staphylococcus spp.", susceptible: "≤0.5", intermediate: "1-4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Staphylococcus spp.", susceptible: "≤2/38", intermediate: "-", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "Staphylococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Doxycycline", organismGroup: "Staphylococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Minocycline", organismGroup: "Staphylococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Rifampin", organismGroup: "Staphylococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "Staphylococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "Staphylococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Moxifloxacin", organismGroup: "Staphylococcus spp.", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Gentamicin", organismGroup: "Staphylococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Tigecycline", organismGroup: "Staphylococcus spp.", susceptible: "≤0.5", intermediate: "-", resistant: "-", method: "MIC", notes: "FDA breakpoint" },
  { antibiotic: "Ceftaroline", organismGroup: "S. aureus", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Nitrofurantoin", organismGroup: "Staphylococcus spp.", susceptible: "≤32", intermediate: "64", resistant: "≥128", method: "MIC", notes: "UTI isolates only" },
  { antibiotic: "Quinupristin-Dalfopristin", organismGroup: "Staphylococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },

  // ==================== Enterococcus ====================
  { antibiotic: "Ampicillin", organismGroup: "Enterococcus spp.", susceptible: "≤8", intermediate: "-", resistant: "≥16", method: "MIC" },
  { antibiotic: "Penicillin", organismGroup: "Enterococcus spp.", susceptible: "≤8", intermediate: "-", resistant: "≥16", method: "MIC" },
  { antibiotic: "Vancomycin", organismGroup: "Enterococcus spp.", susceptible: "≤4", intermediate: "8-16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Linezolid", organismGroup: "Enterococcus spp.", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Daptomycin", organismGroup: "Enterococcus spp.", susceptible: "≤4", intermediate: "-", resistant: "-", method: "MIC", notes: "E. faecium only" },
  { antibiotic: "Tigecycline", organismGroup: "Enterococcus spp.", susceptible: "≤0.25", intermediate: "-", resistant: "-", method: "MIC", notes: "FDA breakpoint" },
  { antibiotic: "Nitrofurantoin", organismGroup: "Enterococcus spp.", susceptible: "≤32", intermediate: "64", resistant: "≥128", method: "MIC", notes: "E. faecalis UTI only" },
  { antibiotic: "Quinupristin-Dalfopristin", organismGroup: "Enterococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC", notes: "E. faecium only; E. faecalis intrinsically R" },
  { antibiotic: "Tetracycline", organismGroup: "Enterococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Doxycycline", organismGroup: "Enterococcus spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "Enterococcus spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },

  // ==================== Pseudomonas aeruginosa ====================
  { antibiotic: "Piperacillin-Tazobactam", organismGroup: "P. aeruginosa", susceptible: "≤16/4", intermediate: "32/4-64/4", resistant: "≥128/4", method: "MIC" },
  { antibiotic: "Ceftazidime", organismGroup: "P. aeruginosa", susceptible: "≤8", intermediate: "-", resistant: "≥16", method: "MIC" },
  { antibiotic: "Cefepime", organismGroup: "P. aeruginosa", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Aztreonam", organismGroup: "P. aeruginosa", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "P. aeruginosa", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Imipenem", organismGroup: "P. aeruginosa", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Doripenem", organismGroup: "P. aeruginosa", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "P. aeruginosa", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "P. aeruginosa", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Gentamicin", organismGroup: "P. aeruginosa", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Tobramycin", organismGroup: "P. aeruginosa", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Amikacin", organismGroup: "P. aeruginosa", susceptible: "≤16", intermediate: "32", resistant: "≥64", method: "MIC" },
  { antibiotic: "Colistin", organismGroup: "P. aeruginosa", susceptible: "≤2", intermediate: "-", resistant: "≥4", method: "MIC", notes: "Broth microdilution only" },
  { antibiotic: "Ceftazidime-Avibactam", organismGroup: "P. aeruginosa", susceptible: "≤8/4", intermediate: "-", resistant: "≥16/4", method: "MIC" },
  { antibiotic: "Ceftolozane-Tazobactam", organismGroup: "P. aeruginosa", susceptible: "≤4/4", intermediate: "8/4", resistant: "≥16/4", method: "MIC" },
  { antibiotic: "Cefiderocol", organismGroup: "P. aeruginosa", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Imipenem-Relebactam", organismGroup: "P. aeruginosa", susceptible: "≤2/4", intermediate: "4/4", resistant: "≥8/4", method: "MIC" },

  // ==================== Acinetobacter spp. ====================
  { antibiotic: "Meropenem", organismGroup: "Acinetobacter spp.", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Imipenem", organismGroup: "Acinetobacter spp.", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Doripenem", organismGroup: "Acinetobacter spp.", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Colistin", organismGroup: "Acinetobacter spp.", susceptible: "≤2", intermediate: "-", resistant: "≥4", method: "MIC" },
  { antibiotic: "Ampicillin-Sulbactam", organismGroup: "Acinetobacter spp.", susceptible: "≤8/4", intermediate: "16/8", resistant: "≥32/16", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "Acinetobacter spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "Acinetobacter spp.", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Gentamicin", organismGroup: "Acinetobacter spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Tobramycin", organismGroup: "Acinetobacter spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Amikacin", organismGroup: "Acinetobacter spp.", susceptible: "≤16", intermediate: "32", resistant: "≥64", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "Acinetobacter spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Minocycline", organismGroup: "Acinetobacter spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Acinetobacter spp.", susceptible: "≤2/38", intermediate: "-", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Cefiderocol", organismGroup: "Acinetobacter spp.", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },

  // ==================== Streptococcus pneumoniae ====================
  { antibiotic: "Penicillin", organismGroup: "S. pneumoniae (meningitis)", susceptible: "≤0.06", intermediate: "-", resistant: "≥0.12", method: "MIC" },
  { antibiotic: "Penicillin", organismGroup: "S. pneumoniae (non-meningitis)", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "S. pneumoniae (meningitis)", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "S. pneumoniae (non-meningitis)", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Cefotaxime", organismGroup: "S. pneumoniae (meningitis)", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Cefotaxime", organismGroup: "S. pneumoniae (non-meningitis)", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Cefepime", organismGroup: "S. pneumoniae (meningitis)", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Cefepime", organismGroup: "S. pneumoniae (non-meningitis)", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "S. pneumoniae", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Vancomycin", organismGroup: "S. pneumoniae", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC", notes: "No resistant breakpoint defined" },
  { antibiotic: "Erythromycin", organismGroup: "S. pneumoniae", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Clindamycin", organismGroup: "S. pneumoniae", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "S. pneumoniae", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Moxifloxacin", organismGroup: "S. pneumoniae", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "S. pneumoniae", susceptible: "≤0.5/9.5", intermediate: "1/19-2/38", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "S. pneumoniae", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Doxycycline", organismGroup: "S. pneumoniae", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Linezolid", organismGroup: "S. pneumoniae", susceptible: "≤2", intermediate: "-", resistant: "-", method: "MIC" },

  // ==================== Beta-hemolytic Streptococcus (Groups A, B, C, G) ====================
  { antibiotic: "Penicillin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤0.12", intermediate: "-", resistant: "-", method: "MIC", notes: "No penicillin resistance reported in GAS" },
  { antibiotic: "Ampicillin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤0.25", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤0.5", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Erythromycin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Clindamycin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤0.25", intermediate: "0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Vancomycin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Daptomycin", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Linezolid", organismGroup: "Beta-hemolytic Streptococcus", susceptible: "≤2", intermediate: "-", resistant: "-", method: "MIC" },

  // ==================== Haemophilus influenzae ====================
  { antibiotic: "Ampicillin", organismGroup: "H. influenzae", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },
  { antibiotic: "Amoxicillin-Clavulanate", organismGroup: "H. influenzae", susceptible: "≤4/2", intermediate: "-", resistant: "≥8/4", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "H. influenzae", susceptible: "≤2", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Cefotaxime", organismGroup: "H. influenzae", susceptible: "≤2", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Cefuroxime", organismGroup: "H. influenzae", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Azithromycin", organismGroup: "H. influenzae", susceptible: "≤4", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Chloramphenicol", organismGroup: "H. influenzae", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "H. influenzae", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "H. influenzae", susceptible: "≤2", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "H. influenzae", susceptible: "≤0.5", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "H. influenzae", susceptible: "≤0.5/9.5", intermediate: "1/19-2/38", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "H. influenzae", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Rifampin", organismGroup: "H. influenzae", susceptible: "≤1", intermediate: "2", resistant: "≥4", method: "MIC" },

  // ==================== Neisseria gonorrhoeae ====================
  { antibiotic: "Ceftriaxone", organismGroup: "N. gonorrhoeae", susceptible: "≤0.25", intermediate: "-", resistant: "-", method: "MIC", notes: "Current recommended treatment" },
  { antibiotic: "Cefixime", organismGroup: "N. gonorrhoeae", susceptible: "≤0.25", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Azithromycin", organismGroup: "N. gonorrhoeae", susceptible: "≤1", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "N. gonorrhoeae", susceptible: "≤0.06", intermediate: "0.12-0.5", resistant: "≥1", method: "MIC" },
  { antibiotic: "Penicillin", organismGroup: "N. gonorrhoeae", susceptible: "≤0.06", intermediate: "0.12-1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Tetracycline", organismGroup: "N. gonorrhoeae", susceptible: "≤0.25", intermediate: "0.5-1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Spectinomycin", organismGroup: "N. gonorrhoeae", susceptible: "≤32", intermediate: "64", resistant: "≥128", method: "MIC" },

  // ==================== Neisseria meningitidis ====================
  { antibiotic: "Penicillin", organismGroup: "N. meningitidis", susceptible: "≤0.06", intermediate: "0.12-0.25", resistant: "≥0.5", method: "MIC" },
  { antibiotic: "Ceftriaxone", organismGroup: "N. meningitidis", susceptible: "≤0.12", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "N. meningitidis", susceptible: "≤0.25", intermediate: "-", resistant: "-", method: "MIC" },
  { antibiotic: "Chloramphenicol", organismGroup: "N. meningitidis", susceptible: "≤4", intermediate: "-", resistant: "≥8", method: "MIC" },
  { antibiotic: "Rifampin", organismGroup: "N. meningitidis", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
  { antibiotic: "Ciprofloxacin", organismGroup: "N. meningitidis", susceptible: "≤0.03", intermediate: "0.06", resistant: "≥0.12", method: "MIC" },

  // ==================== Stenotrophomonas maltophilia ====================
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "S. maltophilia", susceptible: "≤2/38", intermediate: "-", resistant: "≥4/76", method: "MIC", notes: "Drug of choice" },
  { antibiotic: "Ticarcillin-Clavulanate", organismGroup: "S. maltophilia", susceptible: "≤16/2", intermediate: "32/2-64/2", resistant: "≥128/2", method: "MIC" },
  { antibiotic: "Ceftazidime", organismGroup: "S. maltophilia", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "S. maltophilia", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Minocycline", organismGroup: "S. maltophilia", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Chloramphenicol", organismGroup: "S. maltophilia", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },

  // ==================== Burkholderia cepacia complex ====================
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "B. cepacia", susceptible: "≤2/38", intermediate: "-", resistant: "≥4/76", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "B. cepacia", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Ceftazidime", organismGroup: "B. cepacia", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Levofloxacin", organismGroup: "B. cepacia", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Minocycline", organismGroup: "B. cepacia", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Chloramphenicol", organismGroup: "B. cepacia", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },

  // ==================== Anaerobes ====================
  { antibiotic: "Metronidazole", organismGroup: "Anaerobes", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Meropenem", organismGroup: "Anaerobes", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Imipenem", organismGroup: "Anaerobes", susceptible: "≤4", intermediate: "8", resistant: "≥16", method: "MIC" },
  { antibiotic: "Piperacillin-Tazobactam", organismGroup: "Anaerobes", susceptible: "≤32/4", intermediate: "64/4", resistant: "≥128/4", method: "MIC" },
  { antibiotic: "Clindamycin", organismGroup: "Anaerobes", susceptible: "≤2", intermediate: "4", resistant: "≥8", method: "MIC" },
  { antibiotic: "Ampicillin-Sulbactam", organismGroup: "Anaerobes", susceptible: "≤8/4", intermediate: "16/8", resistant: "≥32/16", method: "MIC" },
  { antibiotic: "Amoxicillin-Clavulanate", organismGroup: "Anaerobes", susceptible: "≤4/2", intermediate: "8/4", resistant: "≥16/8", method: "MIC" },
  { antibiotic: "Chloramphenicol", organismGroup: "Anaerobes", susceptible: "≤8", intermediate: "16", resistant: "≥32", method: "MIC" },
  { antibiotic: "Penicillin", organismGroup: "Anaerobes", susceptible: "≤0.5", intermediate: "1", resistant: "≥2", method: "MIC" },
];

// CLSI M100 Zone Diameter Interpretive Standards (disk diffusion, mm)
export const clsiZoneBreakpoints: CLSIZoneBreakpoint[] = [
  // ==================== Enterobacterales ====================
  { antibiotic: "Ampicillin", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Amoxicillin-Clavulanate", organismGroup: "Enterobacterales", diskContent: "20/10 µg", susceptible: 18, intermediate: "14-17", resistant: 13 },
  { antibiotic: "Ceftriaxone", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 23, intermediate: "20-22", resistant: 19 },
  { antibiotic: "Cefotaxime", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 26, intermediate: "23-25", resistant: 22 },
  { antibiotic: "Ceftazidime", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 21, intermediate: "18-20", resistant: 17 },
  { antibiotic: "Cefepime", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 25, intermediate: "19-24", resistant: 18 },
  { antibiotic: "Cefoxitin", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 18, intermediate: "15-17", resistant: 14 },
  { antibiotic: "Cefazolin", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 23, intermediate: "20-22", resistant: 19 },
  { antibiotic: "Aztreonam", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 21, intermediate: "18-20", resistant: 17 },
  { antibiotic: "Meropenem", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 23, intermediate: "20-22", resistant: 19 },
  { antibiotic: "Imipenem", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 23, intermediate: "20-22", resistant: 19 },
  { antibiotic: "Ertapenem", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 22, intermediate: "19-21", resistant: 18 },
  { antibiotic: "Doripenem", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 23, intermediate: "20-22", resistant: 19 },
  { antibiotic: "Ciprofloxacin", organismGroup: "Enterobacterales", diskContent: "5 µg", susceptible: 26, intermediate: "22-25", resistant: 21 },
  { antibiotic: "Levofloxacin", organismGroup: "Enterobacterales", diskContent: "5 µg", susceptible: 22, intermediate: "19-21", resistant: 18 },
  { antibiotic: "Moxifloxacin", organismGroup: "Enterobacterales", diskContent: "5 µg", susceptible: 20, intermediate: "17-19", resistant: 16 },
  { antibiotic: "Gentamicin", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Amikacin", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 17, intermediate: "15-16", resistant: 14 },
  { antibiotic: "Tobramycin", organismGroup: "Enterobacterales", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Enterobacterales", diskContent: "1.25/23.75 µg", susceptible: 16, intermediate: "11-15", resistant: 10 },
  { antibiotic: "Piperacillin-Tazobactam", organismGroup: "Enterobacterales", diskContent: "100/10 µg", susceptible: 21, intermediate: "18-20", resistant: 17 },
  { antibiotic: "Ampicillin-Sulbactam", organismGroup: "Enterobacterales", diskContent: "10/10 µg", susceptible: 15, intermediate: "12-14", resistant: 11 },
  { antibiotic: "Nitrofurantoin", organismGroup: "Enterobacterales", diskContent: "300 µg", susceptible: 17, intermediate: "15-16", resistant: 14, notes: "UTI isolates only" },
  { antibiotic: "Tetracycline", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 15, intermediate: "12-14", resistant: 11 },
  { antibiotic: "Doxycycline", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 14, intermediate: "11-13", resistant: 10 },
  { antibiotic: "Chloramphenicol", organismGroup: "Enterobacterales", diskContent: "30 µg", susceptible: 18, intermediate: "13-17", resistant: 12 },

  // ==================== Staphylococcus spp. ====================
  { antibiotic: "Penicillin", organismGroup: "Staphylococcus spp.", diskContent: "10 units", susceptible: 29, resistant: 28, notes: "Zone ≥29 = S, ≤28 = R" },
  { antibiotic: "Cefoxitin", organismGroup: "S. aureus", diskContent: "30 µg", susceptible: 22, resistant: 21, notes: "MRSA screen: ≤21 = MRSA" },
  { antibiotic: "Cefoxitin", organismGroup: "CoNS", diskContent: "30 µg", susceptible: 25, resistant: 24, notes: "MR-CoNS screen" },
  { antibiotic: "Erythromycin", organismGroup: "Staphylococcus spp.", diskContent: "15 µg", susceptible: 23, intermediate: "14-22", resistant: 13 },
  { antibiotic: "Clindamycin", organismGroup: "Staphylococcus spp.", diskContent: "2 µg", susceptible: 21, intermediate: "15-20", resistant: 14 },
  { antibiotic: "Ciprofloxacin", organismGroup: "Staphylococcus spp.", diskContent: "5 µg", susceptible: 21, intermediate: "16-20", resistant: 15 },
  { antibiotic: "Levofloxacin", organismGroup: "Staphylococcus spp.", diskContent: "5 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Moxifloxacin", organismGroup: "Staphylococcus spp.", diskContent: "5 µg", susceptible: 24, intermediate: "21-23", resistant: 20 },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Staphylococcus spp.", diskContent: "1.25/23.75 µg", susceptible: 16, resistant: 10 },
  { antibiotic: "Linezolid", organismGroup: "Staphylococcus spp.", diskContent: "30 µg", susceptible: 21, resistant: 20 },
  { antibiotic: "Tetracycline", organismGroup: "Staphylococcus spp.", diskContent: "30 µg", susceptible: 19, intermediate: "15-18", resistant: 14 },
  { antibiotic: "Doxycycline", organismGroup: "Staphylococcus spp.", diskContent: "30 µg", susceptible: 16, intermediate: "13-15", resistant: 12 },
  { antibiotic: "Minocycline", organismGroup: "Staphylococcus spp.", diskContent: "30 µg", susceptible: 19, intermediate: "15-18", resistant: 14 },
  { antibiotic: "Rifampin", organismGroup: "Staphylococcus spp.", diskContent: "5 µg", susceptible: 20, intermediate: "17-19", resistant: 16 },
  { antibiotic: "Gentamicin", organismGroup: "Staphylococcus spp.", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Nitrofurantoin", organismGroup: "Staphylococcus spp.", diskContent: "300 µg", susceptible: 17, intermediate: "15-16", resistant: 14, notes: "UTI isolates only" },
  { antibiotic: "Chloramphenicol", organismGroup: "Staphylococcus spp.", diskContent: "30 µg", susceptible: 18, intermediate: "13-17", resistant: 12 },
  { antibiotic: "Quinupristin-Dalfopristin", organismGroup: "Staphylococcus spp.", diskContent: "15 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },

  // ==================== Enterococcus spp. ====================
  { antibiotic: "Ampicillin", organismGroup: "Enterococcus spp.", diskContent: "10 µg", susceptible: 17, resistant: 16 },
  { antibiotic: "Penicillin", organismGroup: "Enterococcus spp.", diskContent: "10 units", susceptible: 15, resistant: 14 },
  { antibiotic: "Vancomycin", organismGroup: "Enterococcus spp.", diskContent: "30 µg", susceptible: 17, intermediate: "15-16", resistant: 14 },
  { antibiotic: "Linezolid", organismGroup: "Enterococcus spp.", diskContent: "30 µg", susceptible: 23, intermediate: "21-22", resistant: 20 },
  { antibiotic: "Ciprofloxacin", organismGroup: "Enterococcus spp.", diskContent: "5 µg", susceptible: 21, intermediate: "16-20", resistant: 15 },
  { antibiotic: "Levofloxacin", organismGroup: "Enterococcus spp.", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Tetracycline", organismGroup: "Enterococcus spp.", diskContent: "30 µg", susceptible: 19, intermediate: "15-18", resistant: 14 },
  { antibiotic: "Doxycycline", organismGroup: "Enterococcus spp.", diskContent: "30 µg", susceptible: 16, intermediate: "13-15", resistant: 12 },
  { antibiotic: "Nitrofurantoin", organismGroup: "Enterococcus spp.", diskContent: "300 µg", susceptible: 17, intermediate: "15-16", resistant: 14, notes: "E. faecalis UTI only" },
  { antibiotic: "Quinupristin-Dalfopristin", organismGroup: "Enterococcus spp.", diskContent: "15 µg", susceptible: 19, intermediate: "16-18", resistant: 15, notes: "E. faecium only" },
  { antibiotic: "Chloramphenicol", organismGroup: "Enterococcus spp.", diskContent: "30 µg", susceptible: 18, intermediate: "13-17", resistant: 12 },

  // ==================== Pseudomonas aeruginosa ====================
  { antibiotic: "Piperacillin-Tazobactam", organismGroup: "P. aeruginosa", diskContent: "100/10 µg", susceptible: 21, intermediate: "18-20", resistant: 17 },
  { antibiotic: "Ceftazidime", organismGroup: "P. aeruginosa", diskContent: "30 µg", susceptible: 18, resistant: 17 },
  { antibiotic: "Cefepime", organismGroup: "P. aeruginosa", diskContent: "30 µg", susceptible: 18, intermediate: "15-17", resistant: 14 },
  { antibiotic: "Aztreonam", organismGroup: "P. aeruginosa", diskContent: "30 µg", susceptible: 22, intermediate: "16-21", resistant: 15 },
  { antibiotic: "Meropenem", organismGroup: "P. aeruginosa", diskContent: "10 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Imipenem", organismGroup: "P. aeruginosa", diskContent: "10 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Doripenem", organismGroup: "P. aeruginosa", diskContent: "10 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Ciprofloxacin", organismGroup: "P. aeruginosa", diskContent: "5 µg", susceptible: 21, intermediate: "16-20", resistant: 15 },
  { antibiotic: "Levofloxacin", organismGroup: "P. aeruginosa", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Gentamicin", organismGroup: "P. aeruginosa", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Tobramycin", organismGroup: "P. aeruginosa", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Amikacin", organismGroup: "P. aeruginosa", diskContent: "30 µg", susceptible: 17, intermediate: "15-16", resistant: 14 },

  // ==================== Acinetobacter spp. ====================
  { antibiotic: "Meropenem", organismGroup: "Acinetobacter spp.", diskContent: "10 µg", susceptible: 18, intermediate: "15-17", resistant: 14 },
  { antibiotic: "Imipenem", organismGroup: "Acinetobacter spp.", diskContent: "10 µg", susceptible: 22, intermediate: "19-21", resistant: 18 },
  { antibiotic: "Doripenem", organismGroup: "Acinetobacter spp.", diskContent: "10 µg", susceptible: 18, intermediate: "15-17", resistant: 14 },
  { antibiotic: "Ciprofloxacin", organismGroup: "Acinetobacter spp.", diskContent: "5 µg", susceptible: 21, intermediate: "16-20", resistant: 15 },
  { antibiotic: "Levofloxacin", organismGroup: "Acinetobacter spp.", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Gentamicin", organismGroup: "Acinetobacter spp.", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Tobramycin", organismGroup: "Acinetobacter spp.", diskContent: "10 µg", susceptible: 15, intermediate: "13-14", resistant: 12 },
  { antibiotic: "Amikacin", organismGroup: "Acinetobacter spp.", diskContent: "30 µg", susceptible: 17, intermediate: "15-16", resistant: 14 },
  { antibiotic: "Ampicillin-Sulbactam", organismGroup: "Acinetobacter spp.", diskContent: "10/10 µg", susceptible: 15, intermediate: "12-14", resistant: 11 },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "Acinetobacter spp.", diskContent: "1.25/23.75 µg", susceptible: 16, intermediate: "11-15", resistant: 10 },
  { antibiotic: "Tetracycline", organismGroup: "Acinetobacter spp.", diskContent: "30 µg", susceptible: 15, intermediate: "12-14", resistant: 11 },
  { antibiotic: "Minocycline", organismGroup: "Acinetobacter spp.", diskContent: "30 µg", susceptible: 16, intermediate: "13-15", resistant: 12 },

  // ==================== Streptococcus pneumoniae ====================
  { antibiotic: "Oxacillin", organismGroup: "S. pneumoniae", diskContent: "1 µg", susceptible: 20, resistant: 19, notes: "Screen only. If ≤19mm, determine penicillin MIC" },
  { antibiotic: "Erythromycin", organismGroup: "S. pneumoniae", diskContent: "15 µg", susceptible: 21, intermediate: "17-20", resistant: 16 },
  { antibiotic: "Clindamycin", organismGroup: "S. pneumoniae", diskContent: "2 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "S. pneumoniae", diskContent: "1.25/23.75 µg", susceptible: 19, intermediate: "16-18", resistant: 15 },
  { antibiotic: "Vancomycin", organismGroup: "S. pneumoniae", diskContent: "30 µg", susceptible: 17, resistant: 16, notes: "No R breakpoint; zone ≥17 = S" },
  { antibiotic: "Levofloxacin", organismGroup: "S. pneumoniae", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Moxifloxacin", organismGroup: "S. pneumoniae", diskContent: "5 µg", susceptible: 18, intermediate: "15-17", resistant: 14 },
  { antibiotic: "Tetracycline", organismGroup: "S. pneumoniae", diskContent: "30 µg", susceptible: 23, intermediate: "19-22", resistant: 18 },
  { antibiotic: "Doxycycline", organismGroup: "S. pneumoniae", diskContent: "30 µg", susceptible: 28, intermediate: "25-27", resistant: 24 },
  { antibiotic: "Chloramphenicol", organismGroup: "S. pneumoniae", diskContent: "30 µg", susceptible: 21, intermediate: "18-20", resistant: 17 },
  { antibiotic: "Linezolid", organismGroup: "S. pneumoniae", diskContent: "30 µg", susceptible: 21, resistant: 20 },

  // ==================== Beta-hemolytic Streptococcus (A, B, C, G) ====================
  { antibiotic: "Penicillin", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "10 units", susceptible: 24, resistant: 23, notes: "All GAS remain penicillin-S" },
  { antibiotic: "Erythromycin", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "15 µg", susceptible: 21, intermediate: "16-20", resistant: 15 },
  { antibiotic: "Clindamycin", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "2 µg", susceptible: 19, intermediate: "16-18", resistant: 15, notes: "Perform D-test if ery-R, clin-S" },
  { antibiotic: "Vancomycin", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "30 µg", susceptible: 17, resistant: 16 },
  { antibiotic: "Levofloxacin", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Tetracycline", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "30 µg", susceptible: 23, intermediate: "19-22", resistant: 18 },
  { antibiotic: "Chloramphenicol", organismGroup: "Beta-hemolytic Streptococcus", diskContent: "30 µg", susceptible: 18, intermediate: "13-17", resistant: 12 },

  // ==================== Haemophilus influenzae ====================
  { antibiotic: "Ampicillin", organismGroup: "H. influenzae", diskContent: "10 µg", susceptible: 22, intermediate: "19-21", resistant: 18, notes: "β-lactamase test recommended first" },
  { antibiotic: "Amoxicillin-Clavulanate", organismGroup: "H. influenzae", diskContent: "20/10 µg", susceptible: 20, resistant: 19 },
  { antibiotic: "Ceftriaxone", organismGroup: "H. influenzae", diskContent: "30 µg", susceptible: 26, resistant: 25 },
  { antibiotic: "Cefotaxime", organismGroup: "H. influenzae", diskContent: "30 µg", susceptible: 26, resistant: 25 },
  { antibiotic: "Cefuroxime", organismGroup: "H. influenzae", diskContent: "30 µg", susceptible: 20, intermediate: "17-19", resistant: 16 },
  { antibiotic: "Azithromycin", organismGroup: "H. influenzae", diskContent: "15 µg", susceptible: 12, resistant: 11 },
  { antibiotic: "Chloramphenicol", organismGroup: "H. influenzae", diskContent: "30 µg", susceptible: 29, intermediate: "26-28", resistant: 25 },
  { antibiotic: "Ciprofloxacin", organismGroup: "H. influenzae", diskContent: "5 µg", susceptible: 21, resistant: 20 },
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "H. influenzae", diskContent: "1.25/23.75 µg", susceptible: 16, intermediate: "11-15", resistant: 10 },
  { antibiotic: "Tetracycline", organismGroup: "H. influenzae", diskContent: "30 µg", susceptible: 29, intermediate: "26-28", resistant: 25 },
  { antibiotic: "Meropenem", organismGroup: "H. influenzae", diskContent: "10 µg", susceptible: 20, resistant: 19 },
  { antibiotic: "Rifampin", organismGroup: "H. influenzae", diskContent: "5 µg", susceptible: 20, intermediate: "17-19", resistant: 16 },

  // ==================== Neisseria meningitidis ====================
  { antibiotic: "Penicillin", organismGroup: "N. meningitidis", diskContent: "10 units", susceptible: 26, intermediate: "20-25", resistant: 19, notes: "Oxacillin 1µg screen: ≥20 = S" },
  { antibiotic: "Chloramphenicol", organismGroup: "N. meningitidis", diskContent: "30 µg", susceptible: 26, intermediate: "20-25", resistant: 19 },
  { antibiotic: "Rifampin", organismGroup: "N. meningitidis", diskContent: "5 µg", susceptible: 25, intermediate: "20-24", resistant: 19 },

  // ==================== Stenotrophomonas maltophilia ====================
  { antibiotic: "Trimethoprim-Sulfamethoxazole", organismGroup: "S. maltophilia", diskContent: "1.25/23.75 µg", susceptible: 16, intermediate: "11-15", resistant: 10, notes: "Drug of choice" },
  { antibiotic: "Levofloxacin", organismGroup: "S. maltophilia", diskContent: "5 µg", susceptible: 17, intermediate: "14-16", resistant: 13 },
  { antibiotic: "Minocycline", organismGroup: "S. maltophilia", diskContent: "30 µg", susceptible: 19, intermediate: "15-18", resistant: 14 },
  { antibiotic: "Chloramphenicol", organismGroup: "S. maltophilia", diskContent: "30 µg", susceptible: 18, intermediate: "13-17", resistant: 12 },
];

export interface CLSIGuideline {
  title: string;
  content: string;
  category: "general" | "testing" | "reporting" | "quality";
}

export const clsiGuidelines: CLSIGuideline[] = [
  {
    title: "CLSI M100 Reference",
    content: "Performance Standards for Antimicrobial Susceptibility Testing. Current edition should be used for all interpretive criteria.",
    category: "general",
  },
  {
    title: "Inoculum Preparation",
    content: "Use 0.5 McFarland standard (1-2 × 10⁸ CFU/mL). Direct colony suspension or growth method acceptable. Inoculum must be used within 15 minutes.",
    category: "testing",
  },
  {
    title: "Mueller-Hinton Agar (MHA)",
    content: "Standard medium for disk diffusion. pH 7.2-7.4. Depth 4mm ± 0.5mm. Supplementation required for fastidious organisms (5% sheep blood for Streptococcus, HTM for Haemophilus).",
    category: "testing",
  },
  {
    title: "Haemophilus Test Medium (HTM)",
    content: "Required for H. influenzae. MHA + 15 µg/mL NAD + 15 µg/mL hematin + 5 mg/L yeast extract. Incubate in 5% CO₂, 35°C, 16-18h.",
    category: "testing",
  },
  {
    title: "GC Agar + Supplements for Neisseria",
    content: "For N. gonorrhoeae and N. meningitidis. GC agar base + 1% defined supplement. Incubate 5% CO₂, 35°C, 20-24h.",
    category: "testing",
  },
  {
    title: "Incubation Conditions",
    content: "35 ± 2°C in ambient air for most organisms. CO₂ for Streptococcus and Neisseria. Read at 16-18h (most) or 24h (Staphylococcus for vancomycin/oxacillin).",
    category: "testing",
  },
  {
    title: "D-test for Inducible Clindamycin Resistance",
    content: "Perform D-zone test when erythromycin-R and clindamycin-S. Place disks 15-26mm apart (edge-to-edge). D-shaped zone = positive = report clindamycin-R.",
    category: "testing",
  },
  {
    title: "ESBL Screening & Confirmation",
    content: "Screen Enterobacterales with ceftriaxone, ceftazidime, cefotaxime, or aztreonam MIC ≥2. Confirm with clavulanate combination (≥3 dilution decrease or ≥5mm zone increase).",
    category: "testing",
  },
  {
    title: "Carbapenemase Detection (CRE)",
    content: "Modified carbapenem inactivation method (mCIM): positive = 6-15mm zone with meropenem disk after 4h incubation with test isolate. eCIM differentiates metallo- vs serine carbapenemases.",
    category: "testing",
  },
  {
    title: "Disk Diffusion — Zone Measurement",
    content: "Measure zone diameters in mm using calipers or ruler. Include the diameter of the disk. Read transmitted light for MHA, reflected light for blood agar. Measure to the nearest whole mm.",
    category: "testing",
  },
  {
    title: "β-Lactamase Testing",
    content: "Chromogenic cephalosporin (nitrocefin) test. Required for H. influenzae, N. gonorrhoeae, Staphylococcus, Enterococcus, and Moraxella catarrhalis before reporting ampicillin/penicillin.",
    category: "testing",
  },
  {
    title: "Cascade Reporting",
    content: "Report narrowest spectrum agent first. Broad-spectrum agents (carbapenems, fluoroquinolones) should be reported selectively to promote antimicrobial stewardship.",
    category: "reporting",
  },
  {
    title: "Intrinsic Resistance Reporting",
    content: "Do NOT report susceptibility for known intrinsically resistant combinations (e.g., Enterococcus + cephalosporins, Klebsiella + ampicillin, P. aeruginosa + ertapenem).",
    category: "reporting",
  },
  {
    title: "Selective Reporting for Urine",
    content: "For uncomplicated UTI, report only oral agents: nitrofurantoin, TMP-SMX, fosfomycin. Reserve fluoroquinolones and broad-spectrum agents for complicated UTI.",
    category: "reporting",
  },
  {
    title: "Comment Codes",
    content: "Use standardized comments: 'D-test positive – report clindamycin resistant', 'ESBL confirmed – report all penicillins, cephalosporins, aztreonam resistant', 'Colistin – broth microdilution only'.",
    category: "reporting",
  },
  {
    title: "QC Organisms",
    content: "E. coli ATCC 25922, S. aureus ATCC 25923 (disk) / 29213 (MIC), P. aeruginosa ATCC 27853, E. faecalis ATCC 29212, H. influenzae ATCC 49247, S. pneumoniae ATCC 49619, N. gonorrhoeae ATCC 49226.",
    category: "quality",
  },
  {
    title: "QC Frequency",
    content: "Test QC strains weekly (or daily for new lot/method). If 1/20 or 3/30 QC results are out of range, investigate and return to daily testing until 30 consecutive in-range results.",
    category: "quality",
  },
  {
    title: "Disk Storage",
    content: "Store at ≤8°C or frozen. Remove cartridge 1-2h before use to equilibrate. Do not use expired disks. β-lactam disks are most susceptible to degradation.",
    category: "quality",
  },
];

// Map organism names to CLSI organism groups
export function getOrganismGroup(organismName: string): string {
  const lower = organismName.toLowerCase();
  if (lower.includes("staphylococcus aureus") || lower.includes("s. aureus")) return "S. aureus";
  if (lower.includes("coagulase-negative") || lower.includes("cons") || (lower.includes("staphylococcus") && (lower.includes("epidermidis") || lower.includes("saprophyticus") || lower.includes("lugdunensis") || lower.includes("haemolyticus") || lower.includes("hominis")))) return "CoNS";
  if (lower.includes("staphylococcus")) return "Staphylococcus spp.";
  if (lower.includes("enterococcus")) return "Enterococcus spp.";
  if (lower.includes("pseudomonas")) return "P. aeruginosa";
  if (lower.includes("acinetobacter")) return "Acinetobacter spp.";
  if (lower.includes("stenotrophomonas")) return "S. maltophilia";
  if (lower.includes("burkholderia")) return "B. cepacia";
  if (lower.includes("streptococcus pneumoniae") || lower.includes("s. pneumoniae")) return "S. pneumoniae";
  if (lower.includes("streptococcus pyogenes") || lower.includes("streptococcus agalactiae") || lower.includes("group a strep") || lower.includes("group b strep") || lower.includes("gas") || lower.includes("gbs")) return "Beta-hemolytic Streptococcus";
  if (lower.includes("haemophilus")) return "H. influenzae";
  if (lower.includes("neisseria gonorrhoeae") || lower.includes("n. gonorrhoeae")) return "N. gonorrhoeae";
  if (lower.includes("neisseria meningitidis") || lower.includes("n. meningitidis")) return "N. meningitidis";
  if (lower.includes("bacteroides") || lower.includes("clostridium") || lower.includes("clostridioides") || lower.includes("fusobacterium") || lower.includes("prevotella") || lower.includes("peptostreptococcus")) return "Anaerobes";
  if (
    lower.includes("escherichia") || lower.includes("klebsiella") ||
    lower.includes("proteus") || lower.includes("salmonella") ||
    lower.includes("shigella") || lower.includes("enterobacter") ||
    lower.includes("serratia") || lower.includes("citrobacter") ||
    lower.includes("morganella") || lower.includes("providencia") ||
    lower.includes("hafnia") || lower.includes("edwardsiella") ||
    lower.includes("yersinia") || lower.includes("cronobacter") ||
    lower.includes("pantoea") || lower.includes("raoultella")
  ) return "Enterobacterales";
  return "Enterobacterales"; // fallback
}

export function getRelevantBreakpoints(organismName: string): CLSIBreakpoint[] {
  const group = getOrganismGroup(organismName);
  const groups = [group];
  if (group === "S. aureus" || group === "CoNS") groups.push("Staphylococcus spp.");
  if (group === "S. pneumoniae") groups.push("S. pneumoniae (meningitis)", "S. pneumoniae (non-meningitis)");
  return clsiBreakpoints.filter((bp) => groups.includes(bp.organismGroup));
}

export function getRelevantZoneBreakpoints(organismName: string): CLSIZoneBreakpoint[] {
  const group = getOrganismGroup(organismName);
  const groups = [group];
  if (group === "S. aureus" || group === "CoNS") groups.push("Staphylococcus spp.");
  if (group === "S. pneumoniae") groups.push("S. pneumoniae (meningitis)", "S. pneumoniae (non-meningitis)");
  return clsiZoneBreakpoints.filter((bp) => groups.includes(bp.organismGroup));
}

export function interpretZone(zone: number, breakpoint: CLSIZoneBreakpoint): "S" | "I" | "R" {
  if (zone >= breakpoint.susceptible) return "S";
  if (zone <= breakpoint.resistant) return "R";
  return "I";
}
