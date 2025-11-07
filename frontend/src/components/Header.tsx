import { FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-3">
        <FileText className="w-5 h-5" />
        <h1 className="font-semibold">AI Document Chat</h1>
        <span className="text-xs text-gray-500 ml-2">
          upload • embed • chat
        </span>
      </div>
    </header>
  );
}
