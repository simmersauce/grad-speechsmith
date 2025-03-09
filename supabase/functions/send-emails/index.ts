
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, formData, speechVersions, purchaseId } = await req.json();

    console.log("Sending emails to:", email);
    console.log("For purchase ID:", purchaseId);
    
    // Generate HTML for speech versions
    let speechsHtml = '';
    
    speechVersions.forEach((speech, index) => {
      const versionLabel = speech.versionType.charAt(0).toUpperCase() + speech.versionType.slice(1);
      speechsHtml += `
        <div style="margin-bottom: 40px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4a5568; margin-bottom: 15px; font-size: 18px;">Speech Draft ${index + 1}: ${versionLabel} Version</h2>
          <p style="color: #718096; margin-bottom: 15px;">Tone: ${speech.tone.charAt(0).toUpperCase() + speech.tone.slice(1)}</p>
          <div style="white-space: pre-wrap; background-color: #f7fafc; padding: 15px; border-radius: 5px; font-family: Georgia, serif; line-height: 1.6;">${speech.content}</div>
        </div>
      `;
    });

    // Send email with all speech versions
    const emailResponse = await resend.emails.send({
      from: "Graduation Speech Writer <speeches@resend.dev>",
      to: [email],
      subject: `Your Graduation Speech Drafts - ${formData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Graduation Speech Drafts</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 20px;">
          <div style="max-width: 700px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d3748; margin-bottom: 10px;">Your Graduation Speech Drafts</h1>
              <p style="color: #718096;">Congratulations on your graduation, ${formData.name}!</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p>Dear ${formData.name},</p>
              <p>Thank you for using our Graduation Speech Writer! We're excited to provide you with three unique speech drafts for your upcoming graduation from ${formData.institution}.</p>
              <p>Each draft has a different tone and approach to help you find the perfect fit for your special day. Feel free to use these drafts as they are, combine elements from different versions, or use them as inspiration for your own speech.</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #2d3748; margin-bottom: 15px; text-align: center;">Your Speech Drafts</h2>
              ${speechsHtml}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; text-align: center;">
              <p>If you have any questions or need any modifications, please don't hesitate to contact us.</p>
              <p>Wishing you all the best for your graduation ceremony!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResponse.id
      }),
      { 
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
