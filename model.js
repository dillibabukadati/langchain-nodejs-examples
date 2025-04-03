import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
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
  messages.push(new HumanMessage(message));
  const response = await model.invoke(messages);
  return response.content;
};
