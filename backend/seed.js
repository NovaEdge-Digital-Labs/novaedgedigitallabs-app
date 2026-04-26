const mongoose = require('mongoose');
const User = require('./src/models/User.model');
require('dotenv').config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const email = 'test@example.com';
        const password = 'password123';

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists');
        } else {
            await User.create({
                name: 'Test User',
                email,
                password,
            });
            console.log('Test user created: test@example.com / password123');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
