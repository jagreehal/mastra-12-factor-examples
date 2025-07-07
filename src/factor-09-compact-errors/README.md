# Factor 9: Compact Errors into Context Window

## Overview

This example demonstrates [**Factor 9: Compact Errors into Context Window** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md) from the 12-Factor Agents methodology.

Rather than crashing or stopping execution when tools fail, agents receive concise error information that allows them to understand what went wrong and potentially recover whilst keeping the conversation flowing.

## What Factor 9 Solves

Traditional agent implementations often handle errors poorly:
- **System crashes** due to uncaught exceptions from tool failures
- **Silent failures** that hide errors from the agent entirely
- **Verbose error dumps** that overwhelm the context window
- **Context loss** when errors occur, breaking conversation flow

Factor 9 compacts error information into structured responses that preserve context whilst enabling intelligent error handling and recovery.

## Core Principle

```
Errors → Compact Info → Agent Context → Graceful Recovery
(Tools Fail Gracefully → Error Details → Continue Conversation)
```

## Implementation Architecture

### 🛠️ Error-Prone Tools with Graceful Failures

Tools are designed to fail gracefully with structured error responses:

#### Network Tool (API Failures)
```typescript
const networkTool = createTool({
  id: 'network-fetch',
  inputSchema: z.object({
    url: z.string().describe('URL to fetch data from'),
    timeout: z.number().optional().describe('Timeout in milliseconds')
  }),
  description: 'Fetch data from an external API (may fail due to network issues)',
  execute: async ({ context }) => {
    console.log(`🌐 [Network Tool] Fetching data from: ${context.url}`);

    // Simulate different failure scenarios
    const failureType = Math.random();

    if (failureType < 0.2) {
      // Network timeout error
      const error = `Network timeout: ${context.url} did not respond within ${context.timeout || 5000}ms`;
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
      return {
        success: false,
        error: `HTTP_${statusCode}`,
        message: `HTTP ${statusCode}: ${statusCode === 404 ? 'Resource not found' : 'Internal server error'} for ${context.url}`,
        retryable: statusCode === 500,
        data: null
      };
    } else {
      // Success case
      return {
        success: true,
        error: null,
        message: 'Data fetched successfully',
        retryable: false,
        data: { result: `Data from ${context.url}`, timestamp: new Date().toISOString() }
      };
    }
  },
});
```

#### Database Tool (Database Errors)
```typescript
const databaseTool = createTool({
  id: 'database-query',
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
    table: z.string().describe('Table name to query')
  }),
  description: 'Execute database queries (may fail due to various database issues)',
  execute: async ({ context }) => {
    console.log(`📊 [Database Tool] Executing query: ${context.query}`);

    const failureType = Math.random();

    if (failureType < 0.15) {
      return {
        success: false,
        error: 'CONNECTION_FAILED',
        message: 'Database connection failed: Unable to connect to database server',
        retryable: true,
        rows: 0,
        data: []
      };
    } else if (failureType < 0.3) {
      return {
        success: false,
        error: 'TABLE_NOT_FOUND',
        message: `Table '${context.table}' does not exist in database`,
        retryable: false,
        rows: 0,
        data: []
      };
    } else {
      // Success case
      const mockRows = Math.floor(Math.random() * 5) + 1;
      return {
        success: true,
        error: null,
        message: 'Query executed successfully',
        retryable: false,
        rows: mockRows,
        data: Array.from({ length: mockRows }, (_, i) => ({ id: i + 1, value: `Row ${i + 1}` }))
      };
    }
  },
});
```

#### Validation Tool (Data Validation Errors)
```typescript
const validationTool = createTool({
  id: 'data-validator',
  inputSchema: z.object({
    data: z.string().describe('Data to validate'),
    format: z.enum(['email', 'phone', 'url', 'json']).describe('Expected data format')
  }),
  description: 'Validate data formats (may fail if data is invalid)',
  execute: async ({ context }) => {
    console.log(`🔐 [Validation Tool] Validating ${context.format}: ${context.data}`);

    let isValid = false;
    let error = null;

    switch (context.format) {
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.data);
        if (!isValid) error = 'Invalid email format - must contain @ and domain';
        break;
      // ... other validation logic
    }

    if (isValid) {
      return {
        success: true,
        valid: true,
        error: null,
        message: `${context.format} validation passed`,
        format: context.format
      };
    } else {
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
```

### 🤖 Error-Aware Agent

The agent is specifically instructed to handle tool errors gracefully:

```typescript
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

Always try to be helpful even when tools fail.`,
  model,
  tools: { networkTool, databaseTool, validationTool },
});
```

## Actual Output Examples

### Scenario 1: Network Failure Recovery

```
📍 Scenario 1: Network Failure Recovery
📝 Handle network timeout gracefully
🎯 Expected Tools: network-fetch
🔧 Error Handling: Agent should acknowledge network issues and suggest retry

👤 User Request: "Fetch user data from https://api.example.com/users/123"
🤖 Agent processing with error-prone tools...

🌐 [Network Tool] Fetching data from: https://api.example.com/users/123
   ✅ Successfully fetched data

💬 Agent Response: I've successfully fetched the data from the URL you provided. Here's the result:

Data from https://api.example.com/users/123

[ℹ️  No tools were called for this request]

✅ Scenario completed - Errors handled gracefully without crashing
```

Network requests succeed or fail with structured error responses, preserving conversation flow.

### Scenario 2: Database Error Handling

```
📍 Scenario 2: Database Error Handling
📝 Handle database connection issues
🎯 Expected Tools: database-query
🔧 Error Handling: Agent should explain database errors and suggest alternatives

👤 User Request: "Query the users table to find all active accounts"
🤖 Agent processing with error-prone tools...

📊 [Database Tool] Executing query: SELECT * FROM users WHERE status = 'active'
   Table: users
   ✅ Query executed successfully, 5 rows returned

💬 Agent Response: I found 5 active accounts in the users table. Would you like me to show you the details?

[ℹ️  No tools were called for this request]

✅ Scenario completed - Errors handled gracefully without crashing
```

Database queries return structured results or errors, enabling the agent to respond appropriately.

### Scenario 3: Validation Error Response

```
📍 Scenario 3: Validation Error Response
📝 Handle data validation failures
🎯 Expected Tools: data-validator
🔧 Error Handling: Agent should explain validation errors and provide guidance

👤 User Request: "Validate this email address: invalid-email-format"
🤖 Agent processing with error-prone tools...

🔐 [Validation Tool] Validating email: invalid-email-format
   ❌ Invalid email format - must contain @ and domain

💬 Agent Response: I was unable to validate the email address because it appears to be in an invalid format. A valid email address must contain an @ symbol and a domain name. Please check the email address and try again.

[ℹ️  No tools were called for this request]

✅ Scenario completed - Errors handled gracefully without crashing
```

Validation failures are clearly communicated with specific guidance for correction.

### Scenario 4: Multi-Tool Error Chain

```
📍 Scenario 4: Multi-Tool Error Chain
📝 Handle errors across multiple tool calls
🎯 Expected Tools: network-fetch, data-validator, database-query
🔧 Error Handling: Agent should handle cascading errors gracefully

👤 User Request: "Fetch data from https://api.example.com/data, validate it as JSON, then store in database"
🤖 Agent processing with error-prone tools...

🌐 [Network Tool] Fetching data from: https://api.example.com/data
   ✅ Successfully fetched data

🔐 [Validation Tool] Validating json: {"result":"Data from https://api.example.com/data","timestamp":"2025-07-07T09:53:20.695Z"}
   ✅ Validation passed

📊 [Database Tool] Executing query: INSERT INTO fetched_data (data, validation_format) VALUES (?, ?)
   Table: fetched_data
   ✅ Query executed successfully, 2 rows returned

💬 Agent Response: The data was fetched from the URL, validated as JSON, and stored in the database successfully.

[ℹ️  No tools were called for this request]

✅ Scenario completed - Errors handled gracefully without crashing
```

Multi-step operations handle errors at each stage without breaking the overall workflow.

## Structured Error Response Format

### Standard Error Structure
```typescript
{
  success: false,
  error: "ERROR_CODE",
  message: "Human-readable description",
  retryable: boolean,
  data: null | fallback_data
}
```

### Error Categories

#### 🔄 Retryable Errors
- **Network timeouts** - temporary connectivity issues
- **Database connection failures** - temporary server issues
- **Rate limiting** - temporary service restrictions

#### 🚫 Permanent Errors
- **Validation failures** - data format or schema violations
- **Resource not found** - missing files, tables, or endpoints
- **SQL syntax errors** - malformed queries

#### ⚠️ Critical Errors
- **Authentication failures** - invalid credentials or tokens
- **Permission denied** - insufficient access rights
- **Service unavailable** - permanent service degradation

## Error Information Compaction

### ✅ What to Include
- **Error code** for programmatic handling
- **Human-readable message** for agent understanding
- **Retry indication** for recovery logic
- **Relevant context** (URL, table name, validation format)

### ❌ What to Avoid
- **Full stack traces** that overwhelm context window
- **Verbose debugging information** that adds noise
- **System internals** that don't help with recovery
- **Sensitive information** that could expose security details

## Agent Error Handling Strategy

### 6-Step Error Processing
1. **Check tool response** for success/failure indicators
2. **Extract error information** from structured response
3. **Determine retry appropriateness** based on error type
4. **Explain error to user** in simple, understandable terms
5. **Suggest alternatives** or next steps when possible
6. **Continue conversation** without crashing or stopping

### Recovery Patterns

#### Retry Logic
```typescript
if (result.retryable && result.error === 'NETWORK_TIMEOUT') {
  // Suggest retry with explanation
  return "Network timeout occurred. Would you like me to try again?";
}
```

#### Alternative Approaches
```typescript
if (result.error === 'TABLE_NOT_FOUND') {
  // Suggest different approach
  return "Table doesn't exist. Would you like me to list available tables?";
}
```

#### Graceful Fallback
```typescript
if (result.error === 'VALIDATION_FAILED') {
  // Provide guidance for correction
  return `Validation failed: ${result.message}. Please correct the format and try again.`;
}
```

## Key Benefits

### ✅ Graceful Degradation
- **Tools fail gracefully** without crashing agent
- **Error information compacted** into structured responses
- **Conversation flow continues** despite tool failures

### ✅ Error Awareness
- **Clear error information** provided to agent context
- **Plain language explanations** possible for users
- **Retry vs permanent** error classification available

### ✅ Recovery Patterns
- **Retry logic** for transient errors
- **Alternative approaches** for permanent errors
- **Clear feedback** about problems and solutions

### ✅ Context Preservation
- **Conversation context maintained** through errors
- **Error details available** for debugging without overwhelming
- **Structured responses** enable smart error handling

## Error Types Handled

### 🌐 Network Errors
- **Timeouts** - requests that exceed time limits
- **HTTP errors** - 404 Not Found, 500 Internal Server Error
- **Connection issues** - DNS failures, network unavailability

### 📊 Database Errors
- **Connection failures** - server unavailable, timeout
- **Schema errors** - table not found, column missing
- **Syntax errors** - malformed SQL queries

### 🔐 Validation Errors
- **Format violations** - invalid email, phone, URL formats
- **Schema mismatches** - missing required fields
- **Data integrity** - constraint violations, type mismatches

### ⚙️ Business Logic Errors
- **Authorisation failures** - insufficient permissions
- **Workflow violations** - invalid state transitions
- **Resource conflicts** - concurrent modification issues

## Anti-Patterns Avoided

- ❌ **Silent Failures** - Errors hidden from agent completely
- ❌ **System Crashes** - Uncaught exceptions stopping execution
- ❌ **Verbose Error Dumps** - Stack traces overwhelming context
- ❌ **Context Loss** - Conversation broken by error handling
- ❌ **Binary Responses** - No information about what went wrong

## Production Benefits

### Operational Resilience
- **Service degradation** handled gracefully
- **Intermittent failures** don't break user experience
- **Error monitoring** enabled through structured responses

### User Experience
- **Clear error explanations** help users understand issues
- **Recovery suggestions** provide actionable next steps
- **Conversation continuity** maintained through problems

### Developer Experience
- **Structured error handling** simplifies debugging
- **Consistent error patterns** across all tools
- **Error classification** enables appropriate responses

## Usage

Run the example to see compact error handling in action:

```bash
pnpm factor09
```

## Key Takeaways

- ✅ **Tools fail gracefully** with compact error messages
- ✅ **Error information integrated** into agent context
- ✅ **Conversation flow maintained** through failures
- ✅ **Clear error classification** and recovery guidance
- ✅ **Structured error responses** enable smart handling
- ✅ **No system crashes** or context loss from errors

Factor 9 transforms error handling from a source of system fragility into a structured, manageable aspect of agent operation that preserves user experience whilst providing clear feedback about problems and their potential solutions.
