export type DocumentItem = {
  id: string;
  filename: string;
  createdAt: string;
};

export type DocumentDetail = {
  id: string;
  filename: string;
  createdAt: string;
  text: string;
  embeddings: { id: string; content: string }[];
  embeddingCount: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
