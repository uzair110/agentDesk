import type { RequestHandler } from "express";
import { agents } from "../models/agent";
import { availableTools } from "../services/availableTools";
import { ToolEntry } from "../services/tools";

const findAgent = (id: string) => agents.find(a => a.id === id)

export const listTools: RequestHandler = (req, res) => {
  const agent = findAgent(req.params.id);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json(agent.config.tools ?? []);
};

export const addTool: RequestHandler = (req, res) => {
  const agent = findAgent(req.params.id);
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
  if (agent.config.tools.some(t => t.key === entry.key)) {
    res.status(409).json({ error: "Tool already added" });
    return;
  }
  agent.config.tools.push(entry);
  res.status(201).json(entry);
};

export const removeTool: RequestHandler = (req, res) => {
  const agent = findAgent(req.params.id);
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  const idx = agent.config.tools.findIndex(t => t.key === req.params.toolKey);
  if (idx === -1) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  const [removed] = agent.config.tools.splice(idx, 1);
  res.json(removed);
};
