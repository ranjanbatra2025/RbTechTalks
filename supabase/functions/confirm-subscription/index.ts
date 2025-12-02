// supabase/functions/confirm-subscription/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return new Response("Missing token", { status: 400 });

    const { data, error } = await supabase
      .from("newsletter")
      .update({ confirmed: true })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle();

    if (error) {
      console.error("confirm error:", error);
      return new Response("Error confirming subscription", { status: 500 });
    }

    if (!data) {
      return new Response("Invalid token or subscriber not found", { status: 404 });
    }

    // You can return an HTML success page
    const html = `<html><body><h1>Subscription Confirmed</h1><p>Thanks — ${data.email} is now confirmed for RBTechTalks.</p></body></html>`;
    return new Response(html, { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("Unexpected confirm error", err);
    return new Response("Server error", { status: 500 });
  }
});
