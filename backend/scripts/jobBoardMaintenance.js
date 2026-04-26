const mongoose = require('mongoose');
const JobListing = require('./src/models/JobListing.model');
const PremiumJobSeeker = require('./src/models/PremiumJobSeeker.model');
require('dotenv').config();

const handleExpiry = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for expiry check...');

        const now = new Date();

        // 1. Deactivate Jobs
        const expiredJobs = await JobListing.updateMany(
            { expiryDate: { $lt: now }, isActive: true },
            { isActive: false }
        );
        console.log(`Expired Jobs Deactivated: ${expiredJobs.modifiedCount}`);

        // 2. Mark Premium Seekers as Expired
        const expiredPremium = await PremiumJobSeeker.updateMany(
            { expiryDate: { $lt: now }, status: 'active' },
            { status: 'expired' }
        );
        console.log(`Expired Premium seekers marked: ${expiredPremium.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Expiry task failed:', error);
        process.exit(1);
    }
};

handleExpiry();
