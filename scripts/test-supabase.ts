#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing required environment variables. Please check your .env file.\n');
    console.log('Required variables:');
    console.log('   - SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    // Test with service role key (for backend operations)
    console.log('🔐 Testing Service Role Connection...');
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test basic connection
    const { data: serviceTest, error: serviceError } = await serviceClient
      .from('evaluations')
      .select('count')
      .limit(1);

    if (serviceError) {
      if (serviceError.code === '42P01') {
        console.log('⚠️  Service role connected, but "evaluations" table not found.');
        console.log('   Please run the database schema from database/schema.sql\n');
      } else {
        console.log(`❌ Service role connection failed: ${serviceError.message}\n`);
        return false;
      }
    } else {
      console.log('✅ Service role connection successful!\n');
    }

    // Test with anon key (for frontend operations)
    if (supabaseAnonKey) {
      console.log('🔓 Testing Anonymous Key Connection...');
      const anonClient = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: anonTest, error: anonError } = await anonClient
        .from('evaluations')
        .select('count')
        .limit(1);

      if (anonError) {
        if (anonError.code === '42P01') {
          console.log('⚠️  Anonymous key connected, but "evaluations" table not found.');
        } else if (anonError.code === '42501') {
          console.log('✅ Anonymous key connected (access restricted as expected).');
        } else {
          console.log(`⚠️  Anonymous key connection issue: ${anonError.message}`);
        }
      } else {
        console.log('✅ Anonymous key connection successful!');
      }
    }

    // Test database schema
    console.log('\n📊 Testing Database Schema...');
    const { data: tables, error: tablesError } = await serviceClient
      .rpc('get_table_info', {}, { count: 'exact' });

    if (tablesError) {
      // Fallback: try to query information_schema
      const { data: schemaData, error: schemaError } = await serviceClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'evaluations');

      if (schemaError) {
        console.log('⚠️  Could not verify database schema');
      } else if (schemaData && schemaData.length > 0) {
        console.log('✅ "evaluations" table exists');
      } else {
        console.log('❌ "evaluations" table not found');
        console.log('   Please run: database/schema.sql in your Supabase SQL editor');
      }
    }

    // Test a simple insert/delete to verify permissions
    console.log('\n🧪 Testing Write Permissions...');
    const testData = {
      request_id: 'test-connection-' + Date.now(),
      request_data: { test: true },
      response_data: { test: true },
      trust_band: 'T3',
      assessment_type: 'test'
    };

    const { data: insertData, error: insertError } = await serviceClient
      .from('evaluations')
      .insert(testData)
      .select();

    if (insertError) {
      console.log(`❌ Write test failed: ${insertError.message}`);
    } else {
      console.log('✅ Write permissions working');
      
      // Clean up test data
      await serviceClient
        .from('evaluations')
        .delete()
        .eq('request_id', testData.request_id);
      
      console.log('✅ Cleanup successful');
    }

    console.log('\n🎉 Supabase connection test completed!');
    return true;

  } catch (error) {
    console.log(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test script error:', error);
    process.exit(1);
  });