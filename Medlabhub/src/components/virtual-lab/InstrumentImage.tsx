import { useRef, useState } from "react";
import { useInstrumentImage } from "@/hooks/useInstrumentImage";
import { useAuth } from "@/contexts/AuthContext";
import { ImageOff, Loader2, Upload, Trash2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface InstrumentImageProps {
  instrumentName: string;
  size?: "sm" | "lg";
}

export function InstrumentImage({ instrumentName, size = "sm" }: InstrumentImageProps) {
  const { imageUrl, loading, uploadImage, deleteImage } = useInstrumentImage(instrumentName);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const success = await uploadImage(file);
    setUploading(false);

    if (success) {
      toast.success(`Image uploaded for ${instrumentName}`);
    } else {
      toast.error("Failed to upload image. Make sure you're signed in.");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    setUploading(true);
    const success = await deleteImage();
    setUploading(false);
    if (success) {
      toast.success("Image removed");
    } else {
      toast.error("Failed to remove image");
    }
  };

  if (loading) {
    return (
      <div className={`${size === "sm" ? "w-12 h-12" : "w-full h-48"} rounded-md bg-muted flex items-center justify-center`}>
        <Loader2 className={`${size === "sm" ? "h-4 w-4" : "h-6 w-6"} animate-spin text-muted-foreground`} />
      </div>
    );
  }

  // Small thumbnail
  if (size === "sm") {
    return imageUrl ? (
      <img
        src={imageUrl}
        alt={instrumentName}
        className="w-12 h-12 object-cover rounded-md"
        loading="lazy"
      />
    ) : (
      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
        <ImageOff className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  // Large view with upload controls
  return (
    <div className="space-y-2">
      {imageUrl ? (
        <>
          <div
            className="w-full h-48 rounded-md bg-muted/30 border cursor-pointer hover:opacity-90 transition-opacity relative group"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={imageUrl}
              alt={instrumentName}
              className="w-full h-full object-contain rounded-md"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
            </div>
          </div>

          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{instrumentName}</DialogTitle>
              </DialogHeader>
              <img
                src={imageUrl}
                alt={instrumentName}
                className="w-full max-h-[70vh] object-contain rounded-md"
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="w-full h-48 rounded-md bg-muted flex flex-col items-center justify-center gap-1 border border-dashed border-muted-foreground/30">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">No image uploaded</span>
        </div>
      )}

      {/* Owner controls */}
      {user && (
        <div className="flex gap-1">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] h-7 gap-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {imageUrl ? "Replace" : "Upload"}
          </Button>
          {imageUrl && (
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 gap-1 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={uploading}
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
