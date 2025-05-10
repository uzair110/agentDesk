// app/chat/[agentId]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { chatAgent } from "../../lib/api";

export default function ChatPage() {
  const params = useParams() as { agentId?: string };
  const agentId = params.agentId!;
  const [messages, setMessages] = useState<{ from: "user" | "agent"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const { reply } = await chatAgent(agentId, text);
      setMessages((m) => [...m, { from: "agent", text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: "agent", text: "Error: no response" }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Chat with Agent</h1>
      <div className="border p-4 h-80 overflow-y-auto bg-white rounded space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded ${
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
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
          className="flex-grow border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" ? (e.preventDefault(), sendMessage()) : null
          }
          placeholder="Type a message…"
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
