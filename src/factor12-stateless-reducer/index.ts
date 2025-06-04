// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import * as readline from 'node:readline';

// This example demonstrates a stateless/concurrent workflow pattern.
// Each step could run independently and results are aggregated at the end.
// In Mastra, you can model this as a stateless reducer step over an array.

// For a stateless reducer, we can use a single step that reduces an array.
const reducerStep = createStep({
  id: 'stateless-reducer',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ sum: z.number() }),
  async execute({ inputData }) {
    // Simulate stateless reduction (e.g., sum, map-reduce, etc.)
    console.log('Reducer step received values:', inputData.values);
    const sum = inputData.values.reduce((acc, v) => acc + v, 0);
    return { sum };
  },
});

const workflow = createWorkflow({
  id: 'stateless-reducer-workflow',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ sum: z.number() }),
  steps: [reducerStep],
})
  .then(reducerStep)
  .commit();

async function main() {
  // Get numbers from CLI args or prompt
  let values: number[] = process.argv
    .slice(2)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  if (values.length === 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await new Promise<string>((resolve) =>
      rl.question('Enter numbers separated by spaces: ', (a) => {
        rl.close();
        resolve(a);
      }),
    );
    values = answer
      .split(/\s+/)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
  }
  if (values.length === 0) {
    console.log('No valid numbers provided. Exiting.');
    return;
  }
  console.log('Reducer input values:', values);
  const run = workflow.createRun();
  const result = await run.start({ inputData: { values } });
  if (result.status === 'success') {
    const reducerResult = result.steps[reducerStep.id];
    if (reducerResult.status === 'success') {
      console.log('Reducer output:', reducerResult.output);
    } else {
      console.log('Reducer step did not succeed:', reducerResult.status);
    }
    console.log('Workflow result:', result.result);
  } else {
    console.log('Workflow status:', result.status);
  }
}

main();
