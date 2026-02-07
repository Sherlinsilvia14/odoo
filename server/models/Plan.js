import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    billingInterval: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'], default: 'Monthly' },
    minQuantity: { type: Number, default: 1 },
    startDate: Date,
    endDate: Date,
    options: {
        autoClose: { type: Boolean, default: false },
        closable: { type: Boolean, default: true },
        pausable: { type: Boolean, default: true },
        renewable: { type: Boolean, default: true }
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);
