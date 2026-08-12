import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientOffer' },
    title: { type: String, required: true },
    requirement: { type: String },
    service: { type: String },
    description: { type: String },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'handed_over', 'support', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    handoverDate: { type: Date },
    supportStartDate: { type: Date },
    supportEndDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

projectSchema.index({ supportEndDate: 1 });

export default mongoose.model('Project', projectSchema);
