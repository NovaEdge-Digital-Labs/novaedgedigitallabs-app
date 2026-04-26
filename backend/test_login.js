const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'test@example.com';
        const password = 'password123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
        } else {
            const isMatch = await user.comparePassword(password);
            console.log('Password match:', isMatch);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
