import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-56px)] flex">
      <Sidebar
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUploaded={(id) => setSelectedId(id)}
      />
      <main className="flex-1 bg-gray-50">
        <ChatPanel documentId={selectedId} />
      </main>
    </div>
  );
}
