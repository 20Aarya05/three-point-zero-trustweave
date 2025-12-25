import { createClient } from '@supabase/supabase-js';

export interface OCRResult {
  fileId: string;
  fileName: string;
  filePath: string;
  extractedText: string;
  confidence: number;
  language: string;
  documentType: 'utility_bill' | 'mobile_bill' | 'bank_statement' | 'community_document' | 'unknown';
  extractedData: {
    amounts: number[];
    dates: string[];
    accountNumbers: string[];
    phoneNumbers: string[];
    addresses: string[];
    names: string[];
  };
  metadata: {
    processingTime: number;
    fileSize: number;
    pageCount?: number;
    ocrMethod: string;
  };
}

export class OCRProcessor {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Running without Supabase - using mock data
      this.supabase = null;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Process all files in the Files bucket and extract text
   */
  async processAllFiles(): Promise<OCRResult[]> {
    if (!this.supabase) {
      console.log('⚠️ Supabase not configured - returning mock OCR results');
      return this.getMockOCRResults();
    }

    try {
      console.log('🔍 Starting OCR processing for all files...');

      // Get all files from the Files bucket
      const files = await this.getAllFilesFromBucket();
      console.log(`📁 Found ${files.length} files to process`);

      const ocrResults: OCRResult[] = [];

      for (const file of files) {
        try {
          const result = await this.processFile(file);
          ocrResults.push(result);
          console.log(`✅ Processed: ${file.name}`);
        } catch (error) {
          console.error(`❌ Failed to process ${file.name}:`, error);
        }
      }

      // Store all OCR results in database
      await this.storeOCRResults(ocrResults);

      console.log(`🎉 OCR processing completed: ${ocrResults.length} files processed`);
      return ocrResults;

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      return [];
    }
  }

  /**
   * Process a single file
   */
  async processFile(file: {name: string, path: string, type?: string}): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Download file from Supabase
      const { data: fileData, error } = await this.supabase.storage
        .from('Files')
        .download(file.path);

      if (error) {
        throw new Error(`Failed to download ${file.name}: ${error.message}`);
      }

      const fileBuffer = await fileData.arrayBuffer();
      const fileSize = fileBuffer.byteLength;

      // Determine file type
      const fileType = this.determineFileType(file.name, file.type);
      
      // Extract text based on file type
      let extractedText = '';
      let confidence = 0;
      let ocrMethod = 'unknown';

      if (fileType.includes('image')) {
        const result = await this.extractFromImage(fileBuffer, file.name);
        extractedText = result.text;
        confidence = result.confidence;
        ocrMethod = 'tesseract';
      } else if (fileType.includes('pdf')) {
        const result = await this.extractFromPDF(fileBuffer, file.name);
        extractedText = result.text;
        confidence = result.confidence;
        ocrMethod = 'pdf-parse';
      } else if (fileType.includes('text')) {
        const result = await this.extractFromText(fileBuffer, file.name);
        extractedText = result.text;
        confidence = result.confidence;
        ocrMethod = 'direct';
      } else if (fileType.includes('document')) {
        const result = await this.extractFromDocument(fileBuffer, file.name);
        extractedText = result.text;
        confidence = result.confidence;
        ocrMethod = 'mammoth';
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Analyze extracted text
      const documentType = this.classifyDocument(extractedText);
      const extractedData = this.extractStructuredData(extractedText);

      const processingTime = Date.now() - startTime;

      return {
        fileId: file.name,
        fileName: file.name,
        filePath: file.path,
        extractedText,
        confidence,
        language: 'en', // Could be detected
        documentType,
        extractedData,
        metadata: {
          processingTime,
          fileSize,
          ocrMethod
        }
      };

    } catch (error) {
      console.error(`OCR failed for ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Extract text from image files (JPG, PNG)
   */
  private async extractFromImage(buffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    // Mock implementation - replace with actual Tesseract.js or Google Vision API
    console.log(`🖼️ Processing image: ${fileName}`);
    
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockText = `ELECTRICITY BILL
Account No: 1234567890
Consumer Name: JOHN DOE
Billing Period: 01-JAN-2024 to 31-JAN-2024
Units Consumed: 245 kWh
Amount Due: ₹1,250.00
Due Date: 15-FEB-2024
Payment Status: PAID
Payment Date: 12-FEB-2024
Payment Method: Online
Reference No: PAY123456789`;

    return {
      text: mockText,
      confidence: 0.92
    };
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(buffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    // Mock implementation - replace with PDF.js or similar
    console.log(`📄 Processing PDF: ${fileName}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockText = `MOBILE RECHARGE RECEIPT
Transaction ID: TXN987654321
Date & Time: 15-FEB-2024 10:30 AM
Mobile Number: +91-9876543210
Operator: Airtel India
Recharge Plan: ₹399 - Unlimited
Validity: 28 Days
Data: 2GB/Day
Calls: Unlimited
SMS: 100/Day
Transaction Status: SUCCESS
Balance After Recharge: ₹45.50
Payment Method: UPI
UPI Ref: 405678912345`;

    return {
      text: mockText,
      confidence: 0.95
    };
  }

  /**
   * Extract text from text files
   */
  private async extractFromText(buffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    console.log(`📝 Processing text file: ${fileName}`);
    
    const text = new TextDecoder('utf-8').decode(buffer);
    
    return {
      text: text,
      confidence: 1.0
    };
  }

  /**
   * Extract text from document files (DOC, DOCX)
   */
  private async extractFromDocument(buffer: ArrayBuffer, fileName: string): Promise<{text: string, confidence: number}> {
    // Mock implementation - replace with mammoth.js for DOCX
    console.log(`📋 Processing document: ${fileName}`);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockText = `COMMUNITY SAVINGS GROUP CERTIFICATE

Member Name: JOHN DOE
Member ID: CSG-2024-001
Group Name: Sunrise Community Savings Group
Membership Start Date: 01-JAN-2023

CONTRIBUTION SUMMARY:
Monthly Savings: ₹2,000
Total Contributions: ₹24,000
Loan Taken: ₹15,000 (Repaid)
Current Balance: ₹9,000

PARTICIPATION RECORD:
Meeting Attendance: 22/24 (92%)
Committee Role: Treasurer (6 months)
Group Activities: Active participant
Dispute Resolution: None

VERIFICATION:
This certificate is issued to verify the member's 
active participation and financial discipline 
within our community savings group.

Issued By: Group Secretary
Date: 15-FEB-2024
Signature: [Digital Signature]`;

    return {
      text: mockText,
      confidence: 0.98
    };
  }

  /**
   * Classify document type based on content
   */
  private classifyDocument(text: string): 'utility_bill' | 'mobile_bill' | 'bank_statement' | 'community_document' | 'unknown' {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('electricity') || lowerText.includes('water') || lowerText.includes('gas') || lowerText.includes('utility')) {
      return 'utility_bill';
    } else if (lowerText.includes('mobile') || lowerText.includes('recharge') || lowerText.includes('airtel') || lowerText.includes('jio')) {
      return 'mobile_bill';
    } else if (lowerText.includes('bank') || lowerText.includes('statement') || lowerText.includes('account')) {
      return 'bank_statement';
    } else if (lowerText.includes('community') || lowerText.includes('group') || lowerText.includes('savings') || lowerText.includes('certificate')) {
      return 'community_document';
    }

    return 'unknown';
  }

  /**
   * Extract structured data from text
   */
  private extractStructuredData(text: string): any {
    return {
      amounts: this.extractAmounts(text),
      dates: this.extractDates(text),
      accountNumbers: this.extractAccountNumbers(text),
      phoneNumbers: this.extractPhoneNumbers(text),
      addresses: this.extractAddresses(text),
      names: this.extractNames(text)
    };
  }

  private extractAmounts(text: string): number[] {
    const amounts = [];
    const patterns = [
      /[₹$]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[₹$]/g,
      /amount[:\s]+(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0 && amount < 1000000) { // Reasonable range
          amounts.push(amount);
        }
      }
    });

    return [...new Set(amounts)]; // Remove duplicates
  }

  private extractDates(text: string): string[] {
    const dates = [];
    const patterns = [
      /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g,
      /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4}/gi,
      /\d{2,4}-\d{1,2}-\d{1,2}/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        dates.push(match[0]);
      }
    });

    return [...new Set(dates)];
  }

  private extractAccountNumbers(text: string): string[] {
    const accounts = [];
    const patterns = [
      /account\s*(?:no|number)[:\s]+(\d{8,16})/gi,
      /a\/c[:\s]+(\d{8,16})/gi,
      /consumer\s*(?:no|number)[:\s]+(\d{8,16})/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        accounts.push(match[1]);
      }
    });

    return [...new Set(accounts)];
  }

  private extractPhoneNumbers(text: string): string[] {
    const phones = [];
    const patterns = [
      /\+91[-\s]?\d{10}/g,
      /\d{10}/g,
      /mobile[:\s]+(\+91[-\s]?\d{10})/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const phone = match[1] || match[0];
        if (phone.replace(/\D/g, '').length === 10 || phone.replace(/\D/g, '').length === 12) {
          phones.push(phone);
        }
      }
    });

    return [...new Set(phones)];
  }

  private extractAddresses(text: string): string[] {
    const addresses = [];
    const patterns = [
      /address[:\s]+([^\n]{20,100})/gi,
      /\d+[,\s]+[a-zA-Z\s]+[,\s]+[a-zA-Z\s]+[-\s]\d{6}/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        addresses.push(match[1] || match[0]);
      }
    });

    return [...new Set(addresses)];
  }

  private extractNames(text: string): string[] {
    const names = [];
    const patterns = [
      /(?:name|customer)[:\s]+([A-Z][a-zA-Z\s]{2,30})/gi,
      /mr\.?\s+([A-Z][a-zA-Z\s]{2,30})/gi,
      /mrs\.?\s+([A-Z][a-zA-Z\s]{2,30})/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 50) {
          names.push(name);
        }
      }
    });

    return [...new Set(names)];
  }

  /**
   * Get all files from the Files bucket
   */
  private async getAllFilesFromBucket(): Promise<Array<{name: string, path: string, type?: string}>> {
    const allFiles = [];

    try {
      // List all folders (mobile, utility, community)
      const { data: folders, error: folderError } = await this.supabase.storage
        .from('Files')
        .list('', { limit: 100 });

      if (folderError) {
        throw new Error(`Failed to list folders: ${folderError.message}`);
      }

      // Process each folder
      for (const folder of folders) {
        if (folder.name && !folder.name.includes('.')) { // Skip files, only process folders
          const { data: files, error: fileError } = await this.supabase.storage
            .from('Files')
            .list(folder.name, { limit: 100 });

          if (fileError) {
            console.error(`Failed to list files in ${folder.name}:`, fileError);
            continue;
          }

          // Process each user folder
          for (const userFolder of files) {
            if (userFolder.name && !userFolder.name.includes('.')) {
              const { data: userFiles, error: userFileError } = await this.supabase.storage
                .from('Files')
                .list(`${folder.name}/${userFolder.name}`, { limit: 100 });

              if (userFileError) {
                console.error(`Failed to list user files:`, userFileError);
                continue;
              }

              // Add actual files
              userFiles.forEach(file => {
                if (file.name && file.name.includes('.')) { // Only actual files
                  allFiles.push({
                    name: file.name,
                    path: `${folder.name}/${userFolder.name}/${file.name}`,
                    type: this.determineFileType(file.name)
                  });
                }
              });
            }
          }
        }
      }

      return allFiles;
    } catch (error) {
      console.error('Error getting files from bucket:', error);
      return [];
    }
  }

  /**
   * Determine file type from filename
   */
  private determineFileType(fileName: string, mimeType?: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const typeMap: {[key: string]: string} = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    return mimeType || typeMap[extension || ''] || 'application/octet-stream';
  }

  /**
   * Store OCR results in database
   */
  private async storeOCRResults(results: OCRResult[]): Promise<void> {
    if (!this.supabase) return;

    try {
      const records = results.map(result => ({
        file_path: result.filePath,
        file_name: result.fileName,
        extracted_text: result.extractedText,
        confidence_score: result.confidence,
        document_type: result.documentType,
        extracted_data: result.extractedData,
        processing_time_ms: result.metadata.processingTime,
        file_size_bytes: result.metadata.fileSize,
        ocr_method: result.metadata.ocrMethod,
        language: result.language,
        created_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('file_ocr_results')
        .upsert(records, { onConflict: 'file_path' });

      if (error) {
        console.error('Failed to store OCR results:', error);
      } else {
        console.log(`✅ Stored ${records.length} OCR results in database`);
      }
    } catch (error) {
      console.error('Error storing OCR results:', error);
    }
  }

  /**
   * Get mock OCR results for testing
   */
  private getMockOCRResults(): OCRResult[] {
    return [
      {
        fileId: 'mock-utility-bill.pdf',
        fileName: 'utility-bill-jan-2024.pdf',
        filePath: 'utility/test-user/utility-bill-jan-2024.pdf',
        extractedText: 'ELECTRICITY BILL\nAccount: 1234567890\nAmount: ₹1,250\nDue Date: 15-FEB-2024\nStatus: PAID',
        confidence: 0.95,
        language: 'en',
        documentType: 'utility_bill',
        extractedData: {
          amounts: [1250],
          dates: ['15-FEB-2024'],
          accountNumbers: ['1234567890'],
          phoneNumbers: [],
          addresses: ['123 Main St, City'],
          names: ['JOHN DOE']
        },
        metadata: {
          processingTime: 1200,
          fileSize: 245760,
          ocrMethod: 'mock'
        }
      }
    ];
  }

  /**
   * Get OCR results for specific file categories
   */
  async getOCRResultsByCategory(category: 'mobile' | 'utility' | 'community'): Promise<OCRResult[]> {
    if (!this.supabase) {
      return this.getMockOCRResults().filter(r => r.filePath.includes(category));
    }

    try {
      const { data, error } = await this.supabase
        .from('file_ocr_results')
        .select('*')
        .like('file_path', `${category}%`);

      if (error) {
        console.error(`Failed to get ${category} OCR results:`, error);
        return [];
      }

      return data.map(record => ({
        fileId: record.file_name,
        fileName: record.file_name,
        filePath: record.file_path,
        extractedText: record.extracted_text,
        confidence: record.confidence_score,
        language: record.language,
        documentType: record.document_type,
        extractedData: record.extracted_data,
        metadata: {
          processingTime: record.processing_time_ms,
          fileSize: record.file_size_bytes,
          ocrMethod: record.ocr_method
        }
      }));
    } catch (error) {
      console.error('Error retrieving OCR results:', error);
      return [];
    }
  }
}