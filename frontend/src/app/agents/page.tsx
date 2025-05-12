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
      setAgents((prev) => [newAgent, ...prev]);
      setShowForm(false);
      setName("");
      setDesc("");
      setConfig("{}");
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
             AgentDesk
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/agents" className="text-white font-medium">
                Agents
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Your Agents
          </h1>
          <button
            onClick={() => setShowForm((f) => !f)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {showForm ? "Cancel" : "Add Agent"}
          </button>
        </div>

        {/* Create Agent Form */}
        {showForm && (
          <form
            onSubmit={onSubmit}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-12 space-y-6 border border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="col-span-2 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder='Config (JSON), e.g. {"foo":"bar"}'
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating…" : "Create Agent"}
              </button>
            </div>
          </form>
        )}

        {/* Agents Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div
              key={a.id}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-700 hover:border-gray-600"
            > 
              <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {a.name}
              </h2>
              {a.description && (
                <p className="text-gray-300 mb-4">{a.description}</p>
              )}
              {a.config.tools && (
                <p className="text-sm text-gray-400 mb-6">
                  {Array.isArray(a.config.tools) && a.config.tools.length > 0 
                    ? `Tools: ${a.config.tools.map((t: ToolMetadata) => t.key).join(", ")}`
                    : "No tools"}
                </p>
              )}
              <div className="flex space-x-3">
                <Link
                  href={`/chat/${a.id}`}
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl shadow hover:shadow-lg transition-all duration-200"
                >
                  Chat
                </Link>
                <Link
                  href={`/agents/${a.id}`}
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl shadow hover:shadow-lg transition-all duration-200"
                >
                  Tools
                </Link>
                <button
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setAgentToDelete(a.id);
                  }}
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow hover:shadow-lg transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>
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
        <p className="text-black">
          Are you sure you want to delete this agent? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}