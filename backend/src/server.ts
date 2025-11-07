import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import uploadRoutes from "./modules/upload/upload.route";
import chatRoutes from "./modules/chat/chat.route";
// import documentsRoutes from "./modules/documents/documents.route";

dotenv.config();

const app = Fastify({ logger: true });

// --- Plugins ---
app.register(cors, { origin: "*" });
app.register(multipart);

// --- Routes ---
app.register(uploadRoutes);
app.register(chatRoutes);
// app.register(documentsRoutes);

app.get("/", async () => ({
  message: "AI Document Chat API running 🚀",
}));

// --- Start Server ---
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("✅ Server running on http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
