import UploadBox from "./UploadBox";
import DocumentList from "./DocumentList";
import { useState } from "react";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUploaded: (id: string) => void;
};

export default function Sidebar({ selectedId, onSelect, onUploaded }: Props) {
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <aside className="w-80 border-r bg-white h-full flex flex-col">
      <div className="p-3">
        <UploadBox
          onUploaded={(id) => {
            setRefreshSignal((s) => s + 1);
            onUploaded(id);
          }}
        />
      </div>
      <div className="px-3 pb-3 overflow-auto">
        <DocumentList
          selectedId={selectedId}
          onSelect={onSelect}
          refreshSignal={refreshSignal}
        />
      </div>
    </aside>
  );
}
