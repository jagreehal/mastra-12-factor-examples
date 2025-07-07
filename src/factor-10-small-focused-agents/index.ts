// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('Factor 10: Small Focused Agents');
console.log('================================================');
console.log('Demonstration: Multiple agents with specific responsibilities');
console.log('Key principle: Each agent should have a single, well-defined responsibility');
console.log('Reference: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md');
console.log('');

// Simple calculation tools for demonstration
const addTool = createTool({
  id: 'add',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  description: 'Add two numbers together',
  execute: async ({ context }) => {
    const result = context.a + context.b;
    console.log(`  [Tool] ${context.a} + ${context.b} = ${result}`);
    return { result, operation: 'addition' };
  },
});

const multiplyTool = createTool({
  id: 'multiply',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  description: 'Multiply two numbers',
  execute: async ({ context }) => {
    const result = context.a * context.b;
    console.log(`  [Tool] ${context.a} * ${context.b} = ${result}`);
    return { result, operation: 'multiplication' };
  },
});

// Define small, focused agents with specific responsibilities
const analysisAgent = new Agent({
  name: 'AnalysisAgent',
  instructions: `You are an analysis agent focused on breaking down problems and identifying key elements.

Your SINGLE responsibility: Analyze topics and identify key components.

Always respond with:
1. Key elements identified
2. Problem breakdown
3. Analysis summary

Keep responses focused and analytical.`,
  model,
  tools: { addTool }, // Can do basic math for analysis
});

const planningAgent = new Agent({
  name: 'PlanningAgent',
  instructions: `You are a planning agent focused on creating structured plans.

Your SINGLE responsibility: Create step-by-step plans.

Always respond with:
1. Clear numbered steps
2. Dependencies between steps
3. Expected outcomes

Keep responses focused on actionable planning.`,
  model,
});

const executionAgent = new Agent({
  name: 'ExecutionAgent',
  instructions: `You are an execution agent focused on implementing plans.

Your SINGLE responsibility: Execute plans and track progress.

Always respond with:
1. Execution steps taken
2. Progress status
3. Next actions

Keep responses focused on execution details.`,
  model,
  tools: { multiplyTool }, // Can do calculations during execution
});

const reviewAgent = new Agent({
  name: 'ReviewAgent',
  instructions: `You are a review agent focused on quality assessment.

Your SINGLE responsibility: Review work and provide feedback.

Always respond with:
1. Quality assessment
2. Specific feedback
3. Improvement suggestions

Keep responses focused on constructive review.`,
  model,
});

// Agent coordination function
async function runAgentChain(topic: string, agents: Agent[]): Promise<void> {
  console.log(`\n=== Agent Chain for: "${topic}" ===`);

  let currentInput = topic;

  for (const [i, agent] of agents.entries()) {
    const stepNumber = i + 1;

    console.log(`\n--- Step ${stepNumber}: ${agent.name} ---`);
    console.log(`Input: ${currentInput}`);

    try {
      const result = await agent.generate(currentInput);
      console.log(`Output: ${result.text}`);

      // Log any tool usage
      if (result.toolResults && result.toolResults.length > 0) {
        console.log(`Tools used: ${result.toolResults.map(tr => tr.toolName).join(', ')}`);
      }

      // Pass output to next agent
      currentInput = result.text;

    } catch (error) {
      console.error(`Error in ${agent.name}:`, error instanceof Error ? error.message : error);
      break;
    }
  }
}

// Demonstrate different agent combinations
async function demonstrateSmallFocusedAgents(): Promise<void> {
  console.log('\n📋 DEMONSTRATION: Small Focused Agents');
  console.log('=====================================');

  // Scenario 1: Full pipeline - Analysis → Planning → Execution → Review
  console.log('\n🔄 Scenario 1: Complete Pipeline (4 agents)');
  console.log('Chain: Analysis → Planning → Execution → Review');
  await runAgentChain(
    'Create a simple budget tracking system',
    [analysisAgent, planningAgent, executionAgent, reviewAgent]
  );

  // Scenario 2: Planning only - skip analysis, go straight to planning
  console.log('\n📋 Scenario 2: Planning Focus (1 agent)');
  console.log('Chain: Planning only');
  await runAgentChain(
    'Organize a team meeting about project deadlines',
    [planningAgent]
  );

  // Scenario 3: Analysis + Review - skip implementation
  console.log('\n🔍 Scenario 3: Analysis + Review (2 agents)');
  console.log('Chain: Analysis → Review');
  await runAgentChain(
    'Evaluate the pros and cons of remote work',
    [analysisAgent, reviewAgent]
  );

  // Scenario 4: Execution + Review - for implementation tasks
  console.log('\n⚙️ Scenario 4: Execution + Review (2 agents)');
  console.log('Chain: Execution → Review');
  await runAgentChain(
    'Implement a daily standup meeting format',
    [executionAgent, reviewAgent]
  );
}

// Demonstrate agent specialization
async function demonstrateAgentSpecialization(): Promise<void> {
  console.log('\n🎯 DEMONSTRATION: Agent Specialization');
  console.log('=====================================');

  const topics = [
    'Technical debt in our codebase',
    'Customer feedback analysis',
    'Team productivity metrics'
  ];

  for (const topic of topics) {
    console.log(`\n📊 Topic: ${topic}`);
    console.log('--- Showing different agent perspectives ---');

    // Show how each agent handles the same topic differently
    const agents = [
      { agent: analysisAgent, role: 'Analysis' },
      { agent: planningAgent, role: 'Planning' },
      { agent: executionAgent, role: 'Execution' },
      { agent: reviewAgent, role: 'Review' }
    ];

    for (const { agent, role } of agents) {
      console.log(`\n${role} perspective:`);
      try {
        const result = await agent.generate(topic);
        console.log(`${result.text.slice(0, 150)}...`);
      } catch (error) {
        console.error(`Error in ${agent.name}:`, error instanceof Error ? error.message : error);
      }
    }
  }
}

// Compare focused vs unfocused agents
async function demonstrateFocusedVsUnfocused(): Promise<void> {
  console.log('\n⚖️ DEMONSTRATION: Focused vs Unfocused Agents');
  console.log('============================================');

  // Create an unfocused agent for comparison
  const unfocusedAgent = new Agent({
    name: 'UnfocusedAgent',
    instructions: `You are a general-purpose agent that can do anything.

    You can analyze, plan, execute, and review. You can handle any task.
    Try to be helpful with whatever the user needs.`,
    model,
    tools: { addTool, multiplyTool },
  });

  const testTopic = 'Improve our customer support process';

  console.log(`\n📝 Topic: ${testTopic}`);

  // Show unfocused agent response
  console.log('\n❌ Unfocused Agent Response:');
  try {
    const unfocusedResult = await unfocusedAgent.generate(testTopic);
    console.log(unfocusedResult.text);
  } catch (error) {
    console.error('Error with unfocused agent:', error instanceof Error ? error.message : error);
  }

  // Show focused agents working together
  console.log('\n✅ Focused Agents Working Together:');
  await runAgentChain(testTopic, [analysisAgent, planningAgent]);

  console.log('\n🔍 Key Differences:');
  console.log('- Unfocused: Tries to do everything, may lack depth');
  console.log('- Focused: Each agent excels in their specific area');
  console.log('- Focused: Clear handoffs between specialized agents');
  console.log('- Focused: Better debugging and maintenance');
}

// Main execution function
async function main(): Promise<void> {
  try {
    await demonstrateSmallFocusedAgents();
    await demonstrateAgentSpecialization();
    await demonstrateFocusedVsUnfocused();

    console.log('\n✅ FACTOR 10 DEMONSTRATION COMPLETE');
    console.log('=================================');
    console.log('Key Takeaways:');
    console.log('1. Each agent has a single, well-defined responsibility');
    console.log('2. Focused agents provide more consistent, quality output');
    console.log('3. Agent chains create powerful workflows through specialization');
    console.log('4. Easier to debug and maintain than monolithic agents');
    console.log('5. Better testability and modularity');

  } catch (error) {
    console.error('Demo failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

main().catch(console.error);
