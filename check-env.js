// Check environment variables
require('dotenv').config();

console.log('🔍 Environment Variables Check\n');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✅' : 'Missing ❌');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✅' : 'Missing ❌');

if (process.env.SUPABASE_URL) {
  console.log('\n📋 Supabase URL:', process.env.SUPABASE_URL);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('📋 Service Key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}