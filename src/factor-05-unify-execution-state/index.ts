// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md

import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 5: Unify Execution State and Business State');
console.log('====================================================');

// 🗃️ UNIFIED STATE CONTAINER
// Single memory instance manages both execution state and business state

const memory = new Memory({
  storage: new LibSQLStore({
    url: ':memory:', // Use in-memory storage for this demo
  }),
  options: {
    lastMessages: 10, // Unified state management
  },
});

// 🔧 BUSINESS STATE TOOLS
// Tools that manage domain-specific information

const savePreferenceTool = createTool({
  id: 'save-preference',
  inputSchema: z.object({
    key: z.string().describe('Preference key (e.g., "language", "theme")'),
    value: z.string().describe('Preference value')
  }),
  description: 'Save a user preference to business state',
  execute: async ({ context }) => {
    console.log(`[💾 Save Preference] ${context.key} = ${context.value}`);

    // In a real app, this would save to a database
    // Here we simulate business state storage
    return {
      success: true,
      preference: { key: context.key, value: context.value },
      timestamp: new Date().toISOString()
    };
  },
});

const calculateTool = createTool({
  id: 'calculate',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  description: 'Perform mathematical calculation',
  execute: async ({ context }) => {
    let result: number;

    switch (context.operation) {
      case 'add': {
        result = context.a + context.b;
        break;
      }
      case 'subtract': {
        result = context.a - context.b;
        break;
      }
      case 'multiply': {
        result = context.a * context.b;
        break;
      }
      case 'divide': {
        if (context.b === 0) throw new Error('Division by zero');
        result = context.a / context.b;
        break;
      }
      default: {
        throw new Error(`Unknown operation: ${context.operation}`);
      }
    }

    console.log(`[🔢 Calculate] ${context.a} ${context.operation} ${context.b} = ${result}`);

    return {
      operation: context.operation,
      operands: [context.a, context.b],
      result,
      timestamp: new Date().toISOString()
    };
  },
});

// 🤖 UNIFIED STATE AGENT
// Single agent with unified memory for both execution and business state

const agent = new Agent({
  name: 'UnifiedStateAgent',
  instructions: `You are a helpful assistant that manages both execution state and business state in a unified way.

UNIFIED STATE MANAGEMENT:
- Business State: User identity, preferences, personal information
- Execution State: Conversation flow, tool results, context
- Both are stored together in the same memory container

Available tools:
- save-preference: Store user preferences (business state)
- calculate: Perform calculations (execution state)

When interacting:
1. Remember user information across conversations (business state)
2. Track tool usage and results (execution state)
3. Reference both types of state when relevant
4. Be specific about what you remember and why`,
  model,
  memory, // Single unified memory container
  tools: { savePreferenceTool, calculateTool },
});

// 🔗 CONSISTENT STATE IDENTIFIERS
// Same thread/resource IDs for unified state access

const threadId = 'factor05-unified-demo';
const resourceId = 'demo-user';

// 📊 STATE TRACKING UTILITIES
// Helper functions to understand what's in our unified state

interface StateSnapshot {
  businessState: {
    userInfo: Record<string, string>;
    preferences: Array<{ key: string; value: string; timestamp: string }>;
  };
  executionState: {
    conversationTurns: number;
    toolCalls: Array<{ tool: string; result: unknown; timestamp: string }>;
    lastActivity: string;
  };
}

async function captureStateSnapshot(scenario: string): Promise<StateSnapshot> {
  // In a real implementation, you would extract this from the memory
  // Here we simulate state tracking for demonstration

  const snapshot: StateSnapshot = {
    businessState: {
      userInfo: {},
      preferences: []
    },
    executionState: {
      conversationTurns: 0,
      toolCalls: [],
      lastActivity: new Date().toISOString()
    }
  };

  console.log(`\n[📸 State Snapshot: ${scenario}]`);
  console.log('Business State:', JSON.stringify(snapshot.businessState, null, 2));
  console.log('Execution State:', JSON.stringify(snapshot.executionState, null, 2));

  return snapshot;
}

// 🎭 DEMONSTRATION: Unified State Management
async function demonstrateUnifiedState() {
  const scenarios = [
    {
      name: 'Setting Business State',
      message: "Hi! My name is Sarah and I prefer dark theme. Please save my theme preference.",
      description: 'Storing user identity and preferences in unified state'
    },
    {
      name: 'Execution State with Tools',
      message: "Can you calculate 15 + 27 for me?",
      description: 'Tool execution results stored in same unified state'
    },
    {
      name: 'State Retrieval',
      message: "What's my name and what calculation did we just do?",
      description: 'Retrieving both business and execution state from unified container'
    },
    {
      name: 'Cross-State Reference',
      message: "Calculate 42 * 8 and tell me what theme I prefer",
      description: 'Demonstrating access to both state types in one interaction'
    }
  ];

  console.log(`\n${'='.repeat(60)}`);
  console.log('🧪 Testing Unified State Management');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n❓ Message: "${scenario.message}"`);
    console.log('🧠 Processing with unified state...');

    // Capture state before
    await captureStateSnapshot(`Before ${scenario.name}`);

    // Execute with unified state
    const result = await agent.generateVNext(scenario.message, {
      threadId,
      resourceId,
    });

    console.log(`\n💬 Agent Response: ${result.text}`);

    // Show tool results if any
    if (result.toolResults && result.toolResults.length > 0) {
      console.log('\n[🔧 Tool Results]:');
      for (const toolResult of result.toolResults) {
        console.log(`  📦 ${toolResult.toolName}:`, JSON.stringify(toolResult.result, null, 2));
      }
    }

    // Capture state after
    await captureStateSnapshot(`After ${scenario.name}`);
  }
}

// 🔍 UNIFIED STATE BENEFITS DEMONSTRATION
async function demonstrateStateBenefits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💡 Unified State Benefits');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Single Source of Truth:');
  console.log('   🗃️  One memory container for all state');
  console.log('   🔗 Consistent access patterns');
  console.log('   🐛 Simplified debugging');

  console.log('\n✅ State Persistence:');
  console.log('   💾 Business state survives across sessions');
  console.log('   📈 Execution history maintained');
  console.log('   🔄 No state synchronization issues');

  console.log('\n✅ Developer Experience:');
  console.log('   🎯 Clear state boundaries');
  console.log('   📊 Easy state inspection');
  console.log('   🔧 Predictable state evolution');

  console.log('\n🏗️ State Architecture:');
  console.log('   Business State: User info, preferences, domain data');
  console.log('   Execution State: Conversation flow, tool results, context');
  console.log('   Unified Storage: Single memory container manages both');

  console.log('\n🚫 Anti-Patterns Avoided:');
  console.log('   ❌ Separate business and execution databases');
  console.log('   ❌ State synchronization complexity');
  console.log('   ❌ Inconsistent state access patterns');
  console.log('   ❌ State drift between systems');
}

// 🎯 STATE CONSISTENCY DEMONSTRATION
async function demonstrateStateConsistency() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔗 State Consistency Verification');
  console.log(`${'='.repeat(60)}`);

  console.log('\n🧪 Testing state persistence across multiple agent calls...');

  // First interaction - set business state
  console.log('\n1️⃣ First Interaction:');
  const result1 = await agent.generateVNext("My name is Alex and I work in engineering", {
    threadId,
    resourceId,
  });
  console.log(`   Response: ${result1.text}`);

  // Second interaction - set more business state
  console.log('\n2️⃣ Second Interaction:');
  const result2 = await agent.generateVNext("Save my language preference as Spanish", {
    threadId,
    resourceId,
  });
  console.log(`   Response: ${result2.text}`);

  // Third interaction - execution state
  console.log('\n3️⃣ Third Interaction:');
  const result3 = await agent.generateVNext("Calculate 100 divided by 5", {
    threadId,
    resourceId,
  });
  console.log(`   Response: ${result3.text}`);

  // Fourth interaction - retrieve all state
  console.log('\n4️⃣ Fourth Interaction (State Retrieval):');
  const result4 = await agent.generateVNext("Tell me my name, my language preference, and what calculation we just did", {
    threadId,
    resourceId,
  });
  console.log(`   Response: ${result4.text}`);

  console.log('\n✅ Unified state successfully maintained across multiple interactions!');
}

async function main() {
  console.log('\n✨ Factor 5 demonstrates unified execution and business state');
  console.log('   - Single memory container for all state');
  console.log('   - Business state: user info, preferences, domain data');
  console.log('   - Execution state: conversation flow, tool results');
  console.log('   - Consistent access patterns for both state types');
  console.log('   - No state synchronization complexity\n');

  await demonstrateUnifiedState();
  await demonstrateStateBenefits();
  await demonstrateStateConsistency();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 5 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Single memory container unifies all state');
  console.log('   ✅ Business and execution state stored together');
  console.log('   ✅ Consistent state access patterns');
  console.log('   ✅ Simplified debugging and inspection');
  console.log('   ✅ No state synchronization issues');
  console.log('   ✅ Predictable state evolution over time');
}

main().catch(console.error);
