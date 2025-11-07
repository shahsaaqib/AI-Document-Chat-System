# 🧠 AI Document Chat System

An intelligent **Document Understanding & Chat Application** that lets users **upload PDFs**, automatically **extract & embed their contents**, and then **chat with those documents** using an LLM via **OpenRouter** (or OpenAI).

Built with a **Retrieval-Augmented Generation (RAG)** pipeline for accurate, context-aware responses.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    A[📄 Upload PDF] --> B[🧩 Text Extraction via pdf.js-extract]
    B --> C[🔍 Chunking via LangChain Splitter]
    C --> D[🔢 Embedding via OpenRouter Embedding API]
    D --> E[(🗄️ PostgreSQL + pgvector)]
    F[💬 User Query] --> G[🔎 Similarity Search in pgvector]
    G --> H[🤖 LLM via OpenRouter Chat API]
    E --> G
    H --> I[🧠 AI Response Streamed to Frontend]
    I --> J[💬 Chat UI (React + Tailwind)]
```

---

## 🚀 Features

✅ **PDF Upload & Parsing** — Extracts text cleanly from uploaded documents
✅ **Automatic Chunking** — Uses `RecursiveCharacterTextSplitter` to split text intelligently
✅ **Embeddings with pgvector** — Stores document vectors in PostgreSQL for fast semantic search
✅ **AI Chat with Context Retrieval** — Chat intelligently with your uploaded PDFs
✅ **Real-Time Streaming** — Answers stream token-by-token, like ChatGPT
✅ **Modern Frontend UI** — React + Vite + Tailwind-based crisp interface
✅ **Modular Backend** — Fastify + Prisma + LangChain integration

---

## 🧰 Tech Stack

| Layer                | Technologies                                                  |
| -------------------- | ------------------------------------------------------------- |
| **Frontend**         | React 19, Vite, Tailwind CSS, Lucide Icons                    |
| **Backend**          | Node.js, Fastify, Prisma ORM                                  |
| **AI Stack**         | LangChain, OpenRouter (or OpenAI API)                         |
| **Database**         | PostgreSQL with `pgvector` extension                          |
| **Embedding Model**  | `text-embedding-3-small` (configurable)                       |
| **Chat Model**       | Any OpenRouter chat model (e.g., LLaMA 3.3 70B, Claude, etc.) |
| **Containerization** | Docker (for Postgres + pgvector)                              |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone [https://github.com/shahsaaqib/ai-document-chat.git](https://github.com/shahsaaqib/AI-Document-Chat-System.git)
cd ai-document-chat
```

---

### 2️⃣ Setup backend

```bash
cd backend
npm install
```

#### Create `.env` file:

```env
DATABASE_URL="postgresql://test/ai_doc_chat"
OPENAI_API_KEY="your-openrouter-or-openai-key"
OPENAI_BASE_URL="https://test/api/v1"
EMBEDDING_MODEL="text-test"
CHAT_MODEL="meta-llama/"
```

#### Start PostgreSQL (with pgvector)

```bash
docker run -d \
  --name pgvector-db \
  -e POSTGRES_USER=saaqib \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_doc_chat \
  -p 5432:5432 \
  ankane/pgvector:latest
```

#### Migrate database

```bash
npx prisma migrate deploy
```

#### Start backend server

```bash
npm run dev
```

Server runs at 👉 **[http://localhost:3000](http://localhost:3000)**

---

### 3️⃣ Setup frontend

```bash
cd ../frontend
npm install
```

#### Create `.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

#### Start frontend

```bash
npm run dev
```

Open 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 💬 How It Works

1️⃣ **Upload PDF**

* The backend extracts text and chunks it.
* Chunks are embedded into vectors and stored in Postgres.

2️⃣ **Ask Questions**

* Your query is embedded and compared to stored vectors.
* Top chunks are retrieved as context.

3️⃣ **AI Generates Answer**

* The retrieved context + query are passed to an LLM.
* The LLM response is streamed to the UI.

4️⃣ **Get Contextual Answers**

* Answers are grounded in your document — precise & relevant.

---

## 🧩 Folder Structure

```
ai-document-chat/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── upload/
│   │   │   ├── chat/
│   │   │   └── analysis/
│   │   ├── utils/
│   │   └── lib/
│   ├── prisma/
│   └── server.ts
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── App.tsx
```

---

## 🧠 Example Interaction

**User:** *“What technologies did this document mention?”*
**AI:**

> The document mentions Node.js, Express, PostgreSQL, MongoDB, AWS, Docker, and TypeScript as core technologies used.

---

## 🚧 Future Enhancements

* 🗑 Delete or re-embed documents
* 🧾 Save chat history per document
* 📚 Multi-document retrieval & comparison
* 🔒 Authentication & user profiles
* ☁️ Deploy on Render/Vercel + Railway

---

## 👨‍💻 Author

**Saaqib Ashraf**
Backend Developer | AI Engineer | Cloud Enthusiast

* 🌐 [LinkedIn](https://linkedin.com/in/saaqibashraf)
* 🧠 [GitHub](https://github.com/shahsaaqib)
* ✉️ [shahsaaqib01@gmail.com](mailto:shahsaaqib01@gmail.com)

---

## 🏁 License

This project is licensed under the **MIT License** – free to use, modify, and share.

---
