// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Check API Key
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing!");
    return new Response(
      JSON.stringify({ error: "Server configuration error: Missing API Key" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 3. Parse Request
    const { to, subject, html, text } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'subject' fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Send Email via Resend (Using Verified Domain)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RBTechTalks <hello@rbtechtalks.com>", // ✅ VERIFIED DOMAIN
        to: to,
        subject: subject,
        html: html || "<p></p>",
        text: text || "",
      }),
    });

    const data = await res.json();

    // 5. Handle Resend Errors Gracefully
    if (!res.ok) {
      console.error("Resend API Error:", data);
      return new Response(
        JSON.stringify({ 
          error: data.message || "Failed to send email", 
          name: data.name 
        }),
        { 
          status: res.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 6. Success
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Edge Function Crash:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});