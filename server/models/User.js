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
    resetPasswordExpires: Date,
    balance: { type: Number, default: 0 },
    membershipDiscount: { type: Number, default: 0 }, // Percentage
    totalCredits: { type: Number, default: 0 },
    isFirstTimeUser: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
