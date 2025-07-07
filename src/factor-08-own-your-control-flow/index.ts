// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

console.log('🎯 Factor 8: Own Your Control Flow');
console.log('==================================');

// 🏗️ EXPLICIT CONTROL FLOW
// Core concept: Developer owns and controls the execution flow

// 📋 EXPLICIT STEP DEFINITIONS
// Each step has clear inputs, outputs, and deterministic logic

const dataValidationStep = createStep({
  id: 'data-validation',
  inputSchema: z.object({
    userInput: z.string(),
    requestId: z.string().optional()
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    cleanedData: z.string(),
    validationErrors: z.array(z.string()),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  async execute({ inputData }) {
    const startTime = Date.now();

    console.log(`\n🔍 [Data Validation] Starting step...`);
    console.log(`   Input: "${inputData.userInput}"`);
    console.log(`   Request ID: ${inputData.requestId || 'none'}`);

    // Explicit validation logic - developer controls this
    const errors: string[] = [];
    let cleanedData = inputData.userInput.trim();

    if (cleanedData.length === 0) {
      errors.push('Input cannot be empty');
    }
    if (cleanedData.length > 500) {
      errors.push('Input too long (max 500 characters)');
      cleanedData = cleanedData.slice(0, 500);
    }

    const isValid = errors.length === 0;
    const processingTime = Date.now() - startTime;

    console.log(`   Validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.join(', ')}`);
    }
    console.log(`   Processing time: ${processingTime}ms`);

    return {
      isValid,
      cleanedData,
      validationErrors: errors,
      stepInfo: {
        stepName: 'data-validation',
        timestamp: new Date().toISOString(),
        processingTime
      }
    };
  },
});

const businessLogicStep = createStep({
  id: 'business-logic',
  inputSchema: z.object({
    isValid: z.boolean(),
    cleanedData: z.string(),
    validationErrors: z.array(z.string()),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  outputSchema: z.object({
    processedResult: z.string(),
    businessRules: z.array(z.string()),
    riskLevel: z.enum(['low', 'medium', 'high']),
    needsApproval: z.boolean(),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  async execute({ inputData }) {
    const startTime = Date.now();

    console.log(`\n⚙️  [Business Logic] Starting step...`);
    console.log(`   Data valid: ${inputData.isValid}`);
    console.log(`   Previous step: ${inputData.stepInfo.stepName} (${inputData.stepInfo.processingTime}ms)`);

    // Explicit business logic - developer controls this flow
    if (!inputData.isValid) {
      console.log(`   Skipping business logic due to validation errors`);

      return {
        processedResult: 'Processing skipped due to validation errors',
        businessRules: ['validation-required'],
        riskLevel: 'high' as const,
        needsApproval: true,
        stepInfo: {
          stepName: 'business-logic',
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      };
    }

    // Apply business rules based on content
    const businessRules: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let needsApproval = false;

    const lowerData = inputData.cleanedData.toLowerCase();

    if (lowerData.includes('delete') || lowerData.includes('remove')) {
      businessRules.push('deletion-protection');
      riskLevel = 'high';
      needsApproval = true;
    } else if (lowerData.includes('update') || lowerData.includes('modify')) {
      businessRules.push('modification-review');
      riskLevel = 'medium';
      needsApproval = false;
    } else {
      businessRules.push('standard-processing');
      riskLevel = 'low';
      needsApproval = false;
    }

    const processedResult = `Processed: ${inputData.cleanedData} (${businessRules.join(', ')})`;
    const processingTime = Date.now() - startTime;

    console.log(`   Applied rules: ${businessRules.join(', ')}`);
    console.log(`   Risk level: ${riskLevel}`);
    console.log(`   Needs approval: ${needsApproval}`);
    console.log(`   Processing time: ${processingTime}ms`);

    return {
      processedResult,
      businessRules,
      riskLevel,
      needsApproval,
      stepInfo: {
        stepName: 'business-logic',
        timestamp: new Date().toISOString(),
        processingTime
      }
    };
  },
});

const outputFormattingStep = createStep({
  id: 'output-formatting',
  inputSchema: z.object({
    processedResult: z.string(),
    businessRules: z.array(z.string()),
    riskLevel: z.enum(['low', 'medium', 'high']),
    needsApproval: z.boolean(),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  outputSchema: z.object({
    formattedOutput: z.string(),
    outputFormat: z.string(),
    metadata: z.object({
      processingChain: z.array(z.string()),
      totalProcessingTime: z.number(),
      riskAssessment: z.string()
    }),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  async execute({ inputData }) {
    const startTime = Date.now();

    console.log(`\n📝 [Output Formatting] Starting step...`);
    console.log(`   Previous step: ${inputData.stepInfo.stepName} (${inputData.stepInfo.processingTime}ms)`);
    console.log(`   Risk level: ${inputData.riskLevel}`);

    // Explicit output formatting - developer controls this
    const outputFormat = inputData.needsApproval ? 'approval-required' : 'standard';

    const formattedOutput = inputData.needsApproval ? `⚠️  APPROVAL REQUIRED
Result: ${inputData.processedResult}
Risk Level: ${inputData.riskLevel.toUpperCase()}
Applied Rules: ${inputData.businessRules.join(', ')}
Action: Manual approval needed before proceeding` : `✅ PROCESSING COMPLETE
Result: ${inputData.processedResult}
Risk Level: ${inputData.riskLevel.toUpperCase()}
Applied Rules: ${inputData.businessRules.join(', ')}
Action: Automatically approved`;

    const processingTime = Date.now() - startTime;
    const totalProcessingTime = inputData.stepInfo.processingTime + processingTime;

    console.log(`   Output format: ${outputFormat}`);
    console.log(`   Processing time: ${processingTime}ms`);
    console.log(`   Total pipeline time: ${totalProcessingTime}ms`);

    return {
      formattedOutput,
      outputFormat,
      metadata: {
        processingChain: ['data-validation', 'business-logic', 'output-formatting'],
        totalProcessingTime,
        riskAssessment: `${inputData.riskLevel} risk with ${inputData.businessRules.length} rules applied`
      },
      stepInfo: {
        stepName: 'output-formatting',
        timestamp: new Date().toISOString(),
        processingTime
      }
    };
  },
});

// 🔗 EXPLICIT WORKFLOW COMPOSITION
// Developer explicitly defines the execution flow

const standardWorkflow = createWorkflow({
  id: 'standard-control-flow',
  inputSchema: z.object({
    userInput: z.string(),
    requestId: z.string().optional()
  }),
  outputSchema: z.object({
    formattedOutput: z.string(),
    outputFormat: z.string(),
    metadata: z.object({
      processingChain: z.array(z.string()),
      totalProcessingTime: z.number(),
      riskAssessment: z.string()
    }),
    stepInfo: z.object({
      stepName: z.string(),
      timestamp: z.string(),
      processingTime: z.number()
    })
  }),
  steps: [dataValidationStep, businessLogicStep, outputFormattingStep]
})
  .then(dataValidationStep)    // Step 1: Developer controls this executes first
  .then(businessLogicStep)     // Step 2: Developer controls this executes second
  .then(outputFormattingStep)  // Step 3: Developer controls this executes third
  .commit();

// 🎭 CONTROL FLOW DEMONSTRATIONS
// Automated scenarios showing different control flow patterns

interface ControlFlowScenario {
  name: string;
  description: string;
  input: string;
  expectedFlow: string[];
  expectedRisk: 'low' | 'medium' | 'high';
}

const scenarios: ControlFlowScenario[] = [
  {
    name: 'Standard Processing',
    description: 'Normal flow with low-risk input',
    input: 'Create a new user account for John',
    expectedFlow: ['data-validation', 'business-logic', 'output-formatting'],
    expectedRisk: 'low'
  },
  {
    name: 'Validation Error',
    description: 'Flow handles invalid input explicitly',
    input: '', // Empty input will trigger validation error
    expectedFlow: ['data-validation', 'business-logic', 'output-formatting'],
    expectedRisk: 'high'
  },
  {
    name: 'Medium Risk Processing',
    description: 'Modification request with medium risk',
    input: 'Update user profile settings for existing account',
    expectedFlow: ['data-validation', 'business-logic', 'output-formatting'],
    expectedRisk: 'medium'
  },
  {
    name: 'High Risk Processing',
    description: 'Deletion request requiring approval',
    input: 'Delete all user accounts permanently',
    expectedFlow: ['data-validation', 'business-logic', 'output-formatting'],
    expectedRisk: 'high'
  }
];

// 🎯 CONTROLLED EXECUTION DEMONSTRATION
async function demonstrateControlFlow() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 Explicit Control Flow Demonstrations');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`🎯 Expected Flow: ${scenario.expectedFlow.join(' → ')}`);
    console.log(`⚠️  Expected Risk: ${scenario.expectedRisk}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n🚀 Executing workflow with input: "${scenario.input}"`);

    try {
      const run = standardWorkflow.createRun();
      const result = await run.start({
        inputData: {
          userInput: scenario.input,
          requestId: `demo-${index + 1}`
        }
      });

      if (result.status === 'success') {
        const finalStep = result.steps['output-formatting'];
        if (finalStep.status === 'success') {
          console.log(`\n✅ Workflow completed successfully!`);
          console.log(`\n📋 Final Output:`);
          console.log(finalStep.output.formattedOutput);

          console.log(`\n📊 Execution Metadata:`);
          console.log(`   Processing Chain: ${finalStep.output.metadata.processingChain.join(' → ')}`);
          console.log(`   Total Processing Time: ${finalStep.output.metadata.totalProcessingTime}ms`);
          console.log(`   Risk Assessment: ${finalStep.output.metadata.riskAssessment}`);

          // Verify expected flow
          const actualFlow = finalStep.output.metadata.processingChain;
          const flowMatches = JSON.stringify(actualFlow) === JSON.stringify(scenario.expectedFlow);
          console.log(`\n🎯 Flow Verification: ${flowMatches ? '✅ MATCHES' : '❌ DIFFERS'}`);

        } else {
          console.log(`❌ Final step failed: ${finalStep.status}`);
        }
      } else {
        console.log(`❌ Workflow failed: ${result.status}`);
      }

    } catch (error) {
      console.log(`❌ Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// 💡 CONTROL FLOW BENEFITS DEMONSTRATION
async function demonstrateBenefits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💡 Factor 8 Benefits: Owned Control Flow');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Explicit Step Definition:');
  console.log('   🔧 Each step has clear inputs and outputs');
  console.log('   📋 Deterministic logic controlled by developer');
  console.log('   🔍 Full visibility into step implementation');

  console.log('\n✅ Controlled Flow Composition:');
  console.log('   🔗 Developer explicitly defines step order');
  console.log('   ⚡ No hidden framework routing logic');
  console.log('   🎯 Predictable execution sequence');

  console.log('\n✅ Transparent Execution:');
  console.log('   📝 Each step logs its progress explicitly');
  console.log('   ⏱️  Processing times tracked at each step');
  console.log('   🔍 Full audit trail of execution path');

  console.log('\n✅ Deterministic Behavior:');
  console.log('   🎯 Same inputs always produce same flow');
  console.log('   🐛 Easy to debug and test individual steps');
  console.log('   🔄 Reliable and repeatable execution');

  console.log('\n🏗️ Control Flow Patterns:');
  console.log('   📊 Sequential processing (A → B → C)');
  console.log('   🔀 Conditional branching (if/else logic)');
  console.log('   ⚠️  Error handling (try/catch patterns)');
  console.log('   🔄 Loop control (iteration patterns)');

  console.log('\n🚫 Anti-Patterns Avoided:');
  console.log('   ❌ Framework-hidden control flow');
  console.log('   ❌ LLM-driven routing decisions');
  console.log('   ❌ Implicit step dependencies');
  console.log('   ❌ Black box execution paths');
}

// 🔍 FLOW TRANSPARENCY DEMONSTRATION
async function demonstrateTransparency() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 Flow Transparency and Debugging');
  console.log(`${'='.repeat(60)}`);

  console.log('\n📊 Workflow Architecture:');
  console.log('   Step 1: data-validation (input validation and cleaning)');
  console.log('   Step 2: business-logic (rule application and risk assessment)');
  console.log('   Step 3: output-formatting (final output generation)');

  console.log('\n🔗 Data Flow Between Steps:');
  console.log('   userInput → cleanedData → processedResult → formattedOutput');
  console.log('   stepInfo propagated through entire chain for full traceability');

  console.log('\n🎯 Developer Control Points:');
  console.log('   ✅ Validation rules (what constitutes valid input)');
  console.log('   ✅ Business logic (how to process different input types)');
  console.log('   ✅ Risk assessment (what requires approval)');
  console.log('   ✅ Output formatting (how results are presented)');
  console.log('   ✅ Error handling (how failures are managed)');

  console.log('\n🐛 Debugging Capabilities:');
  console.log('   🔍 Each step can be tested independently');
  console.log('   📝 Complete execution logs at each step');
  console.log('   ⏱️  Performance metrics for each step');
  console.log('   🎯 Clear error messages and failure points');
  console.log('   📊 Metadata tracking for complete audit trail');
}

async function main() {
  console.log('\n✨ Factor 8 demonstrates explicit developer-controlled execution flow');
  console.log('   - Each step is explicitly defined with clear inputs and outputs');
  console.log('   - Developer controls the exact sequence of operations');
  console.log('   - Transparent logging shows progress at each step');
  console.log('   - Deterministic execution with no hidden framework logic');
  console.log('   - Easy to debug, test, and modify control flow\n');

  await demonstrateControlFlow();
  await demonstrateBenefits();
  await demonstrateTransparency();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 8 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Explicit step definitions with clear inputs/outputs');
  console.log('   ✅ Developer-controlled flow composition');
  console.log('   ✅ Transparent execution with full logging');
  console.log('   ✅ Deterministic behavior and predictable flows');
  console.log('   ✅ Easy debugging and testing capabilities');
  console.log('   ✅ No hidden framework or LLM-driven routing');
}

main().catch(console.error);
