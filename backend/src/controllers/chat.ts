// backend/src/controllers/chat.ts
import type { RequestHandler } from "express";
import { chatCompletion } from "../services/groqClient";
import { invokeTool } from "../services/tools";
import { availableTools } from "../services/availableTools";
import db from "../services/db";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;
const GROQ_MODEL   = process.env.NEXT_PUBLIC_GROQ_MODEL!;

export const chatAgent: RequestHandler = async (req, res) => {
  const agent = await db.agent.findUnique({ where: { id: req.params.id } });
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const { message } = req.body as { message?: string };
  if (!message) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  await db.chatLog.create({
    data: {
      agentId: agent.id,
      role:    "user",
      message: message,
    },
  });

  const toolInfo = (agent.config as { tools?: any[] }).tools
    ?.map(t => {
      const m = availableTools.find(av => av.key === t.key)!;
      return `• ${m.key}: ${m.name} — ${m.description}`;
    })
    .join("\n") || "";

  const systemPrompt = `
You are a versatile assistant that can invoke external tools as needed.
Available tools:
${toolInfo}

To use a tool, respond with exactly one JSON object:
{"toolKey":"<toolKey>","toolArgs":{…}}
If you don't need a tool, reply with plain text only.
Keep your response concise, to the point and in a conversational tone.
When you respond, do not mention your own name; just answer the user.
`.trim();

  let raw: string;
  try {
    raw = await chatCompletion(
      GROQ_API_KEY,
      GROQ_MODEL,
      [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message }
      ]
    );
  } catch {
    res.status(502).json({ error: "LLM call failed" });
    return;
  }

  let finalReply = raw;
  let choice: { toolKey: string; toolArgs: any } | null = null;

  try {
    choice = JSON.parse(raw);
  } catch {
    // finalReply already set to raw
  }

  if (choice) {
    const entry = (agent.config as { tools?: any[] }).tools!.find(t => t.key === choice!.toolKey)!;
    try {
      finalReply = await invokeTool(entry, choice.toolArgs);
    } catch (err: any) {
      res.status(500).json({ error: `${entry.key} failed: ${err.message}` });
      return;
    }
  }

  try {
    const wrap = await chatCompletion(
      GROQ_API_KEY,
      GROQ_MODEL,
      [
        { role: "system", content: "Please produce a concise summary of the following output:" },
        { role: "user",   content: finalReply }
      ]
    );
    if (wrap.trim()) {
      finalReply = wrap.trim();
    }
  } catch {
    /* ignore */
  }

  await db.chatLog.create({
    data: {
      agentId: agent.id,
      role:    "agent",
      message: finalReply,
    },
  });

  res.json({ reply: finalReply });
};
