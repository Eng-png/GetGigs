import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization.");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase function is not configured.");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: caller, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller.user) throw new Error("Invalid session.");

    const { data: profile, error: profileError } = await adminClient
      .from("profiles").select("role").eq("id", caller.user.id).single();
    if (profileError || profile?.role !== "admin") throw new Error("Administrator access required.");

    const body = await request.json() as { userId?: string };
    if (!body.userId) throw new Error("userId is required.");
    if (body.userId === caller.user.id) throw new Error("An administrator cannot delete their own account.");

    const { error } = await adminClient.auth.admin.deleteUser(body.userId);
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Could not delete user." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
