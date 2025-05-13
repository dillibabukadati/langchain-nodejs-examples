import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { formatLogToString } from "langchain/agents/format_scratchpad/log";
import { DynamicTool } from "@langchain/core/tools";
import { ReActSingleInputOutputParser } from "langchain/agents/react/output_parser";
import { PromptTemplate } from "@langchain/core/prompts";

const getTextLength = new DynamicTool({
  name: "get_text_length",
  description: "Returns the length of the text by characters",
  func: async (input) => {
    const cleaned = input
      .trim()
      .replace(/^'+|'+$/g, "")
      .replace(/\n/g, "");
    return cleaned.length.toString();
  },
});

function findToolByName(tools, toolName) {
  const found = tools.find((t) => t.name === toolName);
  if (!found) throw new Error(`Tool with name ${toolName} not found`);
  return found;
}

const tools = [getTextLength];
const toolNames = tools.map((t) => t.name).join(", ");
const toolDescriptions = tools
  .map((t) => `- ${t.name}: ${t.description}`)
  .join("\n");

const template = `
Answer the following questions as best you can. You have access to the following tools:

${toolDescriptions}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolNames}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}

`;

const prompt = PromptTemplate.fromTemplate(template);

const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  stop: ["\nObservation"],
});

const parser = new ReActSingleInputOutputParser({
  toolNames: tools.map((t) => t.name),
});

const inputQuestion =
  "What is the length of 'DOG' and King in characters give separately";

const intermediateSteps = [];

let agentStep;

while (true) {
  const formattedPrompt = await prompt.format({
    input: inputQuestion,
    agent_scratchpad: formatLogToString(intermediateSteps),
  });

  const llmResponse = await llm.invoke(formattedPrompt);
  agentStep = await parser.parse(llmResponse.content);

  console.log(agentStep);
  
  if (agentStep.tool === undefined) {
    console.log("Final Answer:", agentStep.returnValues.output);
    break;
  }

  const toolToUse = findToolByName(tools, agentStep.tool);
  const observation = await toolToUse.func(agentStep.toolInput);
  console.log(`observation: ${observation}`);

  intermediateSteps.push({
    action: agentStep,
    observation,
  });
}
