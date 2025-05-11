import type { RequestHandler } from 'express';
import { chatCompletion } from "../services/groqClient";
import { invokeTool, ToolEntry }       from "../services/tools";
import { availableTools }              from "../services/availableTools";
import { agents }                      from "../models/agent";
import dotenv from "dotenv";

dotenv.config();

export const chatAgent: RequestHandler = async (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  const { message } = req.body as { message?: string };
  if (!message) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  const toolInfo = agent.config.tools
    .map((t) => {
      const m = availableTools.find((av) => av.key === t.key)!;
      return `• ${m.key}: ${m.name} — ${m.description}`;
    })
    .join("\n");

  const systemPrompt = `
You are ${agent.name}.
You have these external tools available:
${toolInfo}

To use a tool, reply with exactly:
{"toolKey":"<toolKey>","toolArgs":{…}}
Otherwise just reply directly.
`;

  let raw: string;
  try {
    raw = await chatCompletion(
      process.env.NEXT_PUBLIC_GROQ_API_KEY!,    
      process.env.NEXT_PUBLIC_GROQ_MODEL!,      
      [
        { role: "system", content: systemPrompt },
        { role: "user",   content: message }
      ]
    );
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "LLM call failed" });
    return;
  }

  let choice: { toolKey: string; toolArgs: any }|null = null;
  try {
    choice = JSON.parse(raw);
  } catch {
    res.json({ reply: raw });
    return;
  }

  const entry = agent.config.tools.find((t) => t.key === choice!.toolKey) as ToolEntry;
  if (!entry) {
    res.status(400).json({ error: `Unknown tool: ${choice!.toolKey}` });
    return;
  }

  let result: string;
  try {
    result = await invokeTool(entry, choice!.toolArgs);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: `${entry.key} failed: ${err.message}` });
    return;
  }

  // 5. Optionally wrap up via Groq again
  let finalReply = result;
  try {
    finalReply = await chatCompletion(
      process.env.NEXT_PUBLIC_GROQ_API_KEY!,
      process.env.NEXT_PUBLIC_GROQ_MODEL!,
      [
        { role: "system", content: `You are ${agent.name}. Summarize this: ${result}` },
      ]
    );
  } catch (error) {
    console.log("error in finalReply", error);
    // ignore, return raw
  }

  res.json({ reply: finalReply });
};
