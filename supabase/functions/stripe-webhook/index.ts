import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received');
    
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response('Server configuration error', { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    let event;
    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook signature verified');
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event');
      
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session data:', JSON.stringify(session, null, 2));

      // Get the user ID from client_reference_id (this should be set when creating the checkout session)
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.error('No client_reference_id found in session');
        return new Response('No user ID found in session', { status: 400 });
      }

      // Initialize Supabase client with service role key
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Determine credits to add based on the amount paid
      // Assuming: 199 THB = 60 credits (as per the create-checkout-session function)
      const amountPaid = session.amount_total || 0; // Amount in smallest currency unit (satang for THB)
      let creditsToAdd = 0;

      if (amountPaid === 19900) { // 199 THB in satang
        creditsToAdd = 60;
      } else {
        // You can add more credit packages here
        console.log(`Unknown amount paid: ${amountPaid}, defaulting to 10 credits`);
        creditsToAdd = 10;
      }

      console.log(`Adding ${creditsToAdd} credits to user ${userId}`);

      // Update user credits in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return new Response('Error fetching user profile', { status: 500 });
      }

      const currentCredits = data?.credits || 0;
      const newCredits = currentCredits + creditsToAdd;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return new Response('Error updating user credits', { status: 500 });
      }

      console.log(`Successfully updated user ${userId} credits from ${currentCredits} to ${newCredits}`);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});