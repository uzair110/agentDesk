// backend/src/controllers/chat.ts
import type { Request, Response, RequestHandler } from 'express';
import { agents } from '../models/agent';
import { chatCompletion, ChatMessage } from '../services/groqClient';

export const chatAgent: RequestHandler = async (req, res) => {
  const { id: agentId } = req.params;
  const agent = agents.find(a => a.id === agentId);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }

  const { apiKey, model } = agent.config as {
    apiKey?: string;
    model?: string;
  };
  if (!apiKey || !model) {
    res.status(500).json({ error: 'Agent config must include apiKey and model' });
    return;
  }

  const userMessage = (req.body as { message?: string }).message;
  if (!userMessage) {
    res.status(400).json({ error: 'Missing `message` in request body' });
    return;
  }

  // Build the conversation context
  const messages = [
    { role: 'system',    content: agent.description ?? `You are ${agent.name}.` },
    { role: 'user',      content: userMessage },
  ];

  try {
    const replyText = await chatCompletion(apiKey, model, messages as ChatMessage[]);
    res.json({ reply: replyText });
  } catch (err) {
    console.error('LLM error', err);
    res.status(502).json({ error: 'LLM call failed' });
  }
};
