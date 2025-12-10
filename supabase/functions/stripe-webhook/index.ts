import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '')
  } catch (err) {
    return new Response(`Webhook signature verification failed.`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { course_id, user_id } = session.metadata ?? {}

    // Update enrollment to 'paid'
    await supabase
      .from('enrollments')
      .update({ status: 'paid' })
      .eq('stripe_session_id', session.id)
  }

  return new Response('ok', { status: 200 })
})