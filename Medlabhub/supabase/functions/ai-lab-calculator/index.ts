import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    const { messages, explainMode } = await req.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const levelInstruction = explainMode === "researcher"
      ? "Explain at a professional research level. Use precise terminology, cite specific standards, and include advanced context."
      : "Explain clearly for a student. Use simple language, define technical terms, and include learning tips.";

    const systemPrompt = `You are Lab Intelligence — an AI-powered laboratory calculation assistant for MicroID. You specialize in validated scientific calculations across microbiology, molecular biology, clinical chemistry, hematology, immunology, and laboratory research.

BEHAVIOR:
1. AUTO-DETECT the calculation type from the user's natural language input.
2. Identify chemicals, concentrations, volumes, units, and parameters automatically.
3. If any information is missing, ask a specific follow-up question — never guess.
4. Always show: **Detected Parameters** → **Formula** → **Step-by-step** → **Final Result**
5. ${levelInstruction}

RULES:
- Only use validated scientific formulas from: CLSI, NABL, ISO 15189, WHO, Bailey & Scott, Jawetz, Sambrook & Russell, Tietz, Rodak
- Use proper scientific notation and units
- If a question is outside laboratory science, politely redirect
- Include the source/reference for each formula used
- Format responses with markdown for clarity
- When a chemical is mentioned, automatically use its molecular weight (e.g., NaCl = 58.44 g/mol)

CAPABILITIES:
- Molarity, normality, dilution (C1V1=C2V2)
- Buffer preparation (Henderson-Hasselbalch)
- CFU calculations, serial dilutions
- DNA/RNA concentration from absorbance (A260)
- PCR master mix calculations
- Hematology indices (MCV, MCH, MCHC, reticulocyte count)
- Enzyme activity, Beer-Lambert law
- Culture media preparation
- Solution preparation
- Unit conversions (SI and conventional)
- Statistical calculations (mean, SD, CV%, t-test)

Always end with: "⚠️ Verify all calculations before laboratory use."`;

    // Sanitize messages
    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.substring(0, 5000) : "",
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizedMessages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to process.";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
