// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md

import { Agent } from '@mastra/core/agent';
import { model } from '../model';
import * as readline from 'node:readline';

const agent = new Agent({
  name: 'Trigger Agent',
  instructions: 'Handle external events and respond.',
  model,
});

async function main() {
  // Get event from CLI arg or prompt
  let event = process.argv[2];
  if (!event) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    event = await new Promise<string>((resolve) =>
      rl.question('Enter an event to trigger the agent: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  }
  console.log('Received external event:', event);
  const result = await agent.generate(`Handle event: ${event}`);
  console.log('Agent response:', result.text);
}

main();
