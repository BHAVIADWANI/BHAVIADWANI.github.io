import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Microscope, BookOpen, BrainCircuit, Database, BarChart3, GitCompare, Layers, FlaskConical, ScanEye, Library, Calculator, Atom, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { organismDatabase } from "@/lib/organismData";

interface SearchItem {
  label: string;
  description: string;
  href: string;
  category: string;
  icon: React.ElementType;
  keywords: string[];
}

const pages: SearchItem[] = [
  { label: "Identify Organism", description: "Identify bacteria, fungi, viruses by characteristics", href: "/identify", category: "Tools", icon: Microscope, keywords: ["identify", "bacteria", "organism", "morphology", "gram stain", "biochemical"] },
  { label: "Organism Database", description: "Browse 500+ organisms with detailed profiles", href: "/database", category: "Tools", icon: BookOpen, keywords: ["database", "organism", "search", "browse", "species", "taxonomy"] },
  { label: "Compare Organisms", description: "Side-by-side organism comparison", href: "/compare", category: "Tools", icon: GitCompare, keywords: ["compare", "difference", "versus", "side by side"] },
  { label: "Quiz", description: "Test your microbiology knowledge", href: "/quiz", category: "Study", icon: BrainCircuit, keywords: ["quiz", "test", "exam", "practice", "mcq", "question"] },
  { label: "Flashcards", description: "Spaced repetition flashcard study", href: "/flashcards", category: "Study", icon: Layers, keywords: ["flashcard", "study", "review", "memorize", "spaced repetition"] },
  { label: "Records", description: "Patient identification records", href: "/records", category: "Tools", icon: Database, keywords: ["records", "patient", "sample", "history", "report"] },
  { label: "AST Analysis", description: "Antibiotic susceptibility testing", href: "/ast", category: "Tools", icon: BarChart3, keywords: ["ast", "antibiotic", "susceptibility", "resistance", "zone", "mic", "clsi"] },
  { label: "Virtual Lab", description: "3D interactive lab simulations", href: "/molecular", category: "Lab", icon: FlaskConical, keywords: ["virtual lab", "simulation", "3d", "experiment", "gram stain", "dna extraction", "pcr", "culture"] },
  { label: "AI Tutor", description: "AI-powered microbiology tutor", href: "/ai-tutor", category: "AI", icon: BrainCircuit, keywords: ["ai", "tutor", "learn", "teach", "explain", "help", "assistant"] },
  { label: "Image Recognition", description: "AI-powered lab image analysis", href: "/image-recognition", category: "AI", icon: ScanEye, keywords: ["image", "recognition", "photo", "camera", "microscope", "ai", "detect"] },
  { label: "Reference Library", description: "Protocols, SOPs, and instrument manuals", href: "/reference-library", category: "Reference", icon: Library, keywords: ["reference", "library", "protocol", "sop", "manual", "guide", "procedure"] },
  { label: "Lab Calculator", description: "AI-powered lab intelligence system", href: "/lab-calculator", category: "Tools", icon: Calculator, keywords: ["calculator", "molarity", "dilution", "solution", "concentration", "formula", "nacl"] },
  { label: "Molecular Docking", description: "Protein-ligand docking simulations", href: "/molecular-docking", category: "Lab", icon: Atom, keywords: ["docking", "protein", "ligand", "binding", "drug", "pdb", "3d"] },
  { label: "Lab Report", description: "Create, interpret and analyze lab reports with AI", href: "/lab-report", category: "Tools", icon: Calculator, keywords: ["report", "cbc", "lft", "rft", "lipid", "glucose", "thyroid", "interpret", "upload", "laboratory"] },
  { label: "Hematology", description: "Blood cell analysis and CBC interpretation", href: "/hematology", category: "Departments", icon: FlaskConical, keywords: ["hematology", "blood", "cbc", "rbc", "wbc", "platelet", "anemia"] },
  { label: "Clinical Chemistry", description: "Biochemical test interpretation", href: "/clinical-chemistry", category: "Departments", icon: FlaskConical, keywords: ["chemistry", "biochemistry", "glucose", "liver", "kidney", "electrolyte", "enzyme"] },
  { label: "Immunology", description: "Immunological tests and serology", href: "/immunology", category: "Departments", icon: FlaskConical, keywords: ["immunology", "serology", "antibody", "antigen", "elisa", "immunoglobulin"] },
  { label: "Blood Bank", description: "Transfusion and blood grouping", href: "/blood-bank", category: "Departments", icon: FlaskConical, keywords: ["blood bank", "transfusion", "grouping", "cross match", "rh", "abo"] },
  { label: "Pathology", description: "Histopathology and cytology", href: "/pathology", category: "Departments", icon: FlaskConical, keywords: ["pathology", "histopathology", "cytology", "biopsy", "tissue", "staining"] },
];

interface GlobalSearchProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export function GlobalSearch({ autoFocus, onNavigate }: GlobalSearchProps = {}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const organismItems: SearchItem[] = useMemo(() =>
    organismDatabase.slice(0, 200).map(o => ({
      label: o.name,
      description: `${o.gramStain || ""} ${o.shape || ""} — ${o.genus || "organism"}`.trim(),
      href: `/database?search=${encodeURIComponent(o.name)}`,
      category: "Organisms",
      icon: Microscope,
      keywords: [o.name.toLowerCase(), o.gramStain?.toLowerCase() || "", o.shape?.toLowerCase() || "", o.genus?.toLowerCase() || ""],
    })),
  []);

  const allItems = useMemo(() => [...pages, ...organismItems], [organismItems]);

  const results = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return allItems
      .filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some(k => k.includes(q))
      )
      .slice(0, 12);
  }, [query, allItems]);

  useEffect(() => { setSelectedIndex(0); }, [results]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: SearchItem) => {
    navigate(item.href);
    setQuery("");
    setOpen(false);
    onNavigate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  const grouped = useMemo(() => {
    const map: Record<string, SearchItem[]> = {};
    results.forEach(r => { (map[r.category] ??= []).push(r); });
    return map;
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.length >= 1) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search organisms, tools, calculators, departments..."
          className="pl-12 pr-4 h-14 text-base rounded-2xl border-2 border-border/60 bg-card shadow-lg focus-visible:ring-primary/30 focus-visible:border-primary/50"
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border bg-popover shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto py-2">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</div>
                {items.map(item => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <button
                      key={item.label + item.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        globalIdx === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                      )}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {open && query.length >= 1 && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border bg-popover shadow-2xl p-6 text-center text-sm text-muted-foreground">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
