
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

// Generate a unique customer reference if one isn't provided
const generateCustomerReference = () => {
  return `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purchaseId, email, formData, speechVersions, customerReference: providedReference } = await req.json();
    
    console.log("Received email request for:", email);
    console.log("Purchase ID:", purchaseId);
    console.log("Provided customer reference:", providedReference);
    console.log("Speech versions count:", speechVersions?.length || 0);
    
    if (!email) {
      throw new Error("Email address is required");
    }
    
    if (!speechVersions || !Array.isArray(speechVersions) || speechVersions.length === 0) {
      throw new Error("Speech versions are required");
    }
    
    // Determine the customer reference
    let customerReference;
    
    // Use provided reference if available
    if (providedReference && typeof providedReference === 'string' && providedReference.trim() !== '') {
      customerReference = providedReference;
      console.log("Using provided customer reference:", customerReference);
    } 
    // Check if we have a test mode purchase ID
    else if (typeof purchaseId === 'string' && purchaseId.startsWith('test-')) {
      customerReference = `GSW-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      console.log("Test mode detected, generated reference:", customerReference);
    } 
    // Try to get reference from database
    else {
      try {
        const { data, error } = await supabase
          .from('speech_purchases')
          .select('customer_reference')
          .eq('id', purchaseId)
          .single();
          
        if (error) {
          console.error("Error fetching customer reference:", error);
          customerReference = generateCustomerReference();
          console.log("Generated new reference after DB error:", customerReference);
        } else if (data && data.customer_reference) {
          customerReference = data.customer_reference;
          console.log("Retrieved customer reference from database:", customerReference);
        } else {
          customerReference = generateCustomerReference();
          console.log("Generated new reference (no DB data):", customerReference);
        }
      } catch (error) {
        console.error("Could not determine customer reference:", error);
        customerReference = generateCustomerReference();
        console.log("Generated new reference after exception:", customerReference);
      }
    }
    
    if (!customerReference) {
      customerReference = generateCustomerReference();
      console.log("Using fallback generated reference:", customerReference);
    }
    
    // Prepare the email content with all speech versions
    const speechListHTML = speechVersions.map((speech, index) => {
      return `
        <div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid #0070f3;">
          <h3 style="margin-top: 0;">Speech Version ${index + 1}: ${speech.tone || 'Standard'} Tone</h3>
          <p style="white-space: pre-wrap;">${speech.content.substring(0, 300)}...</p>
          <p><em>Full version available in the following emails</em></p>
        </div>
      `;
    }).join('');

    // Create the main email HTML
    const emailHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
            .highlight { color: #0070f3; }
            .reference { font-family: monospace; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Graduation Speech Drafts</h1>
            <p><strong>Reference: ${customerReference}</strong></p>
          </div>
          <div class="content">
            <p>Dear ${formData?.name || 'Graduate'},</p>
            <p>Thank you for using our Graduation Speech Writer. We're excited to share your personalized speech drafts!</p>
            
            <h2>Your Customer Reference</h2>
            <p>Please save this reference number for future inquiries: <span class="reference">${customerReference}</span></p>
            
            <h2>Speech Previews</h2>
            ${speechListHTML}
            
            <p>Full versions of each speech are included in separate emails that follow this one. You can save, print, and practice with them at your convenience.</p>
            
            <h2>Speech Details</h2>
            <ul>
              <li><strong>Institution:</strong> ${formData?.institution || 'Your institution'}</li>
              <li><strong>Graduation:</strong> ${formData?.graduationClass || 'Your graduation'}</li>
              <li><strong>Role:</strong> ${formData?.role || 'Graduate'}</li>
            </ul>
            
            <p>Congratulations on your achievement! We wish you all the best for your graduation ceremony and future endeavors.</p>
          </div>
          <div class="footer">
            <p>© 2024 Graduation Speech Writer | Customer Reference: ${customerReference}</p>
          </div>
        </body>
      </html>
    `;

    console.log(`Sending main email to ${email} with reference ${customerReference}`);
    
    // Full speech emails with the full speech text
    const fullSpeeches = speechVersions.map((speech, index) => {
      return {
        from: `Graduation Speech Writer <speeches@resend.dev>`,
        to: [email],
        subject: `Graduation Speech Draft ${index + 1}: ${speech.tone || 'Standard'} Tone - Ref: ${customerReference}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
                .speech { white-space: pre-wrap; line-height: 1.8; }
                .reference { font-family: monospace; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Graduation Speech - Version ${index + 1}</h1>
                <p>Tone: ${speech.tone || 'Standard'}</p>
                <p><strong>Reference: ${customerReference}</strong></p>
              </div>
              <div class="content">
                <p>Dear ${formData?.name || 'Graduate'},</p>
                <p>Here is the full text of your graduation speech (version ${index + 1}):</p>
                <div class="speech">${speech.content}</div>
              </div>
              <div class="footer">
                <p>© 2024 Graduation Speech Writer | Customer Reference: ${customerReference}</p>
              </div>
            </body>
          </html>
        `
      };
    });
    
    try {
      // Send the main email summary first
      const mainEmailResult = await resend.emails.send({
        from: "Graduation Speech Writer <speeches@resend.dev>",
        to: [email],
        subject: `Your Graduation Speech Drafts - Reference: ${customerReference}`,
        html: emailHTML,
      });
      
      console.log("Main email sent successfully:", mainEmailResult);
      
      // Then send each individual speech as a separate email
      const speechEmailPromises = fullSpeeches.map(speechEmail => 
        resend.emails.send(speechEmail)
      );
      
      // Wait for all emails to be sent
      const speechEmailResults = await Promise.all(speechEmailPromises);
      console.log(`All ${speechEmailResults.length} speech emails sent successfully`);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Emails sent successfully",
          customerReference: customerReference,
          emailResults: {
            main: mainEmailResult,
            speeches: speechEmailResults
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (emailError: any) {
      console.error("Error sending emails via Resend:", emailError);
      throw new Error(`Email sending failed: ${emailError.message || "Unknown error"}`);
    }
    
  } catch (error: any) {
    console.error("Error in send-emails function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send emails" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
