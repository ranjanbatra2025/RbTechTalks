// supabase/functions/send-newsletter/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Required env vars
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
}
if (!RESEND_API_KEY) {
  console.warn("Warning: RESEND_API_KEY not set — emails will fail");
}

// Supabase server client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/** Helper: simple moustache-like replace for {{key}} */
function render(template: string, data: Record<string, string | undefined>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_m, key) => {
    const v = data[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

/** Load template files from template/ folder inside the function folder */
async function loadTemplateFiles() {
  const base = Deno.cwd() + "/template"; // CWD is function folder when deployed
  const htmlPath = base + "/newsletter-template.html";
  const textPath = base + "/newsletter-template.txt";
  const html = await Deno.readTextFile(htmlPath).catch(() => "");
  const text = await Deno.readTextFile(textPath).catch(() => "");
  return { html, text };
}

/** Send single email via Resend REST API */
async function sendEmailViaResend(message: {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  list_unsubscribe?: string;
}) {
  const body: Record<string, unknown> = {
    from: message.from,
    to: [message.to],
    subject: message.subject,
  };
  if (message.html) body.html = message.html;
  if (message.text) body.text = message.text;
  if (message.list_unsubscribe) {
    body["headers"] = { "List-Unsubscribe": `<${message.list_unsubscribe}>` };
  }

  const res = await fetch("https://api.resend.com/v1/emails", {
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

/** Main handler */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const subject = payload.subject || "RBTechTalks Newsletter";
    const injectedHtml = payload.html;
    const injectedText = payload.text;

    // Load templates from disk (or use injected payload templates)
    const templates = await loadTemplateFiles();
    const defaultHtmlTemplate = injectedHtml || templates.html || "<h1>Hi {{name}}</h1><p>No content</p>";
    const defaultTextTemplate = injectedText || templates.text || "Hi {{name}} — No content";

    // Fetch confirmed subscribers
    const { data: subscribers, error } = await supabase
      .from("newsletter")
      .select("email, name, unsubscribe_token")
      .eq("confirmed", true);

    if (error) {
      console.error("DB fetch error:", error);
      return new Response(JSON.stringify({ error: "Database error", detail: error.message }), { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No confirmed subscribers" }), { status: 200 });
    }

    // Batch size = concurrency (safe default)
    const BATCH_SIZE = 20;
    let sent = 0;
    let failed = 0;
    const errors: any[] = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const chunk = subscribers.slice(i, i + BATCH_SIZE);

      const promises = chunk.map(async (s: any) => {
        const toEmail = s.email;
        const name = s.name ?? "Developer";
        const unsubscribe_token = s.unsubscribe_token ?? "";
        const unsubscribe_url = `https://rbtechtalks.com/unsubscribe?token=${unsubscribe_token}`;

        const html = render(defaultHtmlTemplate, { name, unsubscribe_token });
        const text = render(defaultTextTemplate, { name, unsubscribe_token });

        try {
          const res = await sendEmailViaResend({
            from: "RBTechTalks <hello@rbtechtalks.com>",
            to: toEmail,
            subject,
            html,
            text,
            list_unsubscribe: unsubscribe_url,
          });
          if (res.ok) {
            return { ok: true, email: toEmail };
          } else {
            return { ok: false, email: toEmail, status: res.status, body: res.body };
          }
        } catch (e) {
          return { ok: false, email: toEmail, error: String(e) };
        }
      });

      const results = await Promise.all(promises);
      for (const r of results) {
        if (r.ok) sent++;
        else { failed++; errors.push(r); }
      }
    }

    return new Response(JSON.stringify({ success: true, total: subscribers.length, sent, failed, errors }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
