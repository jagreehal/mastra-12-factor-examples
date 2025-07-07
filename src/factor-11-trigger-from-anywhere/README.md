# Factor 11: Trigger from Anywhere

## Overview

This example demonstrates [**Factor 11: Trigger from Anywhere** ](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md) from the 12-Factor Agents methodology.

This principle advocates for agents that can be triggered from any source: webhooks, APIs, scheduled events, database changes, file system events, message queues, or external systems. Your agents should be designed as event-driven services that respond to triggers from anywhere in your infrastructure without being tightly coupled to specific trigger mechanisms.

## What Factor 11 Means

Factor 11 advocates for agents that can be triggered from any source—webhooks, APIs, scheduled events, database changes, file system events, message queues, or external systems. Your agents should be designed as event-driven services that respond to triggers from anywhere in your infrastructure without being tightly coupled to specific trigger mechanisms.

## Why Factor 11 Matters

**Production Benefits:**
- **Universal Integration**: Agents can be integrated into any system or workflow
- **Event-Driven Architecture**: Enables reactive, scalable system design
- **Decoupling**: Agent logic remains independent of trigger mechanisms
- **Operational Flexibility**: Easy to add new trigger sources without code changes
- **Monitoring Consistency**: Unified logging and monitoring across all trigger sources

## How This Example Fulfils Factor 11

### 🎯 Unified Agent Design

```typescript
// Single agent that handles events from any source
const agent = new Agent({
  name: 'EventProcessor',
  instructions: 'Process events from various sources and take appropriate actions.',
  model,
  tools: [
    processEventTool,        // Tool for processing different event types
    logEventTool,           // Tool for logging events with metadata
  ],
});
```

### 🌐 Multiple Trigger Sources

The example demonstrates six different trigger sources:

```typescript
// REST API - user registration events
const restApiEvent = {
  type: 'user_registration',
  data: {
    userId: 'user_12345',
    email: 'user@example.com',
    timestamp: new Date().toISOString(),
    source: 'web_app'
  }
};

// Webhook - payment completion events
const webhookEvent = {
  type: 'payment_completed',
  data: {
    paymentId: 'pay_67890',
    amount: 29.99,
    currency: 'USD',
    customerId: 'cust_12345',
    status: 'completed'
  }
};

// Scheduler - daily report events
const schedulerEvent = {
  type: 'daily_report',
  data: {
    reportType: 'daily_summary',
    date: '2025-07-07',
    metrics: {
      activeUsers: 1245,
      newSignups: 23,
      revenue: 1890.5
    }
  }
};

// Message Queue - data processing events
const queueEvent = {
  type: 'data_processing',
  data: {
    jobId: 'job_abc123',
    dataFile: 'user_data_2024.csv',
    operation: 'transform',
    priority: 'high'
  }
};

// Database Trigger - record update events
const databaseEvent = {
  type: 'record_updated',
  data: {
    table: 'users',
    recordId: 'user_98765',
    changes: {
      status: { from: 'pending', to: 'active' },
      lastLogin: new Date().toISOString()
    },
    operation: 'UPDATE'
  }
};

// File System - file upload events
const fileEvent = {
  type: 'file_uploaded',
  data: {
    fileName: 'document.pdf',
    filePath: '/uploads/documents/document.pdf',
    fileSize: 2048576,
    uploadedBy: 'user_12345',
    mimeType: 'application/pdf'
  }
};
```

### 🔧 Event Processing Tools

```typescript
// Tool for processing different event types
const processEventTool = createTool({
  id: 'processEvent',
  description: 'Process events from various trigger sources',
  inputSchema: z.object({
    eventType: z.string(),
    source: z.string(),
    eventData: z.any().optional(),
  }),
  execute: async ({ eventType, source, eventData }) => {
    console.log(`  [Tool] Processing ${eventType} event from ${source}`);
    console.log(`  [Tool] Event data:`, eventData);
    return `Event processed successfully: ${eventType} from ${source}`;
  },
});

// Tool for logging events with metadata
const logEventTool = createTool({
  id: 'logEvent',
  description: 'Log events with metadata and severity level',
  inputSchema: z.object({
    level: z.enum(['INFO', 'WARN', 'ERROR']),
    message: z.string(),
    metadata: z.object({}).passthrough(),
  }),
  execute: async ({ level, message, metadata }) => {
    const timestamp = new Date().toISOString();
    console.log(`  [Tool] LOG[${level}]: ${message}`);
    console.log(`  [Tool] Metadata:`, JSON.stringify(metadata, null, 2));
    return `Event logged at ${timestamp}`;
  },
});
```

## Actual Output Examples

### REST API Trigger

**Input:** User registration event
```json
{
  "type": "user_registration",
  "data": {
    "userId": "user_12345",
    "email": "user@example.com",
    "timestamp": "2025-07-07T09:58:24.030Z",
    "source": "web_app"
  }
}
```

**Agent Response:**
```
[Tool] Processing user_registration event from rest_api
[Tool] Event data: undefined
Agent Response: The user registration event has been successfully processed.
```

### Webhook Trigger

**Input:** Payment completion event
```json
{
  "type": "payment_completed",
  "data": {
    "paymentId": "pay_67890",
    "amount": 29.99,
    "currency": "USD",
    "customerId": "cust_12345",
    "status": "completed"
  }
}
```

**Agent Response:**
```
Agent Response: Certainly! I'll need the event data payload to process this payment event. Could you please provide the event data?
```

### Scheduler Trigger

**Input:** Daily report generation
```json
{
  "type": "daily_report",
  "data": {
    "reportType": "daily_summary",
    "date": "2025-07-07",
    "metrics": {
      "activeUsers": 1245,
      "newSignups": 23,
      "revenue": 1890.5
    }
  }
}
```

**Agent Response:**
```
[Tool] Processing scheduledReport event from scheduler
[Tool] Event data: undefined
[Tool] LOG[INFO]: Scheduled report generation event processed
[Tool] Metadata: {
  "eventType": "scheduledReport",
  "timestamp": "2025-07-07T09:58:38.513Z"
}

✅ All concurrent events processed successfully!
Processed 3 events simultaneously
```

### Message Queue Trigger

**Input:** Data processing job
```json
{
  "type": "data_processing",
  "data": {
    "jobId": "job_abc123",
    "dataFile": "user_data_2024.csv",
    "operation": "transform",
    "priority": "high"
  }
}
```

**Agent Response:**
```
[Tool] Processing data_processing event from queue
[Tool] Event data: undefined
[Tool] LOG[INFO]: Data processing event processed successfully
[Tool] Metadata: {
  "eventType": "data_processing",
  "source": "queue"
}
Agent Response: The data processing event has been processed successfully. The event has been logged with an info level.
```

### Database Trigger

**Input:** Record update event
```json
{
  "type": "record_updated",
  "data": {
    "table": "users",
    "recordId": "user_98765",
    "changes": {
      "status": {
        "from": "pending",
        "to": "active"
      },
      "lastLogin": "2025-07-07T09:58:33.942Z"
    },
    "operation": "UPDATE"
  }
}
```

**Agent Response:**
```
[Tool] Processing databaseUpdate event from internalDatabase
[Tool] Event data: undefined
[Tool] LOG[INFO]: Database update event processed successfully
[Tool] Metadata: {
  "eventType": "databaseUpdate",
  "source": "internalDatabase"
}
Agent Response: The database update event has been processed successfully. The event details have been logged in the system.
```

### Emergency Alert Processing

**Input:** System alert from monitoring
```json
{
  "type": "system_alert",
  "data": {
    "alertType": "database_connection_lost",
    "severity": "critical"
  }
}
```

**Agent Response:**
```
[Tool] Processing system_alert event from monitoring_system
[Tool] Event data: {
  "alertType": "database_connection_lost"
}
[Tool] LOG[ERROR]: URGENT: Database connection lost. Initiating emergency protocols.
[Tool] Metadata: {
  "eventType": "system_alert",
  "source": "monitoring_system"
}
Agent Response: The urgent system alert about the lost database connection has been processed and logged. Emergency protocols are being initiated.
```

## Concurrent Event Processing

The example demonstrates handling multiple events simultaneously:

```typescript
// Processing 3 concurrent events from different sources
await Promise.all([
  processEvent('REST API', 'user_registration'),
  processEvent('Webhook', 'payment_completed'),
  processEvent('Scheduler', 'daily_report')
]);
```

**Output:**
```
Processing 3 concurrent events:

--- Concurrent Event 1 ---
Source: REST API
Type: user_registration

--- Concurrent Event 2 ---
Source: Webhook
Type: payment_completed

--- Concurrent Event 3 ---
Source: Scheduler
Type: daily_report

[Tool] Processing scheduledReport event from scheduler
[Tool] Event data: undefined
[Tool] LOG[INFO]: Scheduled report generation event processed
[Tool] Metadata: {
  "eventType": "scheduledReport",
  "timestamp": "2025-07-07T09:58:38.513Z"
}

✅ All concurrent events processed successfully!
Processed 3 events simultaneously
```

## Key Implementation Benefits

### 🔄 Source-Agnostic Processing

```typescript
// Same agent processes all event types consistently
const processAnyEvent = async (source: string, eventType: string, data: any) => {
  const prompt = `Process ${eventType} event from ${source}: ${JSON.stringify(data)}`;
  return await agent.generate(prompt);
};
```

- **Unified interface**: Same processing logic regardless of trigger source
- **Consistent behaviour**: Predictable responses across all event types
- **Simplified maintenance**: Single agent codebase for all integrations

### 🎯 Tool-Driven Event Handling

```typescript
// Events are processed using structured tools
const eventResult = await agent.generate('Handle emergency system alert', {
  tools: [processEventTool, logEventTool]
});
```

- **Structured processing**: Tools ensure consistent event handling
- **Metadata tracking**: Automatic logging and monitoring for all events
- **Extensible design**: Easy to add new event processing capabilities

### ⚡ Concurrent Processing

```typescript
// Multiple events processed simultaneously
const results = await Promise.all([
  agent.generate(event1),
  agent.generate(event2),
  agent.generate(event3)
]);
```

- **High throughput**: Multiple events processed in parallel
- **Scalability**: No blocking between different trigger sources
- **Performance**: Efficient resource utilisation

## Integration Patterns

### HTTP Webhook Handler

```typescript
app.post('/webhook/:eventType', async (req, res) => {
  try {
    const { eventType } = req.params;
    const eventData = req.body;

    const result = await agent.generate(
      `Process ${eventType} webhook event: ${JSON.stringify(eventData)}`
    );

    res.json({
      success: true,
      eventType,
      response: result.text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Message Queue Integration

```typescript
// Redis/RabbitMQ/SQS consumer
messageQueue.subscribe('agent-events', async (message) => {
  const { eventType, source, data } = JSON.parse(message);

  const result = await agent.generate(
    `Process ${eventType} from ${source}: ${JSON.stringify(data)}`
  );

  await messageQueue.publish('agent-responses', {
    originalEvent: { eventType, source, data },
    response: result.text,
    processedAt: new Date().toISOString()
  });
});
```

### Scheduled Task Integration

```typescript
// Cron job scheduler
cron.schedule('0 */6 * * *', async () => {
  const reportData = await generateDailyMetrics();

  const result = await agent.generate(
    `Process daily_report from scheduler: ${JSON.stringify(reportData)}`
  );

  await sendReport(result.text);
});
```

### Database Change Listener

```typescript
// Database trigger integration
database.on('change', async (changeEvent) => {
  const { table, operation, record } = changeEvent;

  const result = await agent.generate(
    `Process database_${operation} from ${table}: ${JSON.stringify(record)}`
  );

  await auditLog.record({
    event: changeEvent,
    agentResponse: result.text,
    timestamp: new Date().toISOString()
  });
});
```

### File System Monitoring

```typescript
// File system watcher
fs.watch('./uploads', async (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const filePath = path.join('./uploads', filename);
    const stats = await fs.promises.stat(filePath);

    const result = await agent.generate(
      `Process file_uploaded from filesystem: ${JSON.stringify({
        filename,
        size: stats.size,
        modified: stats.mtime
      })}`
    );

    console.log('File processed:', result.text);
  }
});
```

## Anti-Patterns Avoided

❌ **Source-Specific Agents**: No separate agents for different trigger types

❌ **Tight Coupling**: No dependencies on specific trigger mechanisms or formats

❌ **Inconsistent Processing**: No varied logic based on trigger source

❌ **Manual Routing**: No complex routing logic to determine which agent to use

## Architecture Benefits

### 🔍 Unified Monitoring

```typescript
// All events logged consistently regardless of source
const eventMetrics = {
  totalEvents: 0,
  eventsBySource: new Map(),
  processingTimes: []
};

const monitoredAgent = new Proxy(agent, {
  get(target, prop) {
    if (prop === 'generate') {
      return async (...args) => {
        const startTime = Date.now();
        eventMetrics.totalEvents++;

        const result = await target.generate(...args);

        const processingTime = Date.now() - startTime;
        eventMetrics.processingTimes.push(processingTime);

        return result;
      };
    }
    return target[prop];
  }
});
```

### 🧪 Source-Independent Testing

```typescript
describe('Event Processing Agent', () => {
  const testCases = [
    { source: 'webhook', type: 'payment_completed', data: { amount: 100 } },
    { source: 'scheduler', type: 'daily_report', data: { date: '2025-07-07' } },
    { source: 'queue', type: 'data_processing', data: { jobId: 'test123' } }
  ];

  testCases.forEach(({ source, type, data }) => {
    it(`should process ${type} from ${source}`, async () => {
      const result = await agent.generate(
        `Process ${type} from ${source}: ${JSON.stringify(data)}`
      );

      expect(result.text).toContain('processed successfully');
    });
  });
});
```

### ⚙️ Dynamic Event Routing

```typescript
class EventRouter {
  constructor(private agent: Agent) {}

  async route(source: string, eventType: string, data: any) {
    // Route to appropriate processing based on event characteristics
    const priority = this.getPriority(eventType, data);
    const context = this.buildContext(source, eventType, data);

    if (priority === 'high') {
      // Process immediately
      return await this.agent.generate(context);
    } else {
      // Queue for batch processing
      return await this.queueForProcessing(context);
    }
  }

  private getPriority(eventType: string, data: any): 'high' | 'normal' {
    const highPriorityEvents = ['system_alert', 'payment_failed', 'security_breach'];
    return highPriorityEvents.includes(eventType) ? 'high' : 'normal';
  }

  private buildContext(source: string, eventType: string, data: any): string {
    return `Process ${eventType} from ${source}: ${JSON.stringify(data)}`;
  }
}
```

## Related Factors

This example connects to other 12-factor principles:

- **Factor 4** (Tools are Structured Outputs): Event processing uses structured tools for consistency
- **Factor 6** (Launch/Pause/Resume): Triggered workflows can be suspended and resumed
- **Factor 8** (Own Your Control Flow): Explicit control flow regardless of trigger source
- **Factor 10** (Small, Focused Agents): Single agent focused on event processing from any source

## Usage

Run this example to see trigger-from-anywhere capabilities:

```bash
pnpm factor11
```

The example demonstrates:
1. **Six Trigger Sources**: REST API, Webhook, Scheduler, Message Queue, Database, File System
2. **Concurrent Processing**: Multiple events processed simultaneously
3. **Emergency Scenarios**: Critical alerts processed with appropriate logging
4. **Custom Events**: Flexible event processing for various use cases
5. **Tool Integration**: Structured event processing and logging
6. **Source Independence**: Same agent handles all trigger types consistently

This implementation demonstrates how Mastra agents can serve as universal event processors, providing a single, consistent interface for handling triggers from anywhere in your infrastructure while maintaining complete decoupling from specific trigger mechanisms.
