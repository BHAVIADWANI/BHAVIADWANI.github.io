import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Microscope, Bug, FlaskConical, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrganismImageGalleryProps {
  organismName: string;
}

const IMAGE_TYPES = [
  { key: "gram_stain", label: "Gram Stain", icon: Microscope, description: "Oil immersion microscopy (1000x)" },
  { key: "colony_morphology", label: "Colony Morphology", icon: Camera, description: "Agar plate culture appearance" },
  { key: "infection", label: "Clinical Infection", icon: Bug, description: "Typical infection presentation" },
  { key: "biochemical", label: "Biochemical Tests", icon: FlaskConical, description: "Characteristic test reactions" },
] as const;

type ImageType = typeof IMAGE_TYPES[number]["key"];

export function OrganismImageGallery({ organismName }: OrganismImageGalleryProps) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // On mount, check storage for existing cached images
  useEffect(() => {
    const safeName = organismName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const checkCached = async () => {
      const found: Record<string, string> = {};
      const { data: files } = await supabase.storage
        .from("organism-images")
        .list(safeName);

      if (files && files.length > 0) {
        for (const type of IMAGE_TYPES) {
          const match = files.find((f) => f.name === `${type.key}.png`);
          if (match) {
            const { data: publicUrl } = supabase.storage
              .from("organism-images")
              .getPublicUrl(`${safeName}/${type.key}.png`);
            found[type.key] = publicUrl.publicUrl + `?t=${match.updated_at}`;
          }
        }
      }
      setImages(found);
      setInitialLoading(false);
    };
    checkCached();
  }, [organismName]);

  const generateImage = async (imageType: ImageType) => {
    setLoading((prev) => ({ ...prev, [imageType]: true }));
    setErrors((prev) => ({ ...prev, [imageType]: "" }));

    try {
      const { data, error } = await supabase.functions.invoke("generate-organism-image", {
        body: { organismName, imageType, regenerate: !!images[imageType] },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.imageUrl) {
        setImages((prev) => ({ ...prev, [imageType]: data.imageUrl + `?t=${Date.now()}` }));
      }
    } catch (e: any) {
      console.error(`Error generating ${imageType}:`, e);
      setErrors((prev) => ({ ...prev, [imageType]: e.message || "Failed to generate" }));
    } finally {
      setLoading((prev) => ({ ...prev, [imageType]: false }));
    }
  };

  const generateAll = async () => {
    for (const type of IMAGE_TYPES) {
      if (!images[type.key]) {
        await generateImage(type.key);
      }
    }
  };

  const hasAnyMissing = IMAGE_TYPES.some((t) => !images[t.key]);

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            📸 Reference Images
          </CardTitle>
          {hasAnyMissing && (
            <Button variant="outline" size="sm" onClick={generateAll} disabled={Object.values(loading).some(Boolean)}>
              {Object.values(loading).some(Boolean) ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
              ) : (
                "Generate Missing"
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          AI-generated reference images based on Rakesh Patel's Experimental Microbiology, Koneman's Atlas & Bailey & Scott's
        </p>
      </CardHeader>
      <CardContent>
        {initialLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading cached images...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {IMAGE_TYPES.map((type) => {
              const Icon = type.icon;
              const imageUrl = images[type.key];
              const isLoading = loading[type.key];
              const error = errors[type.key];

              return (
                <div key={type.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </div>
                    {imageUrl && !isLoading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Regenerate image"
                        onClick={() => generateImage(type.key)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="h-32 rounded-lg border flex flex-col items-center justify-center gap-2 bg-muted/50">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-[10px] text-muted-foreground">
                        {imageUrl ? "Regenerating..." : "Generating..."}
                      </span>
                    </div>
                  ) : imageUrl ? (
                    <div
                      className="relative rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`${organismName} - ${type.label}`}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                      <Badge variant="secondary" className="absolute bottom-1 right-1 text-[9px]">
                        AI Reference
                      </Badge>
                    </div>
                  ) : error ? (
                    <div className="h-32 rounded-lg border flex flex-col items-center justify-center gap-2 bg-destructive/5">
                      <span className="text-xs text-destructive text-center px-2">{error}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => generateImage(type.key)}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateImage(type.key)}
                      className="h-32 w-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Icon className="h-6 w-6 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground">{type.description}</span>
                      <span className="text-[10px] text-primary font-medium">Click to generate</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt={`${organismName} reference`}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
