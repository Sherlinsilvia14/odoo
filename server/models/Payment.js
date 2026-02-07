import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'Card', 'UPI', 'NetBanking'], default: 'Cash' },
    date: { type: Date, default: Date.now() },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', PaymentSchema);
