import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    status: { type: String, enum: ['open', 'closed', 'converted'], default: 'open' },
    nextFollowUpDate: { type: Date },
    lastContactDate: { type: Date },
    count: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

followUpSchema.index({ status: 1, nextFollowUpDate: 1 });

export default mongoose.model('FollowUp', followUpSchema);
