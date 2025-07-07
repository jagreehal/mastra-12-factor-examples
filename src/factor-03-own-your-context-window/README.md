# Factor 3: Own Your Context Window

## Overview

This example demonstrates [**Factor 3: Own Your Context Window** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md) from the 12-Factor Agents methodology.

This principle emphasises having explicit control over what information gets included in the LLM's context window rather than relying on framework abstractions.

## What Factor 3 Means

Factor 3 establishes that developers must maintain explicit control over context window management. The context window represents a limited, valuable resource that directly influences LLM behaviour. Rather than allowing frameworks to automatically manage context, you should deliberately curate what conversation history and contextual information to include.

### The Core Principle

```
Same Question + Different Context Windows = Different Responses
```

This predictable variation enables strategic context management and sophisticated debugging capabilities.

## How This Example Works

### Explicit Context Strategies

The example demonstrates four distinct context management approaches:

```typescript
// Strategy 1: Recent Context (sliding window)
getRecentContext(maxTurns: number = 3): string {
  const recent = this.conversation.slice(-maxTurns);
  return recent.map(turn =>
    `User: ${turn.user}\nAssistant: ${turn.assistant}`
  ).join('\n\n');
}

// Strategy 2: Important Context Only (filtered)
getImportantContext(): string {
  const important = this.conversation.filter(turn => turn.importance === 'high');
  return important.map(turn =>
    `[IMPORTANT] User: ${turn.user}\nAssistant: ${turn.assistant}`
  ).join('\n\n');
}

// Strategy 3: Summary + Recent (compressed)
getSummaryContext(): string {
  const older = this.conversation.slice(0, -2);
  const recent = this.conversation.slice(-2);

  let context = "";
  if (older.length > 0) {
    const names = older.map(t => t.user.match(/name is (\w+)/)?.[1]).filter(Boolean);
    if (names.length > 0) {
      context += `[SUMMARY] User's name: ${names.join(', ')}\n\n`;
    }
  }

  context += recent.map(turn =>
    `User: ${turn.user}\nAssistant: ${turn.assistant}`
  ).join('\n\n');

  return context;
}
```

### Demonstration Process

1. **Build Conversation History**: Creates a five-turn conversation with varying importance levels
2. **Test Context Strategies**: Applies the same question with different context windows
3. **Show Context Contents**: Displays precisely what the LLM observes
4. **Compare Responses**: Demonstrates how context affects output behaviour

## Running the Example

```bash
pnpm factor03
```

## Example Output

```
🎯 Factor 3: Own Your Context Window
====================================

✨ Factor 3 demonstrates explicit control over context windows
   - You decide what information the LLM sees
   - Different context strategies = different responses
   - Context windows are limited, valuable resources
   - Explicit control enables debugging and optimization

🎬 Building conversation history...

👤 User: Hello! My name is Alex and I'm 25 years old.
🤖 Assistant: Thanks for sharing that information!

👤 User: I like pizza and coding.
🤖 Assistant: Thanks for sharing that information!

👤 User: Yesterday I went to the movies.
🤖 Assistant: Thanks for sharing that information!

👤 User: My favorite color is blue.
🤖 Assistant: Thanks for sharing that information!

👤 User: I have a dog named Max.
🤖 Assistant: Thanks for sharing that information!

📊 Conversation history: 5 turns

============================================================
🧪 Testing Different Context Strategies
============================================================

──────────────────────────────────────────────────
📍 Strategy 1: Recent Context (3 turns)
📝 Description: Only the last 3 conversation turns
──────────────────────────────────────────────────

[📋 Context Window Contents]:
"User: Yesterday I went to the movies.
Assistant: Thanks for sharing that information!

User: My favorite color is blue.
Assistant: Thanks for sharing that information!

User: I have a dog named Max.
Assistant: Thanks for sharing that information!"

❓ Question: "What do you remember about me?"
🧠 Processing with context strategy...
💬 Response: I remember that you went to the movies yesterday, your favorite color is blue, and you have a dog named Max. Thanks for sharing those details!

──────────────────────────────────────────────────
📍 Strategy 2: Important Context Only
📝 Description: Only messages marked as high importance
──────────────────────────────────────────────────

[📋 Context Window Contents]:
"[IMPORTANT] User: Hello! My name is Alex and I'm 25 years old.
Assistant: Thanks for sharing that information!

[IMPORTANT] User: I have a dog named Max.
Assistant: Thanks for sharing that information!"

❓ Question: "What do you remember about me?"
🧠 Processing with context strategy...
💬 Response: Hello Alex! I remember that you're 25 years old and you have a dog named Max.

──────────────────────────────────────────────────
📍 Strategy 3: Summary + Recent
📝 Description: Compressed summary + recent messages
──────────────────────────────────────────────────

[📋 Context Window Contents]:
"[SUMMARY] User's name: Alex

User: My favorite color is blue.
Assistant: Thanks for sharing that information!

User: I have a dog named Max.
Assistant: Thanks for sharing that information!"

❓ Question: "What do you remember about me?"
🧠 Processing with context strategy...
💬 Response: Hi Alex! I remember that your favorite color is blue and you have a dog named Max. How can I assist you today?

──────────────────────────────────────────────────
📍 Strategy 4: No Context
📝 Description: Fresh conversation with no history
──────────────────────────────────────────────────

[📋 Context Window Contents]:
"No previous conversation context available."

❓ Question: "What do you remember about me?"
🧠 Processing with context strategy...
💬 Response: I don't have any information about you. How can I assist you today?

============================================================
📏 Context Window Size Management
============================================================

🔍 Context Window Size: 2 turns
   📊 Context contains 5 lines
   📝 Sample: "User: Message 7: Here's some information 7
Assistant: Got it, thanks for message 7!

User: Message 8..."

🔍 Context Window Size: 4 turns
   📊 Context contains 11 lines
   📝 Sample: "User: Message 5: Here's some information 5
Assistant: Got it, thanks for message 5!

User: Message 6..."

🔍 Context Window Size: 6 turns
   📊 Context contains 17 lines
   📝 Sample: "User: Message 3: Here's some information 3
Assistant: Got it, thanks for message 3!

User: Message 4..."

🔍 Context Window Size: 8 turns
   📊 Context contains 23 lines
   📝 Sample: "User: Message 1: Here's some information 1
Assistant: Got it, thanks for message 1!

User: Message 2..."

============================================================
🎉 Factor 3 Demo Complete!
============================================================

💡 Key Takeaways:

   ✅ Explicit control over what LLM sees in context

   ✅ Different context strategies produce different responses

   ✅ Context windows are limited - choose wisely

   ✅ Enables debugging by examining exact context contents

   ✅ Optimize for relevance vs recency vs importance
```

## Key Factor 3 Principles Demonstrated

✅ **Explicit Control**: Complete ownership over context window contents

✅ **Strategic Variation**: Different context strategies yield predictable response variations

✅ **Resource Management**: Context windows are finite, valuable resources requiring deliberate curation

✅ **Transparency**: Full visibility into what information the LLM receives

✅ **Debugging Capability**: Examine exact context contents when diagnosing issues

## Context Management Strategies

### Recent Context (Sliding Window)
Maintains the most recent conversation turns, useful for:
- Maintaining conversational flow
- Preserving immediate context
- Managing memory-constrained scenarios

### Important Context Only (Filtered)
Retains only high-priority information, ideal for:
- Long-term memory preservation
- Key fact retention
- Focused domain conversations

### Summary + Recent (Compressed)
Combines compressed historical summaries with recent detail, perfect for:
- Balancing history with immediacy
- Efficient context utilisation
- Scalable conversation management

### No Context (Fresh Start)
Provides clean slate interactions, useful for:
- Privacy-sensitive scenarios
- Independent task execution
- Testing without historical bias

## Why Factor 3 Matters

This fundamental capability enables several critical benefits:

- **Performance Optimisation**: Maximise context window utility through strategic curation
- **Cost Management**: Reduce token consumption by including only relevant information
- **Behavioural Control**: Predictably influence LLM responses through context manipulation
- **Debugging Excellence**: Diagnose issues by examining exact context contents
- **Memory Management**: Implement sophisticated long-term memory strategies
- **Privacy Compliance**: Control information retention and exposure

## Production Applications

In production environments, Factor 3 enables:

- **Multi-tenant Systems**: Isolate context between different users or sessions
- **Compliance Requirements**: Manage data retention policies at the context level
- **Performance Tuning**: Optimise context strategies based on usage patterns
- **Error Investigation**: Reproduce issues by examining historical context windows
- **Feature Development**: A/B test different context strategies systematically

## Anti-Patterns Avoided

❌ **Framework-Managed Context**: No opaque automatic context management

❌ **Uncontrolled Memory Growth**: Explicit limits prevent unbounded context expansion

❌ **Hidden Information**: Complete transparency in what reaches the LLM

Factor 3 transforms context management from implicit framework behaviour into explicit, strategic resource allocation.
