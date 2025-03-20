
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
        speechVersions
      })
    });

    const responseText = await emailResponse.text();
    console.log(`Send-emails status: ${emailResponse.status}`);
    console.log(`Send-emails response: ${responseText}`);

    if (!emailResponse.ok) {
      console.error("Failed to trigger email sending:", responseText);
      return false;
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
      return false;
    }
      
    console.log("Purchase record updated successfully - emails marked as sent");
    return true;
  } catch (emailError) {
    console.error("Error triggering email sending:", emailError);
    return false;
  }
};
