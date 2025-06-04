// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import * as readline from 'node:readline';

// This example demonstrates how a workflow can be paused and resumed.
// The workflow doubles a value, then (if < 100) suspends and waits for resume.
// In a real app, you would serialize the workflow state and resume it later.

const stepOneFixed = createStep({
  id: 'stepOne',
  inputSchema: z.object({ clarifiedValue: z.number() }),
  outputSchema: z.object({ doubled: z.number() }),
  async execute({ inputData }) {
    return { doubled: inputData.clarifiedValue * 2 };
  },
});

const stepTwo = createStep({
  id: 'stepTwo',
  inputSchema: z.object({ doubled: z.number() }),
  outputSchema: z.object({ incremented: z.number() }),
  async execute({ inputData, suspend }) {
    if (inputData.doubled < 100) {
      await suspend({}); // Pauses the workflow here
      // When resumed, you could provide new inputData
      return { incremented: 0 };
    }
    return { incremented: inputData.doubled + 1 };
  },
});

// Add a clarification step to request human input if input is invalid
const clarificationStep = createStep({
  id: 'clarificationStep',
  inputSchema: z.object({ inputValue: z.any() }),
  outputSchema: z.object({ clarifiedValue: z.number() }),
  async execute({ inputData, suspend }) {
    if (
      typeof inputData.inputValue !== 'number' ||
      Number.isNaN(inputData.inputValue)
    ) {
      await suspend({
        message: 'Please provide a valid number for inputValue.',
      });
      // When resumed, you could provide new inputData
      return { clarifiedValue: 0 };
    }
    return { clarifiedValue: inputData.inputValue };
  },
});

const improvedWorkflow = createWorkflow({
  id: 'pause-resume-clarification-workflow',
  inputSchema: z.object({ inputValue: z.any() }),
  outputSchema: z.object({ incremented: z.number() }),
  steps: [clarificationStep, stepOneFixed, stepTwo],
})
  .then(clarificationStep)
  .then(stepOneFixed)
  .then(stepTwo)
  .commit();

async function main() {
  const args = process.argv.slice(2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let inputValue: any;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await new Promise<string>((resolve) =>
      rl.question('Enter a number: ', (a) => {
        rl.close();
        resolve(a);
      }),
    );
    inputValue = Number(answer);
    if (Number.isNaN(inputValue)) inputValue = answer;
  } else {
    inputValue = Number(args[0]);
    if (Number.isNaN(inputValue)) inputValue = args[0];
  }
  // Start the improved workflow with user input
  const improvedRun = improvedWorkflow.createRun();
  const improvedResult = await improvedRun.start({ inputData: { inputValue } });
  console.log('Improved workflow execution result:', improvedResult.status);
  if (improvedResult.status === 'suspended') {
    console.log(
      'Workflow suspended for clarification, resuming with valid input...',
    );
    // Resume with valid input (clarifiedValue)
    const resumed = await improvedRun.resume({
      step: 'clarificationStep',
      resumeData: { clarifiedValue: 42 },
    });
    if (resumed.status === 'success' && resumed.result) {
      console.log('Resumed workflow result:', resumed.status, resumed.result);
    } else {
      console.log('Resumed workflow status:', resumed.status);
    }
  } else if (improvedResult.status === 'success' && improvedResult.result) {
    console.log(
      'Workflow completed successfully:',
      improvedResult.result.incremented,
    );
  } else if (improvedResult.status === 'failed') {
    console.log('Workflow failed:', improvedResult.error);
  } else {
    console.log('Workflow status:', improvedResult.status);
  }
}

main();
