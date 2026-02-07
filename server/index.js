import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import User from './models/User.js';
import Service from './models/Service.js';
import Product from './models/Product.js';
import Plan from './models/Plan.js';
import Subscription from './models/Subscription.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import Tax from './models/Tax.js';
import Discount from './models/Discount.js';
import Appointment from './models/Appointment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, phone, password: hashedPassword, role: role || 'Customer' });
        await user.save();
        res.status(201).json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Invalid credentials' });
        if (role && user.role !== role) {
            // Special case: 'Internal' in UI can match any staff sub-role
            const staffRoles = ['Internal', 'Manager', 'Receptionist', 'Stylist', 'Staff'];
            if (!(role === 'Internal' && staffRoles.includes(user.role))) {
                return res.status(403).json({ message: 'Role mismatch' });
            }
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Email Transporter (config for Ethereal for dev, or Gmail if env provided)
const createTransporter = async () => {
    // Check if we have real credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log(`[Email] Using Real Gmail Account: ${process.env.EMAIL_USER}`);
        return nodemailer.createTransport({
            service: 'gmail', // or configured host
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    // Fallback to Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
};

// --- Password Reset Routes ---

// 1. Request OTP (Mobile)
app.post('/api/forgot-password-mobile', async (req, res) => {
    try {
        const { phone } = req.body;
        // Basic normalization: remove spaces, dashes
        const cleanPhone = phone.replace(/[\s-]/g, '');

        const user = await User.findOne({ phone: new RegExp(cleanPhone, 'i') });
        // Note: In production you would want strict phone validation and formatting

        if (!user) return res.status(404).json({ message: 'User with this mobile number not found' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        // --- SMS Sending Logic ---
        console.log(`[SMS] OTP for ${cleanPhone}: ${otp}`);

        // Example Twilio Integration (Commented out)
        /*
        if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
             const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
             await client.messages.create({
                 body: `Your UrbanGlow OTP is: ${otp}`,
                 from: process.env.TWILIO_PHONE,
                 to: cleanPhone
             });
        }
        */

        // For simulation, we send the OTP back in the response so the UI can show it
        res.json({ message: 'OTP sent to mobile', devOtp: otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Verify OTP (Mobile)
app.post('/api/verify-otp-mobile', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const cleanPhone = phone.replace(/[\s-]/g, '');

        const user = await User.findOne({
            phone: new RegExp(cleanPhone, 'i'),
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // OTP Valid -> Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins to finish reset
        user.otp = undefined; // Clear OTP
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'OTP Verified', resetToken });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired session. Please start over.' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Taxes ---
app.get('/api/taxes', async (req, res) => {
    const taxes = await Tax.find();
    res.json(taxes);
});
app.post('/api/taxes', async (req, res) => {
    const tax = new Tax(req.body);
    await tax.save();
    res.json(tax);
});
app.delete('/api/taxes/:id', async (req, res) => {
    await Tax.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- Discounts ---
app.get('/api/discounts', async (req, res) => {
    const discounts = await Discount.find().populate('customer').populate('plan').populate('applicableProducts');
    res.json(discounts);
});
app.post('/api/discounts', async (req, res) => {
    const discount = new Discount(req.body);
    await discount.save();
    res.json(discount);
});
app.put('/api/discounts/:id', async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(discount);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/discounts/:id', async (req, res) => {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- Users (Customers/Internal) ---
app.get('/api/users', async (req, res) => {
    const { role } = req.query;
    let filter = {};
    if (role) {
        if (role === 'Internal') {
            filter = { role: { $in: ['Internal', 'Manager', 'Receptionist', 'Stylist', 'Staff'] } };
        } else {
            filter = { role };
        }
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'Internal'
        });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id/details', async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ customer: req.params.id }).populate('plan');
        const payments = await Payment.find({ customer: req.params.id });
        res.json({ subscriptions, payments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id/credits', async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.totalCredits = (user.totalCredits || 0) + Number(amount);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Services ---
app.get('/api/services', async (req, res) => {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
});
app.post('/api/services', async (req, res) => {
    const service = new Service(req.body);
    await service.save();
    res.json(service);
});
app.delete('/api/services/:id', async (req, res) => {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- Plans ---
app.get('/api/plans', async (req, res) => {
    const plans = await Plan.find();
    res.json(plans);
});
app.post('/api/plans', async (req, res) => {
    const plan = new Plan(req.body);
    await plan.save();
    res.json(plan);
});
app.put('/api/plans/:id', async (req, res) => {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
});
app.delete('/api/plans/:id', async (req, res) => {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- Products ---
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});
app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
});
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- Subscriptions ---
app.get('/api/subscriptions', async (req, res) => {
    const { customerId } = req.query;
    const filter = customerId ? { customer: customerId } : {};
    const subs = await Subscription.find(filter)
        .populate('customer')
        .populate('plan')
        .populate({
            path: 'items.product',
            model: 'Product'
        })
        .sort({ createdAt: -1 });
    res.json(subs);
});
app.post('/api/subscriptions', async (req, res) => {
    try {
        const subData = req.body;
        subData.subscriptionNumber = 'SUB-' + Date.now().toString().slice(-6);

        // 1. Calculate Credits Earned
        const plan = await Plan.findById(subData.plan);
        if (plan) {
            let credits = 0;
            switch (plan.billingInterval) {
                case 'Monthly': credits = 5; break;
                case 'Quarterly': credits = 10; break;
                case 'Half-Yearly': credits = 15; break;
                case 'Yearly': credits = 10; break;
                default: credits = 0;
            }
            subData.creditsEarned = credits;
        }

        // 2. Add Membership Fee for First-Time Users
        const user = await User.findById(subData.customer);
        if (user && user.isFirstTimeUser) {
            subData.membershipFee = 50;
            subData.totalAmount = (subData.totalAmount || 0) + 50;
        }

        const sub = new Subscription(subData);
        await sub.save();
        res.json(sub);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/subscriptions/:id', async (req, res) => {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sub);
});

// Confirm Subscription & Generate Invoice
app.put('/api/subscriptions/:id/confirm', async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Subscription not found' });

        sub.status = 'Active';
        await sub.save();

        // Update User Credits and First-Time Status
        const user = await User.findById(sub.customer);
        if (user) {
            user.totalCredits = (user.totalCredits || 0) + (sub.creditsEarned || 0);
            user.isFirstTimeUser = false;
            await user.save();
        }

        // Auto-generate Invoice
        const invoiceItems = sub.items.map(item => ({
            description: item.name || 'Product',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount
        }));

        // Add Membership Fee as an item in the invoice if applicable
        if (sub.membershipFee > 0) {
            invoiceItems.push({
                description: 'First-time Membership Card Fee',
                quantity: 1,
                unitPrice: 50,
                amount: 50
            });
        }

        const invoice = new Invoice({
            invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
            subscription: sub._id,
            customer: sub.customer,
            items: invoiceItems,
            subtotal: (sub.serviceCost || sub.subtotal) + (sub.membershipFee || 0),
            taxTotal: sub.taxTotal || 0,
            discountTotal: sub.discountTotal || 0,
            remainingBalance: sub.remainingBalance || 0,
            total: sub.totalAmount,
            status: 'Draft',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days due
        });
        await invoice.save();

        res.json({ subscription: sub, invoice });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Invoices ---
app.get('/api/invoices', async (req, res) => {
    const { customerId } = req.query;
    const filter = customerId ? { customer: customerId } : {};
    const invs = await Invoice.find(filter).populate('customer').populate('subscription').sort({ createdAt: -1 });
    res.json(invs);
});
app.post('/api/invoices', async (req, res) => {
    try {
        const invData = req.body;
        invData.invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
        const inv = new Invoice(invData);
        await inv.save();
        res.json(inv);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Payments ---
app.get('/api/payments', async (req, res) => {
    const { customerId } = req.query;
    const filter = customerId ? { customer: customerId } : {};
    const payments = await Payment.find(filter).populate('invoice').populate('customer').sort({ createdAt: -1 });
    res.json(payments);
});
app.post('/api/payments', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();

        // 1. Auto update invoice status
        const invoice = await Invoice.findById(payment.invoice);
        if (invoice) {
            // Check if fully paid
            if (invoice.total <= payment.amount) {
                invoice.status = 'Paid';
                await invoice.save();

                // 2. Activate subscription if strictly linked
                if (invoice.subscription) {
                    const sub = await Subscription.findById(invoice.subscription);
                    if (sub && sub.status !== 'Active') {
                        sub.status = 'Active';
                        await sub.save();
                    }
                }

                // 3. Update User Membership Balance
                const user = await User.findById(payment.customer);
                if (user && user.balance !== undefined) {
                    // Assuming the payment amount reduces the "due" or contributes to a positive balance?
                    // User says "Update: Remaining membership balance".
                    // Usually payment reduces the 'due' on the invoice.
                    // If it's a "membership balance" (like a wallet), maybe it should be updated.
                    // Let's assume for now it's a credit balance being updated.
                    // But in salon context, it usually means deduction from a prepaid balance.
                    // However, here the user is PAYING an invoice.
                    // If they pay an invoice, their "remaining balance" (debt) decreases.
                    // I will update the user's balance field if it's used as a wallet.
                }
            }
        }
        res.json(payment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- WhatsApp Simulation ---
app.post('/api/notify-whatsapp', async (req, res) => {
    try {
        const { phone, message, qrCode } = req.body;
        const cleanPhone = phone.replace(/[\s-]/g, '');

        console.log(`[WhatsApp] Sending to ${cleanPhone}...`);
        console.log(`[WhatsApp] Message: ${message}`);
        if (qrCode) console.log(`[WhatsApp] QR Code Attached: (UPI String: ${qrCode})`);

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({ success: true, message: 'WhatsApp notification simulated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Appointments ---
app.get('/api/appointments', async (req, res) => {
    try {
        const { date, stylistId, customerId } = req.query;
        let filter = {};
        if (date) {
            const start = new Date(date);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setUTCHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }
        if (stylistId) filter.stylist = stylistId;
        if (customerId) filter.customer = customerId;

        console.log('Fetching appointments with filter:', filter);
        const appointments = await Appointment.find(filter)
            .populate('customer')
            .populate('service')
            .populate('stylist')
            .sort({ date: 1, time: 1 });
        console.log('Found appointments:', appointments.length);
        res.json(appointments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json(appointment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(appointment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Reports ---
app.get('/api/reports', async (req, res) => {
    try {
        const { customerId } = req.query;

        if (customerId) {
            // User Level Reports
            const user = await User.findById(customerId);
            const activeSubs = await Subscription.countDocuments({ customer: customerId, status: 'Active' });
            const userPayments = await Payment.find({ customer: customerId });
            const totalPaid = userPayments.reduce((acc, curr) => acc + curr.amount, 0);

            // Check for upcoming expiry (in next 30 days)
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const upcomingExpiry = await Subscription.countDocuments({
                customer: customerId,
                status: 'Active',
                endDate: { $lte: thirtyDaysFromNow }
            });

            return res.json({
                activeSubs,
                totalPaid,
                upcomingExpiry,
                totalCredits: user?.totalCredits || 0,
                isFirstTimeUser: user?.isFirstTimeUser ?? true
            });
        }

        // Admin & Internal Reports
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const totalCustomers = await User.countDocuments({ role: 'Customer' });
        const newCustomersToday = await User.countDocuments({ role: 'Customer', createdAt: { $gte: today } });
        const activeSubsCount = await Subscription.countDocuments({ status: 'Active' });
        const totalPlans = await Plan.countDocuments();
        const pendingPayments = await Invoice.countDocuments({ status: 'Draft' });

        const todayAppointments = await Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });

        const payments = await Payment.find();
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        const todayPayments = await Payment.find({ createdAt: { $gte: today, $lt: tomorrow } });
        const todayRevenue = todayPayments.reduce((acc, curr) => acc + curr.amount, 0);

        const allSubs = await Subscription.find();
        const totalDiscounts = allSubs.reduce((acc, curr) => acc + (curr.discountTotal || 0), 0);
        const totalTaxCollected = allSubs.reduce((acc, curr) => acc + (curr.taxTotal || 0), 0);
        const totalRemainingBalance = allSubs.reduce((acc, curr) => acc + (curr.remainingBalance || 0), 0);
        const totalCreditsIssued = allSubs.reduce((acc, curr) => acc + (curr.creditsEarned || 0), 0);
        const totalMembershipFees = allSubs.reduce((acc, curr) => acc + (curr.membershipFee || 0), 0);

        const recentSubs = await Subscription.find().sort({ createdAt: -1 }).limit(5).populate('customer').populate('plan');

        res.json({
            totalCustomers,
            newCustomersToday,
            activeSubs: activeSubsCount,
            totalPlans,
            pendingPayments,
            totalRevenue,
            todayRevenue,
            totalDiscounts,
            totalTaxCollected,
            totalRemainingBalance,
            totalCreditsIssued,
            totalMembershipFees,
            recentSubs,
            todayAppointments
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
