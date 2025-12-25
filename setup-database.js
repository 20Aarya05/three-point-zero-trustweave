// Quick database setup script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Setting up TrustWeave database...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase configuration');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    console.log('1. Testing connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    console.log('✅ Connected to Supabase');

    // Check if Files bucket exists
    console.log('\n2. Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error checking buckets:', bucketError.message);
    } else {
      const filesBucket = buckets.find(bucket => bucket.name === 'Files');
      if (filesBucket) {
        console.log('✅ "Files" bucket exists');
      } else {
        console.log('⚠️  "Files" bucket not found');
        console.log('📋 Available buckets:', buckets.map(b => b.name).join(', '));
        
        // Try to create the bucket
        console.log('🔧 Creating "Files" bucket...');
        const { error: createError } = await supabase.storage.createBucket('Files', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
          fileSizeLimit: 10485760
        });
        
        if (createError) {
          console.log('❌ Failed to create bucket:', createError.message);
        } else {
          console.log('✅ "Files" bucket created successfully');
        }
      }
    }

    // Test file upload
    console.log('\n3. Testing file upload...');
    const testContent = 'Test file content for TrustWeave';
    const testFile = Buffer.from(testContent);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Files')
      .upload('test/test-file.txt', testFile, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.log('❌ File upload test failed:', uploadError.message);
    } else {
      console.log('✅ File upload test successful');
      
      // Clean up test file
      await supabase.storage.from('Files').remove(['test/test-file.txt']);
      console.log('🧹 Test file cleaned up');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the database schema: database/complete-final-schema.sql');
    console.log('2. Start backend: npm run dev');
    console.log('3. Test file upload from frontend');

  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    console.log('\n🔧 Check:');
    console.log('- Supabase URL is correct');
    console.log('- Service role key has proper permissions');
    console.log('- Project is active in Supabase dashboard');
  }
}

setupDatabase();