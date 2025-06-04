// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import * as readline from 'node:readline';

// This example demonstrates a custom control flow with three steps.
// Each step logs its progress and passes data to the next.

const stepOne = createStep({
  id: 'stepOne',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  async execute({ inputData }) {
    console.log('Step 1: Start', JSON.stringify(inputData, null, 2));
    return { result: 'First step complete.' };
  },
});

const stepTwo = createStep({
  id: 'stepTwo',
  inputSchema: z.object({ result: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  async execute({ inputData }) {
    console.log('Step 2:', inputData.result);
    return { result: 'Second step complete.' };
  },
});

const stepThree = createStep({
  id: 'stepThree',
  inputSchema: z.object({ result: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  async execute({ inputData }) {
    console.log('Step 3:', JSON.stringify(inputData, null, 2));
    return { result: 'Workflow complete.' };
  },
});

const workflow = createWorkflow({
  id: 'custom-control-flow',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  steps: [stepOne, stepTwo, stepThree],
})
  .then(stepOne)
  .then(stepTwo)
  .then(stepThree)
  .commit();

async function main() {
  const args = process.argv.slice(2);
  let inputMessage: string;
  if (args.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    inputMessage = await new Promise<string>((resolve) =>
      rl.question('Enter a message to start the workflow: ', (answer) => {
        rl.close();
        resolve(answer);
      }),
    );
  } else {
    inputMessage = args.join(' ');
  }
  // The workflow doesn't use the input, but we log it for consistency
  console.log('Workflow input:', inputMessage);
  const run = workflow.createRun();
  const result = await run.start({ inputData: {} });
  if (result.status === 'success') {
    const stepResult = result.steps[stepThree.id];
    if (stepResult.status === 'success') {
      console.log('Workflow result:', stepResult.output.result);
    } else {
      console.log('Step did not succeed:', stepResult.status);
    }
  } else {
    console.log('Workflow status:', result.status);
  }
}

main();
