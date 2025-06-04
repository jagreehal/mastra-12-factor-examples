// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import * as readline from 'node:readline';

// This example demonstrates a workflow step that pauses for human input.
// In a real app, you would resume the workflow with user input.

const humanStep = createStep({
  id: 'human-input',
  inputSchema: z.object({ clarifiedMessage: z.string() }),
  outputSchema: z.object({ confirmed: z.boolean() }),
  async execute({ inputData, suspend }) {
    console.log(
      'Pausing for human input...',
      JSON.stringify(inputData, null, 2),
    );
    await suspend({}); // Pauses for human input
    // In a real app, resume would provide the value
    return { confirmed: true };
  },
});

// Add a clarification step to request human input if input is missing
const clarificationStep = createStep({
  id: 'clarificationStep',
  inputSchema: z.object({ userMessage: z.string().optional() }),
  outputSchema: z.object({ clarifiedMessage: z.string() }),
  async execute({ inputData, suspend }) {
    if (!inputData.userMessage) {
      await suspend({ message: 'Please provide your message.' });
      // When resumed, you could provide new inputData
      return { clarifiedMessage: '' };
    }
    return { clarifiedMessage: inputData.userMessage };
  },
});

const improvedWorkflow = createWorkflow({
  id: 'human-in-the-loop-clarification',
  inputSchema: z.object({ userMessage: z.string().optional() }),
  outputSchema: z.object({ confirmed: z.boolean() }),
  steps: [clarificationStep, humanStep],
})
  .then(clarificationStep)
  .then(humanStep)
  .commit();

async function main() {
  const args = process.argv.slice(2);
  let userMessage: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    userMessage = await new Promise<string>((resolve) =>
      rl.question('Enter your message: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    userMessage = args.join(' ');
  }
  // Start the improved workflow with user input
  const improvedRun = improvedWorkflow.createRun();
  const improvedResult = await improvedRun.start({
    inputData: { userMessage },
  });
  console.log('Improved workflow execution result:', improvedResult.status);
  if (improvedResult.status === 'suspended') {
    console.log(
      'Workflow suspended for clarification, resuming with user message...',
    );
    // Resume with valid input (clarifiedMessage)
    const resumed = await improvedRun.resume({
      step: 'clarificationStep',
      resumeData: { clarifiedMessage: userMessage },
    });
    if (resumed.status === 'success' && resumed.result) {
      console.log('Resumed workflow result:', resumed.status, resumed.result);
    } else {
      console.log('Resumed workflow status:', resumed.status);
    }
  }
}

main();
