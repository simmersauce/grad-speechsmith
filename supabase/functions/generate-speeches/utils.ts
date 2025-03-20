
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create consistent response objects
export const createResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Generate a speech prompt based on form data and version number
export const generateSpeechPrompt = (formData: any, tone: string, versionNumber: number) => {
  return `Generate a ${tone} graduation speech for ${formData.name} a ${formData.role} at (${formData.graduationType})  
    who is graduating from ${formData.institution}, Class of ${formData.graduationClass}. Use the following details to guide the speech: 
    personal background: ${formData.personalBackground || "not specified"}, 
    themes: ${formData.themes || "not specified"}, 
    memories: ${formData.memories || "not specified"}, 
    goals and lessons: ${formData.goalsLessons || "not specified"}, 
    and acknowledgements: ${formData.acknowledgements || "not specified"}.
    Include this quote if provided: ${formData.quote || ""}.
    Include this information if provided: ${formData.additionalInfo || ""}.
    Also include these wishes: ${formData.wishes || "not specified"}.
    For version ${versionNumber}, create a unique iteration with different wording and structure, but maintain the SAME TONE and SAME LENGTH as the other versions. 
    Using this information, craft a speech that's up to 750 words.Ensure the speech reflects ${formData.name} personal journey and inspiring the graduating class to embrace future challenges with optimism and strength. 
    The speech should be culmination of an academic journey making the class feel included and connected. 
    Make sure the speech has a natural presenting flow, with smooth transitions between paragraphs for a unified flow.
    The speech should maintain a consistent ${tone} tone throughout and include all provided information.
    This is iteration #${versionNumber} of 3 different versions, so make it unique while keeping the same overall structure and feel.`;
};
