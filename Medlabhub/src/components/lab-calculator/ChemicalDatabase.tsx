import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const chemicals = [
  { name: "Sodium Chloride", formula: "NaCl", mw: 58.44, uses: "Normal saline, media preparation, electrolyte solutions", storage: "Room temp, dry" },
  { name: "Agar", formula: "C₁₄H₂₄O₉ (polymer)", mw: 336.33, uses: "Solidifying agent for culture media", storage: "Room temp, sealed" },
  { name: "Peptone", formula: "Protein hydrolysate", mw: 0, uses: "Nitrogen source in culture media", storage: "Room temp, dry, sealed" },
  { name: "Glucose (Dextrose)", formula: "C₆H₁₂O₆", mw: 180.16, uses: "Carbon source, fermentation tests, clinical chemistry", storage: "Room temp, dry" },
  { name: "Tris Base", formula: "C₄H₁₁NO₃", mw: 121.14, uses: "Buffer preparation (Tris-HCl, TAE, TBE)", storage: "Room temp, dry" },
  { name: "EDTA", formula: "C₁₀H₁₆N₂O₈", mw: 292.24, uses: "Chelating agent, anticoagulant, DNA extraction", storage: "Room temp" },
  { name: "Magnesium Chloride", formula: "MgCl₂", mw: 95.21, uses: "PCR cofactor, enzyme activation", storage: "Room temp, dry, hygroscopic" },
  { name: "Potassium Phosphate (Dibasic)", formula: "K₂HPO₄", mw: 174.18, uses: "Buffer systems, culture media", storage: "Room temp, dry" },
  { name: "Hydrochloric Acid", formula: "HCl", mw: 36.46, uses: "pH adjustment, staining solutions", storage: "Cool, ventilated, corrosive" },
  { name: "Sodium Hydroxide", formula: "NaOH", mw: 40.00, uses: "pH adjustment, decontamination", storage: "Room temp, dry, corrosive" },
  { name: "Ethanol", formula: "C₂H₅OH", mw: 46.07, uses: "Disinfection, DNA precipitation, fixation", storage: "Cool, flammable" },
  { name: "Acetic Acid", formula: "CH₃COOH", mw: 60.05, uses: "Staining (Gram), buffer preparation", storage: "Cool, ventilated" },
  { name: "Crystal Violet", formula: "C₂₅H₃₀ClN₃", mw: 407.98, uses: "Gram staining primary stain", storage: "Room temp, light-sensitive" },
  { name: "Safranin", formula: "C₂₀H₁₉ClN₄", mw: 350.84, uses: "Gram staining counterstain", storage: "Room temp" },
  { name: "Potassium Chloride", formula: "KCl", mw: 74.55, uses: "Electrolyte studies, buffer systems", storage: "Room temp, dry" },
  { name: "Calcium Chloride", formula: "CaCl₂", mw: 110.98, uses: "Coagulation studies, transformation", storage: "Room temp, hygroscopic" },
  { name: "Sodium Bicarbonate", formula: "NaHCO₃", mw: 84.01, uses: "Buffer, culture media supplement", storage: "Room temp, dry" },
  { name: "Formaldehyde", formula: "HCHO", mw: 30.03, uses: "Fixation, preservation", storage: "Room temp, ventilated, toxic" },
  { name: "Methanol", formula: "CH₃OH", mw: 32.04, uses: "Fixation, staining", storage: "Cool, flammable, toxic" },
  { name: "Agarose", formula: "Polysaccharide", mw: 0, uses: "Gel electrophoresis", storage: "Room temp, dry" },
];

export function ChemicalDatabase() {
  const [search, setSearch] = useState("");
  const filtered = chemicals.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.formula.toLowerCase().includes(search.toLowerCase()) ||
    c.uses.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search chemicals..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => (
          <Card key={c.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{c.name}</CardTitle>
              <p className="text-xs font-mono text-primary">{c.formula}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {c.mw > 0 && <div><span className="text-muted-foreground">MW:</span> {c.mw} g/mol</div>}
              <div><span className="text-muted-foreground">Uses:</span> {c.uses}</div>
              <Badge variant="outline" className="text-[10px]">{c.storage}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
