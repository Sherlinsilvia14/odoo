import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['Service', 'Goods'], default: 'Service' },
    category: { type: String },
    salesPrice: { type: Number, required: true },
    costPrice: { type: Number },
    isRecurring: { type: Boolean, default: false },
    variants: [{
        attribute: String,
        value: String,
        extraPrice: Number
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
