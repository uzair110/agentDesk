import type { RequestHandler } from "express";
import { agents } from "../models/agent";
import { availableTools } from "../services/availableTools";
import { ToolEntry } from "../services/tools";
import db from "../services/db";

export const listTools: RequestHandler = async (req, res) => {
  const agent = await db.agent.findUnique({ where: { id: req.params.id } });
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  const config = agent.config as { tools: any[] };
  res.json(config?.tools ?? []);
};

export const addTool: RequestHandler = async (req, res) => {
  const agent = await db.agent.findUnique({ where: { id: req.params.id } });
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  const entry = req.body as ToolEntry;
  const meta = availableTools.find(t => t.key === entry.key);
  if (!meta) {
    res.status(400).json({ error: "Unknown tool key" });
    return;
  }
  const config = agent.config as { tools: any[] };
  if (config.tools.some(t => t.key === entry.key)) {
    res.status(409).json({ error: "Tool already added" });
    return;
  }
  config.tools.push(entry);
  await db.agent.update({
    where: { id: agent.id },
    data: { config: { tools: config.tools } },
  });
  res.status(201).json(entry);
};

export const removeTool: RequestHandler = async (req, res) => {
  const agent = await db.agent.findUnique({ where: { id: req.params.id } });
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  const config = agent.config as { tools: any[] };
  const idx = config.tools.findIndex(t => t.key === req.params.toolKey);
  if (idx === -1) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  const [removed] = config.tools.splice(idx, 1);
  await db.agent.update({
    where: { id: agent.id },
    data: { config: { tools: config.tools } },
  });
  res.json(removed);
};
