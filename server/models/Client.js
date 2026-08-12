import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    businessName: { type: String, index: true },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    country: { type: String },
    city: { type: String },
    address: { type: String },
    source: { type: String },
    leadIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
    projectCount: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    repeatClient: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
