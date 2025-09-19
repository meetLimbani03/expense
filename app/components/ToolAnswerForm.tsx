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
        className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        placeholder="Type your answer…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="px-3 py-2 rounded bg-blue-600 text-white" type="submit">
        Send
      </button>
    </form>
  );
}


