
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

    if (!emailResponse.ok) {
      console.error("Failed to trigger email sending:", await emailResponse.text());
      return false;
    } 
    
    console.log("Email sending triggered successfully");
    
    // Update purchase record to mark emails as sent
    await supabase
      .from('speech_purchases')
      .update({ emails_sent: true })
      .eq('id', purchaseId);
      
    return true;
  } catch (emailError) {
    console.error("Error triggering email sending:", emailError);
    return false;
  }
};
