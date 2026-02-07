import mongoose from 'mongoose';

const TaxSchema = new mongoose.Schema({
    name: { type: String, required: true },
    percentage: { type: Number, required: true },
    type: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Tax', TaxSchema);
