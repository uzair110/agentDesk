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
      message,
    },
  });

  const toolInfo = (agent.config as { tools?: any[] }).tools
    ?.map(t => {
      const m = availableTools.find(av => av.key === t.key)!;
      return `• ${m.key}: ${m.name} — ${m.description}`;
    })
    .join("\n") || "";

  const systemPrompt = [`
You are a versatile assistant.
Available tools:
${toolInfo || "(none)"}

If the user asks you to use a tool, reply with exactly one JSON object:
{"toolKey":"<toolKey>","toolArgs":{…}}

If the user asks to summarize a pull request, you **must** respond with exactly one JSON object containing:
 - "toolKey": "githubSummarizer"
 - "toolArgs": { "prNumber": <string or number> }

Example:
  {"toolKey":"githubSummarizer","toolArgs":{"prNumber":"latest"}}
  {"toolKey":"githubSummarizer","toolArgs":{"prNumber":42}}

If the user asks to send a message/notification or notify to Slack, you **must** respond with exactly one JSON object containing:
 - "toolKey": "slackNotifier"
 - "toolArgs": { "text": <string> }

Example:
  {"toolKey":"slackNotifier","toolArgs":{"text":"Hello, world!"}}

If you don't have the tool configured, reply in plain text.
If no tool is needed, reply in plain text only.
`].join('');

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
    // Not a tool call, raw is the chat reply
  }

  if (choice) {
    const entry = (agent.config as { tools?: any[] }).tools!
      .find(t => t.key === choice!.toolKey);
    if (!entry) {
      finalReply = `Sorry, I don't have the "${choice!.toolKey}" tool configured.`;
    } else {
      let toolResult: string;
      try {
        toolResult = await invokeTool(entry, choice!.toolArgs);
      } catch (err: any) {
        finalReply = `Error invoking tool "${entry.key}": ${err.message}`;
        toolResult = finalReply;
      }

      try {
        const wrap = await chatCompletion(
          GROQ_API_KEY,
          GROQ_MODEL,
          [
            { role: "system", content: "Please summarize the following result concisely:" },
            { role: "user",   content: toolResult }
          ]
        );
        finalReply = wrap.trim() || toolResult;
      } catch {
        finalReply = toolResult;
      }
    }
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
