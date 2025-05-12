import { Request, RequestHandler, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Agent, agents } from '../models/agent';
import db from '../services/db';

export async function createAgent(req: Request, res: Response) {
  const { name, description, config } = req.body as Partial<Agent>;
  if (!name || !config) {
    res.status(400).json({ error: 'name and config required' });
    return;
  }
  const newAgent: Agent = {
    id: uuid(),
    name,
    description,
    config: {
      tools: config.tools ?? []
    }
  };

  const id = uuid();

  await db.agent.create({
    data: { id, name, description, config: { tools: [] } },
  });

  agents.push(newAgent);
  res.status(201).json(newAgent);
}

export async function listAgents(_req: Request, res: Response) {
  const agents = await db.agent.findMany();
  res.json(agents);
}

export async function getAgent(req: Request, res: Response) {
  const agent = await db.agent.findUnique({ where: { id: req.params.id } });
  if (agent) {
    res.json(agent);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
}

export const updateAgent: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const { name, description, config } = req.body as {
    name?: string;
    description?: string;
    config?: any; 
  };

  const existing = await db.agent.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  try {
    const data: Record<string, any> = {};
    if (name !== undefined)        data.name        = name;
    if (description !== undefined) data.description = description;
    if (config !== undefined)       data.config      = config;

    const updated = await db.agent.update({
      where: { id },
      data : { config: { tools: config.tools ?? [] } },
    });

    res.json(updated);
  } catch (err: any) {
    console.error("updateAgent failed:", err);
    res.status(500).json({ error: "Could not update agent" });
  }
};

export const deleteAgent: RequestHandler = async (req, res) => {
  const id = req.params.id;

  const existing = await db.agent.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }

  try {
    await db.chatLog.deleteMany({ where: { agentId: id } });

    const deleted = await db.agent.delete({ where: { id } });

    res.json(deleted);
  } catch (err: any) {
    console.error("deleteAgent failed:", err);
    res.status(500).json({ error: "Could not delete agent" });
  }
};