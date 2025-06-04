// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md

import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { model } from '../model';
import * as readline from 'node:readline';

// Configure memory with storage to keep track of the last 10 messages
const memory = new Memory({
  storage: new LibSQLStore({
    url: ':memory:', // Use in-memory storage for this demo
  }),
  options: { lastMessages: 10 },
});

const agent = new Agent({
  name: 'Memory Agent',
  instructions: 'Remember the user name and recall it when asked.',
  model,
  memory,
});

// Memory context identifiers - these are required for Mastra Memory to persist conversation history
const threadId = 'factor03-demo-thread';
const resourceId = 'factor03-demo-user';

async function main() {
  const args = process.argv.slice(2);
  let name: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    name = await new Promise<string>((resolve) =>
      rl.question('Enter your name: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    name = args.join(' ');
  }
  // Set the user's name in memory
  await agent.generate(`My name is ${name}`, { threadId, resourceId });
  // Ask the agent to recall the name
  const result = await agent.generate("What's my name again?", {
    threadId,
    resourceId,
  });
  console.log('Agent response (recall):', result.text);
  // Show that memory is working by asking again
  const result2 = await agent.generate('Can you remind me of my name?', {
    threadId,
    resourceId,
  });
  console.log('Agent response (recall 2):', result2.text);
}

main();
