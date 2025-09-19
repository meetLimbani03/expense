"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { ToolCallView } from "./ToolCallView";

type ApiOption = {
  label: string;
  value: string; // path
};

const API_OPTIONS: ApiOption[] = [
  { label: "Tools (original)", value: "/api/chat" },
  { label: "Text Similarity (context)", value: "/api/chat-context" },
  { label: "Embeddings (context)", value: "/api/chat-embeddings" },
];

export function ChatPanel() {
  const [apiPath, setApiPath] = useState<string>("/api/chat-embeddings");
  const { messages, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({ api: apiPath }),
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || status !== "ready") return;
    sendMessage({ text: v });
    setInput("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">API:</div>
        <select
          value={apiPath}
          onChange={(e) => setApiPath(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        >
          {API_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="h-[600px] overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">Ask me to extract expenses from your text.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') return <span key={index}>{part.text}</span>;
                    // Render tool calls if any are present from the backend
                    return (
                      <ToolCallView
                        key={index}
                        part={part}
                        onAnswer={async (answer) => {
                          const callId = (part as any).toolCallId as string;
                          await addToolResult({ tool: 'ask_for_input', toolCallId: callId, output: { answer } });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}


