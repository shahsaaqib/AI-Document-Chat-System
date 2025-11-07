import { useRef, useState } from "react";
import { uploadPdf } from "../api/documents";
import { Upload } from "lucide-react";

type Props = {
  onUploaded: (docId: string) => void;
};

export default function UploadBox({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setProgress("Uploading...");
    try {
      const res = await uploadPdf(file);
      setProgress(`Embedded ${res.chunkCount} chunks`);
      onUploaded(res.id);
    } catch (e: any) {
      alert(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 1500);
    }
  }

  return (
    <div className="p-3 border rounded-xl bg-white">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mx-auto mb-2" />
        <p className="text-sm">Click to upload a PDF</p>
        <p className="text-xs text-gray-500">
          We’ll extract text, create embeddings and make it chat-ready.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {loading && (
        <p className="text-xs text-blue-600 mt-2">
          {progress ?? "Processing..."}
        </p>
      )}
    </div>
  );
}
