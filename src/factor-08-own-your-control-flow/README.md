# Factor 8: Own Your Control Flow

## Overview

This example demonstrates [**Factor 8: Own Your Control Flow** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md) from the 12-Factor Agents methodology.

Rather than relying on framework-hidden or LLM-driven control flow, developers explicitly control execution flow with clear, predictable sequences that can be debugged, tested, and modified.

## What Factor 8 Solves

Traditional agent frameworks often hide control flow decisions:
- **Framework-hidden routing** makes debugging impossible
- **LLM-driven decisions** create unpredictable execution paths
- **Implicit step dependencies** lead to fragile workflows
- **Black box execution** prevents meaningful testing and validation

Factor 8 puts control flow ownership back in developer hands, creating predictable, debuggable, and maintainable execution paths.

## Core Principle

```
Developer Controls Flow = Predictable Execution
(Explicit Steps → Transparent Logging → Deterministic Behavior)
```

## Implementation Architecture

### 🏗️ Explicit Step Definitions

Each step is explicitly defined with clear inputs, outputs, and deterministic logic:

#### Data Validation Step
```typescript
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
    console.log(`🔍 [Data Validation] Starting step...`);

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
    console.log(`   Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

    return {
      isValid,
      cleanedData,
      validationErrors: errors,
      stepInfo: { /* tracking metadata */ }
    };
  },
});
```

#### Business Logic Step
```typescript
const businessLogicStep = createStep({
  id: 'business-logic',
  // ... input/output schemas ...
  async execute({ inputData }) {
    console.log(`⚙️  [Business Logic] Starting step...`);

    // Explicit business logic - developer controls this flow
    if (!inputData.isValid) {
      return {
        processedResult: 'Processing skipped due to validation errors',
        businessRules: ['validation-required'],
        riskLevel: 'high' as const,
        needsApproval: true,
        stepInfo: { /* metadata */ }
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

    return {
      processedResult: `Processed: ${inputData.cleanedData} (${businessRules.join(', ')})`,
      businessRules,
      riskLevel,
      needsApproval,
      stepInfo: { /* metadata */ }
    };
  },
});
```

#### Output Formatting Step
```typescript
const outputFormattingStep = createStep({
  id: 'output-formatting',
  // ... schemas ...
  async execute({ inputData }) {
    console.log(`📝 [Output Formatting] Starting step...`);

    // Explicit output formatting - developer controls this
    const outputFormat = inputData.needsApproval ? 'approval-required' : 'standard';

    const formattedOutput = inputData.needsApproval ?
      `⚠️  APPROVAL REQUIRED
Result: ${inputData.processedResult}
Risk Level: ${inputData.riskLevel.toUpperCase()}
Applied Rules: ${inputData.businessRules.join(', ')}
Action: Manual approval needed before proceeding` :
      `✅ PROCESSING COMPLETE
Result: ${inputData.processedResult}
Risk Level: ${inputData.riskLevel.toUpperCase()}
Applied Rules: ${inputData.businessRules.join(', ')}
Action: Automatically approved`;

    return {
      formattedOutput,
      outputFormat,
      metadata: {
        processingChain: ['data-validation', 'business-logic', 'output-formatting'],
        totalProcessingTime: /* calculated */,
        riskAssessment: `${inputData.riskLevel} risk with ${inputData.businessRules.length} rules applied`
      },
      stepInfo: { /* metadata */ }
    };
  },
});
```

### 🔗 Explicit Workflow Composition

The developer explicitly defines the execution flow:

```typescript
const standardWorkflow = createWorkflow({
  id: 'standard-control-flow',
  inputSchema: z.object({
    userInput: z.string(),
    requestId: z.string().optional()
  }),
  outputSchema: z.object({ /* complete output schema */ }),
  steps: [dataValidationStep, businessLogicStep, outputFormattingStep]
})
  .then(dataValidationStep)    // Step 1: Developer controls this executes first
  .then(businessLogicStep)     // Step 2: Developer controls this executes second
  .then(outputFormattingStep)  // Step 3: Developer controls this executes third
  .commit();
```

## Actual Output Examples

### Scenario 1: Standard Processing

```
📍 Scenario 1: Standard Processing
📝 Normal flow with low-risk input
🎯 Expected Flow: data-validation → business-logic → output-formatting
⚠️  Expected Risk: low

🚀 Executing workflow with input: "Create a new user account for John"

🔍 [Data Validation] Starting step...
   Input: "Create a new user account for John"
   Request ID: demo-1
   Validation: PASSED
   Processing time: 1ms

⚙️  [Business Logic] Starting step...
   Data valid: true
   Previous step: data-validation (1ms)
   Applied rules: standard-processing
   Risk level: low
   Needs approval: false
   Processing time: 0ms

📝 [Output Formatting] Starting step...
   Previous step: business-logic (0ms)
   Risk level: low
   Output format: standard
   Processing time: 0ms
   Total pipeline time: 0ms

✅ Workflow completed successfully!

📋 Final Output:
✅ PROCESSING COMPLETE
Result: Processed: Create a new user account for John (standard-processing)
Risk Level: LOW
Applied Rules: standard-processing
Action: Automatically approved

📊 Execution Metadata:
   Processing Chain: data-validation → business-logic → output-formatting
   Total Processing Time: 0ms
   Risk Assessment: low risk with 1 rules applied

🎯 Flow Verification: ✅ MATCHES
```

Low-risk inputs flow through all steps smoothly with automatic approval.

### Scenario 2: Validation Error

```
📍 Scenario 2: Validation Error
📝 Flow handles invalid input explicitly
🎯 Expected Flow: data-validation → business-logic → output-formatting
⚠️  Expected Risk: high

🚀 Executing workflow with input: ""

🔍 [Data Validation] Starting step...
   Input: ""
   Request ID: demo-2
   Validation: FAILED
   Errors: Input cannot be empty
   Processing time: 0ms

⚙️  [Business Logic] Starting step...
   Data valid: false
   Previous step: data-validation (0ms)
   Skipping business logic due to validation errors

📝 [Output Formatting] Starting step...
   Previous step: business-logic (0ms)
   Risk level: high
   Output format: approval-required
   Processing time: 0ms
   Total pipeline time: 0ms

✅ Workflow completed successfully!

📋 Final Output:
⚠️  APPROVAL REQUIRED
Result: Processing skipped due to validation errors
Risk Level: HIGH
Applied Rules: validation-required
Action: Manual approval needed before proceeding

📊 Execution Metadata:
   Processing Chain: data-validation → business-logic → output-formatting
   Total Processing Time: 0ms
   Risk Assessment: high risk with 1 rules applied

🎯 Flow Verification: ✅ MATCHES
```

Invalid input is explicitly handled with clear error messaging and high-risk classification.

### Scenario 3: Medium Risk Processing

```
📍 Scenario 3: Medium Risk Processing
📝 Modification request with medium risk
🎯 Expected Flow: data-validation → business-logic → output-formatting
⚠️  Expected Risk: medium

🚀 Executing workflow with input: "Update user profile settings for existing account"

🔍 [Data Validation] Starting step...
   Input: "Update user profile settings for existing account"
   Request ID: demo-3
   Validation: PASSED
   Processing time: 0ms

⚙️  [Business Logic] Starting step...
   Data valid: true
   Previous step: data-validation (0ms)
   Applied rules: modification-review
   Risk level: medium
   Needs approval: false
   Processing time: 0ms

📝 [Output Formatting] Starting step...
   Previous step: business-logic (0ms)
   Risk level: medium
   Output format: standard
   Processing time: 0ms
   Total pipeline time: 0ms

✅ Workflow completed successfully!

📋 Final Output:
✅ PROCESSING COMPLETE
Result: Processed: Update user profile settings for existing account (modification-review)
Risk Level: MEDIUM
Applied Rules: modification-review
Action: Automatically approved

📊 Execution Metadata:
   Processing Chain: data-validation → business-logic → output-formatting
   Total Processing Time: 0ms
   Risk Assessment: medium risk with 1 rules applied

🎯 Flow Verification: ✅ MATCHES
```

Modification requests are classified as medium risk but proceed automatically with additional review rules.

### Scenario 4: High Risk Processing

```
📍 Scenario 4: High Risk Processing
📝 Deletion request requiring approval
🎯 Expected Flow: data-validation → business-logic → output-formatting
⚠️  Expected Risk: high

🚀 Executing workflow with input: "Delete all user accounts permanently"

🔍 [Data Validation] Starting step...
   Input: "Delete all user accounts permanently"
   Request ID: demo-4
   Validation: PASSED
   Processing time: 1ms

⚙️  [Business Logic] Starting step...
   Data valid: true
   Previous step: data-validation (1ms)
   Applied rules: deletion-protection
   Risk level: high
   Needs approval: true
   Processing time: 0ms

📝 [Output Formatting] Starting step...
   Previous step: business-logic (0ms)
   Risk level: high
   Output format: approval-required
   Processing time: 0ms
   Total pipeline time: 0ms

✅ Workflow completed successfully!

📋 Final Output:
⚠️  APPROVAL REQUIRED
Result: Processed: Delete all user accounts permanently (deletion-protection)
Risk Level: HIGH
Applied Rules: deletion-protection
Action: Manual approval needed before proceeding

📊 Execution Metadata:
   Processing Chain: data-validation → business-logic → output-formatting
   Total Processing Time: 0ms
   Risk Assessment: high risk with 1 rules applied

🎯 Flow Verification: ✅ MATCHES
```

High-risk deletion requests trigger protection rules and require manual approval.

## Workflow Architecture

### Step Sequence
1. **Data Validation** - Input validation and cleaning
2. **Business Logic** - Rule application and risk assessment
3. **Output Formatting** - Final output generation

### Data Flow Between Steps
```
userInput → cleanedData → processedResult → formattedOutput
stepInfo propagated through entire chain for full traceability
```

### Developer Control Points
- ✅ **Validation rules** (what constitutes valid input)
- ✅ **Business logic** (how to process different input types)
- ✅ **Risk assessment** (what requires approval)
- ✅ **Output formatting** (how results are presented)
- ✅ **Error handling** (how failures are managed)

## Key Benefits

### ✅ Explicit Step Definition
- **Clear inputs and outputs** for each step
- **Deterministic logic** controlled by developer
- **Full visibility** into step implementation

### ✅ Controlled Flow Composition
- **Developer explicitly defines** step order
- **No hidden framework** routing logic
- **Predictable execution** sequence

### ✅ Transparent Execution
- **Each step logs** its progress explicitly
- **Processing times tracked** at each step
- **Full audit trail** of execution path

### ✅ Deterministic Behavior
- **Same inputs** always produce same flow
- **Easy to debug** and test individual steps
- **Reliable and repeatable** execution

## Control Flow Patterns

### 📊 Sequential Processing
- **Linear execution** (A → B → C)
- **Data flows** between steps consistently
- **Each step** builds on previous results

### 🔀 Conditional Branching
- **Explicit if/else logic** in step implementations
- **Developer controls** all decision points
- **Clear business rules** determine flow paths

### ⚠️ Error Handling
- **Explicit try/catch** patterns in each step
- **Graceful degradation** with clear error states
- **Error propagation** through step chain

### 🔄 Loop Control
- **Iteration patterns** when needed
- **Developer-controlled** loop conditions
- **Explicit termination** criteria

## Debugging Capabilities

### 🔍 Individual Step Testing
- **Each step** can be tested independently
- **Mock inputs** easily provided to any step
- **Step isolation** for focused debugging

### 📝 Complete Execution Logs
- **Progress tracking** at each step
- **Input/output logging** for full visibility
- **Timing information** for performance analysis

### 🎯 Clear Error Messages
- **Specific failure points** identified
- **Contextual error information** provided
- **Actionable debugging** guidance

### 📊 Metadata Tracking
- **Complete audit trail** for compliance
- **Performance metrics** for optimisation
- **Business rule tracking** for analysis

## Anti-Patterns Avoided

- ❌ **Framework-Hidden Control Flow** - No magic routing behind the scenes
- ❌ **LLM-Driven Routing Decisions** - No unpredictable AI-based flow control
- ❌ **Implicit Step Dependencies** - No hidden coupling between steps
- ❌ **Black Box Execution Paths** - No mysterious framework behaviour
- ❌ **Hardcoded Business Logic** - No inflexible processing patterns

## Production Benefits

### Operational Predictability
- **Deterministic execution** enables reliable monitoring
- **Clear failure modes** simplify incident response
- **Performance characteristics** are measurable and optimisable

### Developer Experience
- **Explicit control** over all execution decisions
- **Easy debugging** through transparent step execution
- **Simple testing** with isolated step validation

### Business Process Integration
- **Business rules** explicitly coded in steps
- **Risk assessment** clearly defined and auditable
- **Approval workflows** transparently implemented

## Usage

Run the example to see explicit control flow in action:

```bash
pnpm factor08
```

## Key Takeaways

- ✅ **Explicit step definitions** with clear inputs/outputs
- ✅ **Developer-controlled flow** composition
- ✅ **Transparent execution** with full logging
- ✅ **Deterministic behaviour** and predictable flows
- ✅ **Easy debugging** and testing capabilities
- ✅ **No hidden framework** or LLM-driven routing

Factor 8 transforms agent workflows from mysterious black boxes into transparent, controlled processes where developers own every aspect of execution flow, enabling reliable, debuggable, and maintainable agent systems.
