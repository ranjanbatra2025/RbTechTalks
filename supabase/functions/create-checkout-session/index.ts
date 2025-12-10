// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14?target=denonext"  // Deno-compatible Stripe SDK

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
    const frontendUrl = Deno.env.get("FRONTEND_URL") ?? "http://localhost:8080"

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured")
    }

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeSecretKey)

    const { courseId, userId } = await req.json()

    if (!courseId) {
      throw new Error("courseId is required")
    }

    // 🔐 Require authenticated user for enrollment
    if (!userId) {
      throw new Error("You must be logged in to enroll in a course")
    }

    // Fetch course from DB
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("stripe_price_id, title")
      .eq("id", courseId)
      .single()

    if (fetchError) {
      console.error("Error fetching course:", fetchError)
      throw new Error("Failed to fetch course")
    }

    if (!course) {
      throw new Error("Course not found")
    }

    if (!course.stripe_price_id) {
      throw new Error("Missing Stripe price ID for this course")
    }

    // Get price details from Stripe to decide mode
    const price = await stripe.prices.retrieve(course.stripe_price_id)

    if (!price) {
      throw new Error("Stripe price not found")
    }

    const mode: "payment" | "subscription" = price.recurring ? "subscription" : "payment"

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/courses`,
      metadata: {
        course_id: String(courseId),
        user_id: userId,
        mode,
      },
    })

    // Create pending enrollment record
    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        course_id: courseId,
        user_id: userId,                 // 👈 no more null
        stripe_session_id: session.id,
        status: "pending",
      })

    if (enrollError) {
      console.error("Error creating enrollment:", enrollError)
      // 👇 send real DB error to client for debugging
      throw new Error(`Failed to create enrollment: ${enrollError.message}`)
    }

    // Return checkout URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error: any) {
    console.error("Edge Function Error:", error)

    return new Response(
      JSON.stringify({ error: error.message ?? "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})
