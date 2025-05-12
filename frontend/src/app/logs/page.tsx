"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { listAllLogs } from "../lib/api";

type LogEntry = {
  id: number
  agentId: string
  metaData: {
    raw: string
  }
  query: string
  response: string
  ts: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const response = await listAllLogs();
      const newLogs = [...response];
      setLogs(newLogs);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      default:
        return "text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Logs</h1>
      <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[80vh]">
        {logs.map((log) => (
          <div key={log.id} className="py-2 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                {(() => {
                  try {
                    return format(new Date(log.ts), "yyyy-MM-dd HH:mm:ss.SSS")
                  } catch {
                    return log.ts
                  }
                })()}
              </span>
              <span className="text-blue-400">ID: {log.id}</span>
              <span className="text-gray-400">Agent: {log.agentId}</span>
            </div>
            <div className="mt-2 ml-4">
              <div className="text-green-400">Query: {log.query}</div>
              <div className="text-blue-400 mt-1">Response: {log.response}</div>
              {log.metaData && (
                <pre className="mt-1 text-gray-400 text-xs">
                  {JSON.stringify(log.metaData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
