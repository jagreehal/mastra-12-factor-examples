// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-6-launch-pause-resume.md

console.log('🎯 Factor 6: Launch/Pause/Resume with Simple APIs');
console.log('==================================================');
console.log('Demonstration: Simple launch/pause/resume workflow APIs');
console.log('Key principle: Workflows should be easily launched, paused, and resumed with minimal setup');
console.log('Reference: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-6-launch-pause-resume.md');
console.log('');

// 💾 STATE MANAGEMENT
// Simple in-memory state storage for demo purposes

interface WorkflowState {
  runId: string;
  status: 'running' | 'suspended' | 'completed' | 'failed';
  currentStep: string;
  stepData: Record<string, unknown>;
  inputData: unknown;
  suspendReason?: string;
  lastModified: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  needsSuspension: boolean;
  execute: (input: unknown) => Promise<{ output: unknown; suspend?: boolean; reason?: string }>;
}

interface ClarificationInput {
  numbers: number[];
  operation: string;
  needsClarification: boolean;
}

interface CalculationInput {
  finalNumbers: number[];
  finalOperation: string;
}

interface ApprovalInput {
  result: number;
  explanation: string;
  needsApproval: boolean;
}

const workflowStates = new Map<string, WorkflowState>();

function saveWorkflowState(state: WorkflowState) {
  state.lastModified = Date.now();
  workflowStates.set(state.runId, state);
  console.log(`💾 Workflow state saved: ${state.runId} (${state.status})`);
}

function loadWorkflowState(runId: string): WorkflowState | null {
  return workflowStates.get(runId) || null;
}

// ⚙️ WORKFLOW STEPS
// Simple steps that demonstrate suspension points

const steps: WorkflowStep[] = [
  {
    id: 'parse-request',
    name: 'Parse Request',
    needsSuspension: false,
    async execute(input: unknown) {
      const { userInput } = input as { userInput: string };
      console.log(`🔍 [Parse Request] Input: "${userInput}"`);

      // Simple parsing logic
      const text = userInput.toLowerCase();
      const numberMatches = text.match(/\d+/g);
      const numbers = numberMatches ? numberMatches.map(Number) : [];

      let operation = 'unknown';
      if (text.includes('add') || text.includes('+')) operation = 'add';
      else if (text.includes('multiply') || text.includes('*')) operation = 'multiply';
      else if (text.includes('divide') || text.includes('/')) operation = 'divide';
      else if (text.includes('subtract') || text.includes('-')) operation = 'subtract';

      const needsClarification = numbers.length < 2 || operation === 'unknown';

      console.log(`    Numbers: [${numbers.join(', ')}], Operation: ${operation}`);
      console.log(`    Needs clarification: ${needsClarification}`);

      return {
        output: { numbers, operation, needsClarification, originalInput: userInput },
        suspend: needsClarification,
        reason: needsClarification ? 'clarification_needed' : undefined
      };
    }
  },
  {
    id: 'clarification',
    name: 'Clarification',
    needsSuspension: true,
    async execute(input: unknown) {
      const { numbers, operation, needsClarification } = input as ClarificationInput;

      if (needsClarification) {
        console.log('\n🤔 [Clarification] Input unclear - suspension needed');
        console.log('⏸️  SUSPENDING workflow - waiting for clarification...');

        return {
          output: { suspended: true },
          suspend: true,
          reason: 'clarification_needed'
        };
      }

      console.log('✅ [Clarification] Input clear - proceeding');
      return {
        output: { finalNumbers: numbers, finalOperation: operation, clarificationProvided: false }
      };
    }
  },
  {
    id: 'calculation',
    name: 'Calculation',
    needsSuspension: false,
    async execute(input: unknown) {
      const { finalNumbers, finalOperation } = input as CalculationInput;
      const [a = 0, b = 0] = finalNumbers;

      let result: number;
      switch (finalOperation) {
        case 'add': { result = a + b; break;
        }
        case 'multiply': { result = a * b; break;
        }
        case 'divide': {
          if (b === 0) throw new Error('Cannot divide by zero');
          result = a / b;
          break;
        }
        case 'subtract': { result = a - b; break;
        }
        default: { throw new Error(`Unknown operation: ${finalOperation}`);
        }
      }

      const explanation = `${a} ${finalOperation} ${b} = ${result}`;
      const needsApproval = Math.abs(result) > 50;

      console.log(`🧮 [Calculation] ${explanation}`);
      console.log(`    Needs approval: ${needsApproval}`);

      return {
        output: { result, explanation, needsApproval },
        suspend: needsApproval,
        reason: needsApproval ? 'approval_needed' : undefined
      };
    }
  },
  {
    id: 'approval',
    name: 'Approval',
    needsSuspension: true,
    async execute(input: unknown) {
      const { result, explanation, needsApproval } = input as ApprovalInput;

      if (needsApproval) {
        console.log('\n⚠️  [Approval] Large result detected - suspension needed');
        console.log(`    Result: ${explanation}`);
        console.log('⏸️  SUSPENDING workflow - waiting for approval...');

        return {
          output: { suspended: true },
          suspend: true,
          reason: 'approval_needed'
        };
      }

      console.log('✅ [Approval] Result approved - completing workflow');
      return {
        output: { approved: true, finalResult: result, message: `Completed: ${explanation}` }
      };
    }
  }
];

// 🚀 SIMPLE LAUNCH API
async function launchWorkflow(input: string, runId: string): Promise<unknown> {
  console.log(`🚀 [Launch] Starting workflow: ${runId}`);
  console.log(`    Input: "${input}"`);

  // Initialize workflow state
  const workflowState: WorkflowState = {
    runId,
    status: 'running',
    currentStep: 'parse-request',
    stepData: {},
    inputData: { userInput: input },
    lastModified: Date.now()
  };
  saveWorkflowState(workflowState);

  let currentInput = workflowState.inputData;

  try {
    // Execute steps sequentially
    for (const step of steps) {
      workflowState.currentStep = step.id;

      const stepResult = await step.execute(currentInput);
      workflowState.stepData[step.id] = stepResult.output;

      if (stepResult.suspend) {
        // Suspend workflow
        workflowState.status = 'suspended';
        workflowState.suspendReason = stepResult.reason;
        saveWorkflowState(workflowState);

        console.log(`⏸️  [Launch] Workflow suspended: ${stepResult.reason}`);
        return { suspended: true, reason: stepResult.reason, runId, currentStep: step.id };
      }

      currentInput = stepResult.output;
    }

    // Workflow completed
    workflowState.status = 'completed';
    saveWorkflowState(workflowState);

    console.log('✅ [Launch] Workflow completed successfully');
    return { completed: true, result: currentInput };

  } catch (error) {
    workflowState.status = 'failed';
    saveWorkflowState(workflowState);
    throw error;
  }
}

// 🔄 SIMPLE RESUME API
async function resumeWorkflow(runId: string, resumeData: Record<string, unknown>): Promise<unknown> {
  console.log(`🔄 [Resume] Resuming workflow: ${runId}`);
  console.log(`    Resume data:`, JSON.stringify(resumeData, null, 2));

  const workflowState = loadWorkflowState(runId);
  if (!workflowState || workflowState.status !== 'suspended') {
    throw new Error(`No suspended workflow found for runId: ${runId}`);
  }

  // Update state to running
  workflowState.status = 'running';
  saveWorkflowState(workflowState);

  try {
    // Find the current step index
    const currentStepIndex = steps.findIndex(step => step.id === workflowState.currentStep);
    if (currentStepIndex === -1) {
      throw new Error(`Invalid step: ${workflowState.currentStep}`);
    }

    // Continue from the current step with resume data
    let currentInput: unknown = resumeData;

    // Execute remaining steps
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      if (!step) {
        throw new Error(`Step not found at index ${i}`);
      }

      workflowState.currentStep = step.id;

      const stepResult = await step.execute(currentInput);
      workflowState.stepData[step.id] = stepResult.output;

      if (stepResult.suspend) {
        // Suspend again
        workflowState.status = 'suspended';
        workflowState.suspendReason = stepResult.reason;
        saveWorkflowState(workflowState);

        console.log(`⏸️  [Resume] Workflow suspended again: ${stepResult.reason}`);
        return { suspended: true, reason: stepResult.reason, runId, currentStep: step.id };
      }

      currentInput = stepResult.output;
    }

    // Workflow completed
    workflowState.status = 'completed';
    saveWorkflowState(workflowState);

    console.log('✅ [Resume] Workflow resumed and completed successfully');
    return { completed: true, result: currentInput };

  } catch (error) {
    workflowState.status = 'failed';
    saveWorkflowState(workflowState);
    throw error;
  }
}

// 🎯 LAUNCH/PAUSE/RESUME DEMONSTRATIONS
interface LaunchResumeScenario {
  name: string;
  description: string;
  input: string;
  resumeData?: Record<string, unknown>;
}

const scenarios: LaunchResumeScenario[] = [
  {
    name: 'Simple Completion',
    description: 'Workflow completes without suspension',
    input: 'add 5 and 3'
  },
  {
    name: 'Clarification Needed',
    description: 'Workflow suspends for clarification, then resumes',
    input: 'do something with numbers',
    resumeData: {
      finalNumbers: [10, 20],
      finalOperation: 'add',
      clarificationProvided: true
    }
  },
  {
    name: 'Approval Required',
    description: 'Workflow suspends for approval, then resumes',
    input: 'multiply 25 by 30',
    resumeData: {
      result: 750,
      explanation: '25 multiply 30 = 750',
      needsApproval: false
    }
  }
];

// 🎭 SCENARIO DEMONSTRATIONS
async function demonstrateScenarios() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎭 Launch/Pause/Resume Scenarios');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`${'─'.repeat(50)}`);

    const runId = `demo-run-${index + 1}`;

    try {
      // 🚀 LAUNCH
      console.log(`\n1️⃣ LAUNCH phase:`);
      const launchResult = await launchWorkflow(scenario.input, runId);

      if (launchResult && typeof launchResult === 'object' && 'suspended' in launchResult) {
        const suspendedResult = launchResult as { suspended: boolean; reason?: string };
        console.log(`   ⏸️  Suspended: ${suspendedResult.reason || 'unknown'}`);

        // 🔄 RESUME
        if (scenario.resumeData) {
          console.log(`\n2️⃣ RESUME phase:`);
          const resumeResult = await resumeWorkflow(runId, scenario.resumeData);

          if (resumeResult && typeof resumeResult === 'object' && 'completed' in resumeResult) {
            console.log(`   ✅ Completed with result:`, JSON.stringify(resumeResult, null, 2));
          } else {
            console.log(`   ⏸️  Suspended again:`, JSON.stringify(resumeResult, null, 2));
          }
        }
      } else {
        console.log(`   ✅ Completed without suspension`);
        console.log(`   Result:`, JSON.stringify(launchResult, null, 2));
      }

      // Show final state
      const finalState = loadWorkflowState(runId);
      console.log(`\n📊 Final State: ${finalState?.status} (${finalState?.suspendReason || 'no suspension'})`);

    } catch (error) {
      console.error(`❌ Error in scenario ${scenario.name}:`, error instanceof Error ? error.message : error);
    }
  }
}

// 🔍 STATE INSPECTION DEMO
async function demonstrateStateInspection() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 Workflow State Inspection');
  console.log(`${'='.repeat(60)}`);

  console.log('\n📋 All workflow states:');
  for (const [runId, state] of workflowStates.entries()) {
    console.log(`   ${runId}: ${state.status} (${state.suspendReason || 'no suspension'})`);
    console.log(`      Current step: ${state.currentStep}`);
    console.log(`      Last modified: ${new Date(state.lastModified).toLocaleTimeString()}`);
  }

  console.log('\n🔄 Suspended workflows:');
  const suspendedWorkflows = [...workflowStates.values()].filter(s => s.status === 'suspended');
  if (suspendedWorkflows.length > 0) {
    for (const workflow of suspendedWorkflows) {
      console.log(`   ${workflow.runId}: ${workflow.suspendReason}`);
      console.log(`      Current step: ${workflow.currentStep}`);
    }
  } else {
    console.log('   No suspended workflows');
  }

  console.log('\n✅ Completed workflows:');
  const completedWorkflows = [...workflowStates.values()].filter(s => s.status === 'completed');
  for (const workflow of completedWorkflows) {
    console.log(`   ${workflow.runId}: completed successfully`);
  }
}

// 💡 BENEFITS DEMONSTRATION
async function demonstrateBenefits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💡 Factor 6 Benefits');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Simple APIs:');
  console.log('   🚀 launchWorkflow(input, runId) - start with minimal setup');
  console.log('   🔄 resumeWorkflow(runId, resumeData) - continue from suspension');
  console.log('   🔍 loadWorkflowState(runId) - inspect current state');

  console.log('\n✅ Intelligent Suspension:');
  console.log('   🤔 Business logic determines when to pause');
  console.log('   💾 State preserved during suspension');
  console.log('   🔄 Multiple suspension points supported');

  console.log('\n✅ Graceful Recovery:');
  console.log('   ⚡ Resume from failures without restarting');
  console.log('   🎯 Retry specific steps with corrected data');
  console.log('   🧠 Maintain context across pause/resume cycles');

  console.log('\n✅ Resource Management:');
  console.log('   ⏸️  Pause long-running workflows to free resources');
  console.log('   🕐 Handle workflows that exceed single execution timeframes');
  console.log('   💾 Efficient memory usage during suspension');

  console.log('\n🏗️ Use Cases:');
  console.log('   👥 Human-in-the-loop workflows');
  console.log('   ⚠️  Approval processes for sensitive operations');
  console.log('   🤔 Clarification requests for ambiguous inputs');
  console.log('   🔧 Long-running batch processes');
  console.log('   💾 Workflows that need to wait for external systems');
}

async function main() {
  console.log('\n✨ Factor 6 demonstrates simple launch/pause/resume workflow APIs');
  console.log('   - Workflows can be launched with minimal setup');
  console.log('   - Intelligent suspension at logical business points');
  console.log('   - Simple resume APIs to continue from suspension');
  console.log('   - State preservation across pause/resume cycles');
  console.log('   - Multiple suspension points supported\n');

  await demonstrateScenarios();
  await demonstrateStateInspection();
  await demonstrateBenefits();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 6 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Simple launch/pause/resume APIs');
  console.log('   ✅ Intelligent suspension at business logic points');
  console.log('   ✅ State preservation during suspension');
  console.log('   ✅ Multiple suspension points supported');
  console.log('   ✅ Graceful recovery from failures');
  console.log('   ✅ Efficient resource management');
}

main().catch(console.error);
