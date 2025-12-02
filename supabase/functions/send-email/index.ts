// supabase/functions/send-email/index.ts (debug version)
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

async function sendViaResend(payload: { from: string; to: string; subject: string; html?: string; text?: string; headers?: Record<string,string> }) {
  const body: any = { from: payload.from, to: [payload.to], subject: payload.subject };
  if (payload.html) body.html = payload.html;
  if (payload.text) body.text = payload.text;
  if (payload.headers) body.headers = payload.headers;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, body: text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const payload = await req.json();
    const from = payload.from ?? "RBTechTalks <hello@rbtechtalks.com>";
    const to = payload.to;
    const subject = payload.subject;
    if (!to || !subject) return new Response(JSON.stringify({ error: "Missing to or subject" }), { status: 400 });

    const result = await sendViaResend({ from, to, subject, html: payload.html, text: payload.text, headers: payload.headers });
    console.log("Resend result:", result);

    if (!result.ok) {
      return new Response(JSON.stringify({ ok: false, status: result.status, body: result.body }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true, status: result.status, body: result.body }), { status: 200 });
  } catch (err) {
    console.error("send-email unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
