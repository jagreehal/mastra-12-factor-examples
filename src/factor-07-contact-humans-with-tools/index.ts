// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md

import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 7: Contact Humans with Tools');
console.log('======================================');

// 🧑‍🤝‍🧑 HUMAN TOOLS
// Core concept: Human interaction treated as regular tools

// 🤔 HUMAN CLARIFICATION TOOL
// Request clarification from humans using the same tool interface

const humanClarificationTool = createTool({
  id: 'human-clarification',
  inputSchema: z.object({
    question: z.string().describe('The question to ask the human'),
    context: z.string().optional().describe('Additional context for the question')
  }),
  description: 'Request clarification from a human user',
  execute: async ({ context }) => {
    console.log(`\n🤔 [Human Clarification Tool] Requesting clarification...`);
    console.log(`   Question: ${context.question}`);
    if (context.context) {
      console.log(`   Context: ${context.context}`);
    }

    // In a real implementation, this would pause for human input
    // For demo purposes, we simulate human responses
    const simulatedResponse = simulateHumanClarification(context.question);

    console.log(`   👤 Human Response: "${simulatedResponse}"`);

    return {
      response: simulatedResponse,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});

// ✋ HUMAN APPROVAL TOOL
// Request approval from humans using the same tool interface

const humanApprovalTool = createTool({
  id: 'human-approval',
  inputSchema: z.object({
    action: z.string().describe('The action requiring approval'),
    risk_level: z.enum(['low', 'medium', 'high']).describe('Risk level of the action'),
    details: z.string().optional().describe('Additional details about the action')
  }),
  description: 'Request approval from a human user for an action',
  execute: async ({ context }) => {
    console.log(`\n✋ [Human Approval Tool] Requesting approval...`);
    console.log(`   Action: ${context.action}`);
    console.log(`   Risk Level: ${context.risk_level}`);
    if (context.details) {
      console.log(`   Details: ${context.details}`);
    }

    // In a real implementation, this would pause for human decision
    // For demo purposes, we simulate human approval decisions
    const simulatedApproval = simulateHumanApproval(context.action, context.risk_level);

    console.log(`   👤 Human Decision: ${simulatedApproval.approved ? 'APPROVED' : 'DENIED'}`);
    if (simulatedApproval.reason) {
      console.log(`   👤 Reason: ${simulatedApproval.reason}`);
    }

    return {
      approved: simulatedApproval.approved,
      reason: simulatedApproval.reason,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});

// 📝 HUMAN REVIEW TOOL
// Request review/feedback from humans using the same tool interface

const humanReviewTool = createTool({
  id: 'human-review',
  inputSchema: z.object({
    content: z.string().describe('Content to be reviewed'),
    review_type: z.enum(['quality', 'accuracy', 'completeness']).describe('Type of review needed'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority of the review')
  }),
  description: 'Request review or feedback from a human user',
  execute: async ({ context }) => {
    console.log(`\n📝 [Human Review Tool] Requesting review...`);
    console.log(`   Content: ${context.content}`);
    console.log(`   Review Type: ${context.review_type}`);
    console.log(`   Priority: ${context.priority}`);

    // In a real implementation, this would pause for human review
    // For demo purposes, we simulate human review feedback
    const simulatedReview = simulateHumanReview(context.content, context.review_type);

    console.log(`   👤 Human Review: ${simulatedReview.status}`);
    console.log(`   👤 Feedback: ${simulatedReview.feedback}`);

    return {
      status: simulatedReview.status,
      feedback: simulatedReview.feedback,
      suggestions: simulatedReview.suggestions,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});

// 🤖 AGENT WITH HUMAN TOOLS
// Agent that can use human tools just like any other tools

const agent = new Agent({
  name: 'HumanToolAgent',
  instructions: `You are an AI assistant that can interact with humans using tools.

Available human interaction tools:
- human-clarification: Ask humans for clarification when something is unclear
- human-approval: Request human approval for actions, especially risky ones
- human-review: Request human review or feedback on content

Use these tools naturally when:
1. You need clarification on ambiguous requests
2. You need approval for actions that might have consequences
3. You need human review of content or decisions

Treat human tools the same way you treat other tools - call them when needed and use their responses to continue your work.`,
  model,
  tools: { humanClarificationTool, humanApprovalTool, humanReviewTool },
});

// 🎭 SIMULATED HUMAN RESPONSES
// Helper functions to simulate human responses for demo purposes

function simulateHumanClarification(question: string): string {
  const responses = {
    'what do you want to do?': 'I want to create a summary of our latest sales report',
    'can you be more specific?': 'I need a 2-page summary highlighting key metrics and trends',
    'which file should i process?': 'Please process the Q3_Sales_Report.xlsx file',
    'what format do you prefer?': 'Please provide the output in PDF format',
    'when do you need this completed?': 'I need this completed by end of day tomorrow'
  };

  const lowerQuestion = question.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuestion.includes(key)) {
      return response;
    }
  }

  return 'Could you please provide more details about what you need?';
}

function simulateHumanApproval(action: string, riskLevel: string): { approved: boolean; reason: string } {
  const lowerAction = action.toLowerCase();

  if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
    if (riskLevel === 'high') {
      return { approved: false, reason: 'High-risk deletion requires additional review' };
    }
    return { approved: true, reason: 'Approved - standard deletion with backup' };
  }

  if (lowerAction.includes('send') || lowerAction.includes('email')) {
    return { approved: true, reason: 'Approved - communication action is low risk' };
  }

  if (lowerAction.includes('purchase') || lowerAction.includes('buy')) {
    return { approved: false, reason: 'Financial actions require manager approval' };
  }

  return { approved: true, reason: 'Approved - standard action' };
}

function simulateHumanReview(content: string, reviewType: string): { status: string; feedback: string; suggestions: string[] } {
  const contentLength = content.length;

  if (reviewType === 'quality') {
    return {
      status: contentLength > 100 ? 'good' : 'needs_improvement',
      feedback: contentLength > 100 ? 'Content quality is good with sufficient detail' : 'Content needs more detail and examples',
      suggestions: contentLength > 100 ? ['Add more specific examples', 'Consider breaking into sections'] : ['Expand each point', 'Add supporting details']
    };
  }

  if (reviewType === 'accuracy') {
    return {
      status: 'good',
      feedback: 'Information appears accurate and up-to-date',
      suggestions: ['Verify latest statistics', 'Cross-check with official sources']
    };
  }

  if (reviewType === 'completeness') {
    return {
      status: contentLength > 200 ? 'complete' : 'incomplete',
      feedback: contentLength > 200 ? 'Content covers all major points' : 'Content is missing key information',
      suggestions: contentLength > 200 ? ['Add conclusion section'] : ['Include introduction', 'Add more examples', 'Include conclusion']
    };
  }

  return {
    status: 'good',
    feedback: 'Review completed successfully',
    suggestions: ['No specific suggestions at this time']
  };
}

// 🎯 DEMONSTRATION SCENARIOS
// Automated scenarios showing different human tool usage patterns

interface HumanToolScenario {
  name: string;
  description: string;
  userRequest: string;
  expectedTools: string[];
}

const scenarios: HumanToolScenario[] = [
  {
    name: 'Clarification Request',
    description: 'Agent asks for clarification when request is unclear',
    userRequest: 'Can you help me with that thing?',
    expectedTools: ['human-clarification']
  },
  {
    name: 'Approval Required',
    description: 'Agent requests approval for potentially risky actions',
    userRequest: 'Delete all the temporary files from the server',
    expectedTools: ['human-approval']
  },
  {
    name: 'Content Review',
    description: 'Agent requests human review of generated content',
    userRequest: 'Create a summary of our project status and make sure it\'s accurate',
    expectedTools: ['human-review']
  },
  {
    name: 'Multi-Step Human Interaction',
    description: 'Agent uses multiple human tools in sequence',
    userRequest: 'Help me process some important documents but I\'m not sure exactly what',
    expectedTools: ['human-clarification', 'human-approval', 'human-review']
  }
];

// 🎭 SCENARIO DEMONSTRATIONS
async function demonstrateScenarios() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎭 Human Tools Integration Scenarios');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n👤 User Request: "${scenario.userRequest}"`);
    console.log('🤖 Agent processing request...');

    // Generate response using agent with human tools
    const result = await agent.generateVNext(scenario.userRequest);

    console.log(`\n💬 Agent Response: ${result.text}`);

    // Show tool usage
    if (result.toolResults && result.toolResults.length > 0) {
      console.log('\n[🔧 Human Tools Used]:');
      for (const toolResult of result.toolResults) {
        console.log(`  📦 ${toolResult.toolName}:`);
        console.log(`     Result: ${JSON.stringify(toolResult.result, null, 2)}`);
      }
    } else {
      console.log('\n[ℹ️  No human tools used - request was clear enough]');
    }

    console.log(`\n✅ Scenario completed - Human tools treated as regular tools`);
  }
}

// 💡 BENEFITS DEMONSTRATION
async function demonstrateBenefits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💡 Factor 7 Benefits: Humans as Tools');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Unified Tool Interface:');
  console.log('   🔧 Human tools use same createTool() API');
  console.log('   📋 Same input/output schema validation');
  console.log('   🎯 Consistent error handling and logging');

  console.log('\n✅ Seamless Integration:');
  console.log('   🤖 Agent calls human tools like any other tool');
  console.log('   🔄 No special handling required for human interaction');
  console.log('   📊 Tool results used naturally in agent workflow');

  console.log('\n✅ Flexible Human Interaction:');
  console.log('   🤔 Clarification requests when input is unclear');
  console.log('   ✋ Approval workflows for risky actions');
  console.log('   📝 Review processes for quality assurance');

  console.log('\n✅ Scalable Patterns:');
  console.log('   🎯 Multiple human tools can be composed together');
  console.log('   🔀 Human tools can be mixed with automated tools');
  console.log('   📈 Easy to add new types of human interaction');

  console.log('\n🏗️ Human Tool Types:');
  console.log('   🤔 Clarification: "What do you mean by X?"');
  console.log('   ✋ Approval: "Should I proceed with this action?"');
  console.log('   📝 Review: "Is this content accurate/complete?"');
  console.log('   🎯 Decision: "Choose between these options"');
  console.log('   💡 Expertise: "What\'s the best approach for X?"');

  console.log('\n🚫 Anti-Patterns Avoided:');
  console.log('   ❌ Complex human-in-the-loop frameworks');
  console.log('   ❌ Separate human interaction systems');
  console.log('   ❌ Hardcoded human interaction flows');
  console.log('   ❌ Inconsistent human interaction patterns');
}

// 🔍 TOOL COMPARISON DEMONSTRATION
async function demonstrateToolComparison() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 Tool Comparison: Human vs Automated');
  console.log(`${'='.repeat(60)}`);

  console.log('\n🤖 Automated Tool Example:');
  console.log('   📦 Calculator Tool');
  console.log('   📋 Input: { operation: "add", numbers: [5, 3] }');
  console.log('   🔧 Execute: Immediate calculation');
  console.log('   📤 Output: { result: 8, operation: "add" }');

  console.log('\n🧑‍🤝‍🧑 Human Tool Example:');
  console.log('   📦 Human Clarification Tool');
  console.log('   📋 Input: { question: "What numbers to add?", context: "math_request" }');
  console.log('   🔧 Execute: Request human input (would pause in real implementation)');
  console.log('   📤 Output: { response: "Add 5 and 3", timestamp: "2024-01-01T10:00:00Z" }');

  console.log('\n🎯 Key Similarities:');
  console.log('   ✅ Both use createTool() API');
  console.log('   ✅ Both have input/output schemas');
  console.log('   ✅ Both return structured results');
  console.log('   ✅ Both integrate seamlessly with agents');
  console.log('   ✅ Both support error handling');

  console.log('\n🎯 Key Differences:');
  console.log('   ⏱️  Human tools may have longer execution time');
  console.log('   🔄 Human tools may require suspension/resumption');
  console.log('   🎭 Human tools provide subjective/creative input');
  console.log('   📊 Human tools handle ambiguous/complex scenarios');
}

async function main() {
  console.log('\n✨ Factor 7 demonstrates human interaction as tools');
  console.log('   - Human tools use the same createTool() API as automated tools');
  console.log('   - Agents can call human tools naturally in their workflow');
  console.log('   - Human clarification, approval, and review treated as regular tools');
  console.log('   - No special handling required for human vs automated tools');
  console.log('   - Seamless integration of human intelligence into agent workflows\n');

  await demonstrateScenarios();
  await demonstrateBenefits();
  await demonstrateToolComparison();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 7 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Human interaction treated as regular tools');
  console.log('   ✅ Same API for human and automated tools');
  console.log('   ✅ Seamless integration in agent workflows');
  console.log('   ✅ Flexible human interaction patterns');
  console.log('   ✅ Scalable and composable human tools');
  console.log('   ✅ No special frameworks needed for human-in-the-loop');
}

main().catch(console.error);
