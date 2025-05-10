import axios from 'axios';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Send a chat completion request to Groq Cloud.
 * @param apiKey Your Groq API key.
 * @param model  The Groq model ID, e.g. "llama-3.3-70b-versatile".
 * @param messages Array of messages in the OpenAI Chat format.
 * @returns The assistant’s reply text.
 */
export async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions', 
    { model, messages }, 
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  return res.data.choices[0].message.content;
}
