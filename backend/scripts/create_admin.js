const mongoose = require('mongoose');
const User = require('../src/models/User.model');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const name = process.env.ADMIN_NAME || 'System Administrator';

        if (!email || !password) {
            throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
        }

        let user = await User.findOne({ email });
        if (user) {
            user.password = password;
            user.role = 'admin';
            if (name) {
                user.name = name;
            }
            await user.save();
            console.log('Admin user updated');
        } else {
            user = await User.create({
                name,
                email,
                password,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
