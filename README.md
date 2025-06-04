# Mastra 12-Factor Agents Examples

This repository demonstrates the [12-Factor Agents](https://github.com/humanlayer/12-factor-agents) principles using the [Mastra](https://mastra.ai/en/docs) agent framework.

Each factor is implemented as a standalone, production-quality TypeScript example, with interactive CLI and explanation.

## Quick Start

- Install dependencies:

  ```sh
  pnpm install
  ```

- Run any factor example (replace `factorXX` with the desired factor):

  ```sh
  pnpm exec tsx src/factor01-natural-language-to-tool-calls/index.ts -- 'Your input here'
  ```

## Model Selection & Configuration

This project uses a shared `src/model.ts` for all examples. By default, it uses the Mistral model, but you can easily switch to Groq, Ollama, OpenAI, Anthropic (Claude), or other providers:

- **OpenAI or Anthropic (Claude)**: You can also use [OpenAI](https://platform.openai.com/) or [Anthropic Claude](https://www.anthropic.com/). These require a paid account and API key, but provide access to GPT-4, Claude 3, and other top-tier models.

- **Groq or Mistral**: For best results, use [Groq](https://groq.com/) or [Mistral](https://mistral.ai/) APIs. Both offer free access (with limits) to high-quality models that outperform most local setups.

- **Ollama**: Run models locally (e.g., Llama 3, Qwen3). Fast for demos, but quality may be lower than hosted APIs.

To use Groq, Mistral, OpenAI, or Anthropic, add your API key(s) to a `.env` file in the project root:

```env
GROQ_API_KEY=your-groq-key-here
MISTRAL_API_KEY=your-mistral-key-here
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```

The `model.ts` file is easy to customise if you want to experiment with different providers or models.

## Factor Index

| #   | Principle                                                                               | Description (short)                                 | Example Command                                                                                              |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | [Natural Language to Tool Calls](src/factor01-natural-language-to-tool-calls/README.md) | LLM parses NL and calls structured tools            | `pnpm exec tsx src/factor01-natural-language-to-tool-calls/index.ts -- 'Who was Ada Lovelace?'`              |
| 2   | [Own Your Prompts](src/factor02-own-your-prompts/README.md)                             | Prompts as code, versioned and testable             | `pnpm exec tsx src/factor02-own-your-prompts/index.ts -- 'Hello!' 'Talk like a pirate'`                      |
| 3   | [Own Your Context Window](src/factor03-own-your-context-window/README.md)               | Explicit control over LLM context                   | `pnpm exec tsx src/factor03-own-your-context-window/index.ts -- 'Laurie'`                                    |
| 4   | [Tools are Structured Outputs](src/factor04-tools-are-structured-outputs/README.md)     | Tools return typed, parseable data                  | `pnpm exec tsx src/factor04-tools-are-structured-outputs/index.ts -- 'Tell me about a famous mathematician'` |
| 5   | [Unify Execution State](src/factor05-unify-execution-state/README.md)                   | Single source of truth for agent and business state | `pnpm exec tsx src/factor05-unify-execution-state/index.ts -- 'My name is Laurie'`                           |
| 6   | [Launch/Pause/Resume](src/factor06-launch-pause-resume/README.md)                       | Workflows can be paused and resumed                 | `pnpm exec tsx src/factor06-launch-pause-resume/index.ts -- 42`                                              |
| 7   | [Contact Humans with Tools](src/factor07-contact-humans-with-tools/README.md)           | Human-in-the-loop as a tool step                    | `pnpm exec tsx src/factor07-contact-humans-with-tools/index.ts -- 'Please confirm my message'`               |
| 8   | [Own Your Control Flow](src/factor08-own-your-control-flow/README.md)                   | Explicit, testable workflow logic                   | `pnpm exec tsx src/factor08-own-your-control-flow/index.ts -- 'Start the workflow'`                          |
| 9   | [Compact Errors](src/factor09-compact-errors/README.md)                                 | Errors are summarised, not fatal                    | `pnpm exec tsx src/factor09-compact-errors/index.ts -- 'What is the capital of South Dakota?'`               |
| 10  | [Small, Focused Agents](src/factor10-small-focused-agents/README.md)                    | Compose agents with single responsibilities         | `pnpm exec tsx src/factor10-small-focused-agents/index.ts -- 'cats'`                                         |
| 11  | [Trigger from Anywhere](src/factor11-trigger-from-anywhere/README.md)                   | Agents can be invoked by any event                  | `pnpm exec tsx src/factor11-trigger-from-anywhere/index.ts -- 'external_api_call'`                           |
| 12  | [Stateless Reducer](src/factor12-stateless-reducer/README.md)                           | Pure, deterministic, stateless agent logic          | `pnpm exec tsx src/factor12-stateless-reducer/index.ts -- 1 2 3 4 5`                                         |

## How to Use

- Each factor folder contains:
  - A runnable `index.ts` with CLI fallback for interactive use
  - A detailed `README.md` with background, code, and expected output
- Use these as templates for your own Mastra agents and workflows.
- See the [Mastra documentation](https://mastra.ai/en/docs) for framework details.
- For the original methodology and more context, see [12-factor-agents](https://github.com/humanlayer/12-factor-agents).

## Credits & License

- Inspired by [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) by Dex Horthy and contributors.
- Mastra framework by [mastra.ai](https://mastra.ai/en/docs).
- Code: Apache 2.0, Content: CC BY-SA 4.0.

---

For any questions, suggestions, or contributions, please open an issue or pull request!
