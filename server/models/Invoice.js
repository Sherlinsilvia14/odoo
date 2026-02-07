import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        amount: Number
    }],
    subtotal: Number,
    taxTotal: Number,
    total: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Confirmed', 'Paid', 'Cancelled'], default: 'Draft' },
    dueDate: Date,
    notes: String
}, { timestamps: true });

export default mongoose.model('Invoice', InvoiceSchema);
