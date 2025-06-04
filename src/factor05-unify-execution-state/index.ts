// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md

import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { model } from '../model';
import * as readline from 'node:readline';

// This example demonstrates how an agent can maintain and use state (memory) across multiple turns.
// The agent will remember your name and recall it later, using Mastra's built-in memory.

// Configure memory with storage for state persistence
const memory = new Memory({
  storage: new LibSQLStore({
    url: ':memory:', // Use in-memory storage for this demo
  }),
  options: { lastMessages: 10 },
});

const agent = new Agent({
  name: 'Stateful Agent',
  instructions: `Remember the user's name if they tell you, and recall it when asked.`,
  model,
  memory,
});

// Memory context identifiers - these are required for Mastra Memory to persist conversation history
const threadId = 'factor05-demo-thread';
const resourceId = 'factor05-demo-user';

async function main() {
  const args = process.argv.slice(2);
  let message: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    message = await new Promise<string>((resolve) =>
      rl.question('You: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    message = args.join(' ');
  }
  let result = await agent.generate(message, { threadId, resourceId });
  console.log('Agent:', result.text);
  // Optionally, loop if agent asks for more info (simulate follow-up)
  while (
    result.text &&
    result.text.toLowerCase().includes('tell me your name')
  ) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    message = await new Promise<string>((resolve) =>
      rl.question('You: ', (answer: string) => {
        rl.close();
        resolve(answer);
      }),
    );
    result = await agent.generate(message, { threadId, resourceId });
    console.log('Agent:', result.text);
  }
}

main().catch(console.error);
