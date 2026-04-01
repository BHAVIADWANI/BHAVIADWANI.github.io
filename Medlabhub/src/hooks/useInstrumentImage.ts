import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getInstrumentStorageKey } from "@/lib/labInstrumentsData";

const BUCKET = "instrument-images";

// Cache to avoid repeated lookups
const urlCache = new Map<string, string | null>();

export function useInstrumentImage(instrumentName: string) {
  const storageKey = getInstrumentStorageKey(instrumentName);
  const [imageUrl, setImageUrl] = useState<string | null>(urlCache.get(storageKey) ?? null);
  const [loading, setLoading] = useState(!urlCache.has(storageKey));

  const fetchImage = useCallback(async () => {
    if (urlCache.has(storageKey)) {
      setImageUrl(urlCache.get(storageKey) ?? null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // List files matching the instrument key
      const { data } = await supabase.storage.from(BUCKET).list("", {
        search: storageKey,
        limit: 1,
      });

      if (data && data.length > 0) {
        const file = data.find(f => f.name.startsWith(storageKey));
        if (file) {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(file.name);
          urlCache.set(storageKey, urlData.publicUrl);
          setImageUrl(urlData.publicUrl);
          setLoading(false);
          return;
        }
      }

      urlCache.set(storageKey, null);
      setImageUrl(null);
    } catch {
      urlCache.set(storageKey, null);
      setImageUrl(null);
    }
    setLoading(false);
  }, [storageKey]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  const uploadImage = async (file: File): Promise<boolean> => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${storageKey}.${ext}`;

    // Delete any existing image first
    const { data: existingFiles } = await supabase.storage.from(BUCKET).list("", {
      search: storageKey,
    });
    if (existingFiles) {
      const toDelete = existingFiles
        .filter(f => f.name.startsWith(storageKey))
        .map(f => f.name);
      if (toDelete.length > 0) {
        await supabase.storage.from(BUCKET).remove(toDelete);
      }
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return false;
    }

    // Update cache and state
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);
    urlCache.set(storageKey, urlData.publicUrl);
    setImageUrl(urlData.publicUrl);
    return true;
  };

  const deleteImage = async (): Promise<boolean> => {
    const { data: existingFiles } = await supabase.storage.from(BUCKET).list("", {
      search: storageKey,
    });
    if (existingFiles) {
      const toDelete = existingFiles
        .filter(f => f.name.startsWith(storageKey))
        .map(f => f.name);
      if (toDelete.length > 0) {
        const { error } = await supabase.storage.from(BUCKET).remove(toDelete);
        if (error) return false;
      }
    }
    urlCache.set(storageKey, null);
    setImageUrl(null);
    return true;
  };

  return { imageUrl, loading, uploadImage, deleteImage, refetch: fetchImage };
}
