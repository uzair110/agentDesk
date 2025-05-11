const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getAgents() {
  const res = await fetch(`${BASE}/agents`);
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
}

export async function createAgent(data: { name: string; description?: string; config: object }) {
  const res = await fetch(`${BASE}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create agent");
  return res.json();
}

export async function chatAgent(
  agentId: string,
  message: string,
  toolKey?: string,
  toolArgs?: Record<string, unknown>
): Promise<{ reply: string }> {
  const body: Record<string, unknown> = { message };
  if (toolKey)  body.toolKey  = toolKey;
  if (toolArgs) body.toolArgs = toolArgs;

  const res = await fetch(`${BASE}/agents/${agentId}/chat`, {
    method:    "POST",
    headers:   { "Content-Type": "application/json" },
    body:      JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  return res.json() as Promise<{ reply: string }>;
}

export type ToolMetadata = {
  key: string;
  name: string;
  description: string;
  configSchema: object;
};

export type ToolEntry = {
  key: string;
  handler: string;
  config: Record<string, unknown>;
};

export async function listAvailableTools(): Promise<ToolMetadata[]> {
  const res = await fetch(`${BASE}/tools`);
  if (!res.ok) throw new Error("Failed to fetch tools");
  return res.json();
}

export async function listAgentTools(agentId: string): Promise<ToolEntry[]> {
  const res = await fetch(`${BASE}/agents/${agentId}/tools`);
  if (!res.ok) throw new Error("Failed to fetch agent tools");
  return res.json();
}


export async function addAgentTool(
  agentId: string,
  entry: ToolEntry
): Promise<ToolEntry> {
  const res = await fetch(`${BASE}/agents/${agentId}/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to add tool");
  return res.json();
}

export async function removeAgentTool(agentId: string, key: string) {
  const res = await fetch(`${BASE}/agents/${agentId}/tools/${key}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove tool");
}