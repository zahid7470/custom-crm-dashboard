import mongoose from 'mongoose';

const clientOfferSchema = new mongoose.Schema(
  {
    offerId: { type: String, unique: true, required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    clientDetails: { type: String },
    clientStatus: { type: String, enum: ['new', 'repeat'], default: 'new' },
    requirement: { type: String, required: true },
    service: { type: String, required: true },
    scope: { type: String },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'completed', 'cancelled'], default: 'draft' },
    offerDate: { type: Date, default: Date.now },
    pdfPath: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('ClientOffer', clientOfferSchema);
