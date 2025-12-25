import { createClient } from '@supabase/supabase-js';

export interface OCRResult {
  fileId: string;
  fileName: string;
  extractedText: string;
  confidence: number;
  language: string;
  metadata: {
    pageCount?: number;
    processingTime: number;
    fileSize: number;
  };
}

export class OCRService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration for OCR service');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Extract text from uploaded file using multiple OCR methods
   */
  async extractTextFromFile(
    filePath: string,
    fileName: string,
    fileType: string
  ): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Starting OCR for ${fileName}...`);

      let extractedText = '';
      let confidence = 0;

      // Get file from Supabase storage
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('Files')
        .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const fileBuffer = await fileData.arrayBuffer();
      const fileSize = fileBuffer.byteLength;

      // Choose OCR method based on file type
      if (fileType.includes('image')) {
        // For images: Use Tesseract.js or Google Vision API
        const result = await this.processImageOCR(fileBuffer, fileName);
        extractedText = result.text;
        confidence = result.confidence;
      } else if (fileType.includes('pdf')) {
        // For PDFs: Extract text directly or use OCR for scanned PDFs
        const result = await this.processPDFOCR(fileBuffer, fileName);
        extractedText = result.text;
        confidence = result.confidence;
      } else if (fileType.includes('text') || fileType.includes('document')) {
        // For text/doc files: Direct text extraction
        const result = await this.processDocumentOCR(fileBuffer, fileName);
        extractedText = result.text;
        confidence = result.confidence;
      } else {
        throw new Error(`Unsupported file type for OCR: ${fileType}`);
      }

      const processingTime = Date.now() - startTime;

      const ocrResult: OCRResult = {
        fileId: fileName,
        fileName,
        extractedText,
        confidence,
        language: 'en', // Default to English, can be detected
        metadata: {
          processingTime,
          fileSize
        }
      };

      // Store OCR result in database
      await this.storeOCRResult(filePath, ocrResult);

      console.log(`✅ OCR completed for ${fileName} in ${processingTime}ms`);
      return ocrResult;

    } catch (error) {
      console.error(`❌ OCR failed for ${fileName}:`, error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process image files using Tesseract.js (client-side OCR)
   */
  private async processImageOCR(fileBuffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    try {
      // For now, return mock data - you can integrate Tesseract.js here
      // const { createWorker } = require('tesseract.js');
      // const worker = await createWorker();
      // const { data: { text, confidence } } = await worker.recognize(fileBuffer);
      // await worker.terminate();
      
      // Mock OCR result for images
      const mockText = `[OCR EXTRACTED FROM ${fileName}]
      
UTILITY BILL
Account Number: 123456789
Service Period: Jan 2024 - Feb 2024
Amount Due: $125.50
Due Date: March 15, 2024
Payment Status: PAID
Customer: John Doe
Address: 123 Main St, City, State`;

      return {
        text: mockText,
        confidence: 0.95
      };
    } catch (error) {
      throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process PDF files
   */
  private async processPDFOCR(fileBuffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    try {
      // For now, return mock data - you can integrate PDF.js + OCR here
      const mockText = `[OCR EXTRACTED FROM ${fileName}]
      
MOBILE RECHARGE RECEIPT
Transaction ID: TXN123456789
Date: 2024-02-15 14:30:25
Mobile Number: +91-9876543210
Operator: Airtel
Plan: Unlimited Talk & Data
Amount: ₹399
Status: SUCCESS
Balance: ₹50.25 remaining`;

      return {
        text: mockText,
        confidence: 0.92
      };
    } catch (error) {
      throw new Error(`PDF OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process document files (DOC, DOCX, TXT)
   */
  private async processDocumentOCR(fileBuffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    try {
      // For text files, direct extraction
      if (fileName.endsWith('.txt')) {
        const text = new TextDecoder().decode(fileBuffer);
        return { text, confidence: 1.0 };
      }

      // For DOC/DOCX, you'd use a library like mammoth.js
      // Mock result for now
      const mockText = `[EXTRACTED FROM ${fileName}]
      
COMMUNITY PARTICIPATION CERTIFICATE

This is to certify that John Doe has been an active member of the 
Community Savings Group since January 2023.

Contributions:
- Monthly savings: ₹2,000
- Group fund contribution: ₹500
- Meeting attendance: 95%
- Leadership role: Treasurer (6 months)

Issued by: Community Leader
Date: February 2024`;

      return {
        text: mockText,
        confidence: 0.98
      };
    } catch (error) {
      throw new Error(`Document OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store OCR result in database
   */
  private async storeOCRResult(filePath: string, ocrResult: OCRResult): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('file_ocr_results')
        .upsert({
          file_path: filePath,
          file_name: ocrResult.fileName,
          extracted_text: ocrResult.extractedText,
          confidence_score: ocrResult.confidence,
          language: ocrResult.language,
          processing_time_ms: ocrResult.metadata.processingTime,
          file_size_bytes: ocrResult.metadata.fileSize,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store OCR result:', error);
      }
    } catch (error) {
      console.error('Error storing OCR result:', error);
    }
  }

  /**
   * Get stored OCR result for a file
   */
  async getOCRResult(filePath: string): Promise<OCRResult | null> {
    try {
      const { data, error } = await this.supabase
        .from('file_ocr_results')
        .select('*')
        .eq('file_path', filePath)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        fileId: data.file_name,
        fileName: data.file_name,
        extractedText: data.extracted_text,
        confidence: data.confidence_score,
        language: data.language,
        metadata: {
          processingTime: data.processing_time_ms,
          fileSize: data.file_size_bytes
        }
      };
    } catch (error) {
      console.error('Error retrieving OCR result:', error);
      return null;
    }
  }

  /**
   * Batch process multiple files
   */
  async batchProcessFiles(files: Array<{path: string, name: string, type: string}>): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.extractTextFromFile(file.path, file.name, file.type);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }
}