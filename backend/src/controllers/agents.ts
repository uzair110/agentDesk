import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Agent, agents } from '../models/agent';

export function createAgent(req: Request, res: Response) {
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

  agents.push(newAgent);
  res.status(201).json(newAgent);
}

export function listAgents(_req: Request, res: Response) {
  res.json(agents);
}

export function getAgent(req: Request, res: Response) {
  const a = agents.find((x) => x.id === req.params.id);
  if (a) {
    res.json(a);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
}

export function updateAgent(req: Request, res: Response) {
  const idx = agents.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const { name, description, config } = req.body as Partial<Agent>;
  agents[idx] = { ...agents[idx], name: name ?? agents[idx].name, description, config: config ?? agents[idx].config };
  res.json(agents[idx]);
}

export function deleteAgent(req: Request, res: Response) {
  const idx = agents.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const [removed] = agents.splice(idx, 1);
  res.json(removed);
}
