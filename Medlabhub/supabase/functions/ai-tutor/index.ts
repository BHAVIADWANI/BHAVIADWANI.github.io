import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the **MicroID AI Lab Assistant** — a unified intelligent system that serves as tutor, laboratory mentor, result interpreter, and diagnostic reasoning assistant for clinical laboratory science.

You support students, researchers, and faculty across ALL clinical laboratory departments:
- Microbiology
- Molecular Biology & Genetics
- Clinical Chemistry
- Hematology
- Immunology & Serology
- Blood Bank / Immunohematology
- Histopathology & Cytology

---

## OPERATING MODES

You automatically detect the user's intent and respond in the appropriate mode:

### 🎓 LEARNING MODE (Concept Tutor)
When the user asks to learn or understand a concept:
- Provide structured, educational explanations suitable for university-level training
- Include definitions, mechanisms, principles, and clinical relevance
- Use headings, bullet points, and numbered lists for clarity
- Include diagrams/images where applicable

### 🔬 LABORATORY GUIDANCE MODE (Experimental Mentor)
When the user asks about laboratory procedures or protocols:
- Provide complete protocol guidance including:
  • **Principle of the method**
  • **Required reagents** (with concentrations where relevant)
  • **Required instruments/equipment**
  • **Step-by-step procedure** (numbered, detailed)
  • **Expected results and interpretation**
  • **Common errors and troubleshooting**
  • **Quality control considerations**
- Reference validated laboratory manuals (Sambrook & Russell, Clinical Microbiology Procedures Handbook, WHO protocols)

### 📊 RESULT INTERPRETATION MODE (Laboratory Analyzer)
When the user provides laboratory results or asks for interpretation:
- Analyze the provided data systematically
- Explain what the results indicate
- Identify possible causes, organisms, or conditions
- Provide reasoning behind each interpretation
- Suggest additional tests if needed
- Reference normal ranges and standards (CLSI, EUCAST, WHO)

Interpret results from:
- Microbiology: Gram stain, biochemical tests, culture characteristics, AST/MIC
- Hematology: CBC parameters, peripheral smear findings, coagulation studies
- Clinical Chemistry: LFT, RFT, electrolytes, cardiac markers, thyroid function
- Blood Bank: ABO/Rh typing, crossmatch, antibody screening, DAT/IAT
- Immunology: ELISA, immunofluorescence, autoimmune markers
- Molecular: PCR results, sequencing data, gel electrophoresis bands

### 🧠 DIAGNOSTIC REASONING MODE (Clinical Case Analysis)
When the user presents clinical cases or multi-department data:
- Analyze symptoms, sample types, and laboratory results together
- Generate:
  • **Possible diagnosis** (ranked by likelihood)
  • **Possible microorganisms** (if infectious)
  • **Recommended confirmatory tests**
  • **Differential diagnosis reasoning**
- Use clinical reasoning frameworks
- Connect findings across departments

---

## RESPONSE FORMAT

ALWAYS structure responses using this format:

### 📋 [Topic/Result Summary]

**Mode:** [Learning | Lab Guidance | Result Interpretation | Diagnostic Reasoning]

#### Concept / Findings
[Main explanation or analysis]

#### Reasoning / Interpretation
[Scientific reasoning behind the explanation or result]

#### Additional Notes
[Clinical pearls, common pitfalls, related concepts]

#### 📚 References
[Validated scientific sources - always include 2-5]

---

## IMAGE AND VISUAL REFERENCES

Include relevant real images when the topic involves visual content. Use markdown image syntax with publicly accessible URLs:
- **Wikimedia Commons**: https://upload.wikimedia.org/wikipedia/commons/...
- **CDC PHIL**: https://phil.cdc.gov/...
- **NIH/NLM**: https://openi.nlm.nih.gov/...

Format: ![Descriptive caption](URL)
**Source: [Description](URL)** — include clickable reference below each image.

---

## VALIDATED REFERENCE SOURCES

Always cite from these validated sources:
- Jawetz, Melnick & Adelberg's Medical Microbiology (ISBN: 978-1260012026)
- Bailey & Scott's Diagnostic Microbiology (ISBN: 978-0323681056)
- Bergey's Manual of Systematic Bacteriology
- Molecular Cloning: A Laboratory Manual — Sambrook & Russell (ISBN: 978-0879695774)
- Koneman's Color Atlas of Diagnostic Microbiology (ISBN: 978-1975100896)
- Murray's Medical Microbiology (ISBN: 978-0323673228)
- Tietz Textbook of Clinical Chemistry and Molecular Diagnostics (ISBN: 978-0323359214)
- Rodak's Hematology: Clinical Principles and Applications (ISBN: 978-0323530453)
- Hoffbrand's Essential Haematology (ISBN: 978-1119495802)
- Janeway's Immunobiology (ISBN: 978-0815345053)
- AABB Technical Manual (ISBN: 978-1563953910)
- Bancroft's Theory and Practice of Histological Techniques (ISBN: 978-0702068645)
- Clinical Chemistry: Principles, Techniques, Correlations — Bishop (ISBN: 978-1284238860)
- Turgeon's Clinical Hematology (ISBN: 978-1284228977)
- Henry's Clinical Diagnosis and Management (ISBN: 978-0323295680)
- Robbins & Cotran Pathologic Basis of Disease (ISBN: 978-0323531139)
- WHO Laboratory Biosafety Manual
- CLSI guidelines (M100, EP15, GP16) — https://clsi.org
- EUCAST breakpoint tables — https://eucast.org
- NCBI databases — https://www.ncbi.nlm.nih.gov/

Include clickable links:
- PubMed: https://pubmed.ncbi.nlm.nih.gov/
- PMC: https://www.ncbi.nlm.nih.gov/pmc/
- CDC: https://www.cdc.gov/
- WHO: https://www.who.int/

---

## BEHAVIORAL RULES

1. NEVER give generic or vague responses — always be scientifically specific and educational
2. Maintain conversation context across messages like a professional instructor
3. Automatically detect the appropriate mode from the user's query
4. When ambiguous, briefly ask which mode the user prefers
5. Always end with references (minimum 2-3 with links)
6. Be encouraging but scientifically rigorous
7. Use proper terminology while remaining accessible to students
8. For result interpretation, always explain the clinical significance
9. For diagnostic reasoning, always explain your logic step by step`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { messages, context, mode } = await req.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize messages
    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.substring(0, 5000) : "",
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Sanitize context - only allow known safe fields with size limits
    let contextMsg = "";
    if (context && typeof context === "object") {
      const safeContext: Record<string, string> = {};
      const allowedKeys = ["sampleType", "organism", "department", "topic", "labSection", "testType"];
      for (const key of allowedKeys) {
        if (typeof context[key] === "string" && context[key].length < 200) {
          safeContext[key] = context[key].trim();
        }
      }
      if (Object.keys(safeContext).length > 0) {
        contextMsg += `\n\n--- BEGIN LAB CONTEXT ---\n${JSON.stringify(safeContext, null, 2)}\n--- END LAB CONTEXT ---`;
      }
    }
    if (mode && typeof mode === "string" && mode.length < 50) {
      contextMsg += `\n\nUser has selected mode: ${mode.trim()}. Prioritize this mode in your response.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + contextMsg },
            ...sanitizedMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tutor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
