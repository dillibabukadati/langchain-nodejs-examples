import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { queryRecords } from "./data.js";
dotenv.config();

const model = new ChatGroq({
  model: "llama3-8b-8192",
  temperature: 0,
});

const messages = [
  new SystemMessage(
    `Your name is Helix. You are simple helpful chatbot. You answers to user queries in a friendly manner.
    Make your response simpler`
  ),
];

export const sendMessage = async (message) => {
  const context = await queryRecords(message);
  messages.push(
    new SystemMessage(`
    Your response should be based on the context provided and for the user query.
    Context: ${context}
    User Query: ${message}
    Your answer should never go out of the context. If you don't know the answer, say "I don't know".
    `)
  );
  const response = await model.invoke(messages);
  return response.content;
};
