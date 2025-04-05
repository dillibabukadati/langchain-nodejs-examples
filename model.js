import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// Reading the knowledge base from the file
const knowledgeBase = fs.readFileSync("./paracetamol.txt", "utf8");
const messages = [
  new SystemMessage(
    `Your name is Helix and are an AI assistant with preloaded knowledge. Use the provided knowledge to answer user queries in a simple and friendly manner.`
  ),
  // Adding the knowledge base to the messages
  new SystemMessage(`Knowledge base: ${knowledgeBase}`),
  new SystemMessage(`If you don't know the answer, say "I don't know". And say you can answer only about topic from the knowledge base.`),
];

export const sendMessage = async (message) => {
  messages.push(new HumanMessage(message));
  console.log("User message:", message);
  const response = await model.invoke(messages);
  console.log("Model response:", response);
  return response.content;
};
