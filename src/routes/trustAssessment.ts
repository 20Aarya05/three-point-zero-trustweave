import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TrustAssessmentService } from '../services/trustAssessmentService';
import { uploadMultiple, handleUploadError, validateFiles } from '../middleware/upload';
import { TrustAssessmentRequest } from '../types';
import { z } from 'zod';

const router = Router();

// Create service instance lazily to ensure environment variables are loaded
let trustAssessmentService: TrustAssessmentService | null = null;

function getTrustAssessmentService(): TrustAssessmentService {
  if (!trustAssessmentService) {
    trustAssessmentService = new TrustAssessmentService();
  }
  return trustAssessmentService;
}

// Validation schema for trust assessment request
const trustAssessmentSchema = z.object({
  purpose: z.enum(['small', 'medium', 'large', 'upgrade']),
  mobile: z.object({
    simDuration: z.string(),
    rechargeRegularity: z.string(),
    usageConsistency: z.string()
  }),
  utility: z.object({
    onTimePayment: z.string(),
    delayFrequency: z.string(),
    billPredictability: z.string()
  }),
  community: z.object({
    groupParticipation: z.string(),
    sharedResponsibility: z.string(),
    disputeHistory: z.string()
  }),
  evidence: z.array(z.object({
    name: z.string(),
    type: z.string(),
    months: z.number(),
    url: z.string().optional(),
    uploadedAt: z.string().optional()
  })).default([]),
  loanExperience: z.string(),
  financial: z.object({
    employmentType: z.string(),
    incomeRange: z.string(),
    incomeStability: z.string()
  }),
  assets: z.object({
    property: z.boolean(),
    fixedDeposits: z.boolean(),
    collateralWillingness: z.boolean()
  })
});

/**
 * POST /api/trust/assess
 * Main endpoint for trust assessment (matches frontend expectations)
 */
router.post('/assess', async (req: Request, res: Response): Promise<void> => {
  const requestId = uuidv4();
  
  try {
    console.log(`[${requestId}] Starting trust assessment`);
    
    // Validate request body
    const validatedData = trustAssessmentSchema.parse(req.body);
    const request: TrustAssessmentRequest = validatedData;
    
    // Process assessment
    const response = await getTrustAssessmentService().assessTrust(request, requestId);
    
    console.log(`[${requestId}] Trust assessment completed successfully`);
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] Trust assessment failed:`, error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request format',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
      return;
    }
    
    res.status(500).json({
      error: 'Assessment Failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      request_id: requestId
    });
  }
});

/**
 * POST /api/trust/upload-evidence
 * Upload evidence documents
 */
router.post('/upload-evidence', 
  uploadMultiple,
  handleUploadError,
  validateFiles,
  async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      console.log(`[${requestId}] Starting evidence file upload`);
      
      const files = req.files as Express.Multer.File[];
      const userId = req.body.userId || 'anonymous';
      
      console.log(`[${requestId}] Received ${files?.length || 0} files from user: ${userId}`);
      
      if (!files || files.length === 0) {
        console.log(`[${requestId}] No files received`);
        res.status(400).json({
          error: 'No Files',
          message: 'No files were uploaded',
          timestamp: new Date().toISOString(),
          request_id: requestId
        });
        return;
      }
      
      // Log file details
      files.forEach((file, index) => {
        console.log(`[${requestId}] File ${index + 1}: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
      });
      
      // Upload files
      console.log(`[${requestId}] Starting Supabase upload...`);
      const evidenceFiles = await getTrustAssessmentService().uploadEvidenceFiles(files, userId);
      
      console.log(`[${requestId}] Evidence files uploaded successfully: ${files.length} files`);
      
      res.status(200).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        files: evidenceFiles,
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
      
    } catch (error) {
      console.error(`[${requestId}] Evidence upload failed:`, error);
      
      res.status(500).json({
        error: 'Upload Failed',
        message: error instanceof Error ? error.message : 'File upload failed',
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
    }
  }
);

/**
 * POST /api/trust/assess-with-upload
 * Combined endpoint: upload files and assess trust in one request
 */
router.post('/assess-with-upload',
  uploadMultiple,
  handleUploadError,
  async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      console.log(`[${requestId}] Starting combined assessment with file upload`);
      
      // Parse assessment data from form data
      const assessmentData = JSON.parse(req.body.assessmentData || '{}');
      const validatedData = trustAssessmentSchema.parse(assessmentData);
      
      let request: TrustAssessmentRequest = validatedData;
      
      // Upload files if provided
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const userId = req.body.userId || 'anonymous';
        const evidenceFiles = await getTrustAssessmentService().uploadEvidenceFiles(files, userId);
        
        // Add uploaded files to evidence
        request.evidence = [...request.evidence, ...evidenceFiles];
      }
      
      // Process assessment
      const response = await getTrustAssessmentService().assessTrust(request, requestId);
      
      console.log(`[${requestId}] Combined assessment completed successfully`);
      
      res.status(200).json({
        ...response,
        uploadedFiles: files?.length || 0
      });
      
    } catch (error) {
      console.error(`[${requestId}] Combined assessment failed:`, error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid assessment data format',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          timestamp: new Date().toISOString(),
          request_id: requestId
        });
        return;
      }
      
      res.status(500).json({
        error: 'Assessment Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
    }
  }
);

/**
 * GET /api/trust/health
 * Health check for trust assessment service
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      status: 'healthy',
      service: 'trust-assessment',
      timestamp: new Date().toISOString(),
      version: 'v1',
      features: {
        assessment: true,
        fileUpload: true,
        storage: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;