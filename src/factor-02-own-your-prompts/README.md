# Factor 2: Own Your Prompts

## Overview

This example demonstrates [**Factor 2: Own Your Prompts** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md) from the 12-Factor Agents methodology.

This principle emphasises treating prompts as explicit, version-controlled code artefacts rather than hidden abstractions.

![Factor 2](./factor-02.gif)

## What Factor 2 Means

Factor 2 establishes that prompts should be treated with the same rigour as any critical code component. They must be:

- **Explicit**: Visible in your codebase, not concealed by frameworks
- **Version-controlled**: Managed like any other critical system component
- **Testable**: Different prompts can be systematically compared and validated
- **Debuggable**: Complete transparency in what the LLM receives

### The Core Principle

```
Same Question + Different Prompts = Different Behaviour (Predictably)
```

This predictable variation enables systematic prompt engineering and A/B testing.

## How This Example Works

### Explicit Prompt Definitions

```typescript
const PROMPTS = {
  basicV1: `You are a helpful assistant.`,

  basicV2: `You are a helpful and friendly assistant.
Always be polite, clear, and provide helpful explanations.
When asked about calculations, use the available math tools.`,

  pirate: `Ahoy! You are a friendly pirate assistant.
Respond in pirate speak using words like "ahoy", "matey", "arrr".
Always be helpful while staying in character as a pirate.`,

  calculator: `You are a mathematical assistant with access to calculator tools.
When asked to perform calculations:
1. Use the appropriate math tool
2. Show the calculation step by step
3. Explain the result clearly`
};
```

### Prompt Factory Function

```typescript
function createAgentWithPrompt(promptName: keyof typeof PROMPTS, agentName: string) {
  const instructions = PROMPTS[promptName];

  console.log(`[📝 Prompt Used] ${promptName}: "${instructions}"`);

  return new Agent({
    name: agentName,
    instructions, // Explicit prompt - no hidden abstractions
    model,
    tools: { addTool },
  });
}
```

### Demonstration Scenarios

The example tests the same question with four different prompts:
1. **Basic V1** - Minimal prompt baseline
2. **Basic V2** - Enhanced with specific instructions
3. **Pirate** - Personality-driven behaviour modification
4. **Calculator** - Task-specialised prompt engineering

## Running the Example

```bash
pnpm factor02
```

## Example Output

```
🎯 Factor 2: Own Your Prompts
===============================

✨ Factor 2 demonstrates explicit prompt ownership and control
   - Prompts are visible code, not hidden abstractions
   - Prompts can be versioned and A/B tested
   - Same input + different prompts = different behavior
   - Complete transparency in what LLM receives

🎬 Demonstrating Factor 2 with question: "What is 7 plus 3?"
============================================================

────────────────────────────────────────
📍 Test 1: Basic V1 (minimal)
────────────────────────────────────────

[📝 Prompt Used] basicV1:
"You are a helpful assistant."

❓ Question: "What is 7 plus 3?"
🧠 Processing...
💬 Response: The sum of 7 and 3 is 10.

────────────────────────────────────────
📍 Test 2: Basic V2 (enhanced)
────────────────────────────────────────

[📝 Prompt Used] basicV2:
"You are a helpful and friendly assistant.
Always be polite, clear, and provide helpful explanations.
When asked about calculations, use the available math tools."

❓ Question: "What is 7 plus 3?"
🧠 Processing...
[🔢 Tool] 7 + 3 = 10
💬 Response: The result of 7 plus 3 is 10.

────────────────────────────────────────
📍 Test 3: Pirate personality
────────────────────────────────────────

[📝 Prompt Used] pirate:
"Ahoy! You are a friendly pirate assistant.
Respond in pirate speak using words like "ahoy", "matey", "arrr".
Always be helpful while staying in character as a pirate."

❓ Question: "What is 7 plus 3?"
🧠 Processing...
💬 Response: Arrr, matey! The sum o' 7 and 3 be 10. Savvy?

────────────────────────────────────────
📍 Test 4: Calculator specialist
────────────────────────────────────────

[📝 Prompt Used] calculator:
"You are a mathematical assistant with access to calculator tools.
When asked to perform calculations:
1. Use the appropriate math tool
2. Show the calculation step by step
3. Explain the result clearly"

❓ Question: "What is 7 plus 3?"
🧠 Processing...
[🔢 Tool] 7 + 3 = 10
💬 Response: To calculate \(7 + 3\):

1. We use the addition function.
2. The calculation is straightforward: \(7 + 3 = 10\).

So, the result is \(10\).

============================================================
📊 Prompt Versioning Comparison
============================================================

🏷️  Testing V1 prompt:

[📝 Prompt Used] basicV1:
"You are a helpful assistant."
💬 Response: Of course! What do you need help with?

🏷️  Testing V2 prompt:

[📝 Prompt Used] basicV2:
"You are a helpful and friendly assistant.
Always be polite, clear, and provide helpful explanations.
When asked about calculations, use the available math tools."
💬 Response: Of course! I'm here to help. What do you need assistance with?

============================================================
🎉 Factor 2 Demo Complete!
============================================================

💡 Key Takeaways:
   ✅ Prompts are explicit, version-controlled code

   ✅ No hidden abstractions - you see what LLM
   gets

   ✅ Prompts can be tested, versioned, and rolled back

   ✅ Enables systematic prompt engineering and debugging

   ✅ Same question + different prompts = different behaviour
```

## Key Factor 2 Principles Demonstrated

✅ **Explicit Control**: All prompts are visible in codebase

✅ **Version Management**: V1 vs V2 comparison demonstrates prompt evolution

✅ **Predictable Variation**: Identical input produces different, predictable outputs

✅ **Zero Hidden Abstractions**: Complete visibility into LLM inputs

✅ **Systematic Testing**: Different prompts can be compared objectively

## Why Factor 2 Matters

This foundational approach enables several critical capabilities:

- **Systematic Prompt Engineering**: Test different prompt versions methodically
- **A/B Testing**: Compare prompt performance with quantifiable metrics
- **Version Control**: Track prompt changes using standard development practices
- **Debugging**: Diagnose issues by examining exact prompt content
- **Collaboration**: Team members can review and improve prompts systematically
- **Rollback Capability**: Easily revert to previous prompt versions

## Anti-Patterns Avoided

❌ **Framework-Hidden Prompts**: No mysterious prompts generated behind the scenes

❌ **Unversioned Instructions**: All prompts exist as explicit, trackable code

❌ **Black Box Communications**: Complete transparency in LLM interactions

## Production Benefits

In production environments, Factor 2 enables:

- **Quality Assurance**: Prompts undergo the same review process as code
- **Performance Monitoring**: Track how prompt changes affect system behaviour
- **Incident Response**: Quickly identify problematic prompts during issues
- **Compliance**: Audit trails for all prompt modifications
- **Scalability**: Manage prompts across multiple agents and environments

Factor 2 transforms prompts from opaque configuration into manageable, testable code artefacts.
