import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Expiry Warning', 'Promotion', 'Credit Update', 'Manual'], default: 'Expiry Warning' },
    message: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Sent' },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
