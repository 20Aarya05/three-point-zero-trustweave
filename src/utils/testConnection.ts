import { DatabaseService } from '../services/database';

/**
 * Simple function to test Supabase connection
 * Can be called from anywhere in your application
 */
export async function testSupabaseConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
}> {
    try {
        console.log('Testing Supabase connection...');

        const dbService = new DatabaseService();
        const isHealthy = await dbService.healthCheck();

        if (isHealthy) {
            return {
                success: true,
                message: 'Supabase connection successful!'
            };
        } else {
            return {
                success: false,
                message: 'Supabase connection failed - health check returned false'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'Supabase connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Test connection and log results
 */
export async function logConnectionTest(): Promise<boolean> {
    const result = await testSupabaseConnection();

    if (result.success) {
        console.log('✅', result.message);
    } else {
        console.log('❌', result.message);
        if (result.details) {
            console.log('   Details:', result.details);
        }
    }

    return result.success;
}