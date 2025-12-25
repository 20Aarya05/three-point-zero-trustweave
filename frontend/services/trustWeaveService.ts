import { TrustAssessmentState, AssessmentResult } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface TrustWeaveApiResponse {
  trustBand: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  interpretation: string;
  traditionalAlignment: string;
  reasoning: string[];
  metadata?: {
    assessment_type: string;
    generated_at: string;
    version: string;
  };
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  files: Array<{
    name: string;
    type: string;
    months: number;
    url: string;
    uploadedAt: string;
  }>;
  timestamp: string;
  request_id: string;
}

/**
 * Upload evidence files to the backend
 */
export const uploadEvidenceFiles = async (files: File[]): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('documents', file);
    });
    
    formData.append('userId', 'frontend-user'); // You can make this dynamic

    const response = await fetch(`${API_BASE_URL}/api/trust/upload-evidence`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Files uploaded successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ File upload failed:', error);
    throw error;
  }
};

/**
 * Analyze trust using the TrustWeave backend API
 */
export const analyzeTrust = async (state: TrustAssessmentState): Promise<AssessmentResult> => {
  try {
    console.log('🤖 Calling TrustWeave Backend API...');

    // Convert frontend state to backend format
    const requestData = {
      purpose: state.purpose,
      mobile: state.mobile,
      utility: state.utility,
      community: state.community,
      evidence: state.evidence,
      loanExperience: state.loanExperience,
      financial: state.financial,
      assets: state.assets
    };

    const response = await fetch(`${API_BASE_URL}/api/trust/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: TrustWeaveApiResponse = await response.json();
    console.log('✅ TrustWeave analysis complete:', data);

    // Convert backend response to frontend format
    const result: AssessmentResult = {
      trustBand: mapTrustBandToEnum(data.trustBand),
      interpretation: data.interpretation,
      traditionalAlignment: data.traditionalAlignment,
      reasoning: data.reasoning
    };

    return result;

  } catch (error) {
    console.error("❌ TrustWeave API failed:", error);
    
    // Fallback to Gemini if backend fails
    console.log("🔄 Falling back to Gemini API...");
    
    try {
      const { analyzeTrust: geminiAnalyzeTrust } = await import('./geminiService');
      return await geminiAnalyzeTrust(state);
    } catch (geminiError) {
      console.error("❌ Gemini fallback also failed:", geminiError);
      
      // Final fallback with default response
      return {
        trustBand: mapTrustBandToEnum('T3'),
        interpretation: "Analysis completed with baseline metrics (offline mode).",
        traditionalAlignment: "650-699",
        reasoning: [
          "Backend service temporarily unavailable",
          "Using baseline assessment criteria",
          "Please try again later for full analysis"
        ]
      };
    }
  }
};

/**
 * Combined upload and assess in one request
 */
export const uploadAndAssess = async (
  state: TrustAssessmentState, 
  files: File[]
): Promise<AssessmentResult> => {
  try {
    console.log('🤖 Calling combined upload and assess API...');

    const formData = new FormData();
    
    // Add files
    files.forEach((file) => {
      formData.append('documents', file);
    });
    
    // Add assessment data
    const requestData = {
      purpose: state.purpose,
      mobile: state.mobile,
      utility: state.utility,
      community: state.community,
      evidence: state.evidence,
      loanExperience: state.loanExperience,
      financial: state.financial,
      assets: state.assets
    };
    
    formData.append('assessmentData', JSON.stringify(requestData));
    formData.append('userId', 'frontend-user');

    const response = await fetch(`${API_BASE_URL}/api/trust/assess-with-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: TrustWeaveApiResponse = await response.json();
    console.log('✅ Combined upload and assess complete:', data);

    return {
      trustBand: mapTrustBandToEnum(data.trustBand),
      interpretation: data.interpretation,
      traditionalAlignment: data.traditionalAlignment,
      reasoning: data.reasoning
    };

  } catch (error) {
    console.error("❌ Combined upload and assess failed:", error);
    // Fall back to separate upload and assess
    return await analyzeTrust(state);
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trust/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * Helper function to map trust band string to enum
 */
function mapTrustBandToEnum(trustBand: string): any {
  const mapping: Record<string, any> = {
    'T1': 'T1 - Limited Trust',
    'T2': 'T2 - Emerging Trust', 
    'T3': 'T3 - Developing Trust',
    'T4': 'T4 - Strong Trust',
    'T5': 'T5 - Exceptional Trust'
  };
  
  return mapping[trustBand] || 'T3 - Developing Trust';
}