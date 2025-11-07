import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import prisma from "../lib/prisma";
import { createId } from "@paralleldrive/cuid2";

/**
 * Splits large text into semantic chunks,
 * generates embeddings, and stores them efficiently in pgvector.
 */
export async function chunkAndEmbedText(documentId: string, text: string) {
  try {
    // --- 1️⃣ Split text ---
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(text);
    console.log(`🧩 Split into ${chunks.length} chunks`);

    if (chunks.length === 0) return 0;

    // --- 2️⃣ Create embeddings model ---
    const embeddings = new OpenAIEmbeddings({
      model: process.env.EMBEDDING_MODEL!,
      apiKey: process.env.OPENAI_API_KEY!,
      configuration: { baseURL: process.env.OPENAI_BASE_URL },
    });

    // --- 3️⃣ Embed all chunks in parallel ---
    console.log("⚙️ Generating embeddings in parallel...");
    const vectors = await Promise.all(
      chunks.map((chunk) => embeddings.embedQuery(chunk))
    );

    // --- 4️⃣ Batch insert into Postgres ---
    const batchSize = 50; // adjust for performance vs memory
    let totalInserted = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchVectors = vectors.slice(i, i + batchSize);

      // Build VALUES section dynamically
      const valuesSql = batchChunks
        .map(
          (_, idx) =>
            `('${createId()}', '${documentId}', $${idx * 2 + 1}, $${
              idx * 2 + 2
            }::vector)`
        )
        .join(", ");

      const queryParams: any[] = [];
      batchChunks.forEach((chunk, idx) => {
        queryParams.push(chunk);
        queryParams.push(`[${batchVectors[idx].join(",")}]`);
      });

      const query = `
        INSERT INTO "Embedding" ("id", "documentId", "content", "vector")
        VALUES ${valuesSql};
      `;

      await prisma.$executeRawUnsafe(query, ...queryParams);
      totalInserted += batchChunks.length;

      console.log(`✅ Inserted batch: ${totalInserted}/${chunks.length}`);
    }

    console.log(`🎯 Successfully embedded ${totalInserted} chunks total.`);
    return totalInserted;
  } catch (error: any) {
    console.error("❌ chunkAndEmbedText error:", error);
    throw new Error("Failed to chunk and embed text: " + error.message);
  }
}
