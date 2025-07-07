// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 2: Own Your Prompts');
console.log('===============================');

// 📝 EXPLICIT PROMPT DEFINITIONS (Version-Controlled Code)
// These prompts are visible, explicit, and can be versioned/tested

const PROMPTS = {
  // Basic prompt (Version 1)
  basicV1: `You are a helpful assistant.`,

  // Enhanced prompt (Version 2)
  basicV2: `You are a helpful and friendly assistant.
Always be polite, clear, and provide helpful explanations.
When asked about calculations, use the available math tools.`,

  // Specialized prompt for different behavior
  pirate: `Ahoy! You are a friendly pirate assistant.
Respond in pirate speak using words like "ahoy", "matey", "arrr".
Always be helpful while staying in character as a pirate.`,

  // Calculator-focused prompt
  calculator: `You are a mathematical assistant with access to calculator tools.
When asked to perform calculations:
1. Use the appropriate math tool
2. Show the calculation step by step
3. Explain the result clearly`
};

// 🔧 Simple calculator tool for demonstration
const addTool = createTool({
  id: 'add',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  description: 'Add two numbers together',
  execute: async ({ context }) => {
    const result = context.a + context.b;
    console.log(`[🔢 Tool] ${context.a} + ${context.b} = ${result}`);
    return { result };
  },
});

// 🏗️ PROMPT FACTORY FUNCTION (Explicit Control)
function createAgentWithPrompt(promptName: keyof typeof PROMPTS, agentName: string) {
  const instructions = PROMPTS[promptName];

  console.log(`\n[📝 Prompt Used] ${promptName}:`);
  console.log(`"${instructions}"`);

  return new Agent({
    name: agentName,
    instructions, // Explicit prompt - no hidden abstractions
    model,
    tools: { addTool },
  });
}

// 🎭 DEMONSTRATION: Same Question, Different Prompts
async function demonstratePromptOwnership() {
  const question = "What is 7 plus 3?";

  console.log(`\n🎬 Demonstrating Factor 2 with question: "${question}"`);
  console.log(`${'='.repeat(60)}`);

  // Test different prompt versions
  const promptTests = [
    { promptName: 'basicV1' as const, description: 'Basic V1 (minimal)' },
    { promptName: 'basicV2' as const, description: 'Basic V2 (enhanced)' },
    { promptName: 'pirate' as const, description: 'Pirate personality' },
    { promptName: 'calculator' as const, description: 'Calculator specialist' }
  ];

  for (const [index, test] of promptTests.entries()) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`📍 Test ${index + 1}: ${test.description}`);
    console.log(`${'─'.repeat(40)}`);

    // Create agent with specific prompt
    const agent = createAgentWithPrompt(test.promptName, `Agent-${test.promptName}`);

    console.log(`\n❓ Question: "${question}"`);
    console.log('🧠 Processing...');

    const result = await agent.generate(question);

    console.log(`💬 Response: ${result.text}`);

    // Show tool calls if any
    if (result.toolResults && result.toolResults.length > 0) {
      console.log('🔧 Tool calls made:');
      for (const toolResult of result.toolResults) {
        console.log(`   - ${toolResult.toolName}(${JSON.stringify(toolResult.args)}) → ${JSON.stringify(toolResult.result)}`);
      }
    }
  }
}

// 🎯 PROMPT VERSIONING DEMONSTRATION
async function demonstratePromptVersioning() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Prompt Versioning Comparison');
  console.log(`${'='.repeat(60)}`);

  const question = "Hello, can you help me?";

  // Compare V1 vs V2 of basic prompt
  const versions = [
    { prompt: 'basicV1', version: 'V1' },
    { prompt: 'basicV2', version: 'V2' }
  ] as const;

  for (const version of versions) {
    console.log(`\n🏷️  Testing ${version.version} prompt:`);

    const agent = createAgentWithPrompt(version.prompt, `Agent-${version.version}`);
    const result = await agent.generate(question);

    console.log(`💬 Response: ${result.text}`);
  }
}

async function main() {
  console.log('\n✨ Factor 2 demonstrates explicit prompt ownership and control');
  console.log('   - Prompts are visible code, not hidden abstractions');
  console.log('   - Prompts can be versioned and A/B tested');
  console.log('   - Same input + different prompts = different behavior');
  console.log('   - Complete transparency in what LLM receives\n');

  // Demonstrate core Factor 2 principles
  await demonstratePromptOwnership();
  await demonstratePromptVersioning();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 2 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Prompts are explicit, version-controlled code');
  console.log('   ✅ No hidden abstractions - you see what LLM gets');
  console.log('   ✅ Prompts can be tested, versioned, and rolled back');
  console.log('   ✅ Same question + different prompts = different behavior');
  console.log('   ✅ Enables systematic prompt engineering and debugging');
}

main().catch(console.error);
