import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX, TXT`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for single file upload
export const uploadSingle = upload.single('document');

// Middleware for multiple file upload
export const uploadMultiple = upload.array('documents', 10);

// Error handling middleware for multer
export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File Too Large',
        message: 'File size cannot exceed 10MB',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        error: 'Too Many Files',
        message: 'Cannot upload more than 10 files at once',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        error: 'Unexpected File',
        message: 'Unexpected file field',
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  if (error.message.includes('File type')) {
    res.status(400).json({
      error: 'Invalid File Type',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Generic upload error
  res.status(400).json({
    error: 'Upload Error',
    message: error.message || 'File upload failed',
    timestamp: new Date().toISOString()
  });
};

// Validation middleware to ensure files are present
export const validateFiles = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const files = req.files as Express.Multer.File[];
  const file = req.file;

  if (!files && !file) {
    res.status(400).json({
      error: 'No Files',
      message: 'No files were uploaded',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};