const mongoose = require('mongoose');
const User = require('../src/models/User.model');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin@novaedge.io';
        const password = 'AdminPassword123!';

        let user = await User.findOne({ email });
        if (user) {
            user.password = password;
            user.role = 'admin';
            await user.save();
            console.log('Admin user updated');
        } else {
            user = await User.create({
                name: 'System Administrator',
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
