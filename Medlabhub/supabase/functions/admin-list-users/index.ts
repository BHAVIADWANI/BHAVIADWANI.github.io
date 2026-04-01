import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin role using service role client (bypasses RLS)
    const { data: roles } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    const isAdmin = roles && roles.length > 0;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Fetch all users from auth
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    // Fetch subscriptions and profiles
    const [{ data: subs }, { data: profiles }] = await Promise.all([
      adminClient.from("subscriptions").select("*"),
      adminClient.from("profiles").select("*"),
    ]);

    const enriched = (users || []).map((u: any) => {
      const sub = (subs || []).find((s: any) => s.user_id === u.id);
      const profile = (profiles || []).find((p: any) => p.user_id === u.id);
      return {
        user_id: u.id,
        email: u.email || "N/A",
        display_name: profile?.display_name || "—",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        plan: sub?.plan || "free",
        status: sub?.status || "active",
        start_date: sub?.start_date,
        expiry_date: sub?.expiry_date,
        sub_id: sub?.id,
      };
    });

    return new Response(JSON.stringify({ users: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
