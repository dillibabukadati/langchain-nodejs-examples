import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import dotenv from "dotenv";
dotenv.config();

const tavilySearchTool = new TavilySearchResults({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
});

const toolsByName = {
  tavily_search_results_json: tavilySearchTool,
};

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const messages = [
  new SystemMessage(
    `Your name is Helix. You are simple helpful chatbot. You answers to user queries in a friendly manner.
    Make your response simpler`
  ),
];

const modelWithTools = model.bindTools([tavilySearchTool]);

export const sendMessage = async (message) => {
  messages.push(new HumanMessage(message));
  const toolResponse = await modelWithTools.invoke(message);

  for (const toolCall of toolResponse.tool_calls) {
    const toolName = toolCall.name;
    const tool = toolsByName[toolName];
    const toolResponse = await tool.invoke(toolCall.args);
    messages.push(toolResponse);
  }
  const response = await model.invoke(messages);
  return response.content;
};