import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });

  const { data, error } = await supabase
    .from("newsletter")
    .update({ confirmed: false })
    .eq("unsubscribe_token", token);

  if (error) return new Response("Error", { status: 500 });
  return new Response("You have been unsubscribed. Thank you.", { status: 200 });
});
