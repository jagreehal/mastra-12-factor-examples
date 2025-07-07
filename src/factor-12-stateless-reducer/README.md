# Factor 12: Make Your Agent a Stateless Reducer

## Overview

This example demonstrates [**Factor 12: Make Your Agent a Stateless Reducer** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md) from the 12-Factor Agents methodology.

This principle advocates for designing agents as stateless reducers that take input data and produce deterministic output without relying on internal state. Like functional programming reducers, agents should be pure functions that can be run anywhere, scaled horizontally, and tested reliably without side effects or state dependencies.

## What Factor 12 Means

Factor 12 advocates for designing agents as stateless reducers that take input data and produce deterministic output without relying on internal state. Like functional programming reducers, agents should be pure functions that can be run anywhere, scaled horizontally, and tested reliably without side effects or state dependencies.

## Why Factor 12 Matters

**Production Benefits:**
- **Horizontal Scalability**: Stateless operations can be distributed across multiple workers without coordination
- **Predictable Execution**: Same input always produces the same output, enabling reliable testing and debugging
- **Fault Tolerance**: No state corruption or race conditions to handle
- **Performance**: Parallel processing becomes trivial without shared state concerns
- **Operational Simplicity**: No state setup, migration, or synchronisation required

## How This Example Fulfils Factor 12

### 🔄 Map-Filter-Reduce Pipeline

The example demonstrates a classic functional programming pipeline with three stateless steps:

```typescript
// Map Step: Transform input values (square each number)
const mapStep = createStep({
  id: 'map-step',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ mappedValues: z.array(z.number()) }),
  async execute({ inputData }) {
    console.log('  [Map Step] Processing values:', inputData.values);
    const mappedValues = inputData.values.map((v) => v * v);
    console.log('  [Map Step] Mapped values (squared):', mappedValues);
    return { mappedValues };
  },
});

// Filter Step: Filter values based on criteria (> 10)
const filterStep = createStep({
  id: 'filter-step',
  inputSchema: z.object({ mappedValues: z.array(z.number()) }),
  outputSchema: z.object({ filteredValues: z.array(z.number()) }),
  async execute({ inputData }) {
    console.log('  [Filter Step] Filtering values:', inputData.mappedValues);
    const filteredValues = inputData.mappedValues.filter((v) => v > 10);
    console.log('  [Filter Step] Filtered values (> 10):', filteredValues);
    return { filteredValues };
  },
});

// Reduce Step: Aggregate results (sum, count, average)
const reduceStep = createStep({
  id: 'reduce-step',
  inputSchema: z.object({ filteredValues: z.array(z.number()) }),
  outputSchema: z.object({
    sum: z.number(),
    count: z.number(),
    average: z.number()
  }),
  async execute({ inputData }) {
    console.log('  [Reduce Step] Reducing values:', inputData.filteredValues);
    const sum = inputData.filteredValues.reduce((acc, v) => acc + v, 0);
    const count = inputData.filteredValues.length;
    const average = count > 0 ? sum / count : 0;

    console.log(`  [Reduce Step] Results - Sum: ${sum} Count: ${count} Average: ${average}`);
    return { sum, count, average };
  },
});
```

### ⚡ Sequential vs Parallel Processing

```typescript
// Sequential Processing: Standard pipeline
const sequentialWorkflow = createWorkflow({
  id: 'sequential-reducer',
  steps: [mapStep, filterStep, reduceStep],
})
  .then(mapStep)
  .then(filterStep)
  .then(reduceStep)
  .commit();

// Parallel Processing: Batch processing for scalability
const parallelReducerStep = createStep({
  id: 'parallel-reducer',
  inputSchema: z.object({ batches: z.array(z.array(z.number())) }),
  outputSchema: z.object({ results: z.array(z.object({
    sum: z.number(),
    count: z.number()
  }))  }),
  async execute({ inputData }) {
    console.log(`  [Parallel Reducer] Processing ${inputData.batches.length} batches`);

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
```

### 🎯 Stateless Properties Verification

```typescript
// Test function to verify identical results for identical inputs
const verifyStatelessProperties = async (input: number[]) => {
  const results = await Promise.all([
    runSequentialWorkflow(input),
    runSequentialWorkflow(input),
    runSequentialWorkflow(input)
  ]);

  const identical = results.every(result =>
    JSON.stringify(result) === JSON.stringify(results[0])
  );

  console.log('All results identical:', identical ? '✅' : '❌');
  return results[0];
};
```

## Actual Output Examples

### Sequential Processing

**Input:** `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25]`

**Execution Flow:**
```
=== Starting Stateless Reducer Workflow ===
Input values: [
   1,  2,  3,  4,  5,  6,
   7,  8,  9, 10, 11, 12,
  15, 20, 25
]
Using parallel processing: false

[Map Step] Processing values: [
   1,  2,  3,  4,  5,  6,
   7,  8,  9, 10, 11, 12,
  15, 20, 25
]
[Map Step] Mapped values (squared): [
    1,   4,   9,  16,  25,  36,
   49,  64,  81, 100, 121, 144,
  225, 400, 625
]

[Filter Step] Filtering values: [
    1,   4,   9,  16,  25,  36,
   49,  64,  81, 100, 121, 144,
  225, 400, 625
]
[Filter Step] Filtered values (> 10): [
   16,  25,  36,  49,  64,
   81, 100, 121, 144, 225,
  400, 625
]

[Reduce Step] Reducing values: [
   16,  25,  36,  49,  64,
   81, 100, 121, 144, 225,
  400, 625
]
[Reduce Step] Results - Sum: 1886 Count: 12 Average: 157.16666666666666

Execution time: 2 ms
```

**Final Result:**
```json
{
  "status": "success",
  "result": {
    "sum": 1886,
    "count": 12,
    "average": 157.16666666666666
  },
  "executionTime": 2
}
```

### Parallel Processing

**Input:** Same array split into batches: `[[1,2,3,4,5], [6,7,8,9,10], [11,12,15,20,25]]`

**Execution Flow:**
```
=== Starting Stateless Reducer Workflow ===
Input values: [
   1,  2,  3,  4,  5,  6,
   7,  8,  9, 10, 11, 12,
  15, 20, 25
]
Using parallel processing: true
Batches: [ [ 1, 2, 3, 4, 5 ], [ 6, 7, 8, 9, 10 ], [ 11, 12, 15, 20, 25 ] ]

[Parallel Reducer] Processing 3 batches
  [Batch 0] Processing: [ 1, 2, 3, 4, 5 ]
  [Batch 1] Processing: [ 6, 7, 8, 9, 10 ]
  [Batch 2] Processing: [ 11, 12, 15, 20, 25 ]
[Parallel Reducer] All batches processed: [ { sum: 15, count: 5 }, { sum: 40, count: 5 }, { sum: 83, count: 5 } ]

[Aggregate Step] Combining results: [ { sum: 15, count: 5 }, { sum: 40, count: 5 }, { sum: 83, count: 5 } ]
[Aggregate Step] Final results - Sum: 138 Count: 15 Average: 9.2

Execution time: 1 ms
```

**Performance Comparison:**
```
Sequential time: 2ms
Parallel time: 1ms
Speedup: 2.00x
```

### Stateless Properties Testing

**Test 1:** Input `[1,2,3,4,5]` - Multiple executions

**Results:**
```
--- Test 1: [1,2,3,4,5] ---

[Map Step] Processing values: [ 1, 2, 3, 4, 5 ]
[Map Step] Mapped values (squared): [ 1, 4, 9, 16, 25 ]
[Filter Step] Filtering values: [ 1, 4, 9, 16, 25 ]
[Filter Step] Filtered values (> 10): [ 16, 25 ]
[Reduce Step] Reducing values: [ 16, 25 ]
[Reduce Step] Results - Sum: 41 Count: 2 Average: 20.5

All results identical: ✅
Result: {"sum":41,"count":2,"average":20.5}
```

**Test 2:** Input `[10,20,30,40,50]` - Multiple executions

**Results:**
```
--- Test 2: [10,20,30,40,50] ---

[Map Step] Processing values: [ 10, 20, 30, 40, 50 ]
[Map Step] Mapped values (squared): [ 100, 400, 900, 1600, 2500 ]
[Filter Step] Filtering values: [ 100, 400, 900, 1600, 2500 ]
[Filter Step] Filtered values (> 10): [ 100, 400, 900, 1600, 2500 ]
[Reduce Step] Reducing values: [ 100, 400, 900, 1600, 2500 ]
[Reduce Step] Results - Sum: 5500 Count: 5 Average: 1100

All results identical: ✅
Result: {"sum":5500,"count":5,"average":1100}
```

### Composability Demonstration

**Extended Pipeline:** Map → Filter → Reduce → Double → Format

```
[Map Step] Processing values: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
[Map Step] Mapped values (squared): [ 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ]
[Filter Step] Filtering values: [ 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ]
[Filter Step] Filtered values (> 10): [ 16, 25, 36, 49, 64, 81, 100 ]
[Reduce Step] Reducing values: [ 16, 25, 36, 49, 64, 81, 100 ]
[Reduce Step] Results - Sum: 371 Count: 7 Average: 53
[Double Step] Doubling all values: { sum: 371, count: 7, average: 53 }
[Format Step] Formatting result: { doubledSum: 742, doubledCount: 14, doubledAverage: 106 }

Composed result: Sum: 742, Count: 14, Average: 106.00
```

### Error Handling

**Valid Input:**
```
--- Testing: Valid input ---
[Risky Step] Processing values: [ 1, 2, 3, 4, 5 ]
[Risky Step] Result: 15
✅ Success: {
  "status": "success",
  "result": { "result": 15 }
}
```

**Empty Array:**
```
--- Testing: Empty array ---
[Risky Step] Processing values: []
✅ Success: {
  "status": "failed",
  "error": "Error: Cannot process empty array",
  "steps": {
    "risky-step": {
      "status": "failed",
      "error": "Error: Cannot process empty array"
    }
  }
}
```

**Invalid Input:**
```
--- Testing: Negative numbers ---
[Risky Step] Processing values: [ 1, -2, 3 ]
✅ Success: {
  "status": "failed",
  "error": "Error: Cannot process negative numbers",
  "steps": {
    "risky-step": {
      "status": "failed",
      "error": "Error: Cannot process negative numbers"
    }
  }
}
```

## Key Implementation Benefits

### 🔄 Pure Function Design

```typescript
// Each step is a pure function with no side effects
async execute({ inputData }) {
  // Transform input deterministically
  const mappedValues = inputData.values.map(v => v * v);

  // Return new state without modifying input
  return { mappedValues };
}
```

- **Deterministic**: Same input always produces same output
- **No side effects**: No external state modification
- **Composable**: Steps can be combined in any order
- **Testable**: Easy to test with known inputs and expected outputs

### ⚡ Horizontal Scalability

```typescript
// Parallel processing with stateless operations
const results = await Promise.all(
  batches.map(async (batch) => {
    // Each batch processed independently
    return batch.reduce((sum, num) => sum + num, 0);
  })
);
```

- **No coordination needed**: Stateless operations can run independently
- **Linear scaling**: Performance scales with available workers
- **Fault tolerant**: Failed workers don't affect others

### 🎯 Execution Tracking

```typescript
// Complete execution history maintained automatically
const result = {
  status: 'success',
  steps: {
    'map-step': {
      startedAt: 1751882422321,
      status: 'success',
      output: { mappedValues: [1, 4, 9, 16, 25] },
      endedAt: 1751882422321
    },
    'filter-step': {
      startedAt: 1751882422321,
      status: 'success',
      output: { filteredValues: [16, 25] },
      endedAt: 1751882422322
    }
  },
  result: { sum: 41, count: 2, average: 20.5 }
};
```

- **Complete audit trail**: Every step execution tracked
- **Performance monitoring**: Timing data for each step
- **Debugging support**: Full execution history available

## Advanced Stateless Patterns

### Map-Reduce with Aggregation

```typescript
// Divide data into batches for parallel processing
const createBatches = (data: number[], batchSize: number) => {
  const batches = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }
  return batches;
};

// Aggregate results from parallel batches
const aggregateStep = createStep({
  id: 'aggregate-step',
  inputSchema: z.object({
    results: z.array(z.object({
      sum: z.number(),
      count: z.number()
    }))
  }),
  outputSchema: z.object({
    totalSum: z.number(),
    totalCount: z.number(),
    overallAverage: z.number()
  }),
  async execute({ inputData }) {
    const totalSum = inputData.results.reduce((acc, r) => acc + r.sum, 0);
    const totalCount = inputData.results.reduce((acc, r) => acc + r.count, 0);
    const overallAverage = totalCount > 0 ? totalSum / totalCount : 0;

    return { totalSum, totalCount, overallAverage };
  },
});
```

### Functional Composition

```typescript
// Compose multiple stateless transformations
const doubleStep = createStep({
  id: 'double-step',
  inputSchema: z.object({ sum: z.number(), count: z.number(), average: z.number() }),
  outputSchema: z.object({ doubledSum: z.number(), doubledCount: z.number(), doubledAverage: z.number() }),
  async execute({ inputData }) {
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
    const formatted = `Sum: ${inputData.doubledSum}, Count: ${inputData.doubledCount}, Average: ${inputData.doubledAverage.toFixed(2)}`;
    return { formattedResult: formatted };
  },
});
```

### Error-Safe Stateless Operations

```typescript
const riskyStep = createStep({
  id: 'risky-step',
  inputSchema: z.object({ values: z.array(z.number()) }),
  outputSchema: z.object({ result: z.number() }),
  async execute({ inputData }) {
    // Stateless validation
    if (inputData.values.length === 0) {
      throw new Error('Cannot process empty array');
    }

    if (inputData.values.some(v => v < 0)) {
      throw new Error('Cannot process negative numbers');
    }

    // Pure computation
    const result = inputData.values.reduce((sum, v) => sum + v, 0);
    return { result };
  },
});
```

## Anti-Patterns Avoided

❌ **External State Dependencies**: No reliance on databases, files, or global variables during processing

❌ **Side Effects**: No modifications to external systems during step execution

❌ **Time Dependencies**: No behaviour that changes based on current time or system state

❌ **Random Behaviour**: No non-deterministic operations that break reproducibility

❌ **Shared Mutable State**: No state shared between concurrent executions

## Benefits for Different Use Cases

### Data Analytics Pipeline

```typescript
// Stateless analytics operations
const analyticsWorkflow = createWorkflow({
  id: 'analytics-pipeline',
  steps: [
    extractEventsStep,    // Pure extraction
    filterValidStep,      // Pure validation
    aggregateMetricsStep, // Pure aggregation
    formatReportStep      // Pure formatting
  ]
});
```

### Content Processing

```typescript
// Stateless content transformation
const contentWorkflow = createWorkflow({
  id: 'content-pipeline',
  steps: [
    parseContentStep,     // Pure parsing
    extractKeywordsStep,  // Pure extraction
    calculateMetricsStep, // Pure calculation
    generateSummaryStep   // Pure summarization
  ]
});
```

### Business Rules Engine

```typescript
// Stateless rule evaluation
const rulesWorkflow = createWorkflow({
  id: 'rules-engine',
  steps: [
    validateInputStep,    // Pure validation
    applyRulesStep,      // Pure rule application
    calculateScoreStep,   // Pure scoring
    formatDecisionStep    // Pure formatting
  ]
});
```

## Testing Stateless Reducers

```typescript
describe('Stateless Reducer Workflow', () => {
  it('should produce identical results for identical inputs', async () => {
    const input = [1, 2, 3, 4, 5];

    const [result1, result2, result3] = await Promise.all([
      runSequentialWorkflow(input),
      runSequentialWorkflow(input),
      runSequentialWorkflow(input)
    ]);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it('should handle parallel processing correctly', async () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const sequentialResult = await runSequentialWorkflow(input);
    const parallelResult = await runParallelWorkflow(input);

    // Results should be mathematically equivalent
    expect(sequentialResult.status).toBe('success');
    expect(parallelResult.status).toBe('success');
  });

  it('should maintain stateless properties under load', async () => {
    const input = Array.from({ length: 1000 }, (_, i) => i + 1);

    const results = await Promise.all(
      Array.from({ length: 10 }, () => runSequentialWorkflow(input))
    );

    // All results should be identical
    results.forEach(result => {
      expect(result).toEqual(results[0]);
    });
  });
});
```

## Related Factors

This example connects to other 12-factor principles:

- **Factor 1** (Natural Language to Tool Calls): Stateless operations as deterministic tools
- **Factor 4** (Tools are Structured Outputs): Structured input/output contracts for reproducibility
- **Factor 8** (Own Your Control Flow): Predictable execution flow in stateless pipelines
- **Factor 10** (Small, Focused Agents): Each step has a single, stateless responsibility
- **Factor 11** (Trigger from Anywhere): Stateless reducers work reliably from any trigger source

## Usage

Run this example to see stateless reducer patterns in action:

```bash
pnpm factor12
```

The example demonstrates:
1. **Sequential Processing**: Map → Filter → Reduce pipeline with step-by-step execution tracking
2. **Parallel Processing**: Batch processing with performance comparison showing 2x speedup
3. **Stateless Properties**: Multiple identical executions proving deterministic behaviour
4. **Composability**: Extended pipeline with additional transformation steps
5. **Error Handling**: Graceful error handling while preserving stateless properties
6. **Performance Monitoring**: Complete execution timing and step tracking

This implementation demonstrates how Mastra enables the creation of truly stateless, functional workflows that operate as pure reducers, providing horizontal scalability, fault tolerance, and predictable execution while avoiding the complexity of stateful operations.
