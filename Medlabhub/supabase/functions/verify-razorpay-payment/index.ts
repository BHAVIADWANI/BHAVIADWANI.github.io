import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    const { paymentId, planType } = await req.json();

    if (!paymentId || !planType) {
      return new Response(
        JSON.stringify({ error: "paymentId and planType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["standard", "premium"].includes(planType)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expectedAmount = planType === "standard" ? 5000 : 10000; // in paise

    // Verify payment with Razorpay API
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    const rzpBody = await rzpResponse.text();

    if (!rzpResponse.ok) {
      console.error("Razorpay API error:", rzpBody);
      return new Response(
        JSON.stringify({ error: "Payment not found on Razorpay. Please check your Payment ID.", verified: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payment = JSON.parse(rzpBody);

    // Verify payment status
    if (payment.status !== "captured") {
      return new Response(
        JSON.stringify({
          error: `Payment status is "${payment.status}". Only captured payments can activate subscriptions.`,
          verified: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify amount
    if (payment.amount < expectedAmount) {
      return new Response(
        JSON.stringify({
          error: `Payment amount ₹${payment.amount / 100} does not match the ${planType} plan (₹${expectedAmount / 100}).`,
          verified: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to update subscription and payment record
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this payment ID was already used
    const { data: existingPayment } = await adminSupabase
      .from("payment_records")
      .select("id")
      .eq("payment_reference", paymentId)
      .eq("activation_status", "verified")
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: "This payment ID has already been used to activate a subscription.", verified: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Insert payment record
    await adminSupabase.from("payment_records").insert({
      user_id: userId,
      email: userEmail,
      plan_type: planType,
      payment_reference: paymentId,
      activation_status: "verified",
      verification_code_used: true,
    });

    // Update subscription
    await adminSupabase
      .from("subscriptions")
      .update({
        plan: planType,
        status: "active",
        start_date: now,
        expiry_date: expiryDate,
      })
      .eq("user_id", userId);

    console.log(`Subscription activated: user=${userEmail}, plan=${planType}, razorpay=${paymentId}`);

    return new Response(
      JSON.stringify({
        verified: true,
        plan: planType,
        expiryDate,
        message: `${planType} plan activated successfully!`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error verifying payment:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", verified: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
