import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './server/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server/.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');

        const email = 'admin@urbanglow.com';
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            const admin = new User({
                name: 'Super Admin',
                email,
                phone: '1234567890',
                password: hashedPassword,
                role: 'Admin'
            });
            await admin.save();
            console.log('Admin user created: admin@urbanglow.com / Admin123!');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
