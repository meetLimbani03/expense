"use client";

import { useState } from "react";

export function ToolAnswerForm({ onSubmit }: { onSubmit: (answer: string) => void | Promise<void> }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        await onSubmit(v);
        setValue("");
      }}
      className="flex space-x-2"
    >
      <input
        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        placeholder="Type your answer…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm" type="submit">
        Send
      </button>
    </form>
  );
}


