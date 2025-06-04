# Factor 2: Own Your Prompts

## Overview

This example demonstrates how the Mastra agent implementation fulfills **Factor 2: Own Your Prompts** from the [12-Factor Agents methodology](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md).

## What Factor 2 Means

Factor 2 emphasizes treating prompts as critical, version-controlled code artifacts rather than throwaway inputs. You should have complete control over what instructions are sent to the LLM, enabling systematic testing, deployment, and rollback of prompt changes.

## How This Example Fulfills Factor 2

### 🎯 Explicit Prompt Control

```typescript
// Direct control over prompt via instructions
function makeInstructions(style: string) {
  return `You must respond in the following style: ${style}`;
}

const agent = createPromptAgent('Talk like a pirate');
```

### 📝 Version-Controlled Prompts

```typescript
// Prompts are defined as code, not hidden in frameworks
const piratePrompt = `
You are a pirate. Respond to all questions in pirate speak.
`;

const chatAgent = new Agent({
  name: 'ChatPromptAgent',
  instructions: piratePrompt,
  model,
});
```

### 🔧 Key Implementation Details

1. **Explicit Instructions**: Prompts are clearly defined as string variables or functions
2. **Customizable Factories**: Functions that generate prompts based on parameters
3. **No Hidden Abstractions**: Complete visibility into what the LLM receives
4. **Testable**: Prompts can be unit tested and validated

### 🏗️ Architecture Benefits

- **Transparency**: You know exactly what instructions are sent to the LLM
- **Maintainability**: Prompts can be tracked in version control
- **Debuggability**: Easy to identify and fix prompt-related issues
- **Reproducibility**: Same prompt always produces consistent behavior
- **Testability**: Prompts can be evaluated and A/B tested

## Best Practices Demonstrated

### ✅ Composable Prompt Functions

```typescript
function makeInstructions(style: string) {
  return `You must respond in the following style: ${style}`;
}
```

### ✅ Template-Based Prompts

```typescript
const piratePrompt = `
You are a pirate. Respond to all questions in pirate speak.
`;
```

### ✅ Parameterized Prompts

```typescript
const agent = createPromptAgent(style); // Style is a parameter
```

## Anti-Patterns Avoided

❌ **Framework-Hidden Prompts**: This example avoids frameworks that obscure prompt content
❌ **Magic String Prompts**: No invisible or auto-generated prompts
❌ **Unversioned Prompts**: All prompts are defined in code and version-controlled

## Related Factors

This example connects to other 12-factor principles:

- **Factor 3** (Own Your Context Window) - explicit control over all LLM inputs
- **Factor 8** (Own Your Control Flow) - deterministic prompt management
- **Factor 9** (Compact Errors) - clear error handling in prompt design

## Testing and Validation

With explicit prompt control, you can:

1. **Unit test prompt generation functions**
2. **A/B test different prompt variants**
3. **Monitor prompt performance over time**
4. **Roll back problematic prompt changes**

This implementation demonstrates how Mastra enables full ownership and control over prompts, ensuring they are treated as first-class code artifacts rather than hidden implementation details.

## Usage

You can run this example from the command line, providing your message and an optional style as arguments, or interactively:

```sh
pnpm exec tsx src/factor02-own-your-prompts/index.ts -- 'Hello! My name is Laurie' 'Talk like a pirate'
```

If you do not provide a message or style, you will be prompted to enter them interactively.

### Example Output

```text
Agent response (simple style): Hello! My name is Laurie. How can I assist you today?
Agent response (chat style): Arr matey, ye be talkin' to Cap'n Redbeard himself. What be ye wantin' from me, savvy? Be quick, I ain't got all day to be chattin' with scurvy dogs like ye. Speak yer piece, or walk the plank, ye landlubber!
```
