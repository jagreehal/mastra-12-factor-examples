// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';
import * as readline from 'node:readline';

// Define a tool that sometimes fails
const flakyTool = createTool({
  id: 'flaky-tool',
  inputSchema: z.object({ search: z.string() }),
  description: 'A tool that sometimes fails',
  execute: async ({ context }) => {
    if (Math.random() < 0.5) {
      console.log('[flakyTool] Tool failed');
      throw new Error(`Tool failed for search: ${context.search}`);
    }
    console.log('[flakyTool] Tool succeeded');
    return { result: 'Pierre' };
  },
});

const agent = new Agent({
  name: 'Flaky Tool Agent',
  instructions: 'Use the flaky-tool to answer questions.',
  model,
  tools: { flakyTool },
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
      rl.question('Enter your question: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    message = args.join(' ');
  }
  try {
    const result = await agent.generate(message);
    console.log('Agent response:', result.text);
  } catch (error) {
    console.error('Agent error:', error);
    // Optionally, retry or handle the error as needed
  }
}

main();
