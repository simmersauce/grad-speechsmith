
// OpenAI API integration
export const generateSpeechWithOpenAI = async (prompt: string) => {
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
          content: "You are an expert speechwriter who creates inspiring graduation speeches. When asked to create multiple versions of a speech, ensure they are unique iterations but maintain the same tone, style, and approximate length. Each version should reorganize and reword the content while covering the same key points."
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`OpenAI API error:`, errorData);
    throw new Error(`Failed to generate speech: ${errorData}`);
  }

  const responseData = await response.json();
  return responseData.choices[0].message.content;
};
