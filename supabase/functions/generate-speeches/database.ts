
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Save a speech version to the database
export const saveSpeechVersion = async (
  purchaseId: string, 
  content: string, 
  versionNumber: number, 
  tone: string
) => {
  const { data, error } = await supabase.from('speech_versions').insert({
    purchase_id: purchaseId,
    content: content,
    version_number: versionNumber,
    tone: tone,
    version_type: `version_${versionNumber}`
  }).select();
  
  if (error) {
    console.error(`Error saving speech version ${versionNumber}:`, error);
    throw new Error(`Failed to save speech version ${versionNumber}`);
  }
  
  return data[0];
};

// Update purchase record to mark speeches as generated
export const updatePurchaseStatus = async (purchaseId: string, status: { 
  speeches_generated?: boolean, 
  emails_sent?: boolean 
}) => {
  const { error } = await supabase
    .from('speech_purchases')
    .update(status)
    .eq('id', purchaseId);

  if (error) {
    console.error("Error updating purchase record:", error);
    return false;
  }
  
  return true;
};
