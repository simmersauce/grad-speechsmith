
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, purchaseId, email } = await req.json();
    
    console.log("Generating speeches for purchase:", purchaseId);
    console.log("Using form data:", formData);
    
    // Generate 3 different speeches with different tones
    const speechVersions = [];
    const tones = [
      formData.tone, // Use the original tone
      formData.tone === "formal" ? "inspirational" : "formal", // Alternative tone 1
      formData.tone === "humorous" ? "heartfelt" : "humorous", // Alternative tone 2
    ];

    for (let i = 0; i < 3; i++) {
      // Modify the prompt for each version to get different results
      const customizedPrompt = `Generate a ${i === 0 ? "primary" : i === 1 ? "alternative" : "creative"} graduation speech for ${formData.name} 
        who is graduating from ${formData.institution} (${formData.graduationType}).
        Include their role: ${formData.role}, 
        personal background: ${formData.personalBackground || "not specified"}, 
        tone: ${tones[i]}, 
        themes: ${formData.themes || "not specified"}, 
        memories: ${formData.memories || "not specified"}, 
        goals and lessons: ${formData.goalsLessons || "not specified"}, 
        and acknowledgements: ${formData.acknowledgements || "not specified"}.
        Include this quote if provided: ${formData.quote || ""}.
        Also include these wishes: ${formData.wishes || "not specified"}.
        For version ${i+1}, make it ${i === 0 ? "comprehensive and balanced" : i === 1 ? "concise and impactful" : "creative and memorable"}.
        The speech should be motivational, personal, and around ${i === 0 ? "4-5" : i === 1 ? "3-4" : "4-5"} paragraphs long.`;

      console.log(`Generating speech version ${i+1} with tone: ${tones[i]}`);

      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert speechwriter who creates inspiring graduation speeches.",
            },
            { role: "user", content: customizedPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI API error for version ${i+1}:`, errorData);
        throw new Error(`Failed to generate speech version ${i+1}: ${errorData}`);
      }

      const responseData = await response.json();
      const generatedSpeech = responseData.choices[0].message.content;
      
      // Save each speech version to the database
      const { data, error } = await supabase.from('speech_versions').insert({
        purchase_id: purchaseId,
        content: generatedSpeech,
        version_number: i + 1,
        tone: tones[i],
        version_type: i === 0 ? "primary" : i === 1 ? "alternative" : "creative"
      }).select();
      
      if (error) {
        console.error(`Error saving speech version ${i+1}:`, error);
        throw new Error(`Failed to save speech version ${i+1}`);
      }
      
      speechVersions.push({
        id: data[0].id,
        content: generatedSpeech,
        versionNumber: i + 1,
        tone: tones[i],
        versionType: i === 0 ? "primary" : i === 1 ? "alternative" : "creative"
      });
      
      console.log(`Successfully generated and saved speech version ${i+1}`);
    }

    // Update purchase record to mark speeches as generated
    const { error: updateError } = await supabase
      .from('speech_purchases')
      .update({ speeches_generated: true })
      .eq('id', purchaseId);

    if (updateError) {
      console.error("Error updating purchase record:", updateError);
    }

    // Call the send-emails function to deliver the speeches
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
      } else {
        console.log("Email sending triggered successfully");
        
        // Update purchase record to mark emails as sent
        await supabase
          .from('speech_purchases')
          .update({ emails_sent: true })
          .eq('id', purchaseId);
      }
    } catch (emailError) {
      console.error("Error triggering email sending:", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        speechVersions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in generate-speeches function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate speeches" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
