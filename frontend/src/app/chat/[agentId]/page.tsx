// app/chat/[agentId]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { chatAgent, ChatLog, listAgentLogs } from "../../lib/api";

export default function ChatPage() {
  const { agentId } = useParams() as { agentId?: string };
  const [msgs, setMsgs] = useState<{ from: "user" | "agent"; text: string }[]>(
    []
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!agentId) return;
    listAgentLogs(agentId)
      .then((logs: ChatLog[]) => {
        const initial = logs.map((log) => ({
          from: log.role as "user" | "agent",
          text: log.message,
        }));
        setMsgs(initial);
      })
      .catch(console.error);
  }, [agentId]);
  
  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMsgs((m) => [...m, { from: "user", text: trimmed }]);
    setText("");
    setSending(true);
    try {
      const { reply } = await chatAgent(agentId!, trimmed);
      setMsgs((m) => [...m, { from: "agent", text: reply }]);
    } catch {
      setMsgs((m) => [...m, { from: "agent", text: "❌ Error sending message" }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <h1 className="text-xl font-bold text-gray-800">Chat with Agent</h1>

      <div className="h-80 overflow-y-auto p-4 bg-white rounded-lg shadow-lg space-y-2">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`px-3 py-2 rounded-lg shadow ${
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" ? (e.preventDefault(), send()) : null
          }
          disabled={sending}
          placeholder="Type your message…"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-green-700 shadow transition-shadow hover:shadow-md disabled:opacity-50"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
