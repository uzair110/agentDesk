// app/agents/[agentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  listAvailableTools,
  listAgentTools,
  addAgentTool,
  removeAgentTool,
  ToolMetadata,
  ToolEntry,
} from "../../lib/api";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AgentDetailPage() {
  const { agentId } = useParams() as { agentId?: string };
  const router = useRouter();
  const [available, setAvailable] = useState<ToolMetadata[]>([]);
  const [ownTools,  setOwnTools]    = useState<ToolEntry[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [chosenKey, setChosenKey] = useState("")
  const [configJSON, setConfigJSON] = useState("{}");

  const configPlaceholders = {
    githubSummarizer: {
      owner: "your-github-username",
      repo: "your-repo-name",
    },
    slackNotifier: {
      WEBHOOK_URL: "your-slack-webhook-url"
    }
  }

  useEffect(() => {
    if (!agentId) return;
    listAvailableTools().then(setAvailable);
    listAgentTools(agentId).then(setOwnTools);
  }, [agentId]);

  useEffect(() => {
    if (chosenKey && configPlaceholders[chosenKey as keyof typeof configPlaceholders]) {
      setConfigJSON(JSON.stringify(configPlaceholders[chosenKey as keyof typeof configPlaceholders], null, 2))
    }
  }, [chosenKey])

  const handleToolChange = (value: string) => {
    setChosenKey(value)
    if (value && configPlaceholders[value as keyof typeof configPlaceholders]) {
      setConfigJSON(JSON.stringify(configPlaceholders[value as keyof typeof configPlaceholders], null, 2))
    } else {
      setConfigJSON("{}")
    }
  }

  async function handleAdd() {
    if (!agentId || !chosenKey) return;
    await addAgentTool(agentId, { key: chosenKey, handler: chosenKey, config: JSON.parse(configJSON) });
    setShowForm(false);
    setChosenKey("");
    setConfigJSON("{}");
    setOwnTools(await listAgentTools(agentId));
  }

  async function handleRemove(key: string) {
    if (!agentId) return;
    await removeAgentTool(agentId, key);
    setOwnTools(await listAgentTools(agentId));
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back & Title */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to Agents</span>
      </button>
      <h1 className="text-3xl font-bold">Manage Tools</h1>

      {/* Add Tool Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={() => setShowForm((f) => !f)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {showForm ? "Cancel" : "Add Tool"}
        </button>

        {showForm && (
          <div className="mt-4 space-y-4">
            <select
              value={chosenKey}
              onChange={(e) => handleToolChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a tool…</option>
              {available.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.key} - {t.name}
                </option>
              ))}
            </select>
            <textarea
              value={configJSON}
              onChange={(e) => setConfigJSON(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
            <div className="text-right">
              <button
                onClick={handleAdd}
                disabled={!chosenKey}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
              >
                Confirm Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Tools Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Current Tools</h2>
        {ownTools.length === 0 ? (
          <p className="text-gray-500">No tools added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Key</th>
                  <th className="px-4 py-2 text-left">Config</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {ownTools.map((t) => (
                  <tr key={t.key} className="border-b">
                    <td className="px-4 py-3 font-medium">{t.key}</td>
                    <td className="px-4 py-3">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {JSON.stringify(t.config, null, 2)}
                      </pre>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(t.key)}
                        className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
