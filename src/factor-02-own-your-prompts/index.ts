// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md

import { Agent } from '@mastra/core/agent';
import { model } from '../model';

console.log('🎯 Factor 2: Own Your Prompts');
console.log('===============================');

// ❌ ANTI-PATTERN: Framework-Hidden Prompts (Black Box Approach)
// Many frameworks hide the actual prompts behind abstractions
// You provide high-level config, but can't see or control the actual prompt

interface BlackBoxAgentConfig {
  role: string;
  goal: string;
  personality?: string;
  context?: string[];
}

class BlackBoxAgent {
  private config: BlackBoxAgentConfig;
  private agent: Agent;

  constructor(config: BlackBoxAgentConfig) {
    this.config = config;

    // ⚠️ The actual prompt is hidden inside the framework!
    // You have no idea what instructions the LLM receives
    const hiddenPrompt = this.generateHiddenPrompt();

    this.agent = new Agent({
      name: 'Black Box Agent',
      instructions: hiddenPrompt,
      model,
    });
  }

  // This method is "private" - you can't see or modify it
  private generateHiddenPrompt(): string {
    // In a real framework, this would be even more complex and hidden
    let prompt = `You are a ${this.config.role}.`;

    if (this.config.goal) {
      prompt += ` Your goal is to ${this.config.goal}.`;
    }

    if (this.config.personality) {
      prompt += ` You have a ${this.config.personality} personality.`;
    }

    if (this.config.context?.length) {
      prompt += ` Consider the following context: ${this.config.context.join(', ')}.`;
    }

    prompt += ' Always be helpful and provide accurate information.';

    return prompt;
  }

  async ask(question: string) {
    return await this.agent.generate(question);
  }
}

// ✅ GOOD PATTERN: Explicit Prompt Ownership
// You write and control exactly what the LLM sees

const DEPLOYMENT_PROMPTS = {
  // Version 1: Basic deployment assistant
  v1: `You are a deployment assistant. When asked about deployments, provide helpful information.`,

  // Version 2: Improved with specific instructions
  v2: `You are a deployment assistant that helps manage software deployments.

When asked about deployments:
- Consider the environment (staging vs production)
- Think about rollback strategies
- Mention any risks or precautions
- Be specific and actionable

Format your responses clearly and concisely.`,

  // Version 3: Production-ready with detailed guidelines
  v3: `You are an expert deployment assistant that ensures safe and reliable software deployments.

Your responsibilities:
1. Analyze deployment requests for potential risks
2. Recommend appropriate deployment strategies
3. Ensure proper testing procedures are followed
4. Advise on rollback procedures

Guidelines:
- ALWAYS verify the target environment before proceeding
- For production deployments, recommend staging tests first
- Highlight any breaking changes or dependencies
- Suggest monitoring and validation steps post-deployment
- If uncertain about safety, recommend additional checks

Response format:
- Start with a risk assessment (Low/Medium/High)
- List prerequisites if any
- Provide step-by-step recommendations
- Include rollback procedures
- End with monitoring suggestions`,
};

// Enhanced: Prompt with template parameters
const TEMPLATED_PROMPTS = {
  deployment: (environment: string, service: string) => `
You are a deployment assistant for ${service} in the ${environment} environment.

Environment-specific considerations:
- ${environment === 'production' ? 'EXTREME CAUTION REQUIRED - Production environment' : 'Standard deployment process'}
- ${environment === 'staging' ? 'Test thoroughly before production' : 'Follow standard procedures'}

Service: ${service}
Environment: ${environment}

Provide deployment guidance with appropriate safety measures.
`,
};

// Enhanced: Prompt validation and metrics
interface PromptMetrics {
  version: string;
  responseTime: number;
  tokenCount: number;
  safetyScore: number;
}

const PromptEvaluator = {
  evaluateSafety(response: string): number {
    const safetyKeywords = ['risk', 'rollback', 'monitor', 'test', 'verify', 'caution'];
    const foundKeywords = safetyKeywords.filter(keyword =>
      response.toLowerCase().includes(keyword)
    );
    return (foundKeywords.length / safetyKeywords.length) * 100;
  },

  async measurePerformance(agent: Agent, question: string): Promise<PromptMetrics> {
    const startTime = Date.now();
    const response = await agent.generate(question);
    const endTime = Date.now();

    return {
      version: agent.name || 'unknown',
      responseTime: endTime - startTime,
      tokenCount: response.text.length, // Simplified - in real app, use actual token count
      safetyScore: this.evaluateSafety(response.text),
    };
  },
};

// Factory function for creating agents with explicit prompts
function createDeploymentAgent(promptVersion: keyof typeof DEPLOYMENT_PROMPTS) {
  const instructions = DEPLOYMENT_PROMPTS[promptVersion];

  console.log(`\n📝 Using Prompt Version: ${promptVersion}`);
  console.log('─'.repeat(50));
  console.log(instructions);
  console.log('─'.repeat(50));

  return new Agent({
    name: `Deployment Agent ${promptVersion}`,
    instructions, // Explicit, visible, version-controlled
    model,
  });
}

// Enhanced: Create agent with templated prompt
function createTemplatedAgent(environment: string, service: string) {
  const instructions = TEMPLATED_PROMPTS.deployment(environment, service);

  console.log(`\n🔧 Using Templated Prompt for ${service} in ${environment}`);
  console.log('─'.repeat(50));
  console.log(instructions);
  console.log('─'.repeat(50));

  return new Agent({
    name: `${service} ${environment} Agent`,
    instructions,
    model,
  });
}

// Demonstration functions
async function demonstrateBlackBoxProblem() {
  console.log('\n❌ ANTI-PATTERN: Black Box Framework Approach');
  console.log('============================================');

  // Create an agent with framework abstractions
  const blackBoxAgent = new BlackBoxAgent({
    role: 'deployment assistant',
    goal: 'help with software deployments',
    personality: 'cautious and thorough',
    context: ['production environment', 'critical systems'],
  });

  console.log('\n🔒 Configuration provided:');
  console.log('- Role: deployment assistant');
  console.log('- Goal: help with software deployments');
  console.log('- Personality: cautious and thorough');
  console.log('- Context: production environment, critical systems');
  console.log('\n❓ But what prompt does the LLM actually see? 🤷');
  console.log('(Hidden inside the framework - you can\'t access or modify it!)');

  const question = "Should I deploy the new user service to production?";
  console.log(`\n💬 Question: "${question}"`);

  const response = await blackBoxAgent.ask(question);
  console.log(`\n🤖 Response: ${response.text}`);

  console.log('\n⚠️  Problems with this approach:');
  console.log('- Cannot see the actual prompt sent to the LLM');
  console.log('- Cannot debug unexpected behaviors');
  console.log('- Cannot A/B test different prompts');
  console.log('- Cannot version control the actual instructions');
}

async function demonstrateExplicitPrompts() {
  console.log('\n\n✅ GOOD PATTERN: Explicit Prompt Ownership');
  console.log('=========================================');

  const deploymentQuestion = "Should I deploy the new user service to production?";

  // Test different prompt versions
  for (const version of ['v1', 'v2', 'v3'] as const) {
    const agent = createDeploymentAgent(version);

    console.log(`\n💬 Question: "${deploymentQuestion}"`);
    const response = await agent.generate(deploymentQuestion);
    console.log(`\n🤖 Response with ${version}:`);
    console.log(response.text);
    console.log('\n' + '─'.repeat(60));
  }
}

async function demonstratePromptEvolution() {
  console.log('\n\n📈 PROMPT EVOLUTION: Iterating Based on Results');
  console.log('==============================================');

  console.log('\nScenario: We notice v1 gives generic responses.');
  console.log('Solution: We can see the exact prompt and improve it!');

  // Show a more specific scenario
  const specificQuestion = "We have a critical hotfix for a payment bug. Should I skip staging and deploy directly to production?";

  console.log(`\n🚨 Critical Question: "${specificQuestion}"`);

  // Compare v1 (basic) vs v3 (production-ready)
  console.log('\n--- Response with v1 (basic) ---');
  const v1Agent = createDeploymentAgent('v1');
  const v1Response = await v1Agent.generate(specificQuestion);
  console.log(v1Response.text);

  console.log('\n--- Response with v3 (production-ready) ---');
  const v3Agent = createDeploymentAgent('v3');
  const v3Response = await v3Agent.generate(specificQuestion);
  console.log(v3Response.text);

  console.log('\n💡 Key Insight: Because we own the prompts, we can:');
  console.log('- See exactly why v3 gives better advice');
  console.log('- Test changes systematically');
  console.log('- Roll back if a change makes things worse');
  console.log('- Share prompts across teams for consistency');
}

async function demonstrateTestingPrompts() {
  console.log('\n\n🧪 TESTING PROMPTS: Systematic Evaluation');
  console.log('=========================================');

  // Test cases to evaluate prompt quality
  const testCases = [
    "Should I deploy on Friday afternoon?",
    "The staging environment is down. Can I deploy to production?",
    "We need to deploy a database migration. What should I consider?",
  ];

  console.log('Running test cases against our prompts...\n');

  for (const testCase of testCases) {
    console.log(`📋 Test Case: "${testCase}"`);

    // Test with v3 (our best prompt)
    const agent = createDeploymentAgent('v3');
    const response = await agent.generate(testCase);

    // Check if response includes key safety elements
    const hasRiskAssessment = response.text.toLowerCase().includes('risk');
    const hasRollback = response.text.toLowerCase().includes('rollback');
    const hasMonitoring = response.text.toLowerCase().includes('monitor');

    console.log('✓ Risk Assessment: ' + (hasRiskAssessment ? '✅' : '❌'));
    console.log('✓ Rollback Plan: ' + (hasRollback ? '✅' : '❌'));
    console.log('✓ Monitoring: ' + (hasMonitoring ? '✅' : '❌'));
    console.log('\n' + '─'.repeat(60) + '\n');
  }
}

async function demonstrateTemplatedPrompts() {
  console.log('\n\n🔧 TEMPLATED PROMPTS: Dynamic Prompt Generation');
  console.log('==============================================');

  const question = "Should I deploy this service?";

  // Compare different environments
  const environments = ['staging', 'production'];
  const service = 'user-service';

  for (const env of environments) {
    const agent = createTemplatedAgent(env, service);

    console.log(`\n💬 Question: "${question}"`);
    const response = await agent.generate(question);
    console.log(`\n🤖 Response for ${env}:`);
    console.log(response.text);
    console.log('\n' + '─'.repeat(60));
  }
}

async function demonstratePromptMetrics() {
  console.log('\n\n📊 PROMPT METRICS: Performance and Safety Evaluation');
  console.log('==================================================');

  const question = "Should I deploy the payment service to production?";
  const versions: (keyof typeof DEPLOYMENT_PROMPTS)[] = ['v1', 'v2', 'v3'];

  console.log('Comparing prompt versions with metrics...\n');

  for (const version of versions) {
    const agent = createDeploymentAgent(version);
    const metrics = await PromptEvaluator.measurePerformance(agent, question);

    console.log(`📈 ${version.toUpperCase()} Metrics:`);
    console.log(`   Response Time: ${metrics.responseTime}ms`);
    console.log(`   Token Count: ${metrics.tokenCount}`);
    console.log(`   Safety Score: ${metrics.safetyScore.toFixed(1)}%`);
    console.log(`   ${'🟢'.repeat(Math.floor(metrics.safetyScore / 20))}${'⚪'.repeat(5 - Math.floor(metrics.safetyScore / 20))}`);
    console.log('');
  }
}

async function main() {
  console.log('\n🎯 Factor 2: Own Your Prompts');
  console.log('=============================');
  console.log('Demonstrating why explicit prompt ownership matters');
  console.log('vs framework abstractions that hide the actual prompts\n');

  // Show the anti-pattern first
  await demonstrateBlackBoxProblem();

  // Show the better approach
  await demonstrateExplicitPrompts();

  // Show how we can evolve prompts
  await demonstratePromptEvolution();

  // Show how we can test prompts
  await demonstrateTestingPrompts();

  // Show templated prompts
  await demonstrateTemplatedPrompts();

  // Show prompt metrics
  await demonstratePromptMetrics();

  console.log('\n\n🎉 Factor 2 Summary');
  console.log('==================');
  console.log('\n❌ Don\'t: Use frameworks that hide prompts behind abstractions');
  console.log('✅ Do: Write explicit prompts as version-controlled code');
  console.log('\n📚 Benefits of Owning Your Prompts:');
  console.log('1. Full visibility into what the LLM sees');
  console.log('2. Ability to debug unexpected behaviors');
  console.log('3. Systematic A/B testing of different versions');
  console.log('4. Version control and rollback capabilities');
  console.log('5. Team collaboration on prompt improvements');
  console.log('6. Build test suites for prompt quality');
  console.log('7. Dynamic prompt generation with templates');
  console.log('8. Performance and safety metrics');
  console.log('\n💡 Remember: Your prompts are the primary interface');
  console.log('   between your application logic and the LLM.');
  console.log('   Treat them as first-class code!\n');
}

main().catch(console.error);