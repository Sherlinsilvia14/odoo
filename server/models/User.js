import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Internal', 'Customer', 'Manager', 'Receptionist', 'Stylist', 'Staff'], default: 'Customer' },

    // Reset Password Fields
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
