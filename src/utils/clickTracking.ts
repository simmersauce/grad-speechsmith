
/**
 * Utility for tracking user button clicks
 */
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Get or create a session ID for the current user session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('click_tracking_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('click_tracking_session_id', sessionId);
  }
  return sessionId;
};

// Track button clicks by sending to console and database
export const trackButtonClick = async (buttonName: string, additionalData?: Record<string, any>) => {
  // Log to console for development visibility
  console.log(`Button Clicked: ${buttonName}`, additionalData || {});
  
  try {
    // Get optional email if available from sessionStorage
    const storedData = sessionStorage.getItem('speechFormData');
    let customerEmail = null;
    
    if (storedData) {
      const formData = JSON.parse(storedData);
      customerEmail = formData.email || null;
    }
    
    // Record click event in database
    const { error } = await supabase
      .from('click_events')
      .insert({
        button_name: buttonName,
        additional_data: additionalData || {},
        customer_email: customerEmail,
        session_id: getSessionId()
      });
      
    if (error) {
      console.error('Error recording click event:', error);
    }
  } catch (err) {
    // Fail silently in production but log for debugging
    console.error('Error in trackButtonClick:', err);
  }
};
