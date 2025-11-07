import { useEffect, useMemo, useRef, useState } from "react";
import { getDocument } from "../api/documents";
import { openChatStream } from "../api/chat";
import type { ChatMessage, DocumentDetail } from "../types";
import MessageBubble from "./MessageBubble";
import { Send, FileText } from "lucide-react";

type Props = { documentId: string | null };

export default function ChatPanel({ documentId }: Props) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<() => void>();

  // load document detail when selected
  useEffect(() => {
    if (!documentId) {
      setDoc(null);
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const d = await getDocument(documentId);
        setDoc(d);
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Loaded "${d.filename}". You can ask questions now! (Chunks: ${d.embeddingCount})`,
          },
        ]);
      } catch (e: any) {
        setDoc(null);
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Failed to load document.",
          },
        ]);
      }
    })();
  }, [documentId]);

  const canSend = useMemo(
    () => !!documentId && input.trim().length > 0 && !streaming,
    [documentId, input, streaming]
  );

  function send() {
    if (!documentId || !canSend) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    abortRef.current = openChatStream(
      documentId,
      userMsg.content,
      (token) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantMsg.id
              ? { ...msg, content: msg.content + token }
              : msg
          )
        );
      },
      () => setStreaming(false),
      (err) => {
        setStreaming(false);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantMsg.id
              ? { ...msg, content: "⚠️ Stream error. Try again." }
              : msg
          )
        );
        console.error(err);
      }
    );
  }

  useEffect(() => {
    return () => {
      abortRef.current?.();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* doc header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-white">
        <FileText className="w-4 h-4" />
        <div className="truncate">
          <div className="text-sm font-medium truncate">
            {doc?.filename ?? "No document selected"}
          </div>
          {doc && (
            <div className="text-[11px] text-gray-500">
              Embeddings: {doc.embeddingCount}
            </div>
          )}
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-white">
        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} />
        ))}
        {!documentId && (
          <div className="text-sm text-gray-500">
            Pick or upload a document to start chatting.
          </div>
        )}
      </div>

      {/* input bar */}
      <div className="border-t p-3 bg-white">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask something about this document…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
            disabled={!documentId || streaming}
          />
          <button
            onClick={send}
            disabled={!canSend}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-blue-600 text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Ask
          </button>
        </div>
        {streaming && (
          <div className="text-[11px] text-gray-500 mt-1">Streaming…</div>
        )}
      </div>
    </div>
  );
}
