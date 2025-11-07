import { FastifyInstance } from "fastify";
import prisma from "../../lib/prisma";
import { OpenAI } from "openai";

export default async function chatRoutes(app: FastifyInstance) {
  app.get("/chat/stream", async (req, reply) => {
    try {
      const documentId = (req.query as any).documentId;
      const query = (req.query as any).query;

      if (!documentId || !query) {
        return reply.status(400).send({
          error: "documentId and query parameters are required",
        });
      }

      // Set headers for SSE
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      // Keep the connection alive
      const keepAlive = setInterval(() => {
        reply.raw.write(":\n\n");
      }, 15000);

      // 1️⃣ Generate query embedding
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        baseURL: process.env.OPENAI_BASE_URL!,
      });

      const embeddingResponse = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL!,
        input: query,
      });

      const queryVector = embeddingResponse.data[0].embedding;

      // 2️⃣ Find top similar chunks from DB
      const similarChunks = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT "content",
               1 - ("vector" <=> $1::vector) AS similarity
        FROM "Embedding"
        WHERE "documentId" = $2
        ORDER BY similarity DESC
        LIMIT 5;
      `,
        `[${queryVector.join(",")}]`,
        documentId
      );

      if (!similarChunks.length) {
        reply.raw.write(
          `data: ${JSON.stringify({ error: "No relevant chunks found" })}\n\n`
        );
        reply.raw.end();
        clearInterval(keepAlive);
        return;
      }

      const context = similarChunks.map((r) => r.content).join("\n\n");

      // 3️⃣ Stream the AI response
      const systemPrompt = `
You are a helpful assistant that answers based on provided context.
If context is irrelevant, respond: "I'm sorry, I couldn't find relevant information in the document."
Be concise and precise.
`;

      const userPrompt = `
Context:
${context}

Question:
${query}
`;

      const stream = await openai.chat.completions.create({
        model: process.env.CHAT_MODEL!,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 800,
        stream: true, // ✅ enables streaming mode
      });

      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content || "";
        if (token) {
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      reply.raw.end();
      clearInterval(keepAlive);
    } catch (error: any) {
      console.error("Stream error:", error);
      reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      reply.raw.end();
    }
  });
}
