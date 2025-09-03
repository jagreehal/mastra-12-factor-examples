import 'dotenv/config';

import { ollama } from 'ai-sdk-ollama';

import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';

export const groqModel = groq('llama-3.3-70b-versatile');

export const mistralModel = mistral('mistral-small-latest');

export const qwen3 = ollama('qwen3:latest', {
  structuredOutputs: true,
});
export const llama3_2 = ollama('llama3.2:latest', {
  structuredOutputs: true,
});
export const model = mistralModel;
