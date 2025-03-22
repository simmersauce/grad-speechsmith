
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createEmailWithAttachments, createSpeechPDFContent } from "./emailTemplates.ts";

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
export const resend = new Resend(resendApiKey);

// Convert text to PDF format (simplified version since we can't generate PDFs directly)
const convertToPDF = (text: string) => {
  // This is a simplified approach - we're just using the text content
  // In a full implementation, you would use a PDF library or service
  // For now, we'll return base64 encoded text as a placeholder
  return Buffer.from(text).toString('base64');
};

// Send a single email with all speeches as PDF attachments
export async function sendEmailWithAttachments(email: string, formData: any, speechVersions: any[], customerReference: string) {
  console.log(`Starting email sending process to ${email} with reference ${customerReference}`);
  
  // Verify API key is properly set
  if (!resendApiKey || resendApiKey.length < 10) {
    console.error("Invalid Resend API key:", resendApiKey ? `${resendApiKey.slice(0, 3)}...` : "empty");
    throw new Error("Email service configuration error: Invalid API key");
  }
  
  console.log(`Using Resend API key ending with: ${resendApiKey.slice(-4)}`);
  console.log(`Number of speech versions to attach: ${speechVersions.length}`);
  
  try {
    // Prepare PDF content for each speech
    const enrichedSpeeches = speechVersions.map((speech, index) => {
      const pdfContent = createSpeechPDFContent(speech, index + 1, formData, customerReference);
      return {
        ...speech,
        pdfContent: convertToPDF(pdfContent)
      };
    });
    
    // Create the email with attachments
    const emailPayload = createEmailWithAttachments(enrichedSpeeches, email, formData, customerReference);
    
    console.log("Email payload:", JSON.stringify({
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      attachmentsCount: emailPayload.attachments?.length || 0
    }));
    
    // Send the email
    const emailResult = await resend.emails.send(emailPayload);
    
    console.log("Email result:", JSON.stringify(emailResult));
    
    if (emailResult.error) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailResult.error)}`);
    }
    
    console.log("Email sent successfully. ID:", emailResult.id);
    
    return {
      success: true,
      emailResult,
      totalAttachments: speechVersions.length
    };
  } catch (emailError: any) {
    console.error("Error sending email via Resend:", emailError);
    throw new Error(`Email sending failed: ${emailError.message || "Unknown error"}`);
  }
}
