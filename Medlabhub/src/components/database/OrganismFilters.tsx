import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { gramStainOptions, shapeOptions, oxygenOptions } from "@/lib/organismData";

interface OrganismFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedGramStains: string[];
  onGramStainChange: (values: string[]) => void;
  selectedShapes: string[];
  onShapeChange: (values: string[]) => void;
  selectedOxygen: string[];
  onOxygenChange: (values: string[]) => void;
  showPathogenicOnly: boolean;
  onPathogenicChange: (value: boolean) => void;
  onClearFilters: () => void;
}

export function OrganismFilters({
  searchQuery,
  onSearchChange,
  selectedGramStains,
  onGramStainChange,
  selectedShapes,
  onShapeChange,
  selectedOxygen,
  onOxygenChange,
  showPathogenicOnly,
  onPathogenicChange,
  onClearFilters,
}: OrganismFiltersProps) {
  const toggleFilter = (
    current: string[],
    value: string,
    onChange: (values: string[]) => void
  ) => {
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value));
    } else {
      onChange([...current, value]);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    selectedGramStains.length > 0 ||
    selectedShapes.length > 0 ||
    selectedOxygen.length > 0 ||
    showPathogenicOnly;

  return (
    <Card className="glass-card sticky top-20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search organisms..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Gram Stain */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Gram Stain</Label>
          <div className="space-y-2">
            {gramStainOptions.map((option) => (
              <Label
                key={option}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selectedGramStains.includes(option)}
                  onCheckedChange={() =>
                    toggleFilter(selectedGramStains, option, onGramStainChange)
                  }
                />
                {option}
              </Label>
            ))}
          </div>
        </div>

        {/* Cell Shape */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cell Shape</Label>
          <div className="space-y-2">
            {shapeOptions.map((option) => (
              <Label
                key={option}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selectedShapes.includes(option)}
                  onCheckedChange={() =>
                    toggleFilter(selectedShapes, option, onShapeChange)
                  }
                />
                {option}
              </Label>
            ))}
          </div>
        </div>

        {/* Oxygen Requirement */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Oxygen Requirement</Label>
          <div className="space-y-2">
            {oxygenOptions.map((option) => (
              <Label
                key={option}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selectedOxygen.includes(option)}
                  onCheckedChange={() =>
                    toggleFilter(selectedOxygen, option, onOxygenChange)
                  }
                />
                {option}
              </Label>
            ))}
          </div>
        </div>

        {/* Pathogenicity */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Pathogenicity</Label>
          <Label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={showPathogenicOnly}
              onCheckedChange={(checked) => onPathogenicChange(!!checked)}
            />
            Show pathogenic only
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
