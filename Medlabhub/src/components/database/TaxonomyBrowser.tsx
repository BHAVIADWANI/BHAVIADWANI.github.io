import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Search, Dna, BookOpen, Info } from "lucide-react";
import { organismDatabase, type Organism } from "@/lib/organismData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxonomyNode {
  name: string;
  level: "domain" | "phylum" | "class" | "order" | "family" | "genus" | "species";
  children: TaxonomyNode[];
  organisms?: Organism[];
}

function buildTaxonomyTree(organisms: Organism[]): TaxonomyNode[] {
  const root: Record<string, any> = {};

  organisms.forEach((org) => {
    const tax = org.taxonomy;
    if (!tax) return;

    const path = [
      { level: "domain", name: tax.domain },
      { level: "phylum", name: tax.phylum },
      { level: "class", name: tax.class },
      { level: "order", name: tax.order },
      { level: "family", name: tax.family },
      { level: "genus", name: org.genus },
    ];

    let current = root;
    path.forEach(({ level, name }) => {
      if (!name) return;
      if (!current[name]) current[name] = { level, children: {}, organisms: [] };
      current = current[name].children;
    });
  });

  function buildNodes(obj: Record<string, any>, organisms: Organism[]): TaxonomyNode[] {
    return Object.entries(obj).map(([name, data]) => {
      const childNodes = buildNodes(data.children, organisms);
      const levelOrganisms = data.level === "genus"
        ? organisms.filter((o) => o.genus === name)
        : undefined;
      return { name, level: data.level, children: childNodes, organisms: levelOrganisms } as TaxonomyNode;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  return buildNodes(root, organisms);
}

// Comprehensive Bergey's Manual classification data
const bergeysInfo: Record<string, { description: string; reference: string; keyFeatures?: string[] }> = {
  // Domains
  "Bacteria": { description: "Prokaryotic domain. Single-celled organisms lacking a membrane-bound nucleus. Cell walls typically contain peptidoglycan.", reference: "Bergey's Manual of Systematic Bacteriology, 2nd Ed., Vol. 1-5 (2001-2012)", keyFeatures: ["Peptidoglycan cell wall", "Binary fission", "Circular chromosome", "70S ribosomes"] },
  "Fungi": { description: "Eukaryotic kingdom including yeasts, molds, and dimorphic fungi. Chitin-containing cell walls. Heterotrophic by absorption.", reference: "Medical Mycology (various)", keyFeatures: ["Chitin cell wall", "Ergosterol in membranes", "80S ribosomes", "Eukaryotic"] },

  // Phyla
  "Bacillota": { description: "Formerly Firmicutes. Low G+C Gram-positive bacteria. Includes clinically significant classes Bacilli and Clostridia. Characterized by thick peptidoglycan layer with teichoic acids.", reference: "Bergey's Vol. 3 (2009)", keyFeatures: ["Low G+C content (typically <50%)", "Thick peptidoglycan", "Teichoic/lipoteichoic acids", "Many spore-formers"] },
  "Pseudomonadota": { description: "Formerly Proteobacteria. Largest and most diverse bacterial phylum. Contains 5 classes (Alpha through Epsilon). All are Gram-negative with outer membrane containing LPS.", reference: "Bergey's Vol. 2 (2005)", keyFeatures: ["Gram-negative", "Lipopolysaccharide (LPS)", "Outer membrane", "Diverse metabolic strategies"] },
  "Actinomycetota": { description: "Formerly Actinobacteria. High G+C Gram-positive bacteria. Many produce branching filaments resembling fungal hyphae. Include Mycobacterium, Corynebacterium, Nocardia.", reference: "Bergey's Vol. 5 (2012)", keyFeatures: ["High G+C content (>55%)", "Branching filaments", "Some acid-fast (mycolic acids)", "Many soil organisms"] },
  "Bacteroidota": { description: "Formerly Bacteroidetes. Major obligate anaerobic Gram-negative bacteria. Predominant component of normal gut microbiota. Bacteroides fragilis group is most clinically significant.", reference: "Bergey's Vol. 4 (2010)", keyFeatures: ["Obligate anaerobes (mostly)", "Major gut flora component", "Bile-resistant", "Polysaccharide capsule"] },
  "Spirochaetota": { description: "Formerly Spirochaetes. Unique spiral-shaped bacteria with endoflagella (axial filaments) located in periplasmic space. Includes Treponema, Borrelia, Leptospira.", reference: "Bergey's Vol. 4 (2010)", keyFeatures: ["Helical morphology", "Endoflagella (axial filaments)", "Periplasmic flagella", "Corkscrew motility"] },
  "Chlamydiota": { description: "Formerly Chlamydiae. Obligate intracellular pathogens with unique developmental cycle alternating between elementary bodies (EB, infectious) and reticulate bodies (RB, replicative).", reference: "Bergey's Vol. 4 (2010)", keyFeatures: ["Obligate intracellular", "EB/RB developmental cycle", "No peptidoglycan (mostly)", "Energy parasites"] },
  "Mycoplasmatota": { description: "Formerly Tenericutes. Wall-less bacteria. Smallest self-replicating organisms. Contain sterols in membranes. Includes Mycoplasma and Ureaplasma.", reference: "Bergey's Vol. 4 (2010)", keyFeatures: ["No cell wall", "Sterols in membrane", "Smallest free-living organisms", "Fried-egg colonies"] },
  "Fusobacteriota": { description: "Formerly Fusobacteria. Obligate anaerobic, Gram-negative, fusiform (spindle-shaped) rods. Key members include Fusobacterium nucleatum (oral/periodontal) and F. necrophorum (Lemierre's syndrome).", reference: "Bergey's Vol. 4 (2010)", keyFeatures: ["Fusiform morphology", "Obligate anaerobes", "Oral/GI flora", "Produce butyric acid"] },

  // Classes
  "Bacilli": { description: "Class of aerobic/facultative Gram-positive bacteria. Contains major orders: Bacillales (Staphylococcus, Bacillus, Listeria), Lactobacillales (Streptococcus, Enterococcus, Lactobacillus), and Staphylococcales.", reference: "Bergey's Vol. 3", keyFeatures: ["Aerobic/facultative", "Catalase variable", "Diverse morphology", "Many commensals and pathogens"] },
  "Clostridia": { description: "Class of obligate anaerobic, mostly spore-forming bacteria. Includes Clostridium (botulism, tetanus, gas gangrene), Clostridioides difficile, and Peptostreptococcus.", reference: "Bergey's Vol. 3", keyFeatures: ["Obligate anaerobes", "Endospore-forming (most)", "Produce potent exotoxins", "Widely distributed in soil/GI"] },
  "Gammaproteobacteria": { description: "Largest class in Pseudomonadota. Includes Enterobacterales (E. coli, Klebsiella, Salmonella), Pseudomonadales, Vibrionales, Legionellales, Pasteurellales, and Xanthomonadales.", reference: "Bergey's Vol. 2", keyFeatures: ["Most clinically significant class", "Includes ESKAPE pathogens", "Diverse metabolism", "Major nosocomial pathogens"] },
  "Betaproteobacteria": { description: "Class including Neisseriales (N. meningitidis, N. gonorrhoeae), Burkholderiales (Burkholderia, Bordetella), and Nitrosomonadales. Important respiratory and STI pathogens.", reference: "Bergey's Vol. 2", keyFeatures: ["Includes key human pathogens", "Oxidase-positive (most)", "Diverse ecology", "Some obligate intracellular"] },
  "Alphaproteobacteria": { description: "Class including Rickettsiales (Rickettsia, Ehrlichia, Anaplasma), Brucellales, Rhizobiales, and Sphingomonadales. Many obligate intracellular pathogens.", reference: "Bergey's Vol. 2", keyFeatures: ["Many obligate intracellular", "Tick-borne diseases", "Endosymbiont ancestors of mitochondria"] },
  "Epsilonproteobacteria": { description: "Class including Campylobacterales. Helicobacter pylori (gastric ulcers, cancer) and Campylobacter jejuni (diarrhea) are key pathogens. Microaerophilic.", reference: "Bergey's Vol. 2", keyFeatures: ["Microaerophilic", "Spiral/curved rods", "Motile (polar flagella)", "GI tract colonizers"] },
  "Actinomycetes": { description: "High G+C Gram-positive class. Includes Mycobacteriales (TB, leprosy), Corynebacteriales, Actinomycetales. Many produce branching filamentous forms.", reference: "Bergey's Vol. 5", keyFeatures: ["High G+C content", "Acid-fast (Mycobacterium)", "Branching filaments", "Some dimorphic growth"] },

  // Orders
  "Staphylococcales": { description: "Order containing family Staphylococcaceae. Catalase-positive, Gram-positive cocci in clusters. Includes S. aureus (coagulase+) and CoNS (S. epidermidis, S. saprophyticus).", reference: "Bergey's Vol. 3", keyFeatures: ["Catalase-positive", "Cluster arrangement", "Coagulase differentiates species", "Salt-tolerant"] },
  "Lactobacillales": { description: "Order of lactic acid bacteria. Includes Streptococcaceae (Streptococcus), Enterococcaceae (Enterococcus), Lactobacillaceae (Lactobacillus). Catalase-negative, fermentative.", reference: "Bergey's Vol. 3", keyFeatures: ["Catalase-negative", "Lactic acid fermentation", "Chains/pairs arrangement", "Lancefield grouping for Streptococcus"] },
  "Bacillales": { description: "Order containing Bacillaceae (Bacillus), Listeriaceae (Listeria), Paenibacillaceae. Many aerobic endospore-formers. Large, rod-shaped bacteria.", reference: "Bergey's Vol. 3", keyFeatures: ["Aerobic spore-formers (Bacillus)", "Large rods", "Catalase-positive (most)", "Soil organisms"] },
  "Enterobacterales": { description: "Order of facultative anaerobic Gram-negative rods. Includes Enterobacteriaceae (E. coli, Klebsiella), Yersiniaceae, Morganellaceae, Hafniaceae. Oxidase-negative, glucose-fermenting.", reference: "Bergey's Vol. 2", keyFeatures: ["Oxidase-negative", "Glucose fermenters", "Reduce nitrate to nitrite", "Major cause of UTI, bacteremia, pneumonia"] },
  "Pseudomonadales": { description: "Order including Pseudomonadaceae (P. aeruginosa) and Moraxellaceae (Acinetobacter, Moraxella). Aerobic, non-fermenting Gram-negative rods.", reference: "Bergey's Vol. 2", keyFeatures: ["Non-fermenters", "Oxidase variable", "Ubiquitous in environment", "Intrinsically resistant to many antibiotics"] },
  "Vibrionales": { description: "Order containing Vibrionaceae. Curved Gram-negative rods, oxidase-positive. Vibrio cholerae (cholera), V. parahaemolyticus (seafood-associated gastroenteritis), V. vulnificus (wound infections).", reference: "Bergey's Vol. 2", keyFeatures: ["Curved rods", "Oxidase-positive", "Halophilic (most)", "Aquatic habitat"] },
  "Legionellales": { description: "Order containing Legionellaceae. Legionella pneumophila causes Legionnaires' disease and Pontiac fever. Requires L-cysteine and iron for growth. Intracellular pathogen of macrophages.", reference: "Bergey's Vol. 2", keyFeatures: ["Requires L-cysteine", "BCYE agar", "Intracellular in macrophages", "Waterborne transmission"] },
  "Pasteurellales": { description: "Order containing Pasteurellaceae (Haemophilus, Pasteurella, Aggregatibacter). Small pleomorphic Gram-negative rods/coccobacilli. Many require growth factors (X and V factors for Haemophilus).", reference: "Bergey's Vol. 2", keyFeatures: ["Fastidious growth requirements", "X and V factors (Haemophilus)", "Coccobacilli", "Upper respiratory tract commensals"] },
  "Neisseriales": { description: "Order containing Neisseriaceae. Gram-negative diplococci. N. meningitidis (meningitis), N. gonorrhoeae (gonorrhea). Oxidase-positive, catalase-positive. Require CO₂ for growth.", reference: "Bergey's Vol. 2", keyFeatures: ["Diplococci (kidney-bean shaped)", "Oxidase/catalase-positive", "CO₂ required", "Modified Thayer-Martin agar"] },
  "Campylobacterales": { description: "Order including Campylobacteraceae (Campylobacter) and Helicobacteraceae (Helicobacter). Spiral/curved, microaerophilic, oxidase-positive. Major GI pathogens.", reference: "Bergey's Vol. 2", keyFeatures: ["Microaerophilic", "42°C growth (Campylobacter)", "Urease-positive (Helicobacter)", "Seagull-wing morphology"] },
  "Mycobacteriales": { description: "Order in Actinomycetota. Contains Mycobacteriaceae (M. tuberculosis, M. leprae, NTM), Nocardiaceae (Nocardia). Acid-fast due to mycolic acids in cell wall.", reference: "Bergey's Vol. 5", keyFeatures: ["Acid-fast staining", "Mycolic acids", "Slow growth (weeks)", "Löwenstein-Jensen medium"] },
  "Corynebacteriales": { description: "Order including Corynebacteriaceae. Club-shaped, pleomorphic Gram-positive rods. Corynebacterium diphtheriae (diphtheria). Chinese-letter arrangement.", reference: "Bergey's Vol. 5", keyFeatures: ["Club-shaped rods", "Chinese-letter arrangement", "Metachromatic granules", "Tellurite agar"] },
  "Rickettsiales": { description: "Order of obligate intracellular bacteria. Rickettsia (Rocky Mountain spotted fever), Ehrlichia, Anaplasma. Transmitted by arthropod vectors (ticks, lice, fleas).", reference: "Bergey's Vol. 2", keyFeatures: ["Obligate intracellular", "Arthropod vectors", "Cannot be cultured on artificial media", "Target endothelial cells (Rickettsia)"] },
  "Chlamydiales": { description: "Order of obligate intracellular bacteria. Chlamydia trachomatis (trachoma, STI), C. pneumoniae (atypical pneumonia), C. psittaci (psittacosis). EB/RB cycle.", reference: "Bergey's Vol. 4", keyFeatures: ["Elementary body (EB) → Reticulate body (RB)", "Cannot make own ATP", "Inclusion bodies in cells", "Cell culture required for isolation"] },
  "Spirochaetales": { description: "Order containing Treponemataceae, Borreliaceae, Leptospiraceae. Helical, motile via endoflagella. T. pallidum (syphilis), Borrelia (Lyme disease), Leptospira.", reference: "Bergey's Vol. 4", keyFeatures: ["Cannot be Gram stained (too thin)", "Darkfield microscopy", "Axial filaments", "Difficult/impossible to culture (Treponema)"] },
  "Mycoplasmatales": { description: "Order of wall-less bacteria. Mycoplasma pneumoniae (walking pneumonia), M. genitalium, Ureaplasma urealyticum. Smallest free-living organisms. Resistant to β-lactams.", reference: "Bergey's Vol. 4", keyFeatures: ["No cell wall → β-lactam resistant", "Fried-egg colonies", "Require cholesterol", "Pass through 0.45µm filters"] },
  "Bacteroidales": { description: "Order of obligate anaerobic Gram-negative rods. Bacteroides fragilis group (most common anaerobic pathogen), Prevotella, Porphyromonas. Major component of gut/oral flora.", reference: "Bergey's Vol. 4", keyFeatures: ["Bile-resistant (B. fragilis)", "β-lactamase production", "Polysaccharide capsule", "Most common anaerobic isolate"] },
  "Clostridiales": { description: "Order of obligate anaerobic spore-forming rods. C. perfringens (gas gangrene), C. tetani (tetanus), C. botulinum (botulism), Clostridioides difficile (CDI).", reference: "Bergey's Vol. 3", keyFeatures: ["Terminal/subterminal spores", "Potent exotoxins", "Anaerobic", "Double-zone hemolysis (C. perfringens)"] },
  "Fusobacteriales": { description: "Order of obligate anaerobic fusiform Gram-negative rods. F. nucleatum (periodontal disease, brain abscess), F. necrophorum (Lemierre's syndrome, peritonsillar abscess).", reference: "Bergey's Vol. 4", keyFeatures: ["Spindle-shaped cells", "Obligate anaerobes", "Butyric acid production", "Mixed infection component"] },

  // Families
  "Staphylococcaceae": { description: "Family of catalase-positive, Gram-positive cocci. Major genera: Staphylococcus (S. aureus, S. epidermidis, S. saprophyticus). Salt-tolerant, grow on mannitol salt agar.", reference: "Bergey's Vol. 3" },
  "Streptococcaceae": { description: "Family of catalase-negative cocci in chains/pairs. Streptococcus pneumoniae (diplococci), S. pyogenes (GAS), S. agalactiae (GBS). Hemolysis pattern distinguishes groups.", reference: "Bergey's Vol. 3" },
  "Enterococcaceae": { description: "Family containing Enterococcus. Formerly classified as Group D streptococci. Grow in 6.5% NaCl, bile esculin positive, PYR positive. E. faecalis and E. faecium are major pathogens.", reference: "Bergey's Vol. 3" },
  "Bacillaceae": { description: "Family of aerobic/facultative endospore-forming rods. Bacillus anthracis (anthrax), B. cereus (food poisoning). Large, Gram-positive, catalase-positive.", reference: "Bergey's Vol. 3" },
  "Listeriaceae": { description: "Family containing Listeria. L. monocytogenes: cold-growth (4°C), tumbling motility at 25°C, β-hemolytic, CAMP-positive with S. aureus. Causes listeriosis.", reference: "Bergey's Vol. 3" },
  "Clostridiaceae": { description: "Family of anaerobic spore-forming rods. Clostridium perfringens, C. tetani, C. botulinum. Produce potent exotoxins including some of the most toxic substances known.", reference: "Bergey's Vol. 3" },
  "Peptostreptococcaceae": { description: "Family including Clostridioides difficile (formerly Clostridium difficile). Obligate anaerobe. Toxins A and B cause CDI. Spores persist in hospital environment. Also includes anaerobic cocci.", reference: "Bergey's Vol. 3" },
  "Enterobacteriaceae": { description: "Largest family in Enterobacterales. Includes E. coli, Klebsiella, Proteus, Salmonella, Shigella. Oxidase-negative, glucose-fermenting, nitrate-reducing. MacConkey agar for differentiation.", reference: "Bergey's Vol. 2" },
  "Yersiniaceae": { description: "Family containing Yersinia pestis (plague), Y. enterocolitica (gastroenteritis), Y. pseudotuberculosis. Bipolar staining ('safety pin' appearance). Cold-enrichment growth.", reference: "Bergey's Vol. 2" },
  "Morganellaceae": { description: "Family containing Proteus, Morganella, Providencia. Proteus mirabilis: swarming motility, urease-positive, fishy odor. Cause complicated UTI and wound infections.", reference: "Bergey's Vol. 2" },
  "Pseudomonadaceae": { description: "Family of aerobic, non-fermenting Gram-negative rods. Pseudomonas aeruginosa: grape-like odor, green pigments (pyocyanin, pyoverdin), oxidase-positive. Major opportunistic pathogen.", reference: "Bergey's Vol. 2" },
  "Moraxellaceae": { description: "Family containing Acinetobacter (MDR nosocomial pathogen), Moraxella catarrhalis (otitis media, sinusitis, COPD exacerbations). Non-fermenting Gram-negative coccobacilli.", reference: "Bergey's Vol. 2" },
  "Vibrionaceae": { description: "Family of curved, Gram-negative rods. Vibrio cholerae (cholera: profuse rice-water diarrhea), V. vulnificus (wound infections, sepsis), V. parahaemolyticus (seafood gastroenteritis). Halophilic.", reference: "Bergey's Vol. 2" },
  "Legionellaceae": { description: "Family with single genus Legionella (~60 species). L. pneumophila serogroup 1 causes most human disease. Environmental organism found in water systems. BCYE agar.", reference: "Bergey's Vol. 2" },
  "Pasteurellaceae": { description: "Family of small, fastidious Gram-negative coccobacilli. Haemophilus influenzae (meningitis, epiglottitis), H. ducreyi (chancroid), Pasteurella multocida (bite wounds), Aggregatibacter.", reference: "Bergey's Vol. 2" },
  "Neisseriaceae": { description: "Family of Gram-negative diplococci. N. meningitidis (meningitis, Waterhouse-Friderichsen), N. gonorrhoeae (gonorrhea). Modified Thayer-Martin agar. Oxidase/catalase-positive.", reference: "Bergey's Vol. 2" },
  "Campylobacteraceae": { description: "Family of microaerophilic, spiral/curved Gram-negative rods. C. jejuni: #1 cause of bacterial gastroenteritis worldwide. Grows at 42°C. Guillain-Barré syndrome association.", reference: "Bergey's Vol. 2" },
  "Helicobacteraceae": { description: "Family containing Helicobacter pylori. Spiral, urease-positive, microaerophilic. Causes gastritis, peptic ulcers, gastric MALT lymphoma, gastric adenocarcinoma. WHO Class I carcinogen.", reference: "Bergey's Vol. 2" },
  "Mycobacteriaceae": { description: "Family of acid-fast bacilli. M. tuberculosis (TB), M. leprae (leprosy), M. avium complex (MAC). Mycolic acids in cell wall. Ziehl-Neelsen/Kinyoun stain. Löwenstein-Jensen medium.", reference: "Bergey's Vol. 5" },
  "Corynebacteriaceae": { description: "Family of club-shaped, pleomorphic Gram-positive rods. C. diphtheriae (diphtheria toxin, Elek test), C. jeikeium (nosocomial). Metachromatic (Babes-Ernst) granules. Chinese-letter arrangement.", reference: "Bergey's Vol. 5" },
  "Nocardiaceae": { description: "Family of branching, partially acid-fast, aerobic actinomycetes. Nocardia asteroides complex causes pulmonary nocardiosis. Modified acid-fast stain. Weakly Gram-positive.", reference: "Bergey's Vol. 5" },
  "Treponemataceae": { description: "Family of thin spirochetes. T. pallidum (syphilis - primary/secondary/tertiary). Cannot be cultured in vitro. Darkfield microscopy. Serologic diagnosis (RPR/VDRL, FTA-ABS).", reference: "Bergey's Vol. 4" },
  "Borreliaceae": { description: "Family of large spirochetes. B. burgdorferi (Lyme disease), B. recurrentis (relapsing fever). Larger than Treponema, visible on Wright/Giemsa stain. Tick/louse vectors.", reference: "Bergey's Vol. 4" },
  "Leptospiraceae": { description: "Family of tightly coiled spirochetes with hooked ends. Leptospira interrogans causes leptospirosis (Weil's disease). Transmission via animal urine contaminating water. Darkfield microscopy.", reference: "Bergey's Vol. 4" },
  "Chlamydiaceae": { description: "Family of obligate intracellular bacteria. C. trachomatis (trachoma, STI, lymphogranuloma venereum), C. pneumoniae (atypical pneumonia), C. psittaci (psittacosis from birds).", reference: "Bergey's Vol. 4" },
  "Rickettsiaceae": { description: "Family of obligate intracellular bacteria. R. rickettsii (Rocky Mountain spotted fever), R. prowazekii (epidemic typhus), R. typhi (endemic typhus). Arthropod vectors.", reference: "Bergey's Vol. 2" },
  "Anaplasmataceae": { description: "Family of obligate intracellular bacteria. Ehrlichia chaffeensis (human monocytic ehrlichiosis), Anaplasma phagocytophilum (anaplasmosis). Tick-borne. Form morulae in host cells.", reference: "Bergey's Vol. 2" },
  "Mycoplasmataceae": { description: "Family of wall-less bacteria. M. pneumoniae (walking pneumonia, cold agglutinins), M. genitalium (urethritis). Cholesterol-containing membrane. Smallest genome of free-living organisms.", reference: "Bergey's Vol. 4" },
  "Bacteroidaceae": { description: "Family of obligate anaerobic, Gram-negative rods. B. fragilis group: most common anaerobic clinical isolate. Bile-resistant. Polysaccharide capsule. β-lactamase producing.", reference: "Bergey's Vol. 4" },
  "Prevotellaceae": { description: "Family of pigmented anaerobic Gram-negative rods. Prevotella melaninogenica (oral/respiratory infections). Previously classified with Bacteroides. Bile-sensitive (distinguishes from Bacteroides).", reference: "Bergey's Vol. 4" },
  "Fusobacteriaceae": { description: "Family of fusiform anaerobic Gram-negative rods. F. nucleatum (Vincent's angina, brain abscess), F. necrophorum (Lemierre's syndrome - internal jugular vein thrombophlebitis).", reference: "Bergey's Vol. 4" },
  "Xanthomonadaceae": { description: "Family containing Stenotrophomonas maltophilia. Non-fermenting, oxidase-negative Gram-negative rod. Intrinsically MDR. TMP-SMX is drug of choice. Nosocomial pathogen.", reference: "Bergey's Vol. 2" },
  "Burkholderiaceae": { description: "Family containing Burkholderia cepacia complex (CF patients, intrinsically resistant), B. pseudomallei (melioidosis). Also Bordetella pertussis (whooping cough).", reference: "Bergey's Vol. 2" },
  "Actinomycetaceae": { description: "Family of branching, filamentous Gram-positive bacteria. Actinomyces israelii (actinomycosis - sulfur granules, cervicofacial 'lumpy jaw'). Anaerobic/microaerophilic.", reference: "Bergey's Vol. 5" },
};

function TaxonomyTreeNode({ node, onSelectOrganism, depth = 0 }: {
  node: TaxonomyNode;
  onSelectOrganism: (org: Organism) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0 || (node.organisms && node.organisms.length > 0);
  const info = bergeysInfo[node.name];

  const levelColors: Record<string, string> = {
    domain: "text-primary font-bold text-base",
    phylum: "text-primary/90 font-semibold",
    class: "text-primary/80 font-medium",
    order: "text-foreground font-medium",
    family: "text-foreground",
    genus: "text-foreground italic",
  };

  const levelBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    domain: "default",
    phylum: "secondary",
    class: "outline",
    order: "outline",
    family: "outline",
    genus: "outline",
  };

  const totalOrganisms = countOrganisms(node);

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <button
        className={`flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-accent/50 transition-colors group ${levelColors[node.level] || ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <span className="w-3.5" />
        )}
        <span className="text-sm">{node.name}</span>
        <Badge variant={levelBadgeVariant[node.level] || "outline"} className="text-[10px] h-4 px-1.5 capitalize">{node.level}</Badge>
        {totalOrganisms > 0 && (
          <span className="text-[10px] text-muted-foreground ml-auto">{totalOrganisms} organism{totalOrganisms > 1 ? "s" : ""}</span>
        )}
        {info && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 hover:text-primary shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p className="text-xs font-medium mb-1">{node.name}</p>
                <p className="text-xs text-muted-foreground">{info.description}</p>
                {info.keyFeatures && (
                  <ul className="text-[10px] mt-1 space-y-0.5 text-muted-foreground">
                    {info.keyFeatures.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                )}
                <p className="text-[9px] mt-1 opacity-60">{info.reference}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </button>

      {expanded && info && (
        <div className="ml-8 mb-1 text-xs text-muted-foreground border-l-2 border-primary/20 pl-3 py-1">
          <p>{info.description}</p>
          {info.keyFeatures && info.keyFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {info.keyFeatures.map((f, i) => (
                <Badge key={i} variant="outline" className="text-[9px] h-4 px-1">{f}</Badge>
              ))}
            </div>
          )}
          <p className="text-[10px] mt-0.5 opacity-70">Ref: {info.reference}</p>
        </div>
      )}

      {expanded && (
        <>
          {node.children.map((child) => (
            <TaxonomyTreeNode key={`${child.level}-${child.name}`} node={child} onSelectOrganism={onSelectOrganism} depth={depth + 1} />
          ))}
          {node.organisms && node.organisms.map((org) => (
            <button
              key={org.id}
              className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-accent/50 transition-colors ml-4"
              style={{ paddingLeft: (depth + 1) * 14 }}
              onClick={() => onSelectOrganism(org)}
            >
              <Dna className="h-3 w-3 text-primary shrink-0" />
              <span className="text-sm italic">{org.name}</span>
              {org.pathogenic && <Badge variant="destructive" className="text-[9px] h-3.5 px-1">pathogenic</Badge>}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function countOrganisms(node: TaxonomyNode): number {
  let count = node.organisms?.length || 0;
  node.children.forEach((child) => { count += countOrganisms(child); });
  return count;
}

interface TaxonomyBrowserProps {
  onSelectOrganism: (organism: Organism) => void;
}

export function TaxonomyBrowser({ onSelectOrganism }: TaxonomyBrowserProps) {
  const [search, setSearch] = useState("");

  const organismsWithTaxonomy = useMemo(
    () => organismDatabase.filter((o) => o.taxonomy),
    []
  );

  const filteredOrganisms = useMemo(() => {
    if (!search) return organismsWithTaxonomy;
    const q = search.toLowerCase();
    return organismsWithTaxonomy.filter((o) =>
      o.name.toLowerCase().includes(q) ||
      o.genus.toLowerCase().includes(q) ||
      o.taxonomy?.phylum?.toLowerCase().includes(q) ||
      o.taxonomy?.class?.toLowerCase().includes(q) ||
      o.taxonomy?.order?.toLowerCase().includes(q) ||
      o.taxonomy?.family?.toLowerCase().includes(q)
    );
  }, [search, organismsWithTaxonomy]);

  const tree = useMemo(() => buildTaxonomyTree(filteredOrganisms), [filteredOrganisms]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Bergey's Manual — Taxonomic Classification
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Hierarchical classification of {organismsWithTaxonomy.length} organisms following Bergey's Manual of Systematic Bacteriology (2nd Ed., Vols. 1-5).
          Hover over <Info className="inline h-3 w-3" /> for detailed descriptions and key features.
        </p>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phylum, class, order, family..."
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {tree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No organisms match your search.</p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-0.5">
            {tree.map((node) => (
              <TaxonomyTreeNode key={`${node.level}-${node.name}`} node={node} onSelectOrganism={onSelectOrganism} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
