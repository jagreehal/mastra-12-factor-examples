# Factor 1: Natural Language to Tool Calls

## Overview

This example demonstrates [**Factor 1: Natural Language to Tool Calls** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md) from the 12-Factor Agents methodology.

This fundamental principle establishes that LLMs should convert natural language into structured, executable tool calls rather than attempting to perform actions directly.

![Factor 1](./factor-01.gif)

## What Factor 1 Means

Factor 1 establishes the LLM's primary role as a **natural language parser** that translates human intent into structured function calls. The LLM handles "understanding" whilst tools handle "doing" deterministically.

### The Core Principle

```
Natural Language Input → LLM Processing → Structured Tool Call → Deterministic Execution → Structured Output
```

This separation of concerns ensures reliability, traceability, and maintainability in agent workflows.

## How This Example Works

### Simple Tool Definition

```typescript
const lookupTool = createTool({
  id: 'lookup',
  inputSchema: z.object({
    search: z.string().describe('The search term to look up')
  }),
  description: 'Looks up information for a given search term',
  execute: async ({ context }) => {
    // Deterministic execution - same input yields same output
    const result = database[context.search.toLowerCase()] || defaultResponse;
    return { result };
  },
});
```

### Agent Configuration

```typescript
const agent = new Agent({
  name: 'Factor1Agent',
  instructions: `Always use the lookup tool for any question - this demonstrates
                 the LLM converting natural language to structured tool calls.`,
  model,
  tools: { lookupTool },
});
```

### Demonstration Scenarios

The example automatically runs three scenarios:
1. **Geographic Query**: "What is the capital of South Dakota?"
2. **Biographical Query**: "Tell me about Ada Lovelace"
3. **Current Information**: "What is the weather like?"

## Running the Example

```bash
pnpm factor01
```

## Example Output

```
🎯 Factor 1: Natural Language to Tool Calls
===========================================

🎬 Running Factor 1 Demo Scenarios:

==================================================
📍 Scenario 1 of 3
==================================================

📝 User Question: "What is the capital of South Dakota?"
🧠 LLM Processing: Converting natural language to tool call...
[🔧 Tool Called] lookupTool with: "capital of South Dakota"
[✅ Tool Result] Pierre is the capital of South Dakota.

💬 Agent Response: The capital of South Dakota is Pierre.

✨ Factor 1 Demonstration:
   1. Natural Language Input ✅
   2. LLM → Structured Tool Call ✅
   3. Deterministic Tool Execution ✅
   4. Structured Output ✅

==================================================
📍 Scenario 2 of 3
==================================================

📝 User Question: "Tell me about Ada Lovelace"
🧠 LLM Processing: Converting natural language to tool call...
[🔧 Tool Called] lookupTool with: "Ada Lovelace"
[✅ Tool Result] Ada Lovelace was an English mathematician and writer, often considered the first computer programmer.

💬 Agent Response: Ada Lovelace was an English mathematician and writer, often considered the first computer programmer.

✨ Factor 1 Demonstration:
   1. Natural Language Input ✅
   2. LLM → Structured Tool Call ✅
   3. Deterministic Tool Execution ✅
   4. Structured Output ✅

==================================================
📍 Scenario 3 of 3
==================================================

📝 User Question: "What is the weather like?"
🧠 LLM Processing: Converting natural language to tool call...
[🔧 Tool Called] lookupTool with: "weather"
[✅ Tool Result] The weather is sunny and 72°F today.

💬 Agent Response: The weather is sunny and 72°F today.

✨ Factor 1 Demonstration:
   1. Natural Language Input ✅
   2. LLM → Structured Tool Call ✅
   3. Deterministic Tool Execution ✅
   4. Structured Output ✅

==================================================
🎉 Factor 1 Demo Complete!
==================================================

💡 Key Takeaway:
   Factor 1 shows how LLMs excel at converting natural language
   into structured, executable tool calls. The LLM handles the
   "understanding" while tools handle "doing" deterministically.
```

## Key Factor 1 Principles Demonstrated

✅ **Natural Language Input**: Users communicate in plain English

✅ **LLM → Tool Call Conversion**: Agent parses intent and creates structured `lookup({search: "..."})` calls

✅ **Deterministic Execution**: Tool consistently returns identical results for identical inputs

✅ **Structured Output**: Tool returns predictable `{result: string}` format

✅ **Separation of Concerns**: LLM handles reasoning, tools handle execution

## Why Factor 1 Matters

This foundational pattern delivers several critical benefits:

- **Reliability**: Deterministic tools produce predictable outcomes
- **Debuggability**: Tool calls are traceable and loggable
- **Scalability**: New tools integrate without modifying LLM logic
- **Testability**: Tools can be unit tested independently
- **Maintainability**: Clear separation between reasoning and execution

Factor 1 forms the foundation upon which all other 12-factor principles build.
