# Factor 10: Small, Focused Agents

## Overview

This example demonstrates [**Factor 1 0: Small, Focused Agents** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md) from the 12-Factor Agents methodology.

This principle advocates for creating small, specialised agents that excel at specific tasks rather than building monolithic agents that attempt to handle everything. Each agent should have a single, well-defined responsibility and work together with other agents to accomplish larger goals through composition.

## What Factor 10 Means

Factor 10 advocates for creating small, specialised agents that excel at specific tasks rather than building monolithic agents that attempt to handle everything. Each agent should have a single, well-defined responsibility and work together with other agents to accomplish larger goals through composition.

## Why Factor 10 Matters

**Production Benefits:**
- **Maintainability**: Small agents are easier to understand, debug, and modify
- **Testability**: Individual agents can be tested in isolation with focused test cases
- **Reusability**: Specialised agents can be reused across different workflows
- **Scalability**: Different agents can be scaled independently based on demand
- **Error Isolation**: Issues can be traced to specific agents, simplifying debugging

## How This Example Fulfils Factor 10

### 🎯 Four Specialised Agents

```typescript
// Agent focused solely on analysis and problem breakdown
const analysisAgent = new Agent({
  name: 'AnalysisAgent',
  instructions: 'Analyze problems and break them down into key elements and components.',
  model,
});

// Agent focused solely on planning and strategy
const planningAgent = new Agent({
  name: 'PlanningAgent',
  instructions: 'Create detailed plans with clear steps, dependencies, and expected outcomes.',
  model,
});

// Agent focused solely on execution and implementation
const executionAgent = new Agent({
  name: 'ExecutionAgent',
  instructions: 'Execute plans by taking concrete steps and reporting progress status.',
  model,
});

// Agent focused solely on review and quality assessment
const reviewAgent = new Agent({
  name: 'ReviewAgent',
  instructions: 'Review completed work and provide quality feedback and improvement suggestions.',
  model,
});
```

### 🔗 Flexible Agent Composition

The example demonstrates four different composition patterns:

```typescript
// Complete pipeline: All four agents
async function runCompleteChain(input: string) {
  const analysis = await analysisAgent.generate(input);
  const plan = await planningAgent.generate(analysis.text);
  const execution = await executionAgent.generate(plan.text);
  const review = await reviewAgent.generate(execution.text);
  return review.text;
}

// Planning focus: Single agent
async function runPlanningOnly(input: string) {
  return await planningAgent.generate(input);
}

// Analysis + Review: Two-agent chain
async function runAnalysisReview(input: string) {
  const analysis = await analysisAgent.generate(input);
  const review = await reviewAgent.generate(analysis.text);
  return review.text;
}

// Execution + Review: Two-agent chain
async function runExecutionReview(input: string) {
  const execution = await executionAgent.generate(input);
  const review = await reviewAgent.generate(execution.text);
  return review.text;
}
```

## Actual Output Examples

### Complete Pipeline (4 Agents)

**Input:** "Create a simple budget tracking system"

**AnalysisAgent Output:**
```
1. Key elements identified:
   - Income sources
   - Expense categories
   - Budget limits
   - Transaction recording
   - Spending tracking
   - Budget reporting

2. Problem breakdown:
   - Identify and categorize income sources
   - Identify and categorize expense categories
   - Set budget limits for each expense category
   - Record and categorize transactions
   - Track spending against budget limits
   - Generate reports to analyze spending habits and budget adherence
```

**PlanningAgent Output:**
```
**Plan: Budget Tracking System Implementation**

**Steps:**
1. **Design Database Schema**
   - Create tables for Income Sources, Expense Categories, Transactions, and Budget Limits
2. **Develop User Interface (UI) for Data Input**
   - Create forms for users to input and categorize income sources and expense categories
3. **Implement Budget Limit Setting Functionality**
   - Design a UI for users to set and adjust budget limits for each expense category
4. **Build Spending Tracking System**
   - Develop a system to automatically track and categorize transactions
5. **Develop Reporting Module**
   - Design and implement reports to analyze spending habits and budget adherence

**Dependencies:**
- Steps 2, 3, and 4 are dependent on the completion of Step 1
- Step 5 is dependent on the completion of Steps 2, 3, and 4
```

**ExecutionAgent Output:**
```
1. **Execution Steps Taken:**
   - Initiated the design of the database schema
   - Created tables for Income Sources, Expense Categories, Transactions, and Budget Limits
   - Defined relationships between tables

2. **Progress Status:**
   - Database schema design is 100% complete

3. **Next Actions:**
   - Proceed with developing the user interface (UI) for data input
   - Create forms for users to input and categorize income sources and expense categories
```

**ReviewAgent Output:**
```
1. **Quality Assessment:**
   The work done on the database schema design is thorough and well-structured.

2. **Specific Feedback:**
   - The selection of tables is appropriate and covers the essential aspects
   - The defined relationships between tables are logical and will facilitate efficient data management
   - The progress status is clearly communicated

3. **Improvement Suggestions:**
   - **Documentation:** Ensure that the database schema is well-documented
   - **Normalization:** Review the schema to ensure it is fully normalized to at least 3NF
   - **Indexing:** Consider adding indexes to frequently queried columns
   - **Validation:** Implement data validation rules at the database level
```

### Agent Specialisation Demonstration

Each agent approaches the same topic ("Technical debt in our codebase") differently:

**Analysis perspective:**
```
1. Key elements identified:
   - Accumulated outdated code
   - Short-term fixes
   - Lack of documentation
   - Inefficient architecture
   - Outdated dependencies
```

**Planning perspective:**
```
**Plan to Address Technical Debt in Our Codebase**

1. **Identify and Document Technical Debt**
   - Conduct a thorough code review to identify areas with technical debt
   - Categorize debt by severity and impact

2. **Prioritize Debt Reduction**
   - Create a prioritized backlog based on business impact and technical risk
```

**Review perspective:**
```
1. **Quality Assessment:** The mention of "technical debt" suggests that the codebase has areas that need improvement, which is a good sign that the team is aware of potential issues.

2. **Improvement Suggestions:**
   - Consider implementing automated code quality tools
   - Establish coding standards and review processes
```

### Focused vs Unfocused Comparison

**❌ Unfocused Agent Response:**
The example shows a monolithic agent trying to handle "Improve our customer support process" with a overwhelming 10-step response covering everything from performance assessment to AI implementation.

**✅ Focused Agents Working Together:**
- **AnalysisAgent**: Identifies key elements (response time, resolution effectiveness, customer satisfaction, support channels)
- **PlanningAgent**: Creates a structured 7-step plan with clear dependencies and expected outcomes
- **Result**: More focused, actionable output with clear ownership

## Key Implementation Benefits

### 🧩 Single Responsibility Principle

```typescript
// Each agent has one clear purpose
const analysisAgent = new Agent({
  name: 'AnalysisAgent',
  instructions: 'Analyze problems and break them down into key elements.',
  model,
});
```

- **Clear boundaries**: No ambiguity about what each agent should do
- **Focused instructions**: Simple, unambiguous instructions for each agent
- **Predictable behaviour**: Each agent consistently performs its specific function

### 🔧 Modular Composition

```typescript
// Agents can be combined in different ways based on needs
const workflows = {
  analysis: () => analysisAgent.generate(input),
  planning: () => planningAgent.generate(input),
  complete: async () => {
    const analysis = await analysisAgent.generate(input);
    const plan = await planningAgent.generate(analysis.text);
    return plan.text;
  }
};
```

- **Flexible workflows**: Combine agents as needed for different scenarios
- **Reusable components**: Agents can be used across multiple workflows
- **Easy debugging**: Issues can be isolated to specific agents

### 🎯 Specialised Expertise

Each agent develops expertise in its domain:

- **AnalysisAgent**: Excellent at breaking down problems into components
- **PlanningAgent**: Creates detailed, structured plans with dependencies
- **ExecutionAgent**: Focuses on concrete implementation steps
- **ReviewAgent**: Provides thorough quality assessment and feedback

## Agent Design Patterns

### Analysis → Planning → Execution → Review

```typescript
const fourStageWorkflow = async (input: string) => {
  const analysis = await analysisAgent.generate(input);
  const plan = await planningAgent.generate(analysis.text);
  const execution = await executionAgent.generate(plan.text);
  const review = await reviewAgent.generate(execution.text);
  return {
    analysis: analysis.text,
    plan: plan.text,
    execution: execution.text,
    review: review.text
  };
};
```

### Conditional Agent Selection

```typescript
const routeToAppropriateAgent = async (input: string, workflowType: string) => {
  switch (workflowType) {
    case 'analysis-only':
      return await analysisAgent.generate(input);
    case 'planning-focus':
      return await planningAgent.generate(input);
    case 'execution-review':
      const execution = await executionAgent.generate(input);
      return await reviewAgent.generate(execution.text);
    default:
      return await runCompleteChain(input);
  }
};
```

### Parallel Agent Processing

```typescript
// Multiple agents can provide different perspectives on the same input
const multiPerspectiveAnalysis = async (input: string) => {
  const [analysis, planning, review] = await Promise.all([
    analysisAgent.generate(input),
    planningAgent.generate(input),
    reviewAgent.generate(input)
  ]);

  return {
    analyticalView: analysis.text,
    planningView: planning.text,
    reviewView: review.text
  };
};
```

## Anti-Patterns Avoided

❌ **Monolithic Agents**: No single agent trying to handle analysis, planning, execution, and review

❌ **Complex Instructions**: No overly detailed or conflicting instructions within a single agent

❌ **Unclear Boundaries**: No ambiguity about which agent handles what responsibility

❌ **Tool Overloading**: No agents loaded with unnecessary tools for their specific purpose

## Architecture Benefits

### 🔍 Debugging and Monitoring

```typescript
// Easy to trace issues to specific agents
const debugWorkflow = async (input: string) => {
  try {
    console.log('Starting analysis...');
    const analysis = await analysisAgent.generate(input);

    console.log('Starting planning...');
    const plan = await planningAgent.generate(analysis.text);

    console.log('Starting execution...');
    const execution = await executionAgent.generate(plan.text);

    return execution.text;
  } catch (error) {
    console.error('Workflow failed at specific agent:', error);
  }
};
```

### 🧪 Independent Testing

```typescript
// Test each agent in isolation
describe('AnalysisAgent', () => {
  it('should break down complex problems into key elements', async () => {
    const result = await analysisAgent.generate('Complex problem description');
    expect(result.text).toContain('Key elements identified:');
  });
});

describe('PlanningAgent', () => {
  it('should create structured plans with dependencies', async () => {
    const result = await planningAgent.generate('Analysis output');
    expect(result.text).toContain('Dependencies:');
  });
});
```

### ⚡ Performance Optimisation

```typescript
// Scale different agents based on demand
const scaleAgents = {
  analysis: new Array(3).fill(null).map(() => new Agent({
    name: 'AnalysisAgent',
    instructions: 'Analyze problems and break them down.',
    model,
  })),
  planning: new Array(2).fill(null).map(() => new Agent({
    name: 'PlanningAgent',
    instructions: 'Create detailed plans.',
    model,
  })),
};
```

## Related Factors

This example connects to other 12-factor principles:

- **Factor 1** (Natural Language to Tool Calls): Each agent uses tools appropriately for its specific purpose
- **Factor 2** (Own Your Prompts): Focused, version-controlled instructions for each agent
- **Factor 4** (Tools are Structured Outputs): Agents produce predictable outputs for downstream processing
- **Factor 8** (Own Your Control Flow): Clear, explicit control flow between specialised agents

## Usage

Run this example to see focused agents in action:

```bash
pnpm factor10
```

The example demonstrates:
1. **Complete Pipeline**: All four agents working together on a budget tracking system
2. **Planning Focus**: Single agent organizing a team meeting
3. **Analysis + Review**: Two agents evaluating remote work pros/cons
4. **Execution + Review**: Two agents implementing a standup meeting format
5. **Agent Specialisation**: Different perspectives on the same topics
6. **Focused vs Unfocused**: Comparison showing the benefits of specialised agents

This implementation demonstrates how Mastra enables the creation of focused, specialised agents that work together effectively, avoiding the complexity and maintainability issues of monolithic agent designs.
