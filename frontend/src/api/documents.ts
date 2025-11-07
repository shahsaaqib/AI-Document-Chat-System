import { api } from "./client";
import type { DocumentItem, DocumentDetail } from "../types";

export async function listDocuments(): Promise<DocumentItem[]> {
  const res = await api.get("/uploads");
  return res.data.documents as DocumentItem[];
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  // backend route kept as /upload/:id per your request
  const res = await api.get(`/upload/${id}`);
  return res.data as DocumentDetail;
}

export async function uploadPdf(
  file: File
): Promise<{ id: string; filename: string; chunkCount: number }> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // your backend returns { id, filename, chunkCount } in AI Doc Chat
  return res.data;
}
