
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );

    console.log(`Received Stripe event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log("Processing completed checkout session:", session.id);
      
      // Get the formDataId from the session metadata
      const formDataId = session.metadata.formDataId;
      
      if (!formDataId) {
        throw new Error("No formDataId found in session metadata");
      }
      
      // Get the form data from our database
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_form_data')
        .select('*')
        .eq('id', formDataId)
        .single();
        
      if (pendingError) {
        console.error("Error retrieving pending form data:", pendingError);
        throw new Error("Failed to retrieve form data");
      }
      
      const formData = pendingData.form_data;
      const customerEmail = session.customer_email || pendingData.customer_email;
      
      console.log("Customer email:", customerEmail);
      
      // Save purchase information to database
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('speech_purchases')
        .insert({
          stripe_session_id: session.id,
          payment_status: 'completed',
          customer_email: customerEmail,
          amount_paid: session.amount_total / 100, // Convert from cents
          form_data: formData
        })
        .select();
          
      if (purchaseError) {
        console.error("Error saving purchase:", purchaseError);
        throw new Error("Failed to save purchase information");
      }
      
      console.log("Purchase saved successfully:", purchaseData[0].id);
      
      // Generate the speeches using the generate-speeches endpoint
      try {
        const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-speeches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            formData,
            purchaseId: purchaseData[0].id,
            email: customerEmail
          })
        });
        
        if (!generateResponse.ok) {
          console.error("Failed to generate speeches:", await generateResponse.text());
        } else {
          console.log("Speeches generation triggered successfully");
        }
      } catch (generateError) {
        console.error("Error triggering speech generation:", generateError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in stripe-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook Error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
