// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';
import * as readline from 'node:readline';

// Define a simple lookup tool
const lookupTool = createTool({
  id: 'lookup',
  inputSchema: z.object({ search: z.string() }),
  description: 'Looks up a value for a given search string',
  execute: async ({ context }) => {
    // Simulate a real tool call with a log
    console.log('[lookupTool] Got command:', context.search);
    // Return a fixed result for demonstration
    return { result: 'Pierre' };
  },
});

// Create the agent with the tool and a model
const agent = new Agent({
  name: 'Lookup Agent',
  instructions:
    'You are a helpful assistant that uses the lookup tool to search for an answer to every question.',
  model,
  tools: { lookupTool },
});

async function main() {
  const args = process.argv.slice(2);
  let message: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    message = await new Promise<string>((resolve) =>
      rl.question('Enter your message: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    message = args.join(' ');
  }
  const result = await agent.generate(message);
  console.log('Got response:', result.text);
}

main().catch(console.error);
