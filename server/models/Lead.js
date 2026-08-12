import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['map', 'facebook'], required: true, index: true },
    externalId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'responded', 'no_response', 'closed_client'],
      default: 'pending',
      index: true,
    },

    sourceData: { type: mongoose.Schema.Types.Mixed },

    name: { type: String, index: true },
    businessName: { type: String, index: true },
    category: { type: String },
    phone: { type: String, index: true },
    email: { type: String, index: true },
    website: { type: String, index: true },
    hasWebsite: { type: Boolean, default: false, index: true },

    country: { type: String, index: true },
    city: { type: String, index: true },
    address: { type: String },
    timezone: { type: String },

    websiteAnalysis: {
      analyzed: { type: Boolean, default: false },
      analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebsiteAnalysis' },
      analyzedAt: { type: Date },
    },

    followUp: {
      required: { type: Boolean, default: false },
      nextFollowUpDate: { type: Date },
      count: { type: Number, default: 0 },
      lastFollowUpDate: { type: Date },
      notes: { type: String },
    },

    client: {
      isClient: { type: Boolean, default: false },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    },

    contactedAt: { type: Date },
    respondedAt: { type: Date },
    closedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

leadSchema.index({ source: 1, externalId: 1 }, { unique: true });
leadSchema.index({ createdAt: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
