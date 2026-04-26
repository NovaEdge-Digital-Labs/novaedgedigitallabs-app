const mongoose = require('mongoose');
const Course = require('./src/models/Course.model');
require('dotenv').config();

const courses = [
    {
        title: 'Mastering React Native & Expo',
        description: 'Learn to build premium cross-platform mobile apps using React Native, Expo, and Reanimated.',
        instructor: {
            name: 'Amit Kumar',
            bio: 'Senior Full Stack Developer with 8+ years of experience in mobile and web development.',
            avatar: 'https://i.pravatar.cc/150?u=amit'
        },
        price: 499,
        originalPrice: 1999,
        category: 'App Development',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
        totalDuration: '10h 30m',
        lectures: [
            {
                title: 'Introduction to Expo SDK 54',
                duration: '12:45',
                videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                freePreview: true
            },
            {
                title: 'Setting up the Development Environment',
                duration: '15:20',
                videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                freePreview: false
            }
        ],
        tags: ['React Native', 'Expo', 'Mobile App'],
        enrolledCount: 1240,
        rating: 4.8
    },
    {
        title: 'Full Stack Web Dev with Next.js',
        description: 'Build modern, high-performance web applications with Next.js 15, Tailwind CSS, and MongoDB.',
        instructor: {
            name: 'Priya Sharma',
            bio: 'Web Architect specializing in scalable frontend systems.',
            avatar: 'https://i.pravatar.cc/150?u=priya'
        },
        price: 399,
        originalPrice: 1499,
        category: 'Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60',
        totalDuration: '8h 45m',
        lectures: [
            {
                title: 'Understanding App Router',
                duration: '10:15',
                videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                freePreview: true
            }
        ],
        tags: ['Next.js', 'React', 'Web Development'],
        enrolledCount: 850,
        rating: 4.7
    },
    {
        title: 'Freelancing Mastery for Developers',
        description: 'Learn how to land high-paying international clients and scale your freelancing business.',
        instructor: {
            name: 'Rahul Varma',
            bio: 'Top-rated Freelancer with over $500k in earnings on Upwork.',
            avatar: 'https://i.pravatar.cc/150?u=rahul'
        },
        price: 299,
        originalPrice: 999,
        category: 'Freelancing',
        thumbnail: 'https://images.unsplash.com/photo-1515378866563-548936fd6ec5?w=800&auto=format&fit=crop&q=60',
        totalDuration: '5h 20m',
        lectures: [
            {
                title: 'Optimizing your Upwork Profile',
                duration: '18:30',
                videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                freePreview: true
            }
        ],
        tags: ['Freelancing', 'Upwork', 'Business'],
        enrolledCount: 2100,
        rating: 4.9
    }
];

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding courses...');

        await Course.deleteMany({}); // Optional: clear existing courses
        await Course.create(courses);

        console.log('Courses seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
};

seedCourses();
