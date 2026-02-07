import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Fixed', 'Percentage'], default: 'Percentage' },
    value: { type: Number, required: true },
    applicablePlanInterval: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'All'], default: 'All' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Discount', DiscountSchema);
