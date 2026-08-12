import mongoose from 'mongoose';

const websiteAnalysisSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['success', 'error'], default: 'success' },
    response: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

websiteAnalysisSchema.index({ leadId: 1, analyzedAt: -1 });

export default mongoose.model('WebsiteAnalysis', websiteAnalysisSchema);
