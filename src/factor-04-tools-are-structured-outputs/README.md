# Factor 4: Tools are Structured Outputs

## Overview

This example demonstrates [**Factor 4: Tools are Structured Outputs** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md) from the 12-Factor Agents methodology.

This principle establishes tools as explicit, structured data formats that guarantee predictable input and output schemas.

## What Factor 4 Means

Factor 4 defines tools as having explicit, structured schemas that ensure deterministic data flow. Rather than having the LLM directly execute actions, it generates clear, parseable output that represents a tool call. This separation ensures the LLM focuses on reasoning whilst deterministic code handles execution with guaranteed data structures.

### The Core Principle

```
LLM → Structured Tool Call → Deterministic Execution → Structured Output → Reliable Processing
```

This approach transforms unpredictable LLM output into dependable, type-safe data structures.

## How This Example Works

### Three Tool Types Demonstrated

#### 1. Simple Structured Output (Weather Tool)
```typescript
const weatherTool = createTool({
  id: 'weather',
  inputSchema: z.object({
    city: z.string(),
    unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius')
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
    city: z.string(),
    unit: z.string()
  }),
  description: 'Get weather information for a city',
  execute: async ({ context }) => {
    // Deterministic structured output
    return {
      temperature: 72,
      condition: "Partly cloudy",
      humidity: 65,
      city: context.city,
      unit: context.unit
    };
  },
});
```

#### 2. Complex Nested Output (User Profile Tool)
```typescript
outputSchema: z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    age: z.number()
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.string(),
    notifications: z.boolean()
  }),
  metadata: z.object({
    lastLogin: z.string(),
    accountType: z.enum(['free', 'premium', 'enterprise'])
  })
})
```

#### 3. Array Output (Search Tool)
```typescript
outputSchema: z.object({
  results: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    score: z.number()
  })),
  query: z.string(),
  totalFound: z.number()
})
```

### Demonstration Process

1. **Define Schemas** - Explicit input/output structure for each tool
2. **LLM Tool Selection** - Agent chooses appropriate tool based on user query
3. **Structured Execution** - Tool runs deterministically with validated inputs
4. **Guaranteed Output** - Schema ensures predictable output structure
5. **Reliable Processing** - Downstream code can safely process structured data

## Running the Example

```bash
pnpm factor04
```

## Example Output

```
🎯 Factor 4: Tools are Structured Outputs
==========================================

✨ Factor 4 demonstrates tools as structured outputs
   - Tools have explicit input/output schemas
   - LLM generates structured tool calls
   - Tools return predictable, typed data
   - Downstream processing is reliable
   - Schema validation ensures data integrity

============================================================
🧪 Testing Structured Tool Outputs
============================================================

──────────────────────────────────────────────────
📍 Scenario 1: Weather Query
──────────────────────────────────────────────────

❓ Question: "What's the weather like in New York in Fahrenheit?"
🧠 Processing...
[🌤️ Weather Tool] Getting weather for New York in fahrenheit

💬 Agent Response: The weather in New York is currently 71.6°F, partly cloudy with 65% humidity.

──────────────────────────────────────────────────
📍 Scenario 2: User Profile Lookup
──────────────────────────────────────────────────

❓ Question: "Show me the profile information for user alice123"
🧠 Processing...
[👤 Profile Tool] Loading profile for user alice123

💬 Agent Response: Here is the profile information for user alice123:

- **Name:** Alice Johnson
- **Email:** alice123@example.com
- **Age:** 28

**Preferences:**
- **Theme:** Dark
- **Language:** English
- **Notifications:** Enabled

**Metadata:**
- **Last Login:** January 15, 2024, at 10:30 AM UTC
- **Account Type:** Premium

──────────────────────────────────────────────────
📍 Scenario 3: Search Query
──────────────────────────────────────────────────

❓ Question: "Search for 'machine learning' and show me 2 results"
🧠 Processing...
[🔍 Search Tool] Searching for "machine learning" (limit: 2)

💬 Agent Response: I found some great resources on machine learning for you:

1. Title: Understanding machine learning
   - URL: https://example.com/machine-learning
   - Snippet: A comprehensive guide to machine learning with examples and best practices.
   - Score: 0.95

2. Title: machine learning Tutorial
   - URL: https://tutorial.com/machine-learning
   - Snippet: Learn machine learning step by step with this detailed tutorial.
   - Score: 0.87

Would you like to explore any of these resources further?

============================================================
🔍 Schema Validation Benefits
============================================================

✅ Type Safety Examples:
   Weather Tool Input:  { city: string, unit?: "celsius" | "fahrenheit" }
   Weather Tool Output: { temperature: number, condition: string, humidity: number, city: string, unit: string }

   Profile Tool Input:  { userId: string }
   Profile Tool Output: { user: {...}, preferences: {...}, metadata: {...} }

   Search Tool Input:   { query: string, limit?: number }
   Search Tool Output:  { results: Array<{title, url, snippet, score}>, query: string, totalFound: number }

💡 Benefits:
   ✅ Predictable output structure
   ✅ Type safety at compile time
   ✅ Runtime validation
   ✅ Clear API contracts
   ✅ Easy downstream processing
   ✅ Reliable data flow

============================================================
🎉 Factor 4 Demo Complete!
============================================================

💡 Key Takeaways:
   ✅ Tools define explicit input/output schemas
   ✅ Structured outputs enable reliable downstream processing
   ✅ Schema validation prevents runtime errors
   ✅ Type safety improves developer experience
   ✅ Predictable data flow across the application
```

## Key Factor 4 Principles Demonstrated

✅ **Explicit Schemas**: Clear input/output contracts for every tool

✅ **Type Safety**: Runtime and compile-time validation ensures data integrity

✅ **Predictable Structure**: Output format guaranteed by schema validation

✅ **Separation of Concerns**: LLM handles reasoning, tools provide structured data

✅ **Reliable Integration**: Downstream systems can depend on consistent structure

## Schema Design Patterns

### Required vs Optional Fields
```typescript
inputSchema: z.object({
  city: z.string(),                    // Required
  unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius') // Optional with default
})
```

### Strict Enums for Controlled Values
```typescript
theme: z.enum(['light', 'dark']),      // Only these values allowed
accountType: z.enum(['free', 'premium', 'enterprise'])
```

### Nested Object Structures
```typescript
outputSchema: z.object({
  user: z.object({ ... }),             // Nested user object
  preferences: z.object({ ... }),      // Nested preferences object
  metadata: z.object({ ... })          // Nested metadata object
})
```

### Array Outputs with Item Schemas
```typescript
results: z.array(z.object({
  title: z.string(),
  score: z.number()
}))
```

## Benefits of Structured Outputs

### Predictable Structure
- Output format guaranteed by schema validation
- No parsing or guessing required
- Type-safe data flow throughout application

### Separation of Concerns
- LLM handles reasoning ("what tool to use")
- Deterministic code handles execution ("how to get data")
- Clear boundaries between AI and deterministic logic

### Developer Experience
- TypeScript interfaces match tool schemas
- Compile-time and runtime validation
- Clear error messages when schemas don't match

### Reliable Integration
- Downstream systems can depend on structure
- Easy to unit test tools independently
- Debuggable data flow

## Production Advantages

In production environments, Factor 4 enables:

- **API Consistency**: Guaranteed response structures across all tools
- **Data Pipelines**: Reliable data transformation and processing
- **Integration Safety**: Type-safe interfaces with external systems
- **Error Prevention**: Schema validation catches issues before runtime
- **Monitoring**: Structured outputs enable precise metrics and logging

## Anti-Patterns Avoided

❌ **Unstructured Tool Returns**: No unpredictable string or object outputs

❌ **Runtime Parsing**: No manual parsing of tool responses

❌ **Type Uncertainty**: No guessing about data structure or types

Factor 4 transforms tools from unpredictable functions into reliable, type-safe data providers that enable sophisticated downstream processing.
