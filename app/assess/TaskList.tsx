"use client";

import { useState } from "react";
import type { DbTask } from "@/lib/db";

export function TaskList({ initialTasks }: { initialTasks: DbTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleTask = async (id: string, currentlyCompleted: boolean) => {
    const taskToRestore = tasks.find((t) => t.id === id);
    const originalIndex = tasks.findIndex((t) => t.id === id);

    // Optimistic update
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentlyCompleted }),
      });
      if (!res.ok) {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      if (taskToRestore) {
        setTasks((prev) => {
          const newTasks = [...prev];
          newTasks.splice(originalIndex, 0, taskToRestore);
          return newTasks;
        });
      }
    }
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (tasks.length === 0) {
    return <p className="text-sm text-muted">No outstanding tasks. Great job!</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((t) => {
        const isExpanded = expanded.has(t.id);
        return (
          <div key={t.id} className="flex gap-4 rounded-xl border border-line bg-card p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-line cursor-pointer"
              checked={t.completed}
              onChange={() => toggleTask(t.id, t.completed)}
            />
            <div>
              <p className="font-medium">{t.title}</p>
              <p
                className={`mt-1 text-sm text-muted ${isExpanded ? "" : "line-clamp-2"}`}
              >
                {t.description}
              </p>
              <button
                type="button"
                onClick={() => toggleExpanded(t.id)}
                className="mt-1 text-xs font-medium text-accent hover:underline"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className="font-medium text-accent">{t.timeframe.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
