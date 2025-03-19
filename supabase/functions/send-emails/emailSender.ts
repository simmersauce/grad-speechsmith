
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createSummaryEmailHTML, createSpeechEmails } from "./emailTemplates.ts";

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
export const resend = new Resend(resendApiKey);

// Send all emails (summary and individual speeches)
export async function sendAllEmails(email: string, formData: any, speechVersions: any[], customerReference: string) {
  // Create the main email HTML with all speech summaries
  const summaryEmailHTML = createSummaryEmailHTML(speechVersions, formData, customerReference);
  
  // Create the email objects for individual speeches
  const speechEmails = createSpeechEmails(speechVersions, email, formData, customerReference);
  
  try {
    // Send the main email summary first
    const mainEmailResult = await resend.emails.send({
      from: "Graduation Speech Writer <speeches@resend.dev>",
      to: [email],
      subject: `Your Graduation Speech Drafts - Reference: ${customerReference}`,
      html: summaryEmailHTML,
    });
    
    console.log("Main email sent successfully:", mainEmailResult);
    
    // Then send each individual speech as a separate email
    const speechEmailPromises = speechEmails.map(speechEmail => 
      resend.emails.send(speechEmail)
    );
    
    // Wait for all emails to be sent
    const speechEmailResults = await Promise.all(speechEmailPromises);
    console.log(`All ${speechEmailResults.length} speech emails sent successfully`);
    
    return {
      success: true,
      mainEmail: mainEmailResult,
      speechEmails: speechEmailResults
    };
  } catch (emailError: any) {
    console.error("Error sending emails via Resend:", emailError);
    throw new Error(`Email sending failed: ${emailError.message || "Unknown error"}`);
  }
}
