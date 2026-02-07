import mongoose from 'mongoose';

const TaxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    percentage: { type: Number, required: true },
    type: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    applicablePlanInterval: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'All'], default: 'All' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Tax', TaxSchema);
