// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 4: Tools are Structured Outputs');
console.log('==========================================');

// 🏗️ STRUCTURED TOOL DEFINITIONS
// Each tool has explicit input and output schemas

// Tool 1: Simple structured output
const weatherTool = createTool({
  id: 'weather',
  inputSchema: z.object({
    city: z.string().describe('City name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius')
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
    city: z.string(),
    unit: z.string()
  }),
  description: 'Get weather information for a city',
  execute: async ({ context }) => {
    console.log(`[🌤️ Weather Tool] Getting weather for ${context.city} in ${context.unit}`);

    // Deterministic structured output
    function getBaseTemp(city: string): number {
      const cityName = city.toLowerCase();
      if (cityName.includes('new york')) return 22;
      if (cityName.includes('london')) return 15;
      if (cityName.includes('tokyo')) return 18;
      return 20;
    }

    const baseTemp = getBaseTemp(context.city);
    const temperature = context.unit === 'fahrenheit' ? (baseTemp * 9/5) + 32 : baseTemp;

    return {
      temperature,
      condition: "Partly cloudy",
      humidity: 65,
      city: context.city,
      unit: context.unit
    };
  },
});

// Tool 2: Complex structured output with nested objects
const userProfileTool = createTool({
  id: 'user-profile',
  inputSchema: z.object({
    userId: z.string().describe('User identifier')
  }),
  outputSchema: z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      age: z.number()
    }),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      language: z.string(),
      notifications: z.boolean()
    }),
    metadata: z.object({
      lastLogin: z.string(),
      accountType: z.enum(['free', 'premium', 'enterprise'])
    })
  }),
  description: 'Get detailed user profile information',
  execute: async ({ context }) => {
    console.log(`[👤 Profile Tool] Loading profile for user ${context.userId}`);

    // Deterministic structured output
    return {
      user: {
        id: context.userId,
        name: context.userId === 'alice123' ? 'Alice Johnson' :
              (context.userId === 'bob456' ? 'Bob Smith' : 'John Doe'),
        email: `${context.userId}@example.com`,
        age: 28
      },
      preferences: {
        theme: 'dark' as const,
        language: 'en',
        notifications: true
      },
      metadata: {
        lastLogin: '2024-01-15T10:30:00Z',
        accountType: 'premium' as const
      }
    };
  },
});

// Tool 3: Array output structure
const searchTool = createTool({
  id: 'search',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(3)
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
      score: z.number()
    })),
    query: z.string(),
    totalFound: z.number()
  }),
  description: 'Search for relevant documents',
  execute: async ({ context }) => {
    console.log(`[🔍 Search Tool] Searching for "${context.query}" (limit: ${context.limit})`);

    // Deterministic structured output
    const results = [
      {
        title: `Understanding ${context.query}`,
        url: `https://example.com/${context.query.toLowerCase().replaceAll(/\s+/g, '-')}`,
        snippet: `A comprehensive guide to ${context.query} with examples and best practices.`,
        score: 0.95
      },
      {
        title: `${context.query} Tutorial`,
        url: `https://tutorial.com/${context.query.toLowerCase().replaceAll(/\s+/g, '-')}`,
        snippet: `Learn ${context.query} step by step with this detailed tutorial.`,
        score: 0.87
      },
      {
        title: `Advanced ${context.query} Techniques`,
        url: `https://advanced.com/${context.query.toLowerCase().replaceAll(/\s+/g, '-')}`,
        snippet: `Advanced techniques and patterns for working with ${context.query}.`,
        score: 0.82
      }
    ];

    return {
      results: results.slice(0, context.limit),
      query: context.query,
      totalFound: 42
    };
  },
});

// 🤖 Create agent with structured tools
const agent = new Agent({
  name: 'StructuredAgent',
  instructions: `You are a helpful assistant with access to structured tools.

When using tools:
1. Parse the user's request to determine which tool to use
2. Extract the correct parameters for the tool's input schema
3. Use the tool and reference its structured output in your response
4. Be specific about the structured data you received

Available tools:
- weather: Get weather information (returns temperature, condition, humidity, etc.)
- user-profile: Get user profile (returns user info, preferences, metadata)
- search: Search for documents (returns array of results with title, url, snippet, score)`,
  model,
  tools: { weatherTool, userProfileTool, searchTool },
});

// 📊 STRUCTURED OUTPUT PROCESSING
// Demonstrate how to consume structured outputs reliably

interface WeatherOutput {
  temperature: number;
  condition: string;
  humidity: number;
  city: string;
  unit: string;
}

interface UserProfileOutput {
  user: {
    id: string;
    name: string;
    email: string;
    age: number;
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  metadata: {
    lastLogin: string;
    accountType: 'free' | 'premium' | 'enterprise';
  };
}

interface SearchOutput {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    score: number;
  }>;
  query: string;
  totalFound: number;
}

function processWeatherOutput(output: WeatherOutput) {
  console.log(`\n[📊 Processing Weather]`);
  console.log(`  🌡️  Temperature: ${output.temperature}°${output.unit.charAt(0).toUpperCase()}`);
  console.log(`  ☁️  Condition: ${output.condition}`);
  console.log(`  💧 Humidity: ${output.humidity}%`);
  console.log(`  📍 Location: ${output.city}`);
}

function processProfileOutput(output: UserProfileOutput) {
  console.log(`\n[📊 Processing Profile]`);
  console.log(`  👤 User: ${output.user.name} (${output.user.email})`);
  console.log(`  🎨 Theme: ${output.preferences.theme}`);
  console.log(`  📱 Notifications: ${output.preferences.notifications ? 'Enabled' : 'Disabled'}`);
  console.log(`  💎 Account: ${output.metadata.accountType}`);
}

function processSearchOutput(output: SearchOutput) {
  console.log(`\n[📊 Processing Search]`);
  console.log(`  🔍 Query: "${output.query}" (${output.totalFound} total found)`);
  console.log(`  📄 Results:`);
  for (const [index, result] of output.results.entries()) {
    console.log(`    ${index + 1}. ${result.title} (score: ${result.score})`);
    console.log(`       📝 ${result.snippet}`);
    console.log(`       🔗 ${result.url}`);
  }
}

// 🎭 DEMONSTRATION: Structured Input → Structured Output
async function demonstrateStructuredTools() {
  const scenarios = [
    {
      name: 'Weather Query',
      question: "What's the weather like in New York in Fahrenheit?",
      expectedTool: 'weather',
      processor: processWeatherOutput as (output: unknown) => void
    },
    {
      name: 'User Profile Lookup',
      question: "Show me the profile information for user alice123",
      expectedTool: 'user-profile',
      processor: processProfileOutput as (output: unknown) => void
    },
    {
      name: 'Search Query',
      question: "Search for 'machine learning' and show me 2 results",
      expectedTool: 'search',
      processor: processSearchOutput as (output: unknown) => void
    }
  ];

  console.log(`\n${'='.repeat(60)}`);
  console.log('🧪 Testing Structured Tool Outputs');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n❓ Question: "${scenario.question}"`);
    console.log('🧠 Processing...');

    const result = await agent.generateVNext(scenario.question);
    console.log(`\n💬 Agent Response: ${result.text}`);

    // Find the expected tool result
    const toolResult = result.toolResults?.find(tr => tr.toolName === scenario.expectedTool);

    if (toolResult) {
      console.log(`\n[🏗️ Raw Structured Output from ${scenario.expectedTool}]:`);
      console.log(JSON.stringify(toolResult.result, null, 2));

      // Process the structured output
      scenario.processor(toolResult.result as unknown);
    } else {
      console.log(`\n⚠️ Expected tool '${scenario.expectedTool}' was not called`);
    }
  }
}

// 🔍 SCHEMA VALIDATION DEMONSTRATION
async function demonstrateSchemaValidation() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 Schema Validation Benefits');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Type Safety Examples:');
  console.log('   Weather Tool Input:  { city: string, unit?: "celsius" | "fahrenheit" }');
  console.log('   Weather Tool Output: { temperature: number, condition: string, humidity: number, city: string, unit: string }');
  console.log('   \n   Profile Tool Input:  { userId: string }');
  console.log('   Profile Tool Output: { user: {...}, preferences: {...}, metadata: {...} }');
  console.log('   \n   Search Tool Input:   { query: string, limit?: number }');
  console.log('   Search Tool Output:  { results: Array<{title, url, snippet, score}>, query: string, totalFound: number }');

  console.log('\n💡 Benefits:');
  console.log('   ✅ Predictable output structure');
  console.log('   ✅ Type safety at compile time');
  console.log('   ✅ Runtime validation');
  console.log('   ✅ Clear API contracts');
  console.log('   ✅ Easy downstream processing');
  console.log('   ✅ Reliable data flow');
}

async function main() {
  console.log('\n✨ Factor 4 demonstrates tools as structured outputs');
  console.log('   - Tools have explicit input/output schemas');
  console.log('   - LLM generates structured tool calls');
  console.log('   - Tools return predictable, typed data');
  console.log('   - Downstream processing is reliable');
  console.log('   - Schema validation ensures data integrity\n');

  await demonstrateStructuredTools();
  await demonstrateSchemaValidation();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 4 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Tools define explicit input/output schemas');
  console.log('   ✅ Structured outputs enable reliable downstream processing');
  console.log('   ✅ Schema validation prevents runtime errors');
  console.log('   ✅ Type safety improves developer experience');
  console.log('   ✅ Predictable data flow across the application');
}

main().catch(console.error);
