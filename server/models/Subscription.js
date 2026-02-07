import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
    subscriptionNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // Optional if custom
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    paymentTerms: { type: String, default: 'Immediate' },
    status: { type: String, enum: ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'], default: 'Draft' }, // Added Quotation status flow

    // Order Lines
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String, // Snapshot
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax' }],
        amount: Number
    }],

    subtotal: Number,
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    planAmount: { type: Number, default: 0 },
    serviceCost: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    notes: String
}, { timestamps: true });

// Auto-generate subscription number hook could go here

export default mongoose.model('Subscription', SubscriptionSchema);
