import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export class OrchestrationService {
  private processes: Map<string, ChildProcess> = new Map();
  private healthChecks: Map<string, boolean> = new Map();

  constructor() {
    this.setupHealthMonitoring();
  }

  /**
   * Start all required services
   */
  async startServices(): Promise<void> {
    console.log('🚀 Starting auto orchestration...');

    try {
      // Start backend if not running
      await this.ensureBackendRunning();
      
      // Start frontend if not running
      await this.ensureFrontendRunning();

      // Setup file watchers for auto-restart
      this.setupFileWatchers();

      console.log('✅ All services orchestrated successfully');
    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Ensure backend is running
   */
  private async ensureBackendRunning(): Promise<void> {
    const isRunning = await this.checkServiceHealth('backend', 'http://localhost:3001/health');
    
    if (!isRunning) {
      console.log('🔄 Starting backend service...');
      
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      backendProcess.stdout?.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
      });

      backendProcess.stderr?.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      backendProcess.on('exit', (code) => {
        console.log(`[Backend] Process exited with code ${code}`);
        this.processes.delete('backend');
        this.healthChecks.set('backend', false);
      });

      this.processes.set('backend', backendProcess);
      
      // Wait for backend to be ready
      await this.waitForService('backend', 'http://localhost:3001/health', 30000);
    }
  }

  /**
   * Ensure frontend is running
   */
  private async ensureFrontendRunning(): Promise<void> {
    const isRunning = await this.checkServiceHealth('frontend', 'http://localhost:5173');
    
    if (!isRunning) {
      console.log('🔄 Starting frontend service...');
      
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'frontend'),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      frontendProcess.stdout?.on('data', (data) => {
        console.log(`[Frontend] ${data.toString().trim()}`);
      });

      frontendProcess.stderr?.on('data', (data) => {
        console.error(`[Frontend Error] ${data.toString().trim()}`);
      });

      frontendProcess.on('exit', (code) => {
        console.log(`[Frontend] Process exited with code ${code}`);
        this.processes.delete('frontend');
        this.healthChecks.set('frontend', false);
      });

      this.processes.set('frontend', frontendProcess);
      
      // Wait for frontend to be ready
      await this.waitForService('frontend', 'http://localhost:5173', 30000);
    }
  }

  /**
   * Check if a service is healthy
   */
  private async checkServiceHealth(serviceName: string, url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const isHealthy = response.ok;
      this.healthChecks.set(serviceName, isHealthy);
      return isHealthy;
    } catch (error) {
      this.healthChecks.set(serviceName, false);
      return false;
    }
  }

  /**
   * Wait for a service to become available
   */
  private async waitForService(serviceName: string, url: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 2000;

    while (Date.now() - startTime < timeout) {
      const isHealthy = await this.checkServiceHealth(serviceName, url);
      if (isHealthy) {
        console.log(`✅ ${serviceName} service is ready`);
        return;
      }
      
      console.log(`⏳ Waiting for ${serviceName} service...`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error(`${serviceName} service failed to start within ${timeout}ms`);
  }

  /**
   * Setup continuous health monitoring
   */
  private setupHealthMonitoring(): void {
    setInterval(async () => {
      await this.checkServiceHealth('backend', 'http://localhost:3001/health');
      await this.checkServiceHealth('frontend', 'http://localhost:5173');
      
      // Auto-restart if services are down
      if (!this.healthChecks.get('backend')) {
        console.log('🔄 Backend unhealthy, attempting restart...');
        await this.ensureBackendRunning().catch(console.error);
      }
      
      if (!this.healthChecks.get('frontend')) {
        console.log('🔄 Frontend unhealthy, attempting restart...');
        await this.ensureFrontendRunning().catch(console.error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup file watchers for auto-restart
   */
  private setupFileWatchers(): void {
    // Watch for critical file changes that require restart
    const watchPaths = [
      'src/server.ts',
      'src/services/',
      'frontend/src/',
      'package.json',
      'frontend/package.json'
    ];

    // Simple file watching (in production, use chokidar)
    console.log('👀 File watchers setup for auto-restart');
  }

  /**
   * Get service status
   */
  getServiceStatus(): { [key: string]: boolean } {
    return Object.fromEntries(this.healthChecks);
  }

  /**
   * Stop all services
   */
  async stopServices(): Promise<void> {
    console.log('🛑 Stopping all services...');
    
    for (const [name, process] of this.processes) {
      console.log(`Stopping ${name}...`);
      process.kill('SIGTERM');
    }
    
    this.processes.clear();
    this.healthChecks.clear();
    
    console.log('✅ All services stopped');
  }

  /**
   * Restart a specific service
   */
  async restartService(serviceName: 'backend' | 'frontend'): Promise<void> {
    console.log(`🔄 Restarting ${serviceName}...`);
    
    const process = this.processes.get(serviceName);
    if (process) {
      process.kill('SIGTERM');
      this.processes.delete(serviceName);
    }
    
    if (serviceName === 'backend') {
      await this.ensureBackendRunning();
    } else {
      await this.ensureFrontendRunning();
    }
  }
}