"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAgents, createAgent, ToolMetadata, deleteAgent } from "../lib/api";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../components/modal";

interface Agent {
  id: string;
  name: string;
  description?: string;
  config: {
    tools: ToolMetadata[];
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [config, setConfig] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    fetchAgents();
  }, [agentCount]);

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
      setAgents((prev) => [newAgent, ...prev]);
      setShowForm(false);
      setName("");
      setDesc("");
      setConfig("{}");
      setAgentCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAgentHelper(id: string) {
    await deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setDeleteModalOpen(false);
    setAgentToDelete(null);
    setAgentCount(prev => prev - 1);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Agents</h1>
        <button
          onClick={() => setShowForm((f) => !f)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {showForm ? "Cancel" : "Add Agent"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            placeholder='Config (JSON), e.g. {"foo":"bar"}'
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              {loading ? "Creating…" : "Create Agent"}
            </button>
          </div>
        </form>
      )}

      {/* Agents Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div
            key={a.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow"
          > 
            <h2 className="text-xl font-semibold mb-2">{a.name}</h2>
            {a.description && (
              <p className="text-gray-600 mb-4">{a.description}</p>
            )}
            {a.config.tools && (
              <p className="text-xs text-gray-400 mb-6 truncate">
                {Array.isArray(a.config.tools) && a.config.tools.length > 0 
                  ? `Tools: ${a.config.tools.map((t: ToolMetadata) => t.key).join(", ")}`
                  : "No tools"}
              </p>
            )}
            <div className="flex space-x-2">
              <Link
                href={`/chat/${a.id}`}
                className="flex-1 text-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Chat
              </Link>
              <Link
                href={`/agents/${a.id}`}
                className="flex-1 text-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Tools
              </Link>
              <button
                onClick={() => {
                  setDeleteModalOpen(true);
                  setAgentToDelete(a.id);
                }}
                className="flex-1 text-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAgentToDelete(null);
        }}
        title="Confirm Delete"
        actions={[
          {
            label: "Cancel",
            onClick: () => {
              setDeleteModalOpen(false);
              setAgentToDelete(null);
            },
            variant: "secondary"
          },
          {
            label: "Delete",
            onClick: () => agentToDelete && deleteAgentHelper(agentToDelete)
          }
        ]}
      >
        <p className="text-gray-600">
          Are you sure you want to delete this agent? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
