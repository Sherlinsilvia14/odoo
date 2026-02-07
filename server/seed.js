import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Service from './models/Service.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Plan from './models/Plan.js';
import Subscription from './models/Subscription.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const services = [
    { name: 'Classic Haircut', description: 'Professional haircut and styling', price: 500, category: 'Hair', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80' },
    { name: 'Beard Trim & Shape', description: 'Precise beard grooming', price: 300, category: 'Grooming', image: 'https://images.unsplash.com/photo-1621605815841-2a662f5b44f1?auto=format&fit=crop&q=80' },
    { name: 'Luxury Clean Shave', description: 'Hot towel and straight razor shave', price: 400, category: 'Grooming', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80' },
    { name: 'Hair Coloring', description: 'Global coloring or highlights', price: 1500, category: 'Hair', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80' },
    { name: 'Express Facial', description: 'Refresh and glow in 30 mins', price: 800, category: 'Skin', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80' },
    { name: 'Royal Pedicure', description: 'Complete foot care and massage', price: 1200, category: 'Skin', image: 'https://images.unsplash.com/photo-1519415510236-85592864a75a?auto=format&fit=crop&q=80' },
    { name: 'Hand Spa / Manicure', description: 'Nail shaping and relaxation', price: 1000, category: 'Skin', image: 'https://images.unsplash.com/photo-1610992015732-2449b0c26670?auto=format&fit=crop&q=80' },
    { name: 'Rejuvenating Hair Spa', description: 'Deep conditioning treatment', price: 1800, category: 'Hair', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80' }
];

const products = [
    { name: 'Signature Hair Wax', description: 'Strong hold, matte finish', type: 'Goods', category: 'Hair Care', salesPrice: 450, costPrice: 200 },
    { name: 'Argan Beard Oil', description: 'Softens and conditions beard', type: 'Goods', category: 'Grooming', salesPrice: 600, costPrice: 250 },
    { name: 'Hydrating Face Cream', description: '24h moisture for glowing skin', type: 'Goods', category: 'Skin Care', salesPrice: 850, costPrice: 400 },
    { name: 'Professional Hair Dryer', description: 'Ionic technology for fast drying', type: 'Goods', category: 'Tools', salesPrice: 3500, costPrice: 1800 }
];

const plans = [
    { name: 'Elite Salon Membership', price: 2999, billingInterval: 'Monthly', status: 'Active' },
    { name: 'Grooming Basics', price: 999, billingInterval: 'Monthly', status: 'Active' },
    { name: 'Wellness Year Pass', price: 25000, billingInterval: 'Yearly', status: 'Active' }
];

const internalUsers = [
    { name: 'Alex Johnson', email: 'alex@urbanglow.com', phone: '9988776655', password: 'Password123!', role: 'Stylist' },
    { name: 'Sarah Miller', email: 'sarah@urbanglow.com', phone: '9988776644', password: 'Password123!', role: 'Stylist' },
    { name: 'Mike Ross', email: 'mike@urbanglow.com', phone: '9988776633', password: 'Manager' },
    { name: 'Rachel Zane', email: 'rachel@urbanglow.com', phone: '9988776622', password: 'Receptionist' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_glow');
        console.log('Connected to MongoDB');

        // Clear and seed core entities
        await Service.deleteMany({});
        await Service.insertMany(services);
        console.log('Services seeded');

        await Product.deleteMany({});
        const seededProducts = await Product.insertMany(products);
        console.log('Products seeded');

        await Plan.deleteMany({});
        const seededPlans = await Plan.insertMany(plans);
        console.log('Plans seeded');

        // Seed Users
        let customers = await User.find({ role: 'Customer' });
        if (customers.length === 0) {
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            const user = new User({ name: 'Demo Customer', email: 'demo@customer.com', phone: '1234567890', password: hashedPassword, role: 'Customer' });
            await user.save();
            customers = [user];
            console.log('Demo Customer created');
        }

        for (const u of internalUsers) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await new User({ ...u, password: hashedPassword }).save();
                console.log(`Internal User ${u.name} added`);
            }
        }

        // Seed some Subscriptions/Invoices for the Demo Customer
        await Subscription.deleteMany({});
        await Invoice.deleteMany({});
        await Payment.deleteMany({});

        const demoSub = new Subscription({
            subscriptionNumber: 'SUB-1001',
            customer: customers[0]._id,
            plan: seededPlans[0]._id,
            totalAmount: seededPlans[0].price,
            status: 'Active',
            startDate: new Date(),
            items: [{
                product: seededProducts[0]._id,
                name: seededProducts[0].name,
                quantity: 1,
                unitPrice: seededProducts[0].salesPrice,
                amount: seededProducts[0].salesPrice
            }]
        });
        await demoSub.save();
        console.log('Sample Subscription created');

        const demoInvoice = new Invoice({
            invoiceNumber: 'INV-2001',
            customer: customers[0]._id,
            subscription: demoSub._id,
            total: 2999,
            status: 'Paid',
            items: [{ description: 'Elite Membership - Feb', quantity: 1, unitPrice: 2999, amount: 2999 }]
        });
        await demoInvoice.save();
        console.log('Sample Invoice created');

        const demoPayment = new Payment({
            invoice: demoInvoice._id,
            customer: customers[0]._id,
            amount: 2999,
            method: 'UPI'
        });
        await demoPayment.save();
        console.log('Sample Payment created');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
