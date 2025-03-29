
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { initSentry } from "../shared/sentry.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Sentry
const Sentry = initSentry("generate-speech");

serve(async (req) => {
  // Test Sentry at the beginning of each request
  try {
    throw new Error("Test Sentry error from generate-speech function");
  } catch (error) {
    Sentry.captureException(error);
    console.log("Test error sent to Sentry");
  }
  
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

    // Set additional context for better debugging
    Sentry.setContext("request", {
      functionName: "generate-speech",
      hasFormData: !!formData,
    });
    
    if (formData?.name) {
      Sentry.setTag("user_name", formData.name);
    }

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
      
      // Capture API error in Sentry
      const error = new Error(`OpenAI API Error: ${errorData}`);
      Sentry.setContext("api_response", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      Sentry.captureException(error);
      
      throw error;
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
    
    // Capture the exception in Sentry
    const eventId = Sentry.captureException(error);
    console.log(`Error tracked in Sentry with event ID: ${eventId}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate speech",
        sentryEventId: eventId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
