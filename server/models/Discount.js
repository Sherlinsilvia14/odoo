import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Fixed', 'Percentage'], required: true },
    value: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    minQuantity: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Discount', DiscountSchema);
