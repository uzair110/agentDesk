// backend/src/services/tools.ts
import axios, { Method } from "axios";
import { summarizePr, SummarizerConfig } from "./githubSummarizer";
import { postToSlack } from "./slackClient";  
import { chatCompletion, ChatMessage } from "./groqClient";
import db from "../services/db";

export interface ToolEntry {
  key:     string;
  handler: string;
  config:  Record<string, any>;
}

export async function invokeTool(
  entry: ToolEntry,
  args:  Record<string, any>,
  log: Record<string, any>,
): Promise<string> {
  switch (entry.handler) {
    case "githubSummarizer": {
      const cfg = entry.config as SummarizerConfig;
      log = await db.log.update({
        where: { id: log.id },
        data: {
          metaData: {
            ...(log.metaData ?? {}),
            args,
            cfg
          },
        },
      });
      return summarizePr(cfg, args.prNumber, log);
    }
    case "slackNotifier": {
      const { WEBHOOK_URL } = entry.config;
      log = await db.log.update({
        where: { id: log.id },
        data: {
          metaData: {
            ...(log.metaData ?? {}),
            webhookUrl: WEBHOOK_URL,
            args,
          },
        },
      });
      return postToSlack(WEBHOOK_URL, args.text, log);
    }
    case "groqChat": {
      const cfg = entry.config;
      const msgs: ChatMessage[] = [
        { role: "system", content: entry.config.systemPrompt || "" },
        { role: "user",   content: args.message }
      ];
      return chatCompletion(cfg.apiKey, cfg.model, msgs);
    }
    case "http": {
      const { url, method, headers, bodyTemplate } = entry.config;
      const body = bodyTemplate
        ? JSON.parse(bodyTemplate.replace(/\{\{(\w+)\}\}/g, (_: any, k: string) => args[k] || ""))
        : args;
      const resp = await axios.request({ url, method: method as Method, headers, data: body });
      return typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data, null, 2);
    }
    default:
      throw new Error(`Unknown handler: ${entry.handler}`);
  }
}
