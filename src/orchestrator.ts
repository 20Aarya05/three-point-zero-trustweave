#!/usr/bin/env node

import { OrchestrationService } from './services/orchestrationService';
import { DatabaseService } from './services/database';

async function main() {
  console.log('🎯 TrustWeave Auto Orchestrator Starting...');
  
  const orchestrator = new OrchestrationService();
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbService = new DatabaseService();
    const dbHealthy = await dbService.healthCheck();
    
    if (dbHealthy) {
      console.log('✅ Database connection successful');
    } else {
      console.log('⚠️ Database connection failed - continuing with local mode');
    }

    // Start all services
    await orchestrator.startServices();
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await orchestrator.stopServices();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await orchestrator.stopServices();
      process.exit(0);
    });

    // Keep the process alive
    console.log('🎉 TrustWeave is running smoothly!');
    console.log('📱 Frontend: http://localhost:5173');
    console.log('🔧 Backend API: http://localhost:3001');
    console.log('📊 Health Status: http://localhost:3001/health');
    console.log('\nPress Ctrl+C to stop all services');

    // Status monitoring
    setInterval(() => {
      const status = orchestrator.getServiceStatus();
      const allHealthy = Object.values(status).every(Boolean);
      
      if (allHealthy) {
        console.log('💚 All services healthy');
      } else {
        console.log('⚠️ Service status:', status);
      }
    }, 60000); // Every minute

  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main();
}