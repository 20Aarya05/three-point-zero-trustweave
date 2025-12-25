import React, { useState, useEffect } from 'react';
import { uploadFilesToSupabase, testSupabaseConnection } from '../services/supabaseService';

const TestUpload: React.FC = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    testSupabaseConnection().then(setConnected);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setResult('');

    try {
      const fileArray = Array.from(files);
      console.log('🔄 Testing direct Supabase upload...');
      
      const uploadedFiles = await uploadFilesToSupabase(fileArray, 'mobile', 'test-user');
      
      setResult(`✅ Successfully uploaded ${uploadedFiles.length} files!\n\nFiles:\n${uploadedFiles.map(f => `- ${f.originalName} → ${f.url}`).join('\n')}\n\n🎉 Check your Supabase Files bucket!`);
      
    } catch (error) {
      setResult(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Direct Supabase Upload Test</h2>
      
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        borderRadius: '5px',
        backgroundColor: connected === null ? '#e3f2fd' : connected ? '#e8f5e8' : '#fff3cd',
        border: `1px solid ${connected === null ? '#2196f3' : connected ? '#4caf50' : '#ffc107'}`
      }}>
        <strong>Supabase Status:</strong> {
          connected === null ? '🔄 Testing...' :
          connected ? '✅ Connected - Ready to upload!' :
          '❌ Connection failed'
        }
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="testFileInput">Select files to test upload:</label><br />
        <input 
          type="file" 
          id="testFileInput"
          multiple 
          accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
          onChange={handleFileUpload}
          disabled={uploading || !connected}
          style={{ margin: '10px 0' }}
        />
      </div>

      {uploading && (
        <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px', marginBottom: '20px' }}>
          🔄 Uploading files to Supabase...
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: result.includes('✅') ? '#e8f5e8' : '#ffebee',
          border: `1px solid ${result.includes('✅') ? '#4caf50' : '#f44336'}`,
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>How it works:</strong>
        <ul>
          <li>Files upload directly from browser to Supabase</li>
          <li>No backend server needed</li>
          <li>Files stored in "Files" bucket under mobile/test-user/</li>
          <li>Public URLs generated automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default TestUpload;