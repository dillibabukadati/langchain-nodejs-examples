import { tool } from "@langchain/core/tools";
import { z } from "zod";
// Hardcoded userId for the consistency of the example.
const USER_ID = 5;

// Get Todos API.
export const getTodos = tool(
  async () => {
    const result = await fetch(`https://dummyjson.com/todos/user/${USER_ID}`);
    return await result.text();
  },
  {
    name: "get_todos",
    description: "Get todos. Returns a list of todos.",
  }
);

const addTodoSchema = z.object({
  todo: z.string().describe("Todo to add"),
});

export const addTodo = tool(
  async (input) => {
    const todo = input.todo;
    const result = await fetch(`https://dummyjson.com/todos/add`, {
      method: "POST",
      body: JSON.stringify({
        userId: USER_ID,
        completed: false,
        todo,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await result.text();
  },
  {
    name: "add_todo",
    description: "Add a todo. Returns the added todo.",
    argsSchema: addTodoSchema,
  }
);
