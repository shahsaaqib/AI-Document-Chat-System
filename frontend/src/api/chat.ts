import { API_BASE } from "./client";

export function openChatStream(
  documentId: string,
  query: string,
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: any) => void
) {
  const url = `${API_BASE}/chat/stream?documentId=${encodeURIComponent(
    documentId
  )}&query=${encodeURIComponent(query)}`;
  const es = new EventSource(url);

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.token) onToken(data.token);
      if (data.done) {
        es.close();
        onDone();
      }
      if (data.error) {
        onError(new Error(data.error));
        es.close();
      }
    } catch (err) {
      onError(err);
      es.close();
    }
  };

  es.onerror = (e) => {
    onError(e);
    es.close();
  };

  return () => es.close();
}
