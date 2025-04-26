import { ChatGroq } from "@langchain/groq";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";

const tools = [new TavilySearchResults({ maxResults: 1 })];
const prompt = await pull("hwchase17/react");

const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});

const agent = await createReactAgent({
  llm,
  tools,
  prompt,
});

const messages = [
  new SystemMessage(
    `Your name is Helix. You are simple helpful chatbot. You answers to user queries in a friendly manner.
    Make your response simpler`
  ),
];

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  // returnIntermediateSteps: true, // Set to true to log the steps.
  // verbose: true, // Set to true to log.
});

export const sendMessage = async (message) => {
  messages.push(new HumanMessage(message));
  const result = await agentExecutor.invoke({
    input: message,
    chatHistory: messages.map((msg)=>`${msg.getType()}:${msg.content}`).join("\n"),
  });
  messages.push(new AIMessage(result.output));

  return result.output;
};
