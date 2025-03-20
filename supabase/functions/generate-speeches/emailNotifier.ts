
import { supabase } from "./database.ts";

// Trigger email sending after speeches are generated
export const sendEmailNotification = async (
  supabaseUrl: string,
  supabaseKey: string,
  purchaseId: string,
  email: string,
  formData: any,
  speechVersions: any[]
) => {
  try {
    console.log(`Sending email notification for purchase ${purchaseId} to ${email}`);
    console.log(`Found ${speechVersions.length} speech versions to send`);
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error("Invalid email address:", email);
      throw new Error("Invalid email address provided");
    }
    
    if (!speechVersions || speechVersions.length === 0) {
      console.error("No speech versions to send");
      throw new Error("No speech versions generated");
    }
    
    // Prepare speech versions to make sure they have all required fields
    const preparedSpeechVersions = speechVersions.map((speech, index) => ({
      id: speech.id || `speech-${index}`,
      content: speech.content || "",
      versionNumber: speech.versionNumber || index + 1,
      tone: speech.tone || "standard",
      versionType: speech.versionType || `Version ${index + 1}`
    }));
    
    console.log(`Calling send-emails function at ${supabaseUrl}/functions/v1/send-emails`);
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        purchaseId,
        email,
        formData,
        speechVersions: preparedSpeechVersions
      })
    });

    const responseText = await emailResponse.text();
    console.log(`Send-emails status: ${emailResponse.status}`);
    console.log(`Send-emails response: ${responseText}`);

    if (!emailResponse.ok) {
      console.error("Failed to trigger email sending:", responseText);
      throw new Error(`Email sending failed with status ${emailResponse.status}: ${responseText}`);
    } 
    
    console.log("Email sending triggered successfully");
    
    // Update purchase record to mark emails as sent
    console.log(`Updating purchase ${purchaseId} to mark emails as sent`);
    const { error } = await supabase
      .from('speech_purchases')
      .update({ emails_sent: true })
      .eq('id', purchaseId);
      
    if (error) {
      console.error("Error updating emails_sent status:", error);
      throw new Error(`Failed to update purchase record: ${error.message}`);
    }
      
    console.log("Purchase record updated successfully - emails marked as sent");
    return true;
  } catch (emailError) {
    console.error("Error triggering email sending:", emailError);
    return false;
  }
};
