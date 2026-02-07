import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    planType: { type: String, enum: ['Duration-based', 'Package-based'], default: 'Duration-based' },
    price: { type: Number, required: true },
    billingInterval: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: 'Monthly' },
    minQuantity: { type: Number, default: 1 },
    startDate: Date,
    endDate: Date,
    options: {
        autoClose: { type: Boolean, default: false },
        closable: { type: Boolean, default: true },
        pausable: { type: Boolean, default: true },
        renewable: { type: Boolean, default: true }
    },
    servicesIncluded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);
