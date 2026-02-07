import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, default: 'General' },
    image: { type: String }, // For image URL
    duration: Number
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
