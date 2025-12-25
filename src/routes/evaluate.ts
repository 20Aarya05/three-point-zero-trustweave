import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { EvaluationService } from '../services/evaluationService';
import { validateEvaluationRequest, validateContentType } from '../middleware/validation';
import { EvaluationRequest } from '../types';

const router = Router();
const evaluationService = new EvaluationService();

/**
 * POST /api/evaluate/full
 * Runs the full agent pipeline and returns final trust profile, explanation, and guidance
 */
router.post('/full', 
  validateContentType,
  validateEvaluationRequest,
  async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      console.log(`[${requestId}] Starting full evaluation pipeline`);
      
      const request: EvaluationRequest = req.body;
      const response = await evaluationService.evaluateFull(request, requestId);
      
      console.log(`[${requestId}] Full evaluation completed successfully`);
      
      res.status(200).json(response);
    } catch (error) {
      console.error(`[${requestId}] Full evaluation failed:`, error);
      
      res.status(500).json({
        error: 'Evaluation Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
    }
  }
);

/**
 * POST /api/evaluate/debug
 * Returns intermediate agent outputs for admin/judge/demo view
 */
router.post('/debug',
  validateContentType,
  validateEvaluationRequest,
  async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      console.log(`[${requestId}] Starting debug evaluation pipeline`);
      
      const request: EvaluationRequest = req.body;
      const response = await evaluationService.evaluateDebug(request, requestId);
      
      console.log(`[${requestId}] Debug evaluation completed successfully`);
      
      res.status(200).json(response);
    } catch (error) {
      console.error(`[${requestId}] Debug evaluation failed:`, error);
      
      res.status(500).json({
        error: 'Debug Evaluation Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
    }
  }
);

/**
 * GET /api/evaluate/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: 'v1'
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