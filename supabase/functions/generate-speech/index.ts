
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    // Use formData to construct the prompt
    const prompt = `Generate an inspiring graduation speech for ${formData.name} who is graduating from ${
      formData.institution
    } (${formData.graduationType}). Include their role: ${
      formData.role
    }, personal background: ${formData.personalBackground || "not specified"}, 
    tone: ${formData.tone}, themes: ${formData.themes || "not specified"}, 
    memories: ${formData.memories || "not specified"}, 
    goals and lessons: ${formData.goalsLessons || "not specified"}, 
    and acknowledgements: ${formData.acknowledgements || "not specified"}. 
    Include this quote if provided: ${formData.quote || ""}. 
    Also include these wishes: ${formData.wishes || "not specified"}.
    The speech should be motivational, personal, and around 3-4 paragraphs long.`;

    console.log("Sending request to OpenAI with prompt:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert speechwriter who creates inspiring graduation speeches.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`Failed to generate speech: ${errorData}`);
    }

    const responseData = await response.json();
    const generatedSpeech = responseData.choices[0].message.content;

    console.log("Successfully generated speech");

    return new Response(
      JSON.stringify({ 
        speech: generatedSpeech 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in generate-speech function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate speech" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
