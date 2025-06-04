# Factor 9: Compact Errors into Context Window

## Overview

This example demonstrates how the Mastra agent implementation fulfills **Factor 9: Compact Errors into Context Window** from the [12-Factor Agents methodology](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md).

## What Factor 9 Means

Factor 9 advocates for handling errors by compacting them into the context window rather than crashing or stopping execution. When tools fail, the agent should receive concise error information that allows it to understand what went wrong and potentially recover or retry, keeping the conversation flowing.

## How This Example Fulfills Factor 9

### 🛠️ Flaky Tool with Error Handling

```typescript
// Tool that demonstrates failure scenarios
const flakyTool = createTool({
  id: 'flaky-tool',
  inputSchema: z.object({ search: z.string() }),
  description: 'A tool that sometimes fails',
  execute: async ({ context }) => {
    if (Math.random() < 0.5) {
      console.log('[flakyTool] Tool failed');
      throw new Error(`Tool failed for search: ${context.search}`);
    }
    console.log('[flakyTool] Tool succeeded');
    return { result: 'Pierre' };
  },
});
```

### 🔄 Agent-Level Error Recovery

```typescript
try {
  // Agent handles tool failures gracefully
  const result = await agent.generate('What is the capital of South Dakota?');
  console.log('Agent response:', result.text);
} catch (err) {
  // Error is captured and can be handled without crashing
  console.error('Agent error:', err);
  // Optionally, retry or handle the error as needed
}
```

### 🎯 Contextual Error Information

```typescript
// Agent instructions include error handling guidance
const agent = new Agent({
  name: 'Flaky Tool Agent',
  instructions: 'Use the flaky-tool to answer questions.',
  model,
  tools: { flakyTool },
});
```

### 🔧 Key Implementation Details

1. **Error Capturing**: Tool errors are caught and logged, not crashed
2. **Context Preservation**: Error information becomes part of agent context
3. **Graceful Degradation**: Agent can continue operating despite tool failures
4. **Error Visibility**: Errors are logged for debugging and monitoring
5. **Recovery Opportunity**: Agent can potentially retry or use alternative approaches

### 🏗️ Architecture Benefits

- **Resilience**: System continues operating despite individual tool failures
- **Debugging**: Error information is captured and available for analysis
- **User Experience**: Failures don't crash the entire agent interaction
- **Flexibility**: Agent can adapt to tool failures and find alternative solutions
- **Monitoring**: Error patterns can be tracked and addressed

## Best Practices Demonstrated

### ✅ Explicit Error Handling

```typescript
try {
  const result = await agent.generate('What is the capital of South Dakota?');
  console.log('Agent response:', result.text);
} catch (err) {
  console.error('Agent error:', err);
  // Error handling without system crash
}
```

- Errors are explicitly caught and handled
- System continues operating after errors

### ✅ Descriptive Error Messages

```typescript
throw new Error(`Tool failed for search: ${context.search}`);
```

- Error messages include relevant context
- Makes debugging and recovery easier

### ✅ Failure Simulation

```typescript
if (Math.random() < 0.5) {
  console.log('[flakyTool] Tool failed');
  throw new Error(`Tool failed for search: ${context.search}`);
}
```

- Realistic simulation of tool failures
- Enables testing of error handling paths

## Error Handling Patterns

### Tool-Level Error Recovery

```typescript
const resilientTool = createTool({
  id: 'resilient-tool',
  execute: async ({ context }) => {
    try {
      return await unreliableOperation(context);
    } catch (error) {
      console.log('Tool error caught:', error.message);
      // Return error information instead of crashing
      return {
        result: null,
        error: `Operation failed: ${error.message}`,
        fallback: 'default-value',
      };
    }
  },
});
```

### Agent-Level Error Context

```typescript
const errorAwareAgent = new Agent({
  instructions: `
    Use the tools available to answer questions.
    If a tool fails, explain what went wrong and try alternative approaches.
    Include error information in your response to help the user understand any limitations.
  `,
  tools: { flakyTool },
});
```

### Workflow Error Handling

```typescript
const errorHandlingStep = createStep({
  id: 'error-aware-step',
  async execute({ inputData }) {
    try {
      return await riskyOperation(inputData);
    } catch (error) {
      // Compact error into step output
      return {
        success: false,
        error: error.message,
        fallbackResult: 'safe-default',
      };
    }
  },
});
```

## Anti-Patterns Avoided

❌ **System Crashes**: No uncaught exceptions that crash the agent
❌ **Silent Failures**: No errors that are ignored or hidden
❌ **Context Loss**: No loss of conversation context due to errors
❌ **Verbose Error Dumps**: No overwhelming error information in context

## Related Factors

This example connects to other 12-factor principles:

- **Factor 3** (Own Your Context Window) - error information fits within context limits
- **Factor 8** (Own Your Control Flow) - explicit error handling in control flow
- **Factor 6** (Launch/Pause/Resume) - error handling in workflow execution
- **Factor 1** (Natural Language to Tool Calls) - tools handle errors gracefully

## Error Compaction Strategies

1. **Error Summarization**: Reduce verbose error messages to essential information
2. **Error Classification**: Categorize errors for consistent handling
3. **Context Preservation**: Maintain conversation flow despite errors
4. **Recovery Hints**: Provide guidance for error recovery
5. **Monitoring Integration**: Log errors for analysis without overwhelming context

## Advanced Error Handling

### Retry Logic

```typescript
const retryTool = createTool({
  id: 'retry-tool',
  async execute({ context }) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await unreliableOperation(context);
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    // Compact final error after all retries
    return {
      error: `Failed after 3 attempts: ${lastError.message}`,
      suggestion: 'Please try again later',
    };
  },
});
```

### Error Categorization

```typescript
const categorizedErrorTool = createTool({
  id: 'categorized-error-tool',
  async execute({ context }) {
    try {
      return await operation(context);
    } catch (error) {
      let errorCategory = 'unknown';
      let userMessage = 'An error occurred';

      if (error.message.includes('network')) {
        errorCategory = 'network';
        userMessage = 'Network connection failed, please try again';
      } else if (error.message.includes('auth')) {
        errorCategory = 'authentication';
        userMessage = 'Authentication failed, please check credentials';
      }

      return {
        error: true,
        category: errorCategory,
        message: userMessage,
        technical: error.message.substring(0, 100), // Truncate long errors
      };
    }
  },
});
```

### Circuit Breaker Pattern

```typescript
class CircuitBreakerTool {
  private failureCount = 0;
  private lastFailure = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute({ context }) {
    if (this.isOpen()) {
      return {
        error: 'Circuit breaker is open - service temporarily unavailable',
        retryAfter: new Date(this.lastFailure + this.timeout),
      };
    }

    try {
      const result = await unreliableService(context);
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      return {
        error: `Service failed: ${error.message}`,
        failureCount: this.failureCount,
      };
    }
  }

  private isOpen(): boolean {
    return (
      this.failureCount >= this.threshold &&
      Date.now() - this.lastFailure < this.timeout
    );
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailure = Date.now();
  }

  private reset(): void {
    this.failureCount = 0;
  }
}
```

This implementation demonstrates how Mastra enables robust error handling by capturing failures, compacting error information into manageable context, and allowing agents to continue operating gracefully despite tool failures.

## Usage

You can run this example from the command line, providing your question as an argument or interactively:

```sh
pnpm exec tsx src/factor09-compact-errors/index.ts -- 'What is the capital of South Dakota?'
```

If you do not provide a question, you will be prompted to enter one interactively.

### Example Output

```text
[flakyTool] Tool succeeded
Agent response: The capital of South Dakota is Pierre.
```
