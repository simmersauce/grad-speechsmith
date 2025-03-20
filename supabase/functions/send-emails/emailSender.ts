
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createSummaryEmailHTML, createSpeechEmails } from "./emailTemplates.ts";

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
export const resend = new Resend(resendApiKey);

// Send all emails (summary and individual speeches)
export async function sendAllEmails(email: string, formData: any, speechVersions: any[], customerReference: string) {
  console.log(`Starting email sending process to ${email} with reference ${customerReference}`);
  
  // Verify API key is properly set
  if (!resendApiKey || resendApiKey.length < 10) {
    console.error("Invalid Resend API key:", resendApiKey ? `${resendApiKey.slice(0, 3)}...` : "empty");
    throw new Error("Email service configuration error: Invalid API key");
  }
  
  console.log(`Using Resend API key ending with: ${resendApiKey.slice(-4)}`);
  console.log(`Number of speech versions to send: ${speechVersions.length}`);
  
  // Create the main email HTML with all speech summaries
  const summaryEmailHTML = createSummaryEmailHTML(speechVersions, formData, customerReference);
  
  // Create the email objects for individual speeches
  const speechEmails = createSpeechEmails(speechVersions, email, formData, customerReference);
  
  try {
    // Send the main email summary first
    console.log("Sending main summary email...");
    const mainEmailPayload = {
      from: "Graduation Speech Writer <speeches@resend.dev>",
      to: [email],
      subject: `Your Graduation Speech Drafts - Reference: ${customerReference}`,
      html: summaryEmailHTML,
    };
    
    console.log("Main email payload:", JSON.stringify({
      from: mainEmailPayload.from,
      to: mainEmailPayload.to,
      subject: mainEmailPayload.subject,
      htmlLength: mainEmailPayload.html.length
    }));
    
    const mainEmailResult = await resend.emails.send(mainEmailPayload);
    
    console.log("Main email result:", JSON.stringify(mainEmailResult));
    
    if (mainEmailResult.error) {
      throw new Error(`Failed to send main email: ${JSON.stringify(mainEmailResult.error)}`);
    }
    
    console.log("Main email sent successfully. ID:", mainEmailResult.id);
    
    // Then send each individual speech as a separate email
    console.log(`Sending ${speechEmails.length} individual speech emails...`);
    
    const speechEmailPromises = speechEmails.map((speechEmail, index) => {
      console.log(`Preparing to send speech email ${index + 1}...`);
      console.log("Speech email payload:", JSON.stringify({
        from: speechEmail.from,
        to: speechEmail.to,
        subject: speechEmail.subject,
        htmlLength: speechEmail.html.length
      }));
      return resend.emails.send(speechEmail);
    });
    
    // Wait for all emails to be sent
    const speechEmailResults = await Promise.all(speechEmailPromises);
    
    // Log results for each email
    speechEmailResults.forEach((result, index) => {
      if (result.error) {
        console.error(`Error sending speech email ${index + 1}:`, JSON.stringify(result.error));
      } else {
        console.log(`Speech email ${index + 1} sent successfully. ID:`, result.id);
      }
    });
    
    const successCount = speechEmailResults.filter(result => !result.error).length;
    console.log(`${successCount} out of ${speechEmailResults.length} speech emails sent successfully`);
    
    // Check if all emails were successful
    const allSuccessful = speechEmailResults.every(result => !result.error);
    
    return {
      success: allSuccessful,
      mainEmail: mainEmailResult,
      speechEmails: speechEmailResults,
      totalEmailsSent: 1 + successCount // Main email + successful speech emails
    };
  } catch (emailError: any) {
    console.error("Error sending emails via Resend:", emailError);
    throw new Error(`Email sending failed: ${emailError.message || "Unknown error"}`);
  }
}
