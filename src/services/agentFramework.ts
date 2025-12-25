/**
 * AGENT DEVELOPMENT KIT (ADK)
 * Framework for building intelligent agents with proper agent patterns
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Base Agent Interface
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  process(input: any): Promise<any>;
  getStatus(): AgentStatus;
}

export interface AgentStatus {
  id: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  lastActivity: Date;
  processedTasks: number;
  errorCount: number;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast' | 'error';
  payload: any;
  timestamp: Date;
  messageId: string;
}

// Base Agent Class with ADK patterns
export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly role: string;
  public readonly capabilities: string[];
  
  protected status: AgentStatus;
  protected model: any;
  protected messageHistory: AgentMessage[] = [];

  constructor(id: string, name: string, role: string, capabilities: string[]) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.capabilities = capabilities;
    
    this.status = {
      id,
      status: 'idle',
      lastActivity: new Date(),
      processedTasks: 0,
      errorCount: 0
    };

    // Initialize AI model
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  // Abstract method that each agent must implement
  abstract process(input: any): Promise<any>;

  // Agent communication methods
  protected async sendMessage(to: string, type: AgentMessage['type'], payload: any): Promise<void> {
    const message: AgentMessage = {
      from: this.id,
      to,
      type,
      payload,
      timestamp: new Date(),
      messageId: `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.messageHistory.push(message);
    console.log(`📨 Agent ${this.id} → ${to}: ${type}`, payload);
  }

  protected async receiveMessage(message: AgentMessage): Promise<void> {
    this.messageHistory.push(message);
    this.updateStatus('active');
    console.log(`📬 Agent ${this.id} ← ${message.from}: ${message.type}`);
  }

  // Agent lifecycle methods
  protected updateStatus(status: AgentStatus['status']): void {
    this.status.status = status;
    this.status.lastActivity = new Date();
    
    if (status === 'error') {
      this.status.errorCount++;
    }
  }

  protected incrementTaskCount(): void {
    this.status.processedTasks++;
  }

  // AI reasoning with agent context
  protected async reason(prompt: string, context?: any): Promise<any> {
    try {
      this.updateStatus('active');
      
      const agentPrompt = `
You are ${this.name}, an AI agent with the role: ${this.role}

Your capabilities include:
${this.capabilities.map(cap => `- ${cap}`).join('\n')}

Agent Context:
- Agent ID: ${this.id}
- Tasks Processed: ${this.status.processedTasks}
- Current Status: ${this.status.status}

${context ? `Additional Context:\n${JSON.stringify(context, null, 2)}` : ''}

Task:
${prompt}

Respond as this specialized agent, using your role and capabilities to provide the best possible response.
`;

      const result = await this.model.generateContent(agentPrompt);
      const response = result.response.text();
      
      this.incrementTaskCount();
      this.updateStatus('idle');
      
      return response;
    } catch (error) {
      this.updateStatus('error');
      console.error(`❌ Agent ${this.id} reasoning failed:`, error);
      throw error;
    }
  }

  // Public methods
  public getStatus(): AgentStatus {
    return { ...this.status };
  }

  public getMessageHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.reason('Perform a simple health check. Respond with "OK" if functioning properly.');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Agent Registry for managing multiple agents
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private messageQueue: AgentMessage[] = [];

  public registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    console.log(`🤖 Registered agent: ${agent.name} (${agent.id})`);
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public async routeMessage(message: AgentMessage): Promise<void> {
    const targetAgent = this.agents.get(message.to);
    if (targetAgent && 'receiveMessage' in targetAgent) {
      await (targetAgent as any).receiveMessage(message);
    } else {
      console.warn(`⚠️ Agent ${message.to} not found for message routing`);
    }
  }

  public async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [id, agent] of this.agents) {
      try {
        results[id] = await agent.healthCheck();
      } catch (error) {
        results[id] = false;
      }
    }
    
    return results;
  }

  public getSystemStatus(): {
    totalAgents: number;
    activeAgents: number;
    errorAgents: number;
    totalTasksProcessed: number;
  } {
    const statuses = Array.from(this.agents.values()).map(agent => agent.getStatus());
    
    return {
      totalAgents: statuses.length,
      activeAgents: statuses.filter(s => s.status === 'active').length,
      errorAgents: statuses.filter(s => s.status === 'error').length,
      totalTasksProcessed: statuses.reduce((sum, s) => sum + s.processedTasks, 0)
    };
  }
}

// Global agent registry instance
export const agentRegistry = new AgentRegistry();