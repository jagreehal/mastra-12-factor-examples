// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md

import { Agent } from '@mastra/core/agent';
import { model } from '../model';
import * as readline from 'node:readline';

// Define two small, focused agents
const thinkAgent = new Agent({
  name: 'ThinkAgent',
  instructions: 'You think about a topic.',
  model,
});

const writeAgent = new Agent({
  name: 'WriteAgent',
  instructions: 'You write about a topic.',
  model,
});

async function main() {
  // Get topic from CLI arg or prompt
  let topic = process.argv[2];
  if (!topic) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    topic = await new Promise<string>((resolve) =>
      rl.question('Enter a topic: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  }

  // Step 1: Think
  const thoughts = await thinkAgent.generate(topic);
  console.log('\nThinkAgent output:', thoughts.text);

  // Step 2: Ask for approval before writing
  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const approval = await new Promise<string>((resolve) =>
    rl2.question('Approve writing about these thoughts? (y/n): ', (answer) => {
      rl2.close();
      resolve(answer.trim().toLowerCase());
    }),
  );
  if (approval !== 'y') {
    console.log('Writing step was not approved. Exiting.');
    return;
  }

  // Step 3: Write
  const writing = await writeAgent.generate(thoughts.text);
  console.log('\nWriteAgent output:', writing.text);
  console.log('\nWorkflow result:', writing.text);
}

main();
