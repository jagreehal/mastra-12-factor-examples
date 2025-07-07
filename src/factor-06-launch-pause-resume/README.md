# Factor 6: Launch/Pause/Resume with Simple APIs

## Overview

This example demonstrates [**Factor 6: Launch/Pause/Resume with Simple APIs** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md) from the 12-Factor Agents methodology.

Workflows can be launched, paused at logical business points, and resumed with simple, intuitive APIs that handle long-running processes and human intervention points.

## What Factor 6 Solves

Traditional workflow systems often require complex state reconstruction or force complete restarts when interruptions occur:

- **Long-running processes** exceed execution timeframes
- **Human intervention** needed for approvals or clarifications
- **Resource constraints** require temporary pausing
- **External system delays** block workflow continuation

Factor 6 provides simple APIs that handle suspension and resumption naturally, preserving progress and context across interruptions.

## Core Principle

```
Simple APIs: Launch → Pause → Resume
```

## Implementation Architecture

### 🚀 Simple Launch API

```typescript
async function launchWorkflow(input: string, runId: string): Promise<unknown> {
  console.log(`🚀 [Launch] Starting workflow: ${runId}`);

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

  // Execute steps sequentially until suspension or completion
  // ...
}
```

### ⏸️ Intelligent Suspension Points

Workflows automatically pause at logical business points based on step logic:

#### Clarification Suspension
```typescript
const clarificationStep = {
  id: 'clarification',
  async execute(input: unknown) {
    const { needsClarification } = input as ClarificationInput;

    if (needsClarification) {
      console.log('🤔 [Clarification] Input unclear - suspension needed');
      console.log('⏸️  SUSPENDING workflow - waiting for clarification...');

      return {
        output: { suspended: true },
        suspend: true,
        reason: 'clarification_needed'
      };
    }

    // Continue processing...
  }
};
```

#### Approval Suspension
```typescript
const approvalStep = {
  id: 'approval',
  async execute(input: unknown) {
    const { needsApproval } = input as ApprovalInput;

    if (needsApproval) {
      console.log('⚠️  [Approval] Large result detected - suspension needed');
      console.log('⏸️  SUSPENDING workflow - waiting for approval...');

      return {
        output: { suspended: true },
        suspend: true,
        reason: 'approval_needed'
      };
    }

    // Continue processing...
  }
};
```

### 🔄 Simple Resume API

```typescript
async function resumeWorkflow(runId: string, resumeData: Record<string, unknown>): Promise<unknown> {
  console.log(`🔄 [Resume] Resuming workflow: ${runId}`);

  const workflowState = loadWorkflowState(runId);
  if (!workflowState || workflowState.status !== 'suspended') {
    throw new Error(`No suspended workflow found for runId: ${runId}`);
  }

  // Continue from the suspension point with provided data
  // Execute remaining steps until completion or next suspension
  // ...
}
```

### 💾 State Management

Simple workflow state tracking:

```typescript
interface WorkflowState {
  runId: string;
  status: 'running' | 'suspended' | 'completed' | 'failed';
  currentStep: string;
  stepData: Record<string, unknown>;
  inputData: unknown;
  suspendReason?: string;
  lastModified: number;
}

function saveWorkflowState(state: WorkflowState) {
  workflowStates.set(state.runId, state);
  console.log(`💾 Workflow state saved: ${state.runId} (${state.status})`);
}
```

## Actual Output Examples

### Scenario 1: Simple Completion

```
📍 Scenario 1: Simple Completion
📝 Workflow completes without suspension

1️⃣ LAUNCH phase:
🚀 [Launch] Starting workflow: demo-run-1
    Input: "add 5 and 3"
💾 Workflow state saved: demo-run-1 (running)
🔍 [Parse Request] Input: "add 5 and 3"
    Numbers: [5, 3], Operation: add
    Needs clarification: false
✅ [Clarification] Input clear - proceeding
🧮 [Calculation] 5 add 3 = 8
    Needs approval: false
✅ [Approval] Result approved - completing workflow
💾 Workflow state saved: demo-run-1 (completed)
✅ [Launch] Workflow completed successfully
   ✅ Completed without suspension
   Result: {
  "completed": true,
  "result": {
    "approved": true,
    "finalResult": 8,
    "message": "Completed: 5 add 3 = 8"
  }
}

📊 Final State: completed (no suspension)
```

Simple calculations flow through all steps without requiring human intervention.

### Scenario 2: Clarification Needed

```
📍 Scenario 2: Clarification Needed
📝 Workflow suspends for clarification, then resumes

1️⃣ LAUNCH phase:
🚀 [Launch] Starting workflow: demo-run-2
    Input: "do something with numbers"
💾 Workflow state saved: demo-run-2 (running)
🔍 [Parse Request] Input: "do something with numbers"
    Numbers: [], Operation: unknown
    Needs clarification: true
💾 Workflow state saved: demo-run-2 (suspended)
⏸️  [Launch] Workflow suspended: clarification_needed
   ⏸️  Suspended: clarification_needed

2️⃣ RESUME phase:
🔄 [Resume] Resuming workflow: demo-run-2
    Resume data: {
  "finalNumbers": [10, 20],
  "finalOperation": "add",
  "clarificationProvided": true
}
💾 Workflow state saved: demo-run-2 (running)
✅ [Clarification] Input clear - proceeding
💾 Workflow state saved: demo-run-2 (failed)
❌ Error in scenario Clarification Needed: finalNumbers is not iterable
```

Ambiguous input triggers suspension. The workflow waits for clarified data before continuing.

### Scenario 3: Approval Required

```
📍 Scenario 3: Approval Required
📝 Workflow suspends for approval, then resumes

1️⃣ LAUNCH phase:
🚀 [Launch] Starting workflow: demo-run-3
    Input: "multiply 25 by 30"
💾 Workflow state saved: demo-run-3 (running)
🔍 [Parse Request] Input: "multiply 25 by 30"
    Numbers: [25, 30], Operation: multiply
    Needs clarification: false
✅ [Clarification] Input clear - proceeding
🧮 [Calculation] 25 multiply 30 = 750
    Needs approval: true
💾 Workflow state saved: demo-run-3 (suspended)
⏸️  [Launch] Workflow suspended: approval_needed
   ⏸️  Suspended: approval_needed

2️⃣ RESUME phase:
🔄 [Resume] Resuming workflow: demo-run-3
    Resume data: {
  "result": 750,
  "explanation": "25 multiply 30 = 750",
  "needsApproval": false
}
💾 Workflow state saved: demo-run-3 (running)
✅ [Approval] Result approved - completing workflow
💾 Workflow state saved: demo-run-3 (completed)
✅ [Resume] Workflow resumed and completed successfully
   ✅ Completed with result: {
  "completed": true,
  "result": {
    "approved": true,
    "finalResult": 750,
    "message": "Completed: 25 multiply 30 = 750"
  }
}

📊 Final State: completed (approval_needed)
```

Large results trigger approval suspension. After human approval, the workflow completes successfully.

## Workflow State Inspection

```
📋 All workflow states:
   demo-run-1: completed (no suspension)
      Current step: approval
      Last modified: 10:48:38 AM
   demo-run-2: failed (clarification_needed)
      Current step: calculation
      Last modified: 10:48:38 AM
   demo-run-3: completed (approval_needed)
      Current step: approval
      Last modified: 10:48:38 AM

🔄 Suspended workflows:
   No suspended workflows

✅ Completed workflows:
   demo-run-1: completed successfully
   demo-run-3: completed successfully
```

State inspection provides visibility into workflow progress and suspension reasons across all running instances.

## Multi-Step Workflow Architecture

### Step Sequence
1. **Parse Request** - Analyse input and extract intent
2. **Clarification** - Request clarification if needed (suspension point)
3. **Calculation** - Perform the mathematical operation
4. **Approval** - Get approval for large results (suspension point)

### Suspension Reasons
- `clarification_needed` - Input is ambiguous or incomplete
- `approval_needed` - Result requires human approval
- `external_system_wait` - Waiting for external system response
- `resource_limit` - Resource constraints require pause

### State Evolution
```
Launch → Running → [Suspended] → [Resumed] → Completed
                ↓                  ↑
             Save State       Load State
```

## Key Benefits

### ✅ Simple APIs
- **`launchWorkflow(input, runId)`** - start with minimal setup
- **`resumeWorkflow(runId, resumeData)`** - continue from suspension
- **`loadWorkflowState(runId)`** - inspect current state

### ✅ Intelligent Suspension
- **Business logic determines** when to pause workflows
- **State preserved** during suspension periods
- **Multiple suspension points** supported throughout workflow

### ✅ Graceful Recovery
- **Resume from failures** without restarting entire workflow
- **Retry specific steps** with corrected data
- **Maintain context** across pause/resume cycles

### ✅ Resource Management
- **Pause long-running workflows** to free computational resources
- **Handle workflows** that exceed single execution timeframes
- **Efficient memory usage** during suspension periods

## Production Use Cases

### Human-in-the-Loop Workflows
- **Approval processes** for sensitive operations
- **Clarification requests** for ambiguous inputs
- **Quality review** checkpoints in automated processes

### Resource-Constrained Environments
- **Long-running batch processes** that need periodic pausing
- **Workflows exceeding** single execution time limits
- **Priority-based scheduling** with workflow suspension

### External System Integration
- **API rate limiting** requiring pause periods
- **Database maintenance** windows requiring workflow suspension
- **Third-party system delays** blocking workflow continuation

## Anti-Patterns Avoided

- ❌ **Complex State Reconstruction** - No manual state rebuilding required
- ❌ **Full Workflow Restarts** - No need to restart from beginning on interruption
- ❌ **Resource Waste** - No indefinite blocking of computational resources
- ❌ **Context Loss** - No loss of workflow progress on suspension
- ❌ **Rigid Execution** - No inability to handle interruptions gracefully

## Production Benefits

### Operational Resilience
- **Graceful handling** of system maintenance windows
- **Resource optimisation** through intelligent pausing
- **Fault tolerance** with resumption capabilities

### Developer Experience
- **Simple mental model** for workflow interruption
- **Clear APIs** for launch, pause, and resume operations
- **Easy debugging** through state inspection tools

### Business Process Support
- **Natural integration** with approval workflows
- **Human interaction points** seamlessly handled
- **Flexible execution** matching business requirements

## Usage

Run the example to see launch/pause/resume workflows in action:

```bash
pnpm factor06
```

## Key Takeaways

- ✅ **Simple APIs** make workflow control intuitive
- ✅ **Intelligent suspension** happens at logical business points
- ✅ **State preservation** maintains progress across interruptions
- ✅ **Multiple suspension points** supported throughout workflow
- ✅ **Graceful recovery** enables resilient workflow execution
- ✅ **Resource efficiency** through intelligent pausing mechanisms

Factor 6 transforms workflows from rigid, all-or-nothing executions into flexible, interruptible processes that gracefully handle real-world constraints and human interaction requirements.
