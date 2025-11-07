import { useEffect, useState } from "react";
import { listDocuments } from "../api/documents";
import type { DocumentItem } from "../types";
import { FileText } from "lucide-react";
import clsx from "clsx";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  refreshSignal?: number; // bump to refresh after upload
};

export default function DocumentList({
  selectedId,
  onSelect,
  refreshSignal,
}: Props) {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await listDocuments();
        setDocs(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshSignal]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        {loading ? "Loading..." : `${docs.length} documents`}
      </div>
      <ul className="space-y-1">
        {docs.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => onSelect(d.id)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2",
                selectedId === d.id && "bg-gray-100"
              )}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-sm font-medium truncate">{d.filename}</div>
                <div className="text-[11px] text-gray-500">
                  {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
