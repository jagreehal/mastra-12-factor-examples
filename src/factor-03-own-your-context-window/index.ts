// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 3: Own Your Context Window');
console.log('====================================');

// 🧠 CONTEXT WINDOW MANAGEMENT
// Explicit control over what information the LLM sees

interface ConversationTurn {
  id: number;
  user: string;
  assistant: string;
  timestamp: Date;
  importance: 'high' | 'medium' | 'low';
}

class ContextManager {
  private conversation: ConversationTurn[] = [];
  private turnCounter = 0;

  addTurn(user: string, assistant: string, importance: 'high' | 'medium' | 'low' = 'medium') {
    this.turnCounter++;
    this.conversation.push({
      id: this.turnCounter,
      user,
      assistant,
      timestamp: new Date(),
      importance
    });
  }

  // 🎯 EXPLICIT CONTEXT STRATEGIES

  // Strategy 1: Recent messages only (sliding window)
  getRecentContext(maxTurns: number = 3): string {
    const recent = this.conversation.slice(-maxTurns);
    if (recent.length === 0) return "No previous conversation.";

    return recent.map(turn =>
      `User: ${turn.user}\nAssistant: ${turn.assistant}`
    ).join('\n\n');
  }

  // Strategy 2: Important messages only (filtered context)
  getImportantContext(): string {
    const important = this.conversation.filter(turn => turn.importance === 'high');
    if (important.length === 0) return "No important previous information.";

    return important.map(turn =>
      `[IMPORTANT] User: ${turn.user}\nAssistant: ${turn.assistant}`
    ).join('\n\n');
  }

  // Strategy 3: Summary + recent (compressed context)
  getSummaryContext(): string {
    const older = this.conversation.slice(0, -2);
    const recent = this.conversation.slice(-2);

    let context = "";

    if (older.length > 0) {
      const names = older.map(t => t.user.match(/name is (\w+)/)?.[1]).filter(Boolean);
      const uniqueNames = [...new Set(names)];
      if (uniqueNames.length > 0) {
        context += `[SUMMARY] User's name: ${uniqueNames.join(', ')}\n\n`;
      }
    }

    if (recent.length > 0) {
      context += recent.map(turn =>
        `User: ${turn.user}\nAssistant: ${turn.assistant}`
      ).join('\n\n');
    }

    return context || "No context available.";
  }

  getConversationLength(): number {
    return this.conversation.length;
  }
}

// 🔢 Simple tool for demonstration
const addTool = createTool({
  id: 'add',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  description: 'Add two numbers',
  execute: async ({ context }) => {
    const result = context.a + context.b;
    console.log(`[🔢 Tool] ${context.a} + ${context.b} = ${result}`);
    return { result };
  },
});

// 🤖 Create agent with context-aware instructions
function createContextAwareAgent(contextStrategy: string) {
  return new Agent({
    name: 'ContextAgent',
    instructions: `You are a helpful assistant. You have access to conversation context.

CONTEXT STRATEGY: ${contextStrategy}

When responding:
1. Use the conversation context to personalize responses
2. Reference previous information when relevant
3. Use the add tool for calculations
4. Be natural and conversational`,
    model,
    tools: { addTool },
  });
}

// 🎭 DEMONSTRATION: Same Conversation, Different Context Windows
async function demonstrateContextControl() {
  const contextManager = new ContextManager();

  console.log('\n🎬 Building conversation history...\n');

  // Build up conversation history
  const conversationSteps = [
    { user: "Hello! My name is Alex and I'm 25 years old.", importance: 'high' as const },
    { user: "I like pizza and coding.", importance: 'medium' as const },
    { user: "Yesterday I went to the movies.", importance: 'low' as const },
    { user: "My favorite color is blue.", importance: 'medium' as const },
    { user: "I have a dog named Max.", importance: 'high' as const }
  ];

  // Simulate conversation history (without actually calling LLM for speed)
  for (const step of conversationSteps) {
    const mockResponse = `Thanks for sharing that information!`;
    contextManager.addTurn(step.user, mockResponse, step.importance);
    console.log(`👤 User: ${step.user}`);
    console.log(`🤖 Assistant: ${mockResponse}\n`);
  }

  console.log(`📊 Conversation history: ${contextManager.getConversationLength()} turns\n`);

  // Now test different context strategies with a new question
  const testQuestion = "What do you remember about me?";

  const strategies = [
    {
      name: 'Recent Context (3 turns)',
      getContext: () => contextManager.getRecentContext(3),
      description: 'Only the last 3 conversation turns'
    },
    {
      name: 'Important Context Only',
      getContext: () => contextManager.getImportantContext(),
      description: 'Only messages marked as high importance'
    },
    {
      name: 'Summary + Recent',
      getContext: () => contextManager.getSummaryContext(),
      description: 'Compressed summary + recent messages'
    },
    {
      name: 'No Context',
      getContext: () => "No previous conversation context available.",
      description: 'Fresh conversation with no history'
    }
  ];

  console.log(`${'='.repeat(60)}`);
  console.log('🧪 Testing Different Context Strategies');
  console.log(`${'='.repeat(60)}`);

  for (const [index, strategy] of strategies.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Strategy ${index + 1}: ${strategy.name}`);
    console.log(`📝 Description: ${strategy.description}`);
    console.log(`${'─'.repeat(50)}`);

    const context = strategy.getContext();
    console.log('\n[📋 Context Window Contents]:');
    console.log(`"${context}"`);

    // Create agent and ask question with this specific context
    const agent = createContextAwareAgent(strategy.name);

    // Prepare the prompt with explicit context
    const promptWithContext = `CONVERSATION CONTEXT:
${context}

CURRENT QUESTION: ${testQuestion}`;

    console.log(`\n❓ Question: "${testQuestion}"`);
    console.log('🧠 Processing with context strategy...');

    const result = await agent.generate(promptWithContext);
    console.log(`💬 Response: ${result.text}`);
  }
}

// 🎯 CONTEXT WINDOW SIZE DEMONSTRATION
async function demonstrateContextLimits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📏 Context Window Size Management');
  console.log(`${'='.repeat(60)}`);

  const contextManager = new ContextManager();

  // Add many conversation turns
  for (let i = 1; i <= 8; i++) {
    contextManager.addTurn(
      `Message ${i}: Here's some information ${i}`,
      `Got it, thanks for message ${i}!`,
      i % 3 === 0 ? 'high' : 'medium'
    );
  }

  const windowSizes = [2, 4, 6, 8];

  for (const size of windowSizes) {
    console.log(`\n🔍 Context Window Size: ${size} turns`);
    const context = contextManager.getRecentContext(size);
    const lines = context.split('\n').length;
    console.log(`   📊 Context contains ${lines} lines`);
    console.log(`   📝 Sample: "${context.slice(0, 100)}${context.length > 100 ? '...' : ''}"`);
  }
}

async function main() {
  console.log('\n✨ Factor 3 demonstrates explicit control over context windows');
  console.log('   - You decide what information the LLM sees');
  console.log('   - Different context strategies = different responses');
  console.log('   - Context windows are limited, valuable resources');
  console.log('   - Explicit control enables debugging and optimization\n');

  await demonstrateContextControl();
  await demonstrateContextLimits();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 3 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Explicit control over what LLM sees in context');
  console.log('   ✅ Different context strategies produce different responses');
  console.log('   ✅ Context windows are limited - choose wisely');
  console.log('   ✅ Enables debugging by examining exact context contents');
  console.log('   ✅ Optimize for relevance vs recency vs importance');
}

main().catch(console.error);
