// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md

import { Agent } from '@mastra/core/agent';
import { model } from '../model';
import * as readline from 'node:readline';

// Customizable prompt via instructions
function makeInstructions(style: string) {
  return `You must respond in the following style: ${style}`;
}

// Create the agent with a customizable prompt
function createPromptAgent(style: string) {
  return new Agent({
    name: 'Prompt Agent',
    instructions: makeInstructions(style),
    model,
  });
}

// Example of a more complex prompt (chat-style)
const piratePrompt = `
You are a pirate. Respond to all questions in pirate speak.
`;

const chatAgent = new Agent({
  name: 'ChatPromptAgent',
  instructions: piratePrompt,
  model,
});

async function main() {
  const args = process.argv.slice(2);
  let message: string;
  let style: string;
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
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    style = await new Promise<string>((resolve) =>
      rl2.question('Enter a style (e.g., pirate): ', (answer) => {
        rl2.close();
        resolve(answer);
      }),
    );
  } else {
    message = args[0] ?? '';
    style = args[1] ?? 'Talk like a pirate';
  }
  const agent = createPromptAgent(style);
  const result = await agent.generate(message);
  console.log('Agent response (simple style):', result.text);
  const chatResult = await chatAgent.generate(message);
  console.log('Agent response (chat style):', chatResult.text);
}

main();
