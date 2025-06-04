// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';
import * as readline from 'node:readline';

// Define a tool with a structured input and output schema
const famousPersonTool = createTool({
  id: 'famous-person',
  inputSchema: z.object({ category: z.string().optional() }),
  outputSchema: z.object({ name: z.string(), birthday: z.string() }),
  description:
    'Returns a famous person and their birthday, optionally filtered by category',
  execute: async ({ context }) => {
    // Use the category input to determine which person to return
    const category = context.category || 'default';
    if (
      category.toLowerCase().includes('math') ||
      category.toLowerCase().includes('computer')
    ) {
      return { name: 'Ada Lovelace', birthday: '1815-12-10' };
    } else if (category.toLowerCase().includes('science')) {
      return { name: 'Marie Curie', birthday: '1867-11-07' };
    } else {
      return { name: 'Ada Lovelace', birthday: '1815-12-10' };
    }
  },
});

const agent = new Agent({
  name: 'Structured Output Agent',
  instructions:
    'Use the famous-person tool to answer questions about famous people.',
  model,
  tools: { famousPersonTool },
});

// Runnable example using top-level await (Node.js style)
// The agent will call the tool and return a structured output
const result = await agent.generate(
  'Give me a famous person and their exact date of birth',
);
console.log('Agent response (structured):', result.text);
// Optionally, show the raw tool output if available
// toolResults is an array of { type, toolCallId, toolName, args, result }
const toolResult = result.toolResults?.find(
  (tr) => tr.toolName === 'famous-person',
);
if (toolResult && toolResult.result) {
  console.log('Tool output:', toolResult.result);
}

// --- Multi-step calculator tool example ---

const addTool = createTool({
  id: 'add',
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  description: 'Adds two numbers',
  execute: async ({ context }) => ({ result: context.a + context.b }),
});

const multiplyTool = createTool({
  id: 'multiply',
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  description: 'Multiplies two numbers',
  execute: async ({ context }) => ({ result: context.a * context.b }),
});

const calculatorAgent = new Agent({
  name: 'Calculator Agent',
  instructions:
    'Use add and multiply tools to solve math problems step by step.',
  model,
  tools: { addTool, multiplyTool },
});

// Multi-step example: multiply 3 and 4, then add 2
const multResult = await calculatorAgent.generate('What is (3 * 4) + 2?');
console.log('Calculator agent response:', multResult.text);
const calcToolResults = multResult.toolResults;
if (calcToolResults) {
  for (const tr of calcToolResults) {
    console.log(`Tool: ${tr.toolName}, Args:`, tr.args, 'Result:', tr.result);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let message: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    message = await new Promise<string>((resolve) =>
      rl.question('Enter your question about a famous person: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    message = args.join(' ');
  }
  // The agent will call the tool and return a structured output
  const result = await agent.generate(message);
  console.log('Agent response (structured):', result.text);
  // Optionally, show the raw tool output if available
  const toolResult = result.toolResults?.find(
    (tr) => tr.toolName === 'famous-person',
  );
  if (toolResult && toolResult.result) {
    console.log('Tool output:', toolResult.result);
  }

  // --- Multi-step calculator tool example ---
  const multResult = await calculatorAgent.generate('What is (3 * 4) + 2?');
  console.log('Calculator agent response:', multResult.text);
  const calcToolResults = multResult.toolResults;
  if (calcToolResults) {
    for (const tr of calcToolResults) {
      console.log(`Tool: ${tr.toolName}, Args:`, tr.args, 'Result:', tr.result);
    }
  }
}

main();
