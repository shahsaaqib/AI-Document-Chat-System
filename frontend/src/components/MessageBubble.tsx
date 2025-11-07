import type { ChatMessage } from "../types";
import clsx from "clsx";

export default function MessageBubble({ role, content }: ChatMessage) {
  const mine = role === "user";
  return (
    <div
      className={clsx("w-full flex", mine ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
          mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        )}
      >
        {content}
      </div>
    </div>
  );
}
