import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schema for evaluation request
const evaluationRequestSchema = z.object({
  credit_purpose: z.string().min(1, 'Credit purpose is required'),
  behavioral_inputs: z.record(z.any()).optional().default({}),
  evidence_metadata: z.array(z.record(z.any())).optional().default([]),
  loan_history: z.string().optional().default(''),
  capacity_inputs: z.record(z.any()).optional().default({}),
  asset_inputs: z.record(z.any()).optional().default({})
});

export const validateEvaluationRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Validate request body shape and presence
    const validatedData = evaluationRequestSchema.parse(req.body);
    
    // Attach validated data to request
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request format',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request format',
      timestamp: new Date().toISOString()
    });
  }
};

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Content-Type must be application/json',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};