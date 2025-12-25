// Debug file upload issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugUpload() {
  console.log('🔍 Debugging File Upload Issue\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Configuration:');
  console.log('   SUPABASE_URL:', supabaseUrl);
  console.log('   SERVICE_KEY:', supabaseKey ? 'Set ✅' : 'Missing ❌');

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase configuration');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Test basic connection
    console.log('\n1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('assessment_sessions')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection working');

    // 2. Check storage buckets
    console.log('\n2. Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage access failed:', bucketError.message);
      return;
    }

    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    const filesBucket = buckets.find(b => b.name === 'Files');
    if (!filesBucket) {
      console.log('❌ "Files" bucket not found!');
      return;
    }
    console.log('✅ "Files" bucket exists');

    // 3. Test file upload
    console.log('\n3. Testing direct file upload...');
    const testContent = 'Test file for TrustWeave - ' + new Date().toISOString();
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Files')
      .upload(`uploads/${testFileName}`, Buffer.from(testContent), {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.log('❌ Direct upload failed:', uploadError.message);
      return;
    }
    console.log('✅ Direct upload successful:', uploadData.path);

    // 4. Test signed URL generation
    console.log('\n4. Testing signed URL generation...');
    const { data: urlData, error: urlError } = await supabase.storage
      .from('Files')
      .createSignedUrl(`uploads/${testFileName}`, 3600);

    if (urlError) {
      console.log('❌ Signed URL generation failed:', urlError.message);
    } else {
      console.log('✅ Signed URL generated:', urlData.signedUrl.substring(0, 50) + '...');
    }

    // 5. Check evidence_files table
    console.log('\n5. Checking evidence_files table...');
    const { data: evidenceData, error: evidenceError } = await supabase
      .from('evidence_files')
      .select('*')
      .limit(5);

    if (evidenceError) {
      console.log('❌ Evidence table query failed:', evidenceError.message);
    } else {
      console.log(`✅ Evidence table accessible (${evidenceData.length} records)`);
      if (evidenceData.length > 0) {
        console.log('   Latest records:');
        evidenceData.forEach(record => {
          console.log(`   - ${record.original_name} (${record.evidence_category})`);
        });
      }
    }

    // 6. Clean up test file
    console.log('\n6. Cleaning up test file...');
    await supabase.storage.from('Files').remove([`uploads/${testFileName}`]);
    console.log('✅ Test file cleaned up');

    console.log('\n🎉 All tests passed! The issue might be in the backend API.');
    console.log('\n🔧 Next steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Check backend logs when uploading from frontend');
    console.log('3. Test API endpoint: POST /api/trust/upload-evidence');

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugUpload();