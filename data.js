// download the pdf from following link if you don't have any
// https://aaai.org/wp-content/uploads/2025/03/AAAI-2025-PresPanel-Report-FINAL.pdf

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { OllamaEmbeddings } from "@langchain/ollama";

import dotenv from "dotenv";
dotenv.config();

const embeddings = new OllamaEmbeddings({
  model: "all-minilm",
  numCtx: 600,
  numCtxOverlap: 50,
});

const ingest = async () => {
  const pdfFilePath = "./AAAI-2025-PresPanel-Report-FINAL.pdf";
  const loader = new PDFLoader(pdfFilePath, {
    splitPages: true,
  });
  const rawDocuments = await loader.load();
  console.log("Original documents length: ", rawDocuments.length);

  // Splitting the documents into smaller chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 600,
    chunkOverlap: 100,
  });
  const docs = await textSplitter.splitDocuments(rawDocuments);
  console.log("Splitted documents length: ", docs.length);

  const pinecone = new PineconeClient();

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
  const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  console.log(`Adding ${docs.length} documents to vector store...`);
  await vectorStore.addDocuments(docs);
  console.log("Documents added to vector store");
};

export const queryRecords = async (query) => {
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
  const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  const results = await vectorStore.similaritySearch(query, 5);
  return results.map((doc) => doc.pageContent);
};



// Uncomment the following lines to run the ingest function
// ingest()
//   .then(() => {
//     console.log("Documents ingested successfully");
//   })
//   .catch((error) => {
//     console.error("Error ingesting documents: ", error);
//   });
