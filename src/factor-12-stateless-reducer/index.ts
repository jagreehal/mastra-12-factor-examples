// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

console.log('Factor 12: Stateless Reducer');
console.log('================================================');
console.log('Demonstration: Stateless workflow execution with reducer patterns');
console.log('Key principle: Functions should be stateless and composable like reduce operations');
console.log('Reference: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md');
console.log('');

// Simple stateless reducer steps
const mapStep = createStep({
  id: 'map-step',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ mappedValues: z.array(z.number()) }),
  async execute({ inputData }) {
    console.log('  [Map Step] Processing values:', inputData.values);
    // Map operation: square each number
    const mappedValues = inputData.values.map(v => v * v);
    console.log('  [Map Step] Mapped values (squared):', mappedValues);
    return { mappedValues };
  },
});

const filterStep = createStep({
  id: 'filter-step',
  inputSchema: z.object({ mappedValues: z.array(z.number()) }),
  outputSchema: z.object({ filteredValues: z.array(z.number()) }),
  async execute({ inputData }) {
    console.log('  [Filter Step] Filtering values:', inputData.mappedValues);
    // Filter operation: keep only values > 10
    const filteredValues = inputData.mappedValues.filter(v => v > 10);
    console.log('  [Filter Step] Filtered values (> 10):', filteredValues);
    return { filteredValues };
  },
});

const reduceStep = createStep({
  id: 'reduce-step',
  inputSchema: z.object({ filteredValues: z.array(z.number()) }),
  outputSchema: z.object({ sum: z.number(), count: z.number(), average: z.number() }),
  async execute({ inputData }) {
    console.log('  [Reduce Step] Reducing values:', inputData.filteredValues);
    // Reduce operation: calculate sum, count, and average
    const sum = inputData.filteredValues.reduce((acc, v) => acc + v, 0);
    const count = inputData.filteredValues.length;
    const average = count > 0 ? sum / count : 0;

    console.log('  [Reduce Step] Results - Sum:', sum, 'Count:', count, 'Average:', average);
    return { sum, count, average };
  },
});

// Stateless reducer workflow
const statelessReducerWorkflow = createWorkflow({
  id: 'stateless-reducer-workflow',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ sum: z.number(), count: z.number(), average: z.number() }),
  steps: [mapStep, filterStep, reduceStep],
})
  .then(mapStep)
  .then(filterStep)
  .then(reduceStep)
  .commit();

// Parallel processing workflow for true stateless operation
const parallelReducerStep = createStep({
  id: 'parallel-reducer',
  inputSchema: z.object({ batches: z.array(z.array(z.number())) }),
  outputSchema: z.object({ results: z.array(z.object({ sum: z.number(), count: z.number() })) }),
  async execute({ inputData }) {
    console.log('  [Parallel Reducer] Processing', inputData.batches.length, 'batches');

    // Process each batch independently (stateless)
    const results = await Promise.all(
      inputData.batches.map(async (batch, index) => {
        console.log(`    [Batch ${index}] Processing:`, batch);
        const sum = batch.reduce((acc, v) => acc + v, 0);
        const count = batch.length;
        return { sum, count };
      })
    );

    console.log('  [Parallel Reducer] All batches processed:', results);
    return { results };
  },
});

const aggregateStep = createStep({
  id: 'aggregate-step',
  inputSchema: z.object({ results: z.array(z.object({ sum: z.number(), count: z.number() })) }),
  outputSchema: z.object({ totalSum: z.number(), totalCount: z.number(), overallAverage: z.number() }),
  async execute({ inputData }) {
    console.log('  [Aggregate Step] Combining results:', inputData.results);

    const totalSum = inputData.results.reduce((acc, r) => acc + r.sum, 0);
    const totalCount = inputData.results.reduce((acc, r) => acc + r.count, 0);
    const overallAverage = totalCount > 0 ? totalSum / totalCount : 0;

    console.log('  [Aggregate Step] Final results - Sum:', totalSum, 'Count:', totalCount, 'Average:', overallAverage);
    return { totalSum, totalCount, overallAverage };
  },
});

const parallelWorkflow = createWorkflow({
  id: 'parallel-stateless-workflow',
  inputSchema: z.object({ batches: z.array(z.array(z.number())) }),
  outputSchema: z.object({ totalSum: z.number(), totalCount: z.number(), overallAverage: z.number() }),
  steps: [parallelReducerStep, aggregateStep],
})
  .then(parallelReducerStep)
  .then(aggregateStep)
  .commit();

// Execute stateless workflow
async function executeStatelessWorkflow(values: number[], useParallel: boolean = false): Promise<{
  status: string;
  result?: unknown;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();

  try {
    console.log('\n=== Starting Stateless Reducer Workflow ===');
    console.log('Input values:', values);
    console.log('Using parallel processing:', useParallel);

    let result;

    if (useParallel) {
      // Split values into batches for parallel processing
      const batchSize = Math.ceil(values.length / 3);
      const batches: number[][] = [];
      for (let i = 0; i < values.length; i += batchSize) {
        batches.push(values.slice(i, i + batchSize));
      }

      console.log('Batches:', batches);
      const parallelRun = parallelWorkflow.createRun();
      result = await parallelRun.start({ inputData: { batches } });
    } else {
      // Sequential processing
      const sequentialRun = statelessReducerWorkflow.createRun();
      result = await sequentialRun.start({ inputData: { values } });
    }

    const executionTime = Date.now() - startTime;
    console.log('Execution time:', executionTime, 'ms');
    console.log('Final result:', result);

    return {
      status: 'success',
      result,
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Workflow execution failed:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    };
  }
}

// Demonstrate sequential vs parallel processing
async function demonstrateSequentialVsParallel(): Promise<void> {
  console.log('\n🔄 DEMONSTRATION: Sequential vs Parallel Processing');
  console.log('==================================================');

  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25];

  // Sequential processing
  console.log('\n--- Sequential Processing ---');
  const sequentialResult = await executeStatelessWorkflow(testData, false);
  console.log('Sequential Result:', JSON.stringify(sequentialResult, null, 2));

  // Parallel processing
  console.log('\n--- Parallel Processing ---');
  const parallelResult = await executeStatelessWorkflow(testData, true);
  console.log('Parallel Result:', JSON.stringify(parallelResult, null, 2));

  // Compare results
  console.log('\n--- Performance Comparison ---');
  console.log(`Sequential time: ${sequentialResult.executionTime}ms`);
  console.log(`Parallel time: ${parallelResult.executionTime}ms`);
  console.log(`Speedup: ${(sequentialResult.executionTime / parallelResult.executionTime).toFixed(2)}x`);
}

// Demonstrate stateless properties
async function demonstrateStatelessProperties(): Promise<void> {
  console.log('\n🔧 DEMONSTRATION: Stateless Properties');
  console.log('=====================================');

  const testInputs = [
    [1, 2, 3, 4, 5],
    [10, 20, 30, 40, 50],
    [5, 15, 25, 35, 45]
  ];

  console.log('Testing multiple executions with same input...');

  for (const [i, input] of testInputs.entries()) {
    console.log(`\n--- Test ${i + 1}: ${JSON.stringify(input)} ---`);

    // Run the same workflow multiple times
    const results = await Promise.all([
      executeStatelessWorkflow(input, false),
      executeStatelessWorkflow(input, false),
      executeStatelessWorkflow(input, false)
    ]);

    // Verify all results are identical (stateless property)
    const firstResult = JSON.stringify(results[0].result);
    const allIdentical = results.every(r => JSON.stringify(r.result) === firstResult);

    console.log(`All results identical: ${allIdentical ? '✅' : '❌'}`);
    console.log(`Result: ${firstResult}`);
  }
}

// Demonstrate composability
async function demonstrateComposability(): Promise<void> {
  console.log('\n🔗 DEMONSTRATION: Composability');
  console.log('===============================');

  // Create additional steps that can be composed
  const doubleStep = createStep({
    id: 'double-step',
    inputSchema: z.object({ sum: z.number(), count: z.number(), average: z.number() }),
    outputSchema: z.object({ doubledSum: z.number(), doubledCount: z.number(), doubledAverage: z.number() }),
    async execute({ inputData }) {
      console.log('  [Double Step] Doubling all values:', inputData);
      return {
        doubledSum: inputData.sum * 2,
        doubledCount: inputData.count * 2,
        doubledAverage: inputData.average * 2
      };
    },
  });

  const formatStep = createStep({
    id: 'format-step',
    inputSchema: z.object({ doubledSum: z.number(), doubledCount: z.number(), doubledAverage: z.number() }),
    outputSchema: z.object({ formattedResult: z.string() }),
    async execute({ inputData }) {
      console.log('  [Format Step] Formatting result:', inputData);
      const formatted = `Sum: ${inputData.doubledSum}, Count: ${inputData.doubledCount}, Average: ${inputData.doubledAverage.toFixed(2)}`;
      return { formattedResult: formatted };
    },
  });

  // Compose a new workflow by extending the original
  const composedWorkflow = createWorkflow({
    id: 'composed-workflow',
    inputSchema: z.object({ values: z.array(z.number()) }),
    outputSchema: z.object({ formattedResult: z.string() }),
    steps: [mapStep, filterStep, reduceStep, doubleStep, formatStep],
  })
    .then(mapStep)
    .then(filterStep)
    .then(reduceStep)
    .then(doubleStep)
    .then(formatStep)
    .commit();

  console.log('Executing composed workflow...');
  const composedRun = composedWorkflow.createRun();
  const result = await composedRun.start({ inputData: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } });
  console.log('Composed result:', result);
}

// Demonstrate error handling in stateless workflows
async function demonstrateErrorHandling(): Promise<void> {
  console.log('\n⚠️ DEMONSTRATION: Error Handling');
  console.log('=================================');

  // Create a step that might fail
  const riskyStep = createStep({
    id: 'risky-step',
    inputSchema: z.object({ values: z.array(z.number()) }),
    outputSchema: z.object({ result: z.number() }),
    async execute({ inputData }) {
      console.log('  [Risky Step] Processing values:', inputData.values);

      // Simulate failure for empty arrays
      if (inputData.values.length === 0) {
        throw new Error('Cannot process empty array');
      }

      // Simulate failure for arrays with negative numbers
      if (inputData.values.some(v => v < 0)) {
        throw new Error('Cannot process negative numbers');
      }

      const result = inputData.values.reduce((acc, v) => acc + v, 0);
      console.log('  [Risky Step] Result:', result);
      return { result };
    },
  });

  const errorHandlingWorkflow = createWorkflow({
    id: 'error-handling-workflow',
    inputSchema: z.object({ values: z.array(z.number()) }),
    outputSchema: z.object({ result: z.number() }),
    steps: [riskyStep],
  })
    .then(riskyStep)
    .commit();

  const testCases = [
    { name: 'Valid input', values: [1, 2, 3, 4, 5] },
    { name: 'Empty array', values: [] },
    { name: 'Negative numbers', values: [1, -2, 3] }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    try {
      const errorRun = errorHandlingWorkflow.createRun();
      const result = await errorRun.start({ inputData: { values: testCase.values } });
      console.log('✅ Success:', result);
    } catch (error) {
      console.log('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   Workflow remained stateless despite error');
    }
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    await demonstrateSequentialVsParallel();
    await demonstrateStatelessProperties();
    await demonstrateComposability();
    await demonstrateErrorHandling();

    console.log('\n✅ FACTOR 12 DEMONSTRATION COMPLETE');
    console.log('==================================');
    console.log('Key Takeaways:');
    console.log('1. Stateless steps produce identical results for identical inputs');
    console.log('2. Parallel processing enables scalability without side effects');
    console.log('3. Composable workflows can be built from simple stateless steps');
    console.log('4. Error handling preserves stateless properties');
    console.log('5. Predictable execution enables better testing and debugging');
    console.log('6. Reducer patterns scale horizontally across multiple workers');

  } catch (error) {
    console.error('Demo failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

main().catch(console.error);
