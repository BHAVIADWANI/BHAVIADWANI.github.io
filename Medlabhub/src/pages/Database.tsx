import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrganismFilters } from "@/components/database/OrganismFilters";
import { OrganismCard } from "@/components/database/OrganismCard";
import { OrganismDetail } from "@/components/database/OrganismDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, LayoutGrid, TestTubes, Dna } from "lucide-react";
import { organismDatabase, type Organism } from "@/lib/organismData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleTypeOrganisms, sampleTypeIcons } from "@/lib/microbiologyVisuals";
import { TaxonomyBrowser } from "@/components/database/TaxonomyBrowser";

const Database = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGramStains, setSelectedGramStains] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedOxygen, setSelectedOxygen] = useState<string[]>([]);
  const [showPathogenicOnly, setShowPathogenicOnly] = useState(false);
  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGramStains([]);
    setSelectedShapes([]);
    setSelectedOxygen([]);
    setShowPathogenicOnly(false);
  };

  const filteredOrganisms = useMemo(() => {
    return organismDatabase.filter((organism) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          organism.name, organism.genus, organism.species,
          ...organism.diseases, organism.clinicalSignificance,
        ].join(" ").toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      if (selectedGramStains.length > 0 && !selectedGramStains.includes(organism.gramStain)) return false;
      if (selectedShapes.length > 0 && !selectedShapes.includes(organism.shape)) return false;
      if (selectedOxygen.length > 0 && !selectedOxygen.includes(organism.oxygen)) return false;
      if (showPathogenicOnly && !organism.pathogenic) return false;
      return true;
    });
  }, [searchQuery, selectedGramStains, selectedShapes, selectedOxygen, showPathogenicOnly]);

  const handleSelectOrganism = (organism: Organism) => {
    setSelectedOrganism(organism);
    setDetailOpen(true);
  };

  // Build sample type view: match organisms by name
  const sampleTypeView = useMemo(() => {
    return Object.entries(sampleTypeOrganisms).map(([sampleType, orgNames]) => {
      const matchedOrganisms = orgNames
        .map((name) => organismDatabase.find((o) => o.name === name))
        .filter(Boolean) as Organism[];
      return { sampleType, organisms: matchedOrganisms };
    }).filter((entry) => entry.organisms.length > 0);
  }, []);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedGramStains.length +
    selectedShapes.length +
    selectedOxygen.length +
    (showPathogenicOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organism Database</h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our comprehensive database of microorganisms with detailed molecular, clinical, and antimicrobial resistance information.
          </p>
        </div>

        <Tabs defaultValue="browse" className="mb-6">
          <TabsList>
            <TabsTrigger value="browse" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Browse All
            </TabsTrigger>
            <TabsTrigger value="by-sample" className="gap-1.5">
              <TestTubes className="h-4 w-4" />
              By Sample Type
            </TabsTrigger>
            <TabsTrigger value="taxonomy" className="gap-1.5">
              <Dna className="h-4 w-4" />
              Bergey's Classification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {filteredOrganisms.length} organism{filteredOrganisms.length !== 1 ? "s" : ""}
                </Badge>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 p-0 justify-center">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-6">
                    <OrganismFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedGramStains={selectedGramStains}
                      onGramStainChange={setSelectedGramStains}
                      selectedShapes={selectedShapes}
                      onShapeChange={setSelectedShapes}
                      selectedOxygen={selectedOxygen}
                      onOxygenChange={setSelectedOxygen}
                      showPathogenicOnly={showPathogenicOnly}
                      onPathogenicChange={setShowPathogenicOnly}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <div className="hidden lg:block lg:col-span-1">
                <OrganismFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedGramStains={selectedGramStains}
                  onGramStainChange={setSelectedGramStains}
                  selectedShapes={selectedShapes}
                  onShapeChange={setSelectedShapes}
                  selectedOxygen={selectedOxygen}
                  onOxygenChange={setSelectedOxygen}
                  showPathogenicOnly={showPathogenicOnly}
                  onPathogenicChange={setShowPathogenicOnly}
                  onClearFilters={clearFilters}
                />
              </div>
              <div className="lg:col-span-3">
                {filteredOrganisms.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredOrganisms.map((organism) => (
                      <OrganismCard key={organism.id} organism={organism} onSelect={handleSelectOrganism} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">No organisms match your filters</p>
                    <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="by-sample">
            <div className="space-y-8">
              {sampleTypeView.map(({ sampleType, organisms }) => (
                <Card key={sampleType} className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{sampleTypeIcons[sampleType] || "🧪"}</span>
                      {sampleType}
                      <Badge variant="secondary" className="ml-2">{organisms.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {organisms.map((organism) => (
                        <OrganismCard key={organism.id} organism={organism} onSelect={handleSelectOrganism} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="taxonomy">
            <TaxonomyBrowser onSelectOrganism={handleSelectOrganism} />
          </TabsContent>
        </Tabs>

        <OrganismDetail
          organism={selectedOrganism}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Database;
