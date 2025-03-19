
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
  return `Generate a unique graduation speech for ${formData.name} 
    who is graduating from ${formData.institution} (${formData.graduationType}).
    Include their role: ${formData.role}, 
    personal background: ${formData.personalBackground || "not specified"}, 
    tone: ${tone}, 
    themes: ${formData.themes || "not specified"}, 
    memories: ${formData.memories || "not specified"}, 
    goals and lessons: ${formData.goalsLessons || "not specified"}, 
    and acknowledgements: ${formData.acknowledgements || "not specified"}.
    Include this quote if provided: ${formData.quote || ""}.
    Also include these wishes: ${formData.wishes || "not specified"}.
    For version ${versionNumber}, create a unique iteration with different wording and structure, but maintain the SAME TONE and SAME LENGTH as the other versions.
    Make sure this speech has a similar length to the other versions (about 4-5 paragraphs).
    The speech should maintain a consistent ${tone} tone throughout and include all provided information.
    This is iteration #${versionNumber} of 3 different versions, so make it unique while keeping the same overall structure and feel.`;
};
