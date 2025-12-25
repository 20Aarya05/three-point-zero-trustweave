import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export class FileUploadService {
  private supabase: SupabaseClient;
  private bucketName = 'Files'; // Updated to match your bucket name

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 FileUploadService - Checking environment variables:');
    console.log('   SUPABASE_URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌');
    console.log('   SERVICE_KEY:', supabaseKey ? 'Set ✅' : 'Missing ❌');

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase configuration for file upload');
      throw new Error('Missing Supabase configuration for file upload');
    }

    console.log('✅ Creating Supabase client for file upload');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Initialize storage bucket if it doesn't exist
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: false, // Private bucket for security
          allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
          ],
          fileSizeLimit: 10485760 // 10MB limit
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
        } else {
          console.log(`✅ Created storage bucket: ${this.bucketName}`);
        }
      } else {
        console.log(`✅ Using existing storage bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(
    file: Express.Multer.File,
    userId?: string
  ): Promise<UploadedFile> {
    try {
      console.log(`🔄 Starting file upload: ${file.originalname} (${file.size} bytes)`);
      
      await this.initializeBucket();

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = userId ? `${userId}/${fileName}` : `uploads/${fileName}`;

      console.log(`📁 Upload path: ${this.bucketName}/${filePath}`);

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ File uploaded to Supabase:', data);

      // Get signed URL
      const { data: urlData, error: urlError } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 3600 * 24 * 7); // 7 days expiry

      if (urlError || !urlData?.signedUrl) {
        console.error('❌ Failed to generate signed URL:', urlError);
        throw new Error('Failed to generate file URL');
      }

      console.log('✅ Generated signed URL');

      const uploadedFile: UploadedFile = {
        id: fileName,
        name: fileName,
        originalName: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: urlData.signedUrl,
        uploadedAt: new Date().toISOString()
      };

      console.log(`✅ File upload completed: ${file.originalname}`);
      return uploadedFile;

    } catch (error) {
      console.error('❌ File upload error:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    userId?: string
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      console.log(`✅ File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Get file info and signed URL
   */
  async getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error || !data?.signedUrl) {
        console.error('Error getting file URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  /**
   * List files for a user
   */
  async listUserFiles(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(userId);

      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}