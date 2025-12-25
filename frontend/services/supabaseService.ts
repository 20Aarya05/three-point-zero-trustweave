import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using anonymous key with RLS policies
const supabaseUrl = 'https://cxdkdnkzvutjbqatdbms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZGtkbmt6dnV0amJxYXRkYm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2Mjg1MjcsImV4cCI6MjA4MjIwNDUyN30.q2fWM3jiqMmkUmP24h3NpVxgdMZLqfda-KGFefbyeXo';

// Use anonymous key - RLS policies now allow uploads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

/**
 * Upload files directly to Supabase from frontend
 */
export const uploadFilesToSupabase = async (
  files: File[],
  category: 'mobile' | 'utility' | 'community',
  userId: string = 'frontend-user'
): Promise<UploadedFile[]> => {
  const uploadedFiles: UploadedFile[] = [];

  for (const file of files) {
    try {
      console.log(`🔄 Uploading ${file.name} to Supabase...`);

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `${category}/${userId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('Files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ File uploaded:', data.path);

      // Get public URL (since your bucket is public)
      const { data: urlData } = supabase.storage
        .from('Files')
        .getPublicUrl(filePath);

      const uploadedFile: UploadedFile = {
        id: fileName,
        name: fileName,
        originalName: file.name,
        type: file.type,
        size: file.size,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString()
      };

      uploadedFiles.push(uploadedFile);
      console.log(`✅ ${file.name} uploaded successfully`);

    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedFiles;
};

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Test by listing buckets
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }

    console.log('✅ Supabase connected. Available buckets:', data.map(b => b.name));
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

/**
 * Store assessment data in Supabase database
 */
export const storeAssessmentData = async (
  sessionId: string,
  assessmentData: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('assessment_sessions')
      .upsert({
        session_id: sessionId,
        user_identifier: 'frontend-user',
        current_step: 8,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Failed to store assessment:', error);
    } else {
      console.log('✅ Assessment data stored in Supabase');
    }
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};