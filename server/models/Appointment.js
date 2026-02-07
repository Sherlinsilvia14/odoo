import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'], default: 'Pending' },
    notes: String,
    price: Number // Actual price at booking
}, { timestamps: true });

export default mongoose.model('Appointment', AppointmentSchema);
