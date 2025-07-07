// See: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { model } from '../model';

console.log('Factor 11: Trigger from Anywhere');
console.log('================================================');
console.log('Demonstration: Agents can be triggered from multiple sources');
console.log('Key principle: Agents should be accessible via APIs, webhooks, schedulers, and other triggers');
console.log('Reference: https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md');
console.log('');

// Tools for event processing
const processEventTool = createTool({
  id: 'processEvent',
  inputSchema: z.object({
    eventType: z.string().describe('Type of event to process'),
    eventData: z.unknown().describe('Event data payload'),
    source: z.string().describe('Source of the event'),
  }),
  description: 'Process an incoming event',
  execute: async ({ context }) => {
    console.log(`  [Tool] Processing ${context.eventType} event from ${context.source}`);
    console.log(`  [Tool] Event data:`, JSON.stringify(context.eventData, null, 2));
    return {
      processed: true,
      eventType: context.eventType,
      timestamp: new Date().toISOString(),
      source: context.source
    };
  },
});

const logEventTool = createTool({
  id: 'logEvent',
  inputSchema: z.object({
    message: z.string().describe('Log message'),
    level: z.enum(['info', 'warning', 'error']).describe('Log level'),
    metadata: z.unknown().optional().describe('Additional metadata'),
  }),
  description: 'Log event processing information',
  execute: async ({ context }) => {
    console.log(`  [Tool] LOG[${context.level.toUpperCase()}]: ${context.message}`);
    if (context.metadata) {
      console.log(`  [Tool] Metadata:`, JSON.stringify(context.metadata, null, 2));
    }
    return { logged: true, level: context.level, timestamp: new Date().toISOString() };
  },
});

// Event processing agent
const eventProcessorAgent = new Agent({
  name: 'EventProcessor',
  instructions: `You are an event processing agent that handles events from various sources.

Your responsibilities:
1. Process incoming events using the processEvent tool
2. Log important information using the logEvent tool
3. Provide appropriate responses based on event type
4. Handle different event sources appropriately

Always process events systematically and provide clear status updates.`,
  model,
  tools: { processEventTool, logEventTool },
});

// Simulate different trigger sources
interface TriggerSource {
  name: string;
  description: string;
  simulateEvent(): Promise<{
    eventType: string;
    eventData: unknown;
    source: string;
    prompt: string;
  }>;
}

// API trigger simulation
const apiTrigger: TriggerSource = {
  name: 'REST API',
  description: 'HTTP POST request to /api/events',
  async simulateEvent() {
    return {
      eventType: 'user_registration',
      eventData: {
        userId: 'user_12345',
        email: 'user@example.com',
        timestamp: new Date().toISOString(),
        source: 'web_app'
      },
      source: 'REST API',
      prompt: 'A new user has registered via the REST API. Please process this user registration event.'
    };
  }
};

// Webhook trigger simulation
const webhookTrigger: TriggerSource = {
  name: 'Webhook',
  description: 'Incoming webhook from external service',
  async simulateEvent() {
    return {
      eventType: 'payment_completed',
      eventData: {
        paymentId: 'pay_67890',
        amount: 29.99,
        currency: 'USD',
        customerId: 'cust_12345',
        status: 'completed'
      },
      source: 'Webhook',
      prompt: 'A payment has been completed and sent via webhook. Please process this payment event.'
    };
  }
};

// Scheduler trigger simulation
const schedulerTrigger: TriggerSource = {
  name: 'Scheduler',
  description: 'Scheduled task execution',
  async simulateEvent() {
    return {
      eventType: 'daily_report',
      eventData: {
        reportType: 'daily_summary',
        date: new Date().toISOString().split('T')[0],
        metrics: {
          activeUsers: 1245,
          newSignups: 23,
          revenue: 1890.5
        }
      },
      source: 'Scheduler',
      prompt: 'It\'s time to generate the daily report. Please process this scheduled report generation event.'
    };
  }
};

// Message queue trigger simulation
const queueTrigger: TriggerSource = {
  name: 'Message Queue',
  description: 'Message from queue system',
  async simulateEvent() {
    return {
      eventType: 'data_processing',
      eventData: {
        jobId: 'job_abc123',
        dataFile: 'user_data_2024.csv',
        operation: 'transform',
        priority: 'high'
      },
      source: 'Message Queue',
      prompt: 'A data processing job has been queued. Please process this data processing event.'
    };
  }
};

// Database trigger simulation
const dbTrigger: TriggerSource = {
  name: 'Database Trigger',
  description: 'Database change event',
  async simulateEvent() {
    return {
      eventType: 'record_updated',
      eventData: {
        table: 'users',
        recordId: 'user_98765',
        changes: {
          status: { from: 'pending', to: 'active' },
          lastLogin: new Date().toISOString()
        },
        operation: 'UPDATE'
      },
      source: 'Database Trigger',
      prompt: 'A database record has been updated. Please process this database change event.'
    };
  }
};

// File system trigger simulation
const fileTrigger: TriggerSource = {
  name: 'File System',
  description: 'File system change event',
  async simulateEvent() {
    return {
      eventType: 'file_uploaded',
      eventData: {
        fileName: 'document.pdf',
        filePath: '/uploads/documents/document.pdf',
        fileSize: 2_048_576,
        uploadedBy: 'user_12345',
        mimeType: 'application/pdf'
      },
      source: 'File System',
      prompt: 'A new file has been uploaded to the system. Please process this file upload event.'
    };
  }
};

// Function to trigger agent from a specific source
async function triggerAgentFromSource(source: TriggerSource): Promise<void> {
  console.log(`\n🔥 Triggering agent from: ${source.name}`);
  console.log(`Description: ${source.description}`);
  console.log('---');

  try {
    // Simulate the event
    const event = await source.simulateEvent();

    console.log(`Event Type: ${event.eventType}`);
    console.log(`Event Data:`, JSON.stringify(event.eventData, null, 2));

    // Trigger the agent
    const result = await eventProcessorAgent.generate(event.prompt);

    console.log(`Agent Response: ${result.text}`);

    // Log tool usage
    if (result.toolResults && result.toolResults.length > 0) {
      console.log(`Tools used: ${result.toolResults.map(tr => tr.toolName).join(', ')}`);
    }

  } catch (error) {
    console.error(`Error processing event from ${source.name}:`, error instanceof Error ? error.message : error);
  }
}

// Demonstrate various trigger sources
async function demonstrateVariousTriggers(): Promise<void> {
  console.log('\n🎯 DEMONSTRATION: Various Trigger Sources');
  console.log('=========================================');

  const triggers = [
    apiTrigger,
    webhookTrigger,
    schedulerTrigger,
    queueTrigger,
    dbTrigger,
    fileTrigger
  ];

  for (const trigger of triggers) {
    await triggerAgentFromSource(trigger);
  }
}

// Demonstrate concurrent triggers
async function demonstrateConcurrentTriggers(): Promise<void> {
  console.log('\n⚡ DEMONSTRATION: Concurrent Triggers');
  console.log('====================================');
  console.log('Simulating multiple events arriving simultaneously...');

  const concurrentEvents = [
    apiTrigger.simulateEvent(),
    webhookTrigger.simulateEvent(),
    schedulerTrigger.simulateEvent()
  ];

  try {
    const events = await Promise.all(concurrentEvents);

    console.log(`\nProcessing ${events.length} concurrent events:`);

    // Process all events concurrently
    const processingPromises = events.map(async (event, index) => {
      console.log(`\n--- Concurrent Event ${index + 1} ---`);
      console.log(`Source: ${event.source}`);
      console.log(`Type: ${event.eventType}`);

      const result = await eventProcessorAgent.generate(event.prompt);
      return {
        event,
        result: result.text,
        toolResults: result.toolResults
      };
    });

    const results = await Promise.all(processingPromises);

    console.log('\n✅ All concurrent events processed successfully!');
    console.log(`Processed ${results.length} events simultaneously`);

  } catch (error) {
    console.error('Error processing concurrent events:', error instanceof Error ? error.message : error);
  }
}

// Demonstrate trigger flexibility
async function demonstrateTriggerFlexibility(): Promise<void> {
  console.log('\n🔄 DEMONSTRATION: Trigger Flexibility');
  console.log('====================================');

  // Custom trigger scenarios
  const customScenarios = [
    {
      name: 'Emergency Alert',
      eventType: 'system_alert',
      eventData: { severity: 'high', message: 'Database connection lost' },
      source: 'Monitoring System',
      prompt: 'URGENT: System alert detected. Database connection has been lost. Please handle this emergency event.'
    },
    {
      name: 'User Feedback',
      eventType: 'feedback_received',
      eventData: { rating: 5, comment: 'Great service!', userId: 'user_789' },
      source: 'Feedback Widget',
      prompt: 'New user feedback has been received. Please process this feedback event.'
    },
    {
      name: 'Batch Job Complete',
      eventType: 'batch_complete',
      eventData: { jobId: 'batch_001', recordsProcessed: 10_000, duration: '2h 15m' },
      source: 'Batch Processor',
      prompt: 'A batch processing job has completed. Please process this batch completion event.'
    }
  ];

  for (const scenario of customScenarios) {
    console.log(`\n🔧 Custom Scenario: ${scenario.name}`);
    console.log(`Source: ${scenario.source}`);
    console.log(`Event Type: ${scenario.eventType}`);

    try {
      const result = await eventProcessorAgent.generate(scenario.prompt);
      console.log(`Agent Response: ${result.text}`);

      if (result.toolResults && result.toolResults.length > 0) {
        console.log(`Tools used: ${result.toolResults.map(tr => tr.toolName).join(', ')}`);
      }

    } catch (error) {
      console.error(`Error in scenario ${scenario.name}:`, error instanceof Error ? error.message : error);
    }
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    await demonstrateVariousTriggers();
    await demonstrateConcurrentTriggers();
    await demonstrateTriggerFlexibility();

    console.log('\n✅ FACTOR 11 DEMONSTRATION COMPLETE');
    console.log('=================================');
    console.log('Key Takeaways:');
    console.log('1. Agents can be triggered from multiple sources simultaneously');
    console.log('2. Same agent handles different event types consistently');
    console.log('3. Concurrent processing enables high throughput');
    console.log('4. Flexible event structure accommodates various use cases');
    console.log('5. Consistent API makes integration simple');
    console.log('6. Event-driven architecture supports scalability');

  } catch (error) {
    console.error('Demo failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

main().catch(console.error);
