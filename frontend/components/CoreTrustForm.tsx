import React, { useState, useEffect } from 'react';
import { TrustAssessmentState, EvidenceFile } from '../types';
import { uploadFilesToSupabase, testSupabaseConnection } from '../services/supabaseService';

interface Props {
  data: TrustAssessmentState;
  onUpdate: (u: Partial<TrustAssessmentState>) => void;
  onNext: () => void;
}

const CoreTrustForm: React.FC<Props> = ({ data, onUpdate, onNext }) => {
  const [fileProgress, setFileProgress] = useState(0);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({
    mobile: false,
    utility: false,
    community: false
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const totalMonths = data.evidence.reduce((sum, f) => sum + f.months, 0);
    setFileProgress(Math.min(totalMonths, 6));
  }, [data.evidence]);

  useEffect(() => {
    // Test Supabase connection on component mount
    testSupabaseConnection().then(connected => {
      setSupabaseConnected(connected);
      if (connected) {
        console.log('✅ Supabase connected - files will be uploaded directly');
      } else {
        console.log('❌ Supabase connection failed - files will be stored locally');
      }
    });
  }, []);

  const handleMobileChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onUpdate({ mobile: { ...data.mobile, [e.target.name]: e.target.value } });
  };

  const handleUtilityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onUpdate({ utility: { ...data.utility, [e.target.name]: e.target.value } });
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onUpdate({ community: { ...data.community, [e.target.name]: e.target.value } });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: 'mobile' | 'utility' | 'community') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, [category]: true }));
    setUploadError(null);

    try {
      // Convert FileList to File array
      const fileArray = Array.from(files);
      
      console.log(`🔄 Uploading ${fileArray.length} ${category} files directly to Supabase...`);
      
      // Upload files directly to Supabase
      const uploadedFiles = await uploadFilesToSupabase(fileArray, category, 'frontend-user');
      
      // Add uploaded files to evidence with proper category
      const newEvidenceFiles: EvidenceFile[] = uploadedFiles.map(file => ({
        name: file.originalName,
        type: category, // Use the category parameter
        months: 3, // Default months coverage
        url: file.url,
        uploadedAt: file.uploadedAt
      }));
      
      onUpdate({ evidence: [...data.evidence, ...newEvidenceFiles] });
      
      console.log(`✅ ${category} files uploaded successfully to Supabase!`);
      
    } catch (error) {
      console.error(`❌ ${category} file upload failed:`, error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      
      // Fallback: Add files locally without upload
      const newFiles: EvidenceFile[] = Array.from(files).map((f: File) => ({
        name: f.name,
        type: category, // Use the category parameter
        months: 1 // Default to 1 month coverage
      }));
      onUpdate({ evidence: [...data.evidence, ...newFiles] });
      
    } finally {
      setUploading(prev => ({ ...prev, [category]: false }));
      // Clear the input
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newEvidence = data.evidence.filter((_, i) => i !== index);
    onUpdate({ evidence: newEvidence });
  };

  const isComplete = data.evidence.length >= 1;

  const isAnyUploading = Object.values(uploading).some(Boolean);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Core Trust Profile</h3>
        <p className="text-slate-500 text-sm">Demonstrate real, observable financial behavior.</p>
      </div>

      <div className="space-y-6">
        {/* Section A: Mobile Stability */}
        <section className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📱</span>
            <h4 className="font-bold text-slate-800">Mobile Stability</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">SIM Duration</label>
              <select name="simDuration" value={data.mobile.simDuration} onChange={handleMobileChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="less_than_6_months">Less than 6 months</option>
                <option value="6_months_to_1_year">6 months - 1 year</option>
                <option value="1_to_2_years">1 - 2 years</option>
                <option value="more_than_2_years">More than 2 years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Recharge Regularity</label>
              <select name="rechargeRegularity" value={data.mobile.rechargeRegularity} onChange={handleMobileChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="very_regular">Very regular</option>
                <option value="mostly_regular">Mostly regular</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Usage Consistency</label>
              <select name="usageConsistency" value={data.mobile.usageConsistency} onChange={handleMobileChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="very_stable">Very stable pattern</option>
                <option value="stable">Stable pattern</option>
                <option value="fluctuating">Fluctuating</option>
              </select>
            </div>
          </div>
          
          {/* Mobile Evidence Upload */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-blue-700 uppercase">Mobile Evidence</label>
              <span className="text-xs text-blue-600">
                {data.evidence.filter(f => f.type === 'mobile').length} files
              </span>
            </div>
            <div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
              uploading.mobile ? 'border-blue-300 bg-blue-100' : 'border-blue-200 hover:bg-blue-100/50'
            }`}>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'mobile')} 
                disabled={uploading.mobile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <div className={`text-xs font-medium ${uploading.mobile ? 'text-blue-700' : 'text-blue-600'}`}>
                {uploading.mobile ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload mobile bills, recharge receipts'
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section B: Utility Discipline */}
        <section className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <h4 className="font-bold text-slate-800">Utility Payment Discipline</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">On-time Behavior</label>
              <select name="onTimePayment" value={data.utility.onTimePayment} onChange={handleUtilityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="always">Always on time</option>
                <option value="mostly">Mostly on time</option>
                <option value="sometimes">Sometimes late</option>
                <option value="often_late">Often late</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Delay Frequency</label>
              <select name="delayFrequency" value={data.utility.delayFrequency} onChange={handleUtilityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="occasionally">Occasionally</option>
                <option value="frequently">Frequently</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bill Predictability</label>
              <select name="billPredictability" value={data.utility.billPredictability} onChange={handleUtilityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="very_consistent">Very consistent amounts</option>
                <option value="consistent">Consistent amounts</option>
                <option value="variable">Variable amounts</option>
                <option value="highly_variable">Highly variable</option>
              </select>
            </div>
          </div>
          
          {/* Utility Evidence Upload */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-yellow-700 uppercase">Utility Evidence</label>
              <span className="text-xs text-yellow-600">
                {data.evidence.filter(f => f.type === 'utility').length} files
              </span>
            </div>
            <div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
              uploading.utility ? 'border-yellow-300 bg-yellow-100' : 'border-yellow-200 hover:bg-yellow-100/50'
            }`}>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'utility')} 
                disabled={uploading.utility}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <div className={`text-xs font-medium ${uploading.utility ? 'text-yellow-700' : 'text-yellow-600'}`}>
                {uploading.utility ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload electricity, water, gas bills'
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section C: Community Reliability */}
        <section className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🧑‍🤝‍🧑</span>
            <h4 className="font-bold text-slate-800">Community Reliability</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Group Participation</label>
              <select name="groupParticipation" value={data.community.groupParticipation} onChange={handleCommunityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="very_active">Very active member</option>
                <option value="active">Active member</option>
                <option value="passive">Passive member</option>
                <option value="none">No participation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Shared Resp.</label>
              <select name="sharedResponsibility" value={data.community.sharedResponsibility} onChange={handleCommunityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="high">Handles group funds</option>
                <option value="medium">Helps occasionally</option>
                <option value="low">Limited responsibility</option>
                <option value="none">No responsibility</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dispute History</label>
              <select name="disputeHistory" value={data.community.disputeHistory} onChange={handleCommunityChange} className="w-full p-2 rounded-lg border-slate-200 text-sm">
                <option value="">Select...</option>
                <option value="clear">Clear record</option>
                <option value="minor">Minor disputes resolved</option>
                <option value="some">Some unresolved issues</option>
                <option value="major">Major disputes</option>
              </select>
            </div>
          </div>
          
          {/* Community Evidence Upload */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-green-700 uppercase">Community Evidence</label>
              <span className="text-xs text-green-600">
                {data.evidence.filter(f => f.type === 'community').length} files
              </span>
            </div>
            <div className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
              uploading.community ? 'border-green-300 bg-green-100' : 'border-green-200 hover:bg-green-100/50'
            }`}>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'community')} 
                disabled={uploading.community}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <div className={`text-xs font-medium ${uploading.community ? 'text-green-700' : 'text-green-600'}`}>
                {uploading.community ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload group receipts, community proofs'
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h4 className="font-bold text-indigo-900">Evidence Summary</h4>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${data.evidence.length >= 1 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {data.evidence.length} file{data.evidence.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">
                {data.evidence.filter(f => f.type === 'mobile').length}
              </div>
              <div className="text-xs text-blue-600">Mobile Files</div>
              <div className="text-[10px] text-blue-500 mt-1">
                {data.evidence.filter(f => f.type === 'mobile' && f.url).length} uploaded
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-700">
                {data.evidence.filter(f => f.type === 'utility').length}
              </div>
              <div className="text-xs text-yellow-600">Utility Files</div>
              <div className="text-[10px] text-yellow-500 mt-1">
                {data.evidence.filter(f => f.type === 'utility' && f.url).length} uploaded
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">
                {data.evidence.filter(f => f.type === 'community').length}
              </div>
              <div className="text-xs text-green-600">Community Files</div>
              <div className="text-[10px] text-green-500 mt-1">
                {data.evidence.filter(f => f.type === 'community' && f.url).length} uploaded
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
              <strong>Upload Error:</strong> {uploadError}
              <br />
              <em>Files were added locally. You can continue the assessment.</em>
            </div>
          )}

          {supabaseConnected !== null && (
            <div className={`p-3 rounded-lg text-xs ${
              supabaseConnected 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              <strong>Storage Status:</strong> {
                supabaseConnected 
                  ? '✅ Connected to Supabase - files will be uploaded securely' 
                  : '⚠️ Offline mode - files stored locally only'
              }
            </div>
          )}

          <p className="text-[10px] text-slate-400 italic text-center">
            "Upload at least 1 evidence file from any category. Supported: PDF, JPG, PNG, DOC, DOCX, TXT (max 10MB each)"
          </p>
        </section>
      </div>

      <button 
        disabled={!isComplete || isAnyUploading}
        onClick={onNext}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          isComplete && !isAnyUploading
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isAnyUploading ? 'Uploading files...' : 'Continue Assessment'}
      </button>
    </div>
  );
};

export default CoreTrustForm;