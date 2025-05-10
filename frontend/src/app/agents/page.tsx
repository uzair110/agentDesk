// app/agents/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAgents, createAgent } from "../lib/api";

interface Agent {
  id: string;
  name: string;
  description?: string;
  config: object;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [config, setConfig] = useState("{}");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const newAgent = await createAgent({
        name,
        description: desc,
        config: JSON.parse(config),
      });
      setAgents((prev) => [...prev, newAgent]);
      setName("");
      setDesc("");
      setConfig("{}");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with Add Agent button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          onClick={() => setShowForm((f) => !f)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Agent"}
        </button>
      </div>

      {/* Conditionally shown form */}
      {showForm && (
        <form
          onSubmit={onSubmit}
          className="p-6 bg-white rounded shadow space-y-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder='Config (JSON), e.g. {"foo":"bar"}'
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full border p-2 rounded font-mono text-sm"
            rows={4}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Creating…" : "Create Agent"}
          </button>
        </form>
      )}

      {/* Agent list with Chat button */}
      <ul className="space-y-4">
        {agents.map((a) => (
          <li
            key={a.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-gray-600">{a.description}</p>
              <p className="text-sm text-gray-600">{JSON.stringify(a.id)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/chat/${a.id}`}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Chat
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
