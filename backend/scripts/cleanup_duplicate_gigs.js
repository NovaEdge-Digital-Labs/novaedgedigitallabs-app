const mongoose = require('mongoose');
const Gig = require('../src/models/Gig.model');
require('dotenv').config();

const cleanupDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const gigs = await Gig.find().sort({ createdAt: 1 });
        console.log(`Total gigs in DB: ${gigs.length}`);

        const seenTitles = new Set();
        let deletedCount = 0;

        for (const gig of gigs) {
            const titleKey = (gig.title || '').trim().toLowerCase();
            if (seenTitles.has(titleKey)) {
                await Gig.findByIdAndDelete(gig._id);
                deletedCount++;
                console.log(`Deleted duplicate gig ID: ${gig._id} (${gig.title})`);
            } else {
                seenTitles.add(titleKey);
            }
        }

        console.log(`Cleanup complete! Removed ${deletedCount} duplicate gigs.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
};

cleanupDuplicates();
