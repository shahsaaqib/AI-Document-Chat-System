import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";
import prisma from "../../lib/prisma";
import { chunkAndEmbedText } from "../../utils/pdfUtils";

/**
 * Upload Route — Handles:
 * - PDF upload
 * - Text extraction via pdf.js-extract
 * - Chunking + embedding via LangChain
 * - Storing data into PostgreSQL (pgvector)
 */
export default async function uploadRoutes(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    try {
      const data = await req.file(); // multipart file
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      // --- Ensure uploads dir exists ---
      const uploadDir = path.join(__dirname, "../../../uploads");
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // --- Save uploaded file temporarily ---
      const tempPath = path.join(uploadDir, data.filename);
      const fileBuffer = await data.toBuffer();
      await fs.promises.writeFile(tempPath, fileBuffer);

      // --- Extract text using pdf.js-extract ---
      const pdfExtract = new PDFExtract();
      const options: PDFExtractOptions = {};
      const pdfData = await pdfExtract.extractBuffer(fileBuffer, options);

      // Combine text from all pages
      const text = pdfData.pages
        .map((page) => page.content.map((c) => c.str).join(" "))
        .join("\n")
        .trim();

      if (!text || text.length < 100) {
        await fs.promises.unlink(tempPath);
        return reply.status(422).send({
          error: "Failed to extract sufficient text from PDF.",
        });
      }

      // --- Save document record ---
      const document = await prisma.document.create({
        data: {
          filename: data.filename,
          text,
        },
      });

      // --- Process chunks + embeddings ---
      const chunkCount = await chunkAndEmbedText(document.id, text);

      // --- Cleanup ---
      await fs.promises.unlink(tempPath);

      return reply.status(200).send({
        message: "Document uploaded and embedded successfully ✅",
        documentId: document.id,
        filename: document.filename,
        chunkCount,
      });
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      return reply.status(500).send({
        error: "Failed to process uploaded document",
        details: error.message,
      });
    }
  });
  /**
   * 🧾 GET /documents → list all documents
   */
  app.get("/uploads", async (req, reply) => {
    try {
      const documents = await prisma.document.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          filename: true,
          createdAt: true,
          text: false,
          embeddings: false,
        },
      });

      return reply.status(200).send({
        count: documents.length,
        documents,
      });
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      return reply.status(500).send({
        error: "Failed to fetch documents",
        details: error.message,
      });
    }
  });

  /**
   * 📄 GET /upload/:id → fetch a single document + its embeddings
   */
  app.get("/upload/:id", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          embeddings: {
            select: {
              id: true,
              content: true,
              // can't include vector here because Prisma doesn’t support Unsupported("vector")
              // vector is still stored in DB and accessible via raw SQL if needed
            },
          },
        },
      });

      if (!document) {
        return reply.status(404).send({ error: "Document not found" });
      }

      return reply.status(200).send({
        ...document,
        embeddingCount: document.embeddings.length,
      });
    } catch (error: any) {
      console.error("Error fetching document details:", error);
      return reply.status(500).send({
        error: "Failed to fetch document details",
        details: error.message,
      });
    }
  });
}
