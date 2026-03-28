"use client";

import { useState } from "react";

export default function LessonForm() {
  const [outline, setOutline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outline.trim()) {
      setError("Please enter a lesson outline.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to start generation");
      }

      setOutline("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 rounded-2xl shadow-sm bg-gradient-to-r from-sky-50 to-indigo-50 border border-indigo-100"
    >
      <div>
        <label
          htmlFor="outline"
          className="block text-sm font-medium text-indigo-800 mb-2"
        >
          Lesson Outline
        </label>
        <textarea
          id="outline"
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full p-3 border border-indigo-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-300 focus:outline-none placeholder-gray-400"
          placeholder="e.g., 'A 10-question pop quiz on Florida'"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition disabled:bg-indigo-200"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}
