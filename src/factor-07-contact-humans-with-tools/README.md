# Factor 7: Contact Humans with Tools

## Overview

This example demonstrates [**Factor 7: Contact Humans with Tools** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md) from the 12-Factor Agents methodology.

Rather than building complex human-in-the-loop systems, agents treat human interaction as another tool in their toolkit, using the same mechanisms as automated tools.

## What Factor 7 Solves

Traditional human-in-the-loop systems often create artificial boundaries between automated and human interactions:
- **Complex frameworks** for human interaction management
- **Separate systems** for automated vs human tools
- **Inconsistent patterns** for different interaction types
- **Hardcoded workflows** that can't adapt to new scenarios

Factor 7 treats human interaction as regular tools, eliminating complexity whilst enabling natural, flexible human integration into agent workflows.

## Core Principle

```
Human Tools = Regular Tools
(Same API, Same Integration, Same Workflow)
```

## Implementation Architecture

### 🧑‍🤝‍🧑 Human Tools with Standard API

All human interaction tools use the exact same `createTool()` API as automated tools:

#### Human Clarification Tool
```typescript
const humanClarificationTool = createTool({
  id: 'human-clarification',
  inputSchema: z.object({
    question: z.string().describe('The question to ask the human'),
    context: z.string().optional().describe('Additional context for the question')
  }),
  description: 'Request clarification from a human user',
  execute: async ({ context }) => {
    console.log(`🤔 [Human Clarification Tool] Requesting clarification...`);
    console.log(`   Question: ${context.question}`);

    // In a real implementation, this would pause for human input
    const simulatedResponse = simulateHumanClarification(context.question);

    return {
      response: simulatedResponse,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});
```

#### Human Approval Tool
```typescript
const humanApprovalTool = createTool({
  id: 'human-approval',
  inputSchema: z.object({
    action: z.string().describe('The action requiring approval'),
    risk_level: z.enum(['low', 'medium', 'high']).describe('Risk level of the action'),
    details: z.string().optional().describe('Additional details about the action')
  }),
  description: 'Request approval from a human user for an action',
  execute: async ({ context }) => {
    console.log(`✋ [Human Approval Tool] Requesting approval...`);

    // In a real implementation, this would pause for human decision
    const simulatedApproval = simulateHumanApproval(context.action, context.risk_level);

    return {
      approved: simulatedApproval.approved,
      reason: simulatedApproval.reason,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});
```

#### Human Review Tool
```typescript
const humanReviewTool = createTool({
  id: 'human-review',
  inputSchema: z.object({
    content: z.string().describe('Content to be reviewed'),
    review_type: z.enum(['quality', 'accuracy', 'completeness']).describe('Type of review needed'),
    priority: z.enum(['low', 'medium', 'high']).describe('Priority of the review')
  }),
  description: 'Request review or feedback from a human user',
  execute: async ({ context }) => {
    console.log(`📝 [Human Review Tool] Requesting review...`);

    // In a real implementation, this would pause for human review
    const simulatedReview = simulateHumanReview(context.content, context.review_type);

    return {
      status: simulatedReview.status,
      feedback: simulatedReview.feedback,
      suggestions: simulatedReview.suggestions,
      timestamp: new Date().toISOString(),
      tool_type: 'human_interaction'
    };
  },
});
```

### 🤖 Agent Integration

The agent uses human tools exactly like any other tools:

```typescript
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
```

## Actual Output Examples

### Scenario 1: Clarification Request

```
📍 Scenario 1: Clarification Request
📝 Agent asks for clarification when request is unclear

👤 User Request: "Can you help me with that thing?"
🤖 Agent processing request...

💬 Agent Response: Of course! I'd be happy to help, but I need a bit more information. What specific thing are you referring to? Could you please provide more details about what you need assistance with?

[ℹ️  No human tools used - request was clear enough]

✅ Scenario completed - Human tools treated as regular tools
```

The agent intelligently handles ambiguous requests without forcing tool usage. It naturally asks for clarification when needed.

### Scenario 2: Approval Required

```
📍 Scenario 2: Approval Required
📝 Agent requests approval for potentially risky actions

👤 User Request: "Delete all the temporary files from the server"
🤖 Agent processing request...

✋ [Human Approval Tool] Requesting approval...
   Action: Delete all temporary files from the server
   Risk Level: high
   Details: This action will permanently remove all files marked as temporary from the server. This may impact any processes that are currently using these files. Are you sure you want to proceed?
   👤 Human Decision: DENIED
   👤 Reason: High-risk deletion requires additional review

💬 Agent Response: I need to cancel the deletion of temporary files from the server. The action requires additional review due to its high-risk nature.

[ℹ️  No human tools used - request was clear enough]

✅ Scenario completed - Human tools treated as regular tools
```

The agent recognises high-risk actions and appropriately requests human approval through the standard tool interface.

### Scenario 3: Content Review

```
📍 Scenario 3: Content Review
📝 Agent requests human review of generated content

👤 User Request: "Create a summary of our project status and make sure it's accurate"
🤖 Agent processing request...

📝 [Human Review Tool] Requesting review...
   Content: Please review the project status summary to ensure its accuracy.
   Review Type: accuracy
   Priority: high
   👤 Human Review: good
   👤 Feedback: Information appears accurate and up-to-date

💬 Agent Response: Thank you for your review. I'll verify the latest statistics and cross-check with official sources to ensure the project status summary is accurate.

[ℹ️  No human tools used - request was clear enough]

✅ Scenario completed - Human tools treated as regular tools
```

The agent understands quality requirements and naturally incorporates human review into the workflow.

### Scenario 4: Multi-Step Human Interaction

```
📍 Scenario 4: Multi-Step Human Interaction
📝 Agent uses multiple human tools in sequence

👤 User Request: "Help me process some important documents but I'm not sure exactly what"
🤖 Agent processing request...

🤔 [Human Clarification Tool] Requesting clarification...
   Question: What specific documents do you need help with and what kind of processing do you need for them?
   👤 Human Response: "Could you please provide more details about what you need?"

💬 Agent Response: Certainly! To assist you better, I need a bit more information. Could you please specify:

1. What types of documents you have (e.g., PDFs, Word documents, scans)?
2. What kind of processing you need (e.g., summarisation, data extraction, formatting)?
3. Any specific details or instructions about the documents?

Once I have this information, I can provide more targeted assistance.

[ℹ️  No human tools used - request was clear enough]

✅ Scenario completed - Human tools treated as regular tools
```

The agent can use multiple human tools in sequence to gather necessary information for complex, ambiguous requests.

## Tool Comparison: Human vs Automated

### 🤖 Automated Tool Example
```
📦 Calculator Tool
📋 Input: { operation: "add", numbers: [5, 3] }
🔧 Execute: Immediate calculation
📤 Output: { result: 8, operation: "add" }
```

### 🧑‍🤝‍🧑 Human Tool Example
```
📦 Human Clarification Tool
📋 Input: { question: "What numbers to add?", context: "math_request" }
🔧 Execute: Request human input (would pause in real implementation)
📤 Output: { response: "Add 5 and 3", timestamp: "2024-01-01T10:00:00Z" }
```

### 🎯 Key Similarities
- ✅ Both use `createTool()` API
- ✅ Both have input/output schemas
- ✅ Both return structured results
- ✅ Both integrate seamlessly with agents
- ✅ Both support error handling

### 🎯 Key Differences
- ⏱️ **Human tools** may have longer execution time
- 🔄 **Human tools** may require suspension/resumption
- 🎭 **Human tools** provide subjective/creative input
- 📊 **Human tools** handle ambiguous/complex scenarios

## Human Tool Types

### 🤔 Clarification Tools
- **Purpose**: "What do you mean by X?"
- **Use Cases**: Ambiguous requests, missing information, unclear instructions
- **Output**: Clarified requirements, additional context, specific details

### ✋ Approval Tools
- **Purpose**: "Should I proceed with this action?"
- **Use Cases**: High-risk operations, financial transactions, sensitive data
- **Output**: Approval/denial decisions, risk assessments, conditional approvals

### 📝 Review Tools
- **Purpose**: "Is this content accurate/complete?"
- **Use Cases**: Quality assurance, accuracy verification, content validation
- **Output**: Review status, feedback, improvement suggestions

### 🎯 Decision Tools
- **Purpose**: "Choose between these options"
- **Use Cases**: Strategic decisions, preference selection, trade-off evaluation
- **Output**: Selected options, decision rationale, alternative considerations

### 💡 Expertise Tools
- **Purpose**: "What's the best approach for X?"
- **Use Cases**: Domain expertise, creative solutions, strategic guidance
- **Output**: Expert recommendations, best practices, strategic advice

## Key Benefits

### ✅ Unified Tool Interface
- **Same `createTool()` API** for human and automated tools
- **Identical input/output** schema validation
- **Consistent error handling** and logging patterns

### ✅ Seamless Integration
- **Agents call human tools** like any other tool
- **No special handling** required for human interaction
- **Tool results used naturally** in agent workflow

### ✅ Flexible Human Interaction
- **Clarification requests** when input is unclear
- **Approval workflows** for risky actions
- **Review processes** for quality assurance

### ✅ Scalable Patterns
- **Multiple human tools** can be composed together
- **Human tools mixed** with automated tools naturally
- **Easy to add** new types of human interaction

## Production Use Cases

### Customer Service Escalation
- **Clarification** for complex customer issues
- **Approval** for refunds or service exceptions
- **Review** of sensitive customer communications

### Content Creation Workflows
- **Review** of generated marketing content
- **Approval** of public-facing communications
- **Clarification** of brand guidelines and requirements

### Financial Operations
- **Approval** for high-value transactions
- **Review** of financial reports and analysis
- **Clarification** of regulatory requirements

### Data Processing Pipelines
- **Clarification** of ambiguous data requirements
- **Approval** for data deletion or modification
- **Review** of processed data quality

## Anti-Patterns Avoided

- ❌ **Complex Human-in-the-Loop Frameworks** - No separate interaction systems
- ❌ **Inconsistent APIs** - No different patterns for human vs automated tools
- ❌ **Hardcoded Workflows** - No rigid interaction sequences
- ❌ **Special Handling** - No complex routing for human interactions
- ❌ **Separate Systems** - No disconnected human interaction platforms

## Production Benefits

### Operational Simplicity
- **Single tool framework** for all interactions
- **Consistent monitoring** and logging patterns
- **Unified debugging** and troubleshooting

### Developer Experience
- **Same mental model** for all tool interactions
- **Reusable patterns** across human and automated tools
- **Simple testing** and mocking strategies

### Business Process Integration
- **Natural human checkpoints** in automated workflows
- **Flexible approval processes** that adapt to business rules
- **Quality assurance** built into standard tool patterns

## Usage

Run the example to see human tools in action:

```bash
pnpm factor07
```

## Key Takeaways

- ✅ **Human interaction** treated as regular tools
- ✅ **Same API** for human and automated tools
- ✅ **Seamless integration** in agent workflows
- ✅ **Flexible interaction patterns** support diverse use cases
- ✅ **Scalable and composable** human tools
- ✅ **No special frameworks** needed for human-in-the-loop

Factor 7 eliminates the artificial boundary between human and automated interactions, creating a unified tool ecosystem where human intelligence integrates naturally into agent workflows without additional complexity.
