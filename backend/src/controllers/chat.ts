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
    You are a versatile assistant.
    Available tools:
    ${toolInfo || "(none)"}
    
    If the user asks you to use a tool, reply with exactly one JSON object:
    {"toolKey":"<toolKey>","toolArgs":{…}}

    If the user asks to summarize a pull request, you **must** respond with exactly one JSON object containing:
 - "toolKey": the tool name ("githubSummarizer")
 - "toolArgs": an object with exactly one field "prNumber"

If the user says "latest" or "most recent", set "prNumber" to the string "latest".
If they specify a number, set it to that number.

Example:
  {"toolKey":"githubSummarizer","toolArgs":{"prNumber":"latest"}}
  {"toolKey":"githubSummarizer","toolArgs":{"prNumber":42}}

    if you don't find a tool, reply in plain text that you don't have the tool.  
    
    If no tool is needed, reply in plain text without mentioning your name.
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
    if (!entry) {
      finalReply = `Sorry, I don't have the "${choice!.toolKey}" tool configured.`;
    } else {
      try {
        finalReply = await invokeTool(entry, choice!.toolArgs);
      } catch (err: any) {
        finalReply = `Error invoking tool "${entry.key}": ${err.message}`;
      }
      // wrap-up
      try {
        const wrap = await chatCompletion(
          GROQ_API_KEY,
          GROQ_MODEL,
          [
            { role: "system", content: "Please summarize the following result concisely:" },
            { role: "user",   content: finalReply },
          ]
        );
        if (wrap.trim()) {
          finalReply = wrap.trim();
        }
      } catch {
        // ignore wrap errors
      }
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
