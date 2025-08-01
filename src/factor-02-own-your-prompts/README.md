# Factor 2: Own Your Prompts

## Overview

This example demonstrates [**Factor 2: Own Your Prompts**](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md) from the 12-Factor Agents methodology.

The core principle: **Don't outsource your prompt engineering to a framework**. Treat prompts as explicit, version-controlled code rather than hidden abstractions.

![Factor 2](./factor-02.gif)

## The Core Problem

Many AI frameworks hide prompts behind abstractions:

```python
# ❌ Anti-Pattern: Black Box Framework
agent = Agent(
  role="deployment assistant",
  goal="help with deployments",
  personality="cautious",
  tools=[deploy_tool, rollback_tool]
)

# What prompt does the LLM actually see? 🤷
result = agent.run(task)
```

This approach creates several problems:
- **No visibility** into actual prompts
- **Can't debug** unexpected behaviors
- **Can't test** different versions
- **Can't iterate** based on results
- **No version control** for prompts

## The Solution: Own Your Prompts

Factor 2 advocates for explicit prompt ownership:

```typescript
// ✅ Good Pattern: Explicit Prompts
const DEPLOYMENT_PROMPTS = {
  v1: `You are a deployment assistant...`,
  v2: `You are a deployment assistant that helps manage software deployments...`,
  v3: `You are an expert deployment assistant that ensures safe deployments...`
};

// Full visibility and control
const agent = new Agent({
  name: 'Deployment Agent',
  instructions: DEPLOYMENT_PROMPTS.v3, // Explicit, visible, testable
  model,
});
```

## How This Example Works

### 1. Black Box Anti-Pattern

The example first demonstrates the problematic "black box" approach:

```typescript
class BlackBoxAgent {
  private generateHiddenPrompt(): string {
    // Hidden prompt generation logic
    // You can't see or modify this!
  }
}
```

This simulates frameworks that hide prompt generation behind abstractions.

### 2. Explicit Prompt Ownership

Then it shows the better approach with three prompt versions:

```typescript
const DEPLOYMENT_PROMPTS = {
  // Version 1: Basic
  v1: `You are a deployment assistant...`,

  // Version 2: Improved
  v2: `...with specific deployment guidelines...`,

  // Version 3: Production-ready
  v3: `...with detailed safety procedures...`
};
```

### 3. Templated Prompts

Demonstrates dynamic prompt generation for different contexts:

```typescript
const TEMPLATED_PROMPTS = {
  deployment: (environment: string, service: string) => `
You are a deployment assistant for ${service} in the ${environment} environment.
Environment-specific considerations:
- ${environment === 'production' ? 'EXTREME CAUTION REQUIRED' : 'Standard process'}
...
`,
};
```

### 4. Prompt Metrics and Evaluation

Shows how to measure prompt performance and safety:

```typescript
class PromptEvaluator {
  static evaluateSafety(response: string): number {
    // Measure safety score based on keywords
  }

  static async measurePerformance(agent: Agent, question: string): Promise<PromptMetrics> {
    // Track response time, token count, safety score
  }
}
```

### 5. Systematic Testing

The example demonstrates how owned prompts enable testing:

```typescript
// Test critical scenarios
const testCases = [
  "Should I deploy on Friday afternoon?",
  "The staging environment is down. Can I deploy to production?",
  "We need to deploy a database migration. What should I consider?"
];

// Verify responses include safety elements
✓ Risk Assessment: ✅
✓ Rollback Plan: ✅
✓ Monitoring: ✅
```

## Running the Example

```bash
pnpm factor02
```

## Example Output

```
🎯 Factor 2: Own Your Prompts
=============================

❌ ANTI-PATTERN: Black Box Framework Approach
============================================

🔒 Configuration provided:
- Role: deployment assistant
- Goal: help with software deployments
- Personality: cautious and thorough
- Context: production environment, critical systems

❓ But what prompt does the LLM actually see? 🤷
(Hidden inside the framework - you can't access or modify it!)

✅ GOOD PATTERN: Explicit Prompt Ownership
=========================================

📝 Using Prompt Version: v1
──────────────────────────────────────────────────
You are a deployment assistant. When asked about deployments, provide helpful information.
──────────────────────────────────────────────────

💬 Question: "Should I deploy the new user service to production?"
🤖 Response: [Generic, unhelpful response]

📝 Using Prompt Version: v3
──────────────────────────────────────────────────
You are an expert deployment assistant that ensures safe and reliable software deployments.
[... detailed guidelines ...]
──────────────────────────────────────────────────

🤖 Response:
Risk Assessment: HIGH
Prerequisites:
- Verify staging tests have passed
- Ensure rollback plan is documented
[... detailed, safety-focused response ...]
```

## Key Benefits Demonstrated

### 1. **Visibility**
You can see exactly what instructions the LLM receives:
```typescript
console.log(instructions); // Full prompt visible
```

### 2. **Evolution**
Compare how responses improve from v1 to v3:
- v1: Generic responses
- v2: Better structure
- v3: Production-ready with safety checks

### 3. **Testing**
Systematic evaluation of prompt quality:
```typescript
const hasRiskAssessment = response.includes('risk');
const hasRollback = response.includes('rollback');
```

### 4. **Version Control**
All prompts are code that can be:
- Tracked in git
- Reviewed in PRs
- Rolled back if needed

## Production Benefits

In real-world applications, Factor 2 enables:

**A/B Testing**: Compare prompt performance with metrics
```typescript
const promptA = PROMPTS.v2;
const promptB = PROMPTS.v3;
// Track which performs better
```

**Team Collaboration**: Engineers can review and improve prompts
```typescript
// PR comment: "This prompt should also check for dependency conflicts"
```

**Debugging**: When issues arise, you can see the exact prompt
```typescript
logger.info('Prompt used:', agent.instructions);
```

**Compliance**: Audit trail of all prompt changes
```typescript
// git log shows: "Updated deployment prompt to include GDPR checks"
```

**Dynamic Prompts**: Generate context-specific prompts
```typescript
const agent = createTemplatedAgent('production', 'payment-service');
// Automatically includes production-specific safety measures
```

**Performance Monitoring**: Track prompt effectiveness
```typescript
const metrics = await PromptEvaluator.measurePerformance(agent, question);
console.log(`Safety Score: ${metrics.safetyScore}%`);
```

## Anti-Patterns Avoided

❌ **Hidden Prompts**: No mysterious prompt generation
❌ **Untrackable Changes**: All modifications in version control
❌ **Debugging Blindness**: Full visibility into LLM instructions
❌ **Testing Difficulty**: Prompts are just strings you can test

## The Bottom Line

Factor 2 transforms prompt engineering from guesswork into engineering. By owning your prompts:

1. **You see** what the LLM sees
2. **You control** how it behaves
3. **You test** different approaches
4. **You iterate** based on results
5. **You collaborate** with your team

Remember: Your prompts are the primary interface between your application and the LLM. Treat them as first-class code, not hidden configuration.

When building AI agents, ask yourself: "Can I see, test, and version control the exact prompts being used?" If not, it's time to take ownership.