
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purchaseId, email, formData, speechVersions, customerReference } = await req.json();
    
    console.log("Received email request for:", email);
    console.log("Purchase ID:", purchaseId);
    console.log("Customer reference:", customerReference);
    console.log("Speech versions count:", speechVersions?.length || 0);
    
    if (!email) {
      throw new Error("Email address is required");
    }
    
    if (!speechVersions || !Array.isArray(speechVersions) || speechVersions.length === 0) {
      throw new Error("Speech versions are required");
    }
    
    let reference;
    
    // Handle the case when we're in test mode (purchaseId is a string starting with "test-")
    if (typeof purchaseId === 'string' && purchaseId.startsWith('test-')) {
      console.log("Test mode detected, using provided customer reference");
      reference = customerReference || `GSW-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    } else {
      // Get the customer reference from the database
      try {
        const { data, error } = await supabase
          .from('speech_purchases')
          .select('customer_reference')
          .eq('id', purchaseId)
          .single();
          
        if (error) {
          console.error("Error fetching customer reference:", error);
          throw new Error("Could not fetch customer reference");
        }
        
        reference = data.customer_reference;
        console.log("Retrieved customer reference from database:", reference);
      } catch (error) {
        // If we can't get the reference from the database and it's provided in the request, use that
        if (customerReference) {
          reference = customerReference;
          console.log("Using provided customer reference:", reference);
        } else {
          console.error("Could not determine customer reference:", error);
          throw new Error("Could not determine customer reference");
        }
      }
    }
    
    if (!reference) {
      // Generate a fallback reference if none is available
      reference = `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      console.log("Generated fallback customer reference:", reference);
    }
    
    // Prepare the email content with all speech versions
    const speechListHTML = speechVersions.map((speech, index) => {
      return `
        <div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid #0070f3;">
          <h3 style="margin-top: 0;">Speech Version ${index + 1}: ${speech.tone || 'Standard'} Tone</h3>
          <p style="white-space: pre-wrap;">${speech.content.substring(0, 300)}...</p>
          <p><em>Full version available in the attached PDF</em></p>
        </div>
      `;
    }).join('');

    // Create the email HTML
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
          </div>
          <div class="content">
            <p>Dear ${formData?.name || 'Graduate'},</p>
            <p>Thank you for using our Graduation Speech Writer. We're excited to share your personalized speech drafts!</p>
            
            <h2>Your Customer Reference</h2>
            <p>Please save this reference number for future inquiries: <span class="reference">${reference}</span></p>
            
            <h2>Speech Previews</h2>
            ${speechListHTML}
            
            <p>Full versions of each speech are included in this email. You can save, print, and practice with them at your convenience.</p>
            
            <h2>Speech Details</h2>
            <ul>
              <li><strong>Institution:</strong> ${formData?.institution || 'Your institution'}</li>
              <li><strong>Graduation:</strong> ${formData?.graduationClass || 'Your graduation'}</li>
              <li><strong>Role:</strong> ${formData?.role || 'Graduate'}</li>
            </ul>
            
            <p>Congratulations on your achievement! We wish you all the best for your graduation ceremony and future endeavors.</p>
          </div>
          <div class="footer">
            <p>© 2024 Graduation Speech Writer | Customer Reference: ${reference}</p>
          </div>
        </body>
      </html>
    `;

    console.log(`Sending email to ${email} with reference ${reference}`);
    
    // Since we can't directly generate PDFs in Edge Functions,
    // we'll just include the full speech text in the email for now
    const fullSpeeches = speechVersions.map((speech, index) => {
      return {
        from: "Graduation Speech Writer <speeches@resend.dev>",
        to: [email],
        subject: `Graduation Speech Draft ${index + 1}: ${speech.tone || 'Standard'} Tone - Ref: ${reference}`,
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
                .speech { white-space: pre-wrap; line-height: 1.8; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Graduation Speech - Version ${index + 1}</h1>
                <p>Tone: ${speech.tone || 'Standard'}</p>
              </div>
              <div class="content">
                <div class="speech">${speech.content}</div>
              </div>
              <div class="footer">
                <p>© 2024 Graduation Speech Writer | Customer Reference: ${reference}</p>
              </div>
            </body>
          </html>
        `
      };
    });
    
    // Send the main email summary first
    const mainEmailResult = await resend.emails.send({
      from: "Graduation Speech Writer <speeches@resend.dev>",
      to: [email],
      subject: `Your Graduation Speech Drafts - Reference: ${reference}`,
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
        customerReference: reference,
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
    
  } catch (error) {
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
