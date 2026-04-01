import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { organismDatabase } from "@/lib/organismData";
import { cn } from "@/lib/utils";

interface OrganismAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function OrganismAutocomplete({ value, onChange, placeholder, className }: OrganismAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allNames = organismDatabase.map((o) => o.name);

  useEffect(() => {
    if (value.length >= 1) {
      const q = value.toLowerCase();
      const matches = allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 10);
      setFiltered(matches);
      setOpen(matches.length > 0 && document.activeElement === inputRef.current);
    } else {
      setFiltered([]);
      setOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (filtered.length > 0) setOpen(true); }}
        placeholder={placeholder || "e.g., Staphylococcus aureus"}
        className={cn("italic", className)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover shadow-lg"
        >
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 text-sm italic hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
