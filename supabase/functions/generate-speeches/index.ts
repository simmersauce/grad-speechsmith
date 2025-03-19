
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse, generateSpeechPrompt } from "./utils.ts";
import { supabase, saveSpeechVersion, updatePurchaseStatus } from "./database.ts";
import { generateSpeechWithOpenAI } from "./openai.ts";
import { sendEmailNotification } from "./emailNotifier.ts";

// Initialize Supabase URL for function calls
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, purchaseId, email } = await req.json();
    
    console.log("Generating speeches for purchase:", purchaseId);
    console.log("Using form data:", formData);
    
    // Generate 3 different speeches with the same tone
    const speechVersions = [];
    const tone = formData.tone; // Use the selected tone for all versions

    for (let i = 0; i < 3; i++) {
      const versionNumber = i + 1;
      console.log(`Generating speech version ${versionNumber} with tone: ${tone}`);
      
      // Generate the prompt for this version
      const customizedPrompt = generateSpeechPrompt(formData, tone, versionNumber);

      // Call OpenAI API to generate the speech
      const generatedSpeech = await generateSpeechWithOpenAI(customizedPrompt);
      
      // Save the speech version to the database
      const savedSpeech = await saveSpeechVersion(purchaseId, generatedSpeech, versionNumber, tone);
      
      speechVersions.push({
        id: savedSpeech.id,
        content: generatedSpeech,
        versionNumber: versionNumber,
        tone: tone,
        versionType: `Version ${versionNumber}`
      });
      
      console.log(`Successfully generated and saved speech version ${versionNumber}`);
    }

    // Update purchase record to mark speeches as generated
    await updatePurchaseStatus(purchaseId, { speeches_generated: true });

    // Call the send-emails function to deliver the speeches
    await sendEmailNotification(
      supabaseUrl, 
      supabaseKey, 
      purchaseId, 
      email, 
      formData, 
      speechVersions
    );

    return createResponse({ 
      success: true,
      speechVersions
    });
  } catch (error) {
    console.error("Error in generate-speeches function:", error);
    return createResponse({ 
      error: error.message || "Failed to generate speeches" 
    }, 500);
  }
});
