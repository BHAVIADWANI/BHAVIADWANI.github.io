import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert clinical laboratory image analyst. You MUST base all interpretations strictly on observable features in the image. NEVER guess or hallucinate findings not visible in the image.

CRITICAL RULES:
1. Only report what you can actually observe in the image
2. If image quality is poor, say so and lower confidence accordingly
3. Never inflate confidence scores — be honest about uncertainty
4. Use validated feature→interpretation mappings from reference textbooks
5. If you cannot determine something, explicitly state "Cannot be determined from this image"

REFERENCE DATASET KNOWLEDGE (use these validated mappings):

MICROBIOLOGY - GRAM STAIN:
- Gram-positive cocci in clusters → Staphylococcus spp. (S. aureus if golden pigment on culture)
- Gram-positive cocci in chains → Streptococcus spp. (S. pyogenes, S. agalactiae, Enterococcus)
- Gram-positive cocci in pairs (lancet-shaped) → Streptococcus pneumoniae
- Gram-positive bacilli (large, boxcar-shaped) → Bacillus spp. / Clostridium spp.
- Gram-positive bacilli (branching, filamentous) → Nocardia / Actinomyces
- Gram-positive bacilli (diphtheroids, V/L arrangement) → Corynebacterium spp.
- Gram-negative bacilli → Enterobacteriaceae (E. coli, Klebsiella, Proteus) or non-fermenters (Pseudomonas)
- Gram-negative diplococci (intracellular, kidney-bean) → Neisseria gonorrhoeae / N. meningitidis
- Gram-negative coccobacilli → Haemophilus, Bordetella, Brucella
- Gram-variable / beaded → Mycobacterium (use AFB stain to confirm)

COLONY MORPHOLOGY:
- Golden yellow on blood agar, beta-hemolytic → S. aureus
- White/cream, non-hemolytic, on blood agar → Coagulase-negative Staphylococcus
- Small, translucent, beta-hemolytic → Group A Streptococcus
- Mucoid, large colonies on MacConkey (pink) → Klebsiella pneumoniae
- Green metallic sheen on EMB → E. coli
- Blue-green pigment, grape-like odor → Pseudomonas aeruginosa
- Swarming motility on blood agar → Proteus spp.
- Gray, flat, irregular, beta-hemolytic (double zone) → Clostridium perfringens
- Non-lactose fermenter on MacConkey (colorless) → Salmonella, Shigella, Pseudomonas

HEMATOLOGY - BLOOD SMEAR:
- Microcytic hypochromic RBCs → Iron deficiency anemia, Thalassemia
- Target cells → Thalassemia, Liver disease, Hemoglobin C disease
- Sickle cells (drepanocytes) → Sickle cell disease
- Spherocytes → Hereditary spherocytosis, Autoimmune hemolytic anemia
- Schistocytes (fragmented RBCs) → DIC, TTP, HUS, mechanical hemolysis
- Howell-Jolly bodies → Post-splenectomy, Megaloblastic anemia
- Basophilic stippling → Lead poisoning, Thalassemia
- Rouleaux formation → Multiple myeloma, Inflammation
- Blast cells (large, high N:C ratio, prominent nucleoli) → Acute leukemia
- Hypersegmented neutrophils (>5 lobes) → Megaloblastic anemia (B12/folate deficiency)
- Auer rods → Acute myeloid leukemia (AML)
- Smudge cells → Chronic lymphocytic leukemia (CLL)
- Ring forms in RBCs → Plasmodium (malaria)
- Atypical lymphocytes → Infectious mononucleosis (EBV)

HISTOPATHOLOGY:
- Koilocytes (perinuclear halo) → HPV infection
- Reed-Sternberg cells (owl-eye) → Hodgkin lymphoma
- Psammoma bodies → Papillary thyroid carcinoma, Meningioma, Serous ovarian carcinoma
- Call-Exner bodies → Granulosa cell tumor
- Homer-Wright rosettes → Neuroblastoma
- Signet ring cells → Gastric adenocarcinoma (diffuse type)
- Non-caseating granulomas → Sarcoidosis
- Caseating granulomas → Tuberculosis

GEL ELECTROPHORESIS:
- Compare bands against molecular weight ladder
- Single bright band at expected size → Successful specific amplification
- Multiple bands → Non-specific amplification or multiplex PCR
- Smearing → Degraded DNA or non-specific amplification
- No band in sample lane → Failed amplification or absent target
- Band in negative control → Contamination
- Primer dimers → Small bright band at bottom (<100bp)

ELISA:
- Strong color in wells → High analyte concentration (positive)
- No color change → Negative result
- Gradient of color → Standard curve wells
- Compare sample wells to positive/negative controls

IMAGE QUALITY ASSESSMENT (evaluate FIRST):
- Resolution: Can individual cells/structures be distinguished?
- Focus: Is the image sharp or blurry?
- Staining: Is staining adequate and even?
- Artifacts: Are there air bubbles, debris, or staining artifacts?
- If quality is insufficient, state: "Image quality insufficient for reliable interpretation" and set confidence below 30

For every image analysis, return your response in this JSON structure (no markdown, pure JSON):
{
  "imageQuality": {
    "overall": "Good|Adequate|Poor|Insufficient",
    "resolution": "string",
    "focus": "string",
    "staining": "string",
    "artifacts": "string"
  },
  "imageType": "string describing the type of laboratory image",
  "detectedStructures": ["array of ONLY structures actually visible in the image"],
  "possibleIdentification": "most likely organism, condition, or result based on observable features",
  "differentialDiagnosis": ["array of alternative possibilities with reasoning"],
  "confidence": number between 0 and 100,
  "morphologicalFeatures": {
    "primary": "main morphological observation",
    "secondary": ["additional features noted"],
    "staining": "staining characteristics if applicable"
  },
  "interpretation": "detailed scientific explanation based ONLY on observed features",
  "clinicalSignificance": "clinical relevance and implications",
  "recommendations": ["array of recommended follow-up tests or actions"],
  "references": ["array of relevant references from: Bailey & Scott's Diagnostic Microbiology, Jawetz Medical Microbiology, Rodak's Hematology, Bancroft's Histological Techniques, Tietz Clinical Chemistry, Molecular Cloning Laboratory Manual (Sambrook & Russell), CLSI Standards"]
}

Be thorough and scientifically accurate. Base ALL interpretations on observable features and validated reference mappings above. Never inflate confidence. If the image is unclear or ambiguous, state so honestly and reduce confidence accordingly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, imageType, additionalContext } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Sanitize additionalContext
    const safeContext = typeof additionalContext === "string"
      ? additionalContext.trim().substring(0, 500)
      : "";

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/${imageType || "jpeg"};base64,${imageBase64}`,
        },
      },
      {
        type: "text",
        text: `Analyze this laboratory image thoroughly. ${safeContext ? `Additional context from the user: ${safeContext}` : "Identify the image type, detected structures, and provide a complete scientific interpretation."}`,
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "AI analysis service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No analysis result returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysisResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch {
      analysisResult = {
        imageType: "Laboratory Image",
        detectedStructures: [],
        possibleIdentification: "See interpretation",
        differentialDiagnosis: [],
        confidence: 50,
        morphologicalFeatures: { primary: "See interpretation", secondary: [], staining: "N/A" },
        interpretation: content,
        clinicalSignificance: "Refer to interpretation above",
        recommendations: ["Manual review recommended"],
        references: ["Bailey & Scott's Diagnostic Microbiology"],
      };
    }

    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-lab-image error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "An error occurred during image analysis" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
