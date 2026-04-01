import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation
const ORGANISM_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9\s\-\.()\/]+$/;
const MAX_ORGANISM_NAME_LENGTH = 100;
const VALID_IMAGE_TYPES = ["gram_stain", "colony_morphology", "infection", "biochemical"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { organismName, imageType, regenerate } = await req.json();

    // Validate organism name
    if (!organismName || typeof organismName !== "string") {
      return new Response(
        JSON.stringify({ error: "organismName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedName = organismName.trim();
    if (trimmedName.length > MAX_ORGANISM_NAME_LENGTH || !ORGANISM_NAME_PATTERN.test(trimmedName)) {
      return new Response(
        JSON.stringify({ error: "Invalid organism name format. Use only letters, numbers, spaces, hyphens, dots, and parentheses." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image type
    if (!imageType || !VALID_IMAGE_TYPES.includes(imageType)) {
      return new Response(
        JSON.stringify({ error: `Invalid imageType. Valid types: ${VALID_IMAGE_TYPES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for storage operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if image already exists in storage
    const safeName = trimmedName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const filePath = `${safeName}/${imageType}.png`;

    if (!regenerate) {
      const { data: listData } = await supabase.storage
        .from("organism-images")
        .list(safeName, { search: `${imageType}.png` });

      if (listData && listData.length > 0) {
        const { data: publicUrl } = supabase.storage
          .from("organism-images")
          .getPublicUrl(filePath);
        
        return new Response(
          JSON.stringify({ imageUrl: publicUrl.publicUrl, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate image prompt based on type (using sanitized name)
    const prompts: Record<string, string> = {
      gram_stain: `Photorealistic microscopy image of ${trimmedName} under oil immersion (1000x magnification) showing Gram stain. The image should look like a real clinical microbiology laboratory photograph from a textbook like Rakesh Patel's Experimental Microbiology or Koneman's Color Atlas. Show the characteristic morphology, arrangement, and staining pattern clearly against the background. Crystal violet purple for Gram-positive, safranin pink/red for Gram-negative. Professional microscopy lighting with realistic depth of field. Ultra high resolution laboratory photograph.`,
      
      colony_morphology: `Photorealistic photograph of ${trimmedName} colonies growing on agar plate in a clinical microbiology laboratory. Show characteristic colony morphology including size, shape, color, texture, elevation, margin, and opacity. The image should look like a real photograph from a microbiology textbook like Bailey & Scott's Diagnostic Microbiology or Rakesh Patel's Experimental Microbiology. Show the agar plate with realistic lighting and colors. Include characteristic pigmentation if applicable. Ultra high resolution laboratory photograph.`,
      
      infection: `Photorealistic clinical photograph showing a typical infection caused by ${trimmedName}. The image should look like a clinical case presentation from a medical microbiology textbook like Jawetz Medical Microbiology or Murray's Medical Microbiology. Show the characteristic clinical presentation, lesions, or tissue changes associated with this pathogen. Professional medical photography style. Educational medical image suitable for clinical microbiology training. Ultra high resolution.`,
      
      biochemical: `Photorealistic photograph of biochemical test results for ${trimmedName} in a clinical microbiology laboratory. Show characteristic biochemical test tubes or plates with color reactions typical of this organism. Include tests like TSI, IMViC, urease, or specific identification media. The image should look like a real photograph from Rakesh Patel's Experimental Microbiology textbook or Koneman's atlas. Professional laboratory photography. Ultra high resolution.`,
    };

    const prompt = prompts[imageType];

    console.log(`Generating ${imageType} image for ${trimmedName} (user: ${user.id})`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image in AI response");
      return new Response(
        JSON.stringify({ error: "AI did not return an image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data and upload to storage
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("organism-images")
      .upload(filePath, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ imageUrl: imageData, cached: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from("organism-images")
      .getPublicUrl(filePath);

    console.log(`Successfully generated and cached ${imageType} for ${trimmedName}`);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl.publicUrl, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
