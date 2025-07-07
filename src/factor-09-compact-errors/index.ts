// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('🎯 Factor 9: Compact Errors into Context Window');
console.log('==============================================');

// 🛠️ ERROR-PRONE TOOLS
// Core concept: Tools fail gracefully with compact error messages

// 🌐 NETWORK TOOL (simulates API failures)
const networkTool = createTool({
  id: 'network-fetch',
  inputSchema: z.object({
    url: z.string().describe('URL to fetch data from'),
    timeout: z.number().optional().describe('Timeout in milliseconds')
  }),
  description: 'Fetch data from an external API (may fail due to network issues)',
  execute: async ({ context }) => {
    console.log(`\n🌐 [Network Tool] Fetching data from: ${context.url}`);

    // Simulate different failure scenarios
    const failureType = Math.random();

    if (failureType < 0.2) {
      // Network timeout error
      const error = `Network timeout: ${context.url} did not respond within ${context.timeout || 5000}ms`;
      console.log(`   ❌ ${error}`);

      return {
        success: false,
        error: 'NETWORK_TIMEOUT',
        message: error,
        retryable: true,
        data: null
      };
    } else if (failureType < 0.4) {
      // HTTP error
      const statusCode = Math.random() < 0.5 ? 404 : 500;
      const error = `HTTP ${statusCode}: ${statusCode === 404 ? 'Resource not found' : 'Internal server error'} for ${context.url}`;
      console.log(`   ❌ ${error}`);

      return {
        success: false,
        error: `HTTP_${statusCode}`,
        message: error,
        retryable: statusCode === 500,
        data: null
      };
    } else {
      // Success case
      const mockData = { result: `Data from ${context.url}`, timestamp: new Date().toISOString() };
      console.log(`   ✅ Successfully fetched data`);

      return {
        success: true,
        error: null,
        message: 'Data fetched successfully',
        retryable: false,
        data: mockData
      };
    }
  },
});

// 📊 DATABASE TOOL (simulates database errors)
const databaseTool = createTool({
  id: 'database-query',
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
    table: z.string().describe('Table name to query')
  }),
  description: 'Execute database queries (may fail due to various database issues)',
  execute: async ({ context }) => {
    console.log(`\n📊 [Database Tool] Executing query: ${context.query}`);
    console.log(`   Table: ${context.table}`);

    // Simulate different database failure scenarios
    const failureType = Math.random();

    if (failureType < 0.15) {
      // Connection error
      const error = `Database connection failed: Unable to connect to database server`;
      console.log(`   ❌ ${error}`);

      return {
        success: false,
        error: 'CONNECTION_FAILED',
        message: error,
        retryable: true,
        rows: 0,
        data: []
      };
    } else if (failureType < 0.3) {
      // Table not found
      const error = `Table '${context.table}' does not exist in database`;
      console.log(`   ❌ ${error}`);

      return {
        success: false,
        error: 'TABLE_NOT_FOUND',
        message: error,
        retryable: false,
        rows: 0,
        data: []
      };
    } else if (failureType < 0.45) {
      // Invalid SQL syntax
      const error = `SQL syntax error in query: '${context.query}' - check column names and syntax`;
      console.log(`   ❌ ${error}`);

      return {
        success: false,
        error: 'SYNTAX_ERROR',
        message: error,
        retryable: false,
        rows: 0,
        data: []
      };
    } else {
      // Success case
      const mockRows = Math.floor(Math.random() * 5) + 1;
      const mockData = Array.from({ length: mockRows }, (_, i) => ({ id: i + 1, value: `Row ${i + 1}` }));
      console.log(`   ✅ Query executed successfully, ${mockRows} rows returned`);

      return {
        success: true,
        error: null,
        message: `Query executed successfully`,
        retryable: false,
        rows: mockRows,
        data: mockData
      };
    }
  },
});

// 🔐 VALIDATION TOOL (simulates validation errors)
const validationTool = createTool({
  id: 'data-validator',
  inputSchema: z.object({
    data: z.string().describe('Data to validate'),
    format: z.enum(['email', 'phone', 'url', 'json']).describe('Expected data format')
  }),
  description: 'Validate data formats (may fail if data is invalid)',
  execute: async ({ context }) => {
    console.log(`\n🔐 [Validation Tool] Validating ${context.format}: ${context.data}`);

    let isValid = false;
    let error = null;

    // Validation logic based on format
    switch (context.format) {
      case 'email': {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.data);
        if (!isValid) error = 'Invalid email format - must contain @ and domain';
        break;
      }
      case 'phone': {
        isValid = /^\+?[\d\s\-()]{10,}$/.test(context.data);
        if (!isValid) error = 'Invalid phone format - must contain at least 10 digits';
        break;
      }
      case 'url': {
        try {
          new URL(context.data);
          isValid = true;
        } catch {
          isValid = false;
          error = 'Invalid URL format - must start with http:// or https://';
        }
        break;
      }
      case 'json': {
        try {
          JSON.parse(context.data);
          isValid = true;
        } catch {
          isValid = false;
          error = 'Invalid JSON format - syntax error in JSON string';
        }
        break;
      }
    }

    if (isValid) {
      console.log(`   ✅ Validation passed`);
      return {
        success: true,
        valid: true,
        error: null,
        message: `${context.format} validation passed`,
        format: context.format
      };
    } else {
      console.log(`   ❌ ${error}`);
      return {
        success: false,
        valid: false,
        error: 'VALIDATION_FAILED',
        message: error,
        format: context.format
      };
    }
  },
});

// 🤖 ERROR-AWARE AGENT
// Agent that handles tool errors gracefully

const errorHandlingAgent = new Agent({
  name: 'ErrorHandlingAgent',
  instructions: `You are an assistant that works with potentially unreliable tools.

When tools fail:
1. Acknowledge the error clearly
2. Explain what went wrong in simple terms
3. Suggest alternatives or next steps if possible
4. Never crash or stop responding due to tool errors

Tool error information will be provided in the tool responses. Use this information to:
- Determine if a retry might help (for retryable errors)
- Suggest alternative approaches
- Provide helpful fallback responses

Available tools:
- network-fetch: Fetches data from URLs (may have network issues)
- database-query: Executes database queries (may have DB issues)
- data-validator: Validates data formats (may fail for invalid data)

Always try to be helpful even when tools fail.`,
  model,
  tools: { networkTool, databaseTool, validationTool },
});

// 🎭 ERROR HANDLING SCENARIOS
interface ErrorScenario {
  name: string;
  description: string;
  userRequest: string;
  expectedTools: string[];
  errorHandling: string;
}

const scenarios: ErrorScenario[] = [
  {
    name: 'Network Failure Recovery',
    description: 'Handle network timeout gracefully',
    userRequest: 'Fetch user data from https://api.example.com/users/123',
    expectedTools: ['network-fetch'],
    errorHandling: 'Agent should acknowledge network issues and suggest retry'
  },
  {
    name: 'Database Error Handling',
    description: 'Handle database connection issues',
    userRequest: 'Query the users table to find all active accounts',
    expectedTools: ['database-query'],
    errorHandling: 'Agent should explain database errors and suggest alternatives'
  },
  {
    name: 'Validation Error Response',
    description: 'Handle data validation failures',
    userRequest: 'Validate this email address: invalid-email-format',
    expectedTools: ['data-validator'],
    errorHandling: 'Agent should explain validation errors and provide guidance'
  },
  {
    name: 'Multi-Tool Error Chain',
    description: 'Handle errors across multiple tool calls',
    userRequest: 'Fetch data from https://api.example.com/data, validate it as JSON, then store in database',
    expectedTools: ['network-fetch', 'data-validator', 'database-query'],
    errorHandling: 'Agent should handle cascading errors gracefully'
  }
];

// 🎯 ERROR HANDLING DEMONSTRATIONS
async function demonstrateErrorHandling() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 Compact Error Handling Demonstrations');
  console.log(`${'='.repeat(60)}`);

  for (const [index, scenario] of scenarios.entries()) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📍 Scenario ${index + 1}: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`🎯 Expected Tools: ${scenario.expectedTools.join(', ')}`);
    console.log(`🔧 Error Handling: ${scenario.errorHandling}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n👤 User Request: "${scenario.userRequest}"`);
    console.log('🤖 Agent processing with error-prone tools...');

    try {
      const result = await errorHandlingAgent.generate(scenario.userRequest);

      console.log(`\n💬 Agent Response: ${result.text}`);

      // Show tool usage and error handling
      if (result.toolResults && result.toolResults.length > 0) {
        console.log('\n[🔧 Tool Results]:');
        for (const toolResult of result.toolResults) {
          console.log(`  📦 ${toolResult.toolName}:`);

                     if (toolResult.result && typeof toolResult.result === 'object') {
             const res = toolResult.result as { success?: boolean; error?: string; message?: string; retryable?: boolean };
             if (res.success === false) {
              console.log(`     ❌ Error: ${res.error}`);
              console.log(`     💬 Message: ${res.message}`);
              console.log(`     🔄 Retryable: ${res.retryable ? 'Yes' : 'No'}`);
            } else {
              console.log(`     ✅ Success: ${res.message || 'Tool executed successfully'}`);
            }
          } else {
            console.log(`     Result: ${JSON.stringify(toolResult.result, null, 2)}`);
          }
        }
      } else {
        console.log('\n[ℹ️  No tools were called for this request]');
      }

      console.log(`\n✅ Scenario completed - Errors handled gracefully without crashing`);

    } catch (error) {
      console.log(`\n❌ Unexpected agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('   This suggests error handling could be improved');
    }
  }
}

// 💡 ERROR HANDLING BENEFITS
async function demonstrateBenefits() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💡 Factor 9 Benefits: Compact Error Handling');
  console.log(`${'='.repeat(60)}`);

  console.log('\n✅ Graceful Degradation:');
  console.log('   🛠️ Tools fail gracefully without crashing agent');
  console.log('   📋 Error information is compacted into structured responses');
  console.log('   🔄 Agent continues conversation flow despite tool failures');

  console.log('\n✅ Error Awareness:');
  console.log('   🔍 Agent receives clear error information in context');
  console.log('   💬 Agent can explain errors to users in plain language');
  console.log('   🎯 Agent knows which errors are retryable vs permanent');

  console.log('\n✅ Recovery Patterns:');
  console.log('   🔄 Retry logic for transient errors (network timeouts)');
  console.log('   🔀 Alternative approaches for permanent errors');
  console.log('   📝 Clear feedback about what went wrong and why');

  console.log('\n✅ Context Preservation:');
  console.log('   💾 Conversation context maintained through errors');
  console.log('   📊 Error details available for debugging without overwhelming context');
  console.log('   🎯 Structured error responses enable smart error handling');

  console.log('\n🏗️ Error Types Handled:');
  console.log('   🌐 Network errors (timeouts, HTTP errors, connection issues)');
  console.log('   📊 Database errors (connection, syntax, missing tables)');
  console.log('   🔐 Validation errors (format, schema, data integrity)');
  console.log('   ⚙️  Business logic errors (authorization, workflow failures)');

  console.log('\n🚫 Anti-Patterns Avoided:');
  console.log('   ❌ Silent failures that hide errors from agent');
  console.log('   ❌ System crashes due to uncaught exceptions');
  console.log('   ❌ Verbose error dumps that overwhelm context window');
  console.log('   ❌ Context loss when errors occur');
}

// 🔧 ERROR PATTERNS DEMONSTRATION
async function demonstrateErrorPatterns() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔧 Error Handling Patterns');
  console.log(`${'='.repeat(60)}`);

  console.log('\n📋 Structured Error Responses:');
  console.log('   {');
  console.log('     success: false,');
  console.log('     error: "ERROR_CODE",');
  console.log('     message: "Human-readable description",');
  console.log('     retryable: boolean,');
  console.log('     data: null | fallback_data');
  console.log('   }');

  console.log('\n🎯 Error Categories:');
  console.log('   🔄 RETRYABLE: Network timeouts, temporary DB issues');
  console.log('   🚫 PERMANENT: Validation failures, missing resources');
  console.log('   ⚠️  CRITICAL: Authentication failures, permission denied');

  console.log('\n🔍 Error Information Compaction:');
  console.log('   ✅ Include error code for programmatic handling');
  console.log('   ✅ Include human-readable message for agent understanding');
  console.log('   ✅ Include retry indication for recovery logic');
  console.log('   ✅ Include relevant context (URL, table name, etc.)');
  console.log('   ❌ Avoid full stack traces in context window');
  console.log('   ❌ Avoid verbose debugging information');

  console.log('\n🤖 Agent Error Handling Strategy:');
  console.log('   1️⃣ Check tool response for success/failure');
  console.log('   2️⃣ If failure, extract error information');
  console.log('   3️⃣ Determine if retry is appropriate');
  console.log('   4️⃣ Explain error to user in simple terms');
  console.log('   5️⃣ Suggest alternatives or next steps');
  console.log('   6️⃣ Continue conversation without crashing');
}

async function main() {
  console.log('\n✨ Factor 9 demonstrates compact error handling for reliable agents');
  console.log('   - Tools fail gracefully with structured error responses');
  console.log('   - Error information is compacted into context window');
  console.log('   - Agents continue operating despite tool failures');
  console.log('   - Clear error classification (retryable vs permanent)');
  console.log('   - Conversation flow preserved through error scenarios\n');

  await demonstrateErrorHandling();
  await demonstrateBenefits();
  await demonstrateErrorPatterns();

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Factor 9 Demo Complete!');
  console.log(`${'='.repeat(60)}`);
  console.log('\n💡 Key Takeaways:');
  console.log('   ✅ Tools fail gracefully with compact error messages');
  console.log('   ✅ Error information integrated into agent context');
  console.log('   ✅ Conversation flow maintained through failures');
  console.log('   ✅ Clear error classification and recovery guidance');
  console.log('   ✅ Structured error responses enable smart handling');
  console.log('   ✅ No system crashes or context loss from errors');
}

main().catch(console.error);
