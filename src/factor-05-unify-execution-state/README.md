# Factor 5: Unify Execution State and Business State

## Overview

This example demonstrates [**Factor 5: Unify Execution State and Business State** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md) from the 12-Factor Agents methodology.

Rather than maintaining separate systems for workflow state and application data, everything is stored and accessed through one consistent interface.

## What Factor 5 Solves

Traditional agent architectures often split state management:
- **Business State**: User preferences, domain data → Database A
- **Execution State**: Conversation flow, tool results → Database B
- **Result**: Complex synchronisation, state drift, debugging nightmares

Factor 5 unifies everything into a single container, eliminating synchronisation complexity whilst providing consistent access patterns for all state types.

## Core Principle

```
Single Memory Container = Execution State + Business State
```

## Implementation Architecture

### 🗃️ Unified State Container

```typescript
// Single Memory instance serves as unified state container
const memory = new Memory({
  storage: new LibSQLStore({
    url: ':memory:', // Use in-memory storage for this demo
  }),
  options: { lastMessages: 10 }, // Unified state management
});

const agent = new Agent({
  name: 'UnifiedStateAgent',
  instructions: `You manage both execution state and business state in a unified way.`,
  model,
  memory, // Single unified memory container
  tools: { savePreferenceTool, calculateTool },
});
```

### 🔧 State Management Tools

#### Business State Tool
```typescript
const savePreferenceTool = createTool({
  id: 'save-preference',
  inputSchema: z.object({
    key: z.string().describe('Preference key (e.g., "language", "theme")'),
    value: z.string().describe('Preference value')
  }),
  description: 'Save a user preference to business state',
  execute: async ({ context }) => {
    // Store business information in unified container
    return {
      success: true,
      preference: { key: context.key, value: context.value },
      timestamp: new Date().toISOString()
    };
  },
});
```

#### Execution State Tool
```typescript
const calculateTool = createTool({
  id: 'calculate',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  description: 'Perform mathematical calculation',
  execute: async ({ context }) => {
    // Process execution logic, results stored in same container
    return {
      operation: context.operation,
      operands: [context.a, context.b],
      result: /* calculated result */,
      timestamp: new Date().toISOString()
    };
  },
});
```

## Actual Output Examples

### Scenario 1: Setting Business State

```
❓ Message: "Hi! My name is Sarah and I prefer dark theme. Please save my theme preference."
🧠 Processing with unified state...

[💾 Save Preference] theme = dark

💬 Agent Response: I've saved your theme preference for dark mode, Sarah. I'll remember this in our future interactions.
```

The agent stores both the user's identity (Sarah) and preference (dark theme) in the unified memory container.

### Scenario 2: Execution State with Tools

```
❓ Message: "Can you calculate 15 + 27 for me?"
🧠 Processing with unified state...

[🔢 Calculate] 15 add 27 = 42

💬 Agent Response: The sum of 15 and 27 is 42. I've recorded this calculation in our conversation history.
```

Tool execution results are stored alongside business state in the same unified container.

### Scenario 3: State Retrieval

```
❓ Message: "What's my name and what calculation did we just do?"
🧠 Processing with unified state...

💬 Agent Response: I remember that your name is Sarah. In our previous conversation, we calculated the sum of 15 and 27, which equals 42.
```

The agent retrieves both business state (name: Sarah) and execution state (calculation: 15+27=42) from the unified container.

### Scenario 4: Cross-State Reference

```
❓ Message: "Calculate 42 * 8 and tell me what theme I prefer"
🧠 Processing with unified state...

[🔢 Calculate] 42 multiply 8 = 336

💬 Agent Response: The product of 42 multiplied by 8 is 336. I've recorded this calculation in our conversation history.

From my records, I know that you prefer dark theme.
```

Single interaction accessing both execution state (new calculation) and business state (theme preference) simultaneously.

## State Consistency Verification

The example demonstrates state persistence across multiple agent calls:

```
1️⃣ First Interaction:
   Response: I'm sorry, Alex, but I don't have the necessary tools to assist with that specific request. However, I'm here to help with any other questions or topics you might have! Let's explore something else you're interested in.

2️⃣ Second Interaction:
[💾 Save Preference] language = Spanish
   Response: I've saved your language preference as Spanish in our records.

3️⃣ Third Interaction:
[🔢 Calculate] 100 divide 5 = 20
   Response: The result of 100 divided by 5 is 20. I've recorded this calculation in our conversation history.

4️⃣ Fourth Interaction (State Retrieval):
   Response: From my records, your name is Alex. Your language preference is set to Spanish. We just calculated 100 divided by 5, which equals 20.
```

✅ **Unified state successfully maintained across multiple interactions!**

## Key Benefits

### ✅ Single Source of Truth
- **One memory container** for all state types
- **Consistent access patterns** across business and execution state
- **Simplified debugging** - no need to correlate multiple data sources

### ✅ State Persistence
- **Business state survives** across sessions and interactions
- **Execution history maintained** alongside domain data
- **No synchronisation issues** between separate systems

### ✅ Developer Experience
- **Clear state boundaries** within unified container
- **Easy state inspection** through single interface
- **Predictable state evolution** over time

### ✅ Operational Simplicity
- **Single storage system** to backup and monitor
- **Unified logging** and observability
- **Consistent recovery procedures**

## State Architecture

### Business State Components
- **User Identity**: Names, roles, authentication details
- **User Preferences**: Theme settings, language choices, personalisation
- **Domain Data**: Application-specific information, user-generated content

### Execution State Components
- **Conversation Flow**: Message history, context windows, turn management
- **Tool Results**: Function call outputs, computational results
- **Workflow Progress**: Step completion, error states, retry attempts

### Unified Storage Strategy
- **Same Container**: Both state types in single memory instance
- **Consistent IDs**: Same thread/resource identifiers for all operations
- **Atomic Operations**: State changes happen together, never drift apart

## Anti-Patterns Avoided

- ❌ **Separate Databases**: No split between business DB and execution DB
- ❌ **State Synchronisation**: No complex sync between different state systems
- ❌ **Inconsistent Access**: No different patterns for different state types
- ❌ **State Drift**: No possibility of state inconsistency between systems
- ❌ **Multiple Sources of Truth**: No confusion about where state lives

## Production Benefits

### Simplified Operations
- **One backup strategy** for all agent state
- **Single monitoring dashboard** for state health
- **Unified disaster recovery** procedures

### Enhanced Debugging
- **Complete interaction history** in one place
- **Clear state evolution** over time
- **No cross-system debugging** complexity

### Consistent Performance
- **Single database** connection and management
- **Unified query patterns** for all state access
- **Predictable scaling** characteristics

## Usage

Run the example to see unified state management in action:

```bash
pnpm factor05
```

## Key Takeaways

- ✅ **Single container unifies** business and execution state
- ✅ **Consistent access patterns** eliminate complexity
- ✅ **State persistence works** across multiple interactions
- ✅ **Cross-state references** happen naturally
- ✅ **Simplified debugging** through unified storage
- ✅ **Operational simplicity** from single source of truth

Factor 5 transforms state management from a complex synchronisation problem into a simple, unified storage solution that scales naturally with your agent's complexity.
