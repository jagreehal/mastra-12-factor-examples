// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 1: Natural Language to Tool Calls');
console.log('===========================================');

// Simple lookup tool that demonstrates deterministic execution
const lookupTool = createTool({
  id: 'lookup',
  inputSchema: z.object({
    search: z.string().describe('The search term to look up')
  }),
  description: 'Looks up information for a given search term',
  execute: async ({ context }) => {
    console.log(`[🔧 Tool Called] lookupTool with: "${context.search}"`);

    // Deterministic responses for demo
    const database: Record<string, string> = {
      'capital of south dakota': 'Pierre is the capital of South Dakota.',
      'ada lovelace': 'Ada Lovelace was an English mathematician and writer, often considered the first computer programmer.',
      'weather': 'The weather is sunny and 72°F today.',
      'default': `I found information about "${context.search}" but it's not in my current database.`
    };

    const searchKey = context.search.toLowerCase();
    const result = database[searchKey] || database.default;

    console.log(`[✅ Tool Result] ${result}`);
    return { result };
  },
});

// Simple agent focused on natural language → tool calls
const agent = new Agent({
  name: 'Factor1Agent',
  instructions: `You are a helpful assistant that demonstrates Factor 1: Natural Language to Tool Calls.

When a user asks a question:
1. Use the lookup tool to search for information
2. Provide a clear response based on the tool result

Always use the lookup tool for any question - this demonstrates the LLM converting natural language to structured tool calls.`,
  model,
  tools: { lookupTool },
});

async function demonstrateFactor1(userQuestion: string) {
  console.log(`\n📝 User Question: "${userQuestion}"`);
  console.log('🧠 LLM Processing: Converting natural language to tool call...');

  const result = await agent.generate(userQuestion);

  console.log(`\n💬 Agent Response: ${result.text}`);

  // Show tool calls that were made
  if (result.toolResults && result.toolResults.length > 0) {
    console.log('\n🔍 Tool Calls Made:');
    for (const [index, toolResult] of result.toolResults.entries()) {
      console.log(`   ${index + 1}. ${toolResult.toolName}(${JSON.stringify(toolResult.args)})`);
      console.log(`      → ${JSON.stringify(toolResult.result)}`);
    }
  }

  console.log('\n✨ Factor 1 Demonstration:');
  console.log('   1. Natural Language Input ✅');
  console.log('   2. LLM → Structured Tool Call ✅');
  console.log('   3. Deterministic Tool Execution ✅');
  console.log('   4. Structured Output ✅');
}

async function main() {
  // Three demo scenarios that show different natural language inputs
  const scenarios = [
    'What is the capital of South Dakota?',
    'Tell me about Ada Lovelace',
    'What is the weather like?'
  ];

  console.log('\n🎬 Running Factor 1 Demo Scenarios:\n');

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1} of ${scenarios.length}`);
    console.log(`${'='.repeat(50)}`);

    await demonstrateFactor1(scenario);

    if (index < scenarios.length - 1) {
      // Add a small delay between scenarios for readability
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('🎉 Factor 1 Demo Complete!');
  console.log(`${'='.repeat(50)}`);
  console.log('\n💡 Key Takeaway:');
  console.log('   Factor 1 shows how LLMs excel at converting natural language');
  console.log('   into structured, executable tool calls. The LLM handles the');
  console.log('   "understanding" while tools handle "doing" deterministically.');
}

main().catch(console.error);
