const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../src/models/Course.model');

const updateCourseData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // New reliable URL
        const directVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        
        // Update all courses
        const result = await Course.updateMany(
            {},
            { 
                $set: { 
                    previewVideoUrl: directVideoUrl,
                    'lectures.$[].videoUrl': directVideoUrl
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} courses with reliable video links.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating courses:', error);
        process.exit(1);
    }
};

updateCourseData();
