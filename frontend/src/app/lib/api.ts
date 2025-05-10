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

export async function chatAgent(agentId: string, message: string) {
  const res = await fetch(`${BASE}/agents/${agentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json() as Promise<{ reply: string }>;
}
