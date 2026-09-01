const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Blog = require('../src/models/blog.model');

const importFullBlogs = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novaedgedigitallabs-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected.');

        const filePath = path.join(__dirname, '../data/blogpost.json');
        console.log('Reading data from', filePath);
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const blogsData = JSON.parse(fileContent);
        
        console.log(`Found ${blogsData.length} blogs in the JSON file.`);

        let updatedCount = 0;
        let insertedCount = 0;

        for (const blogData of blogsData) {
            // Map id to slug
            if (!blogData.slug && blogData.id) {
                blogData.slug = blogData.id;
            }
            // Find by slug first
            const existingBlog = await Blog.findOne({ slug: blogData.slug });

            if (existingBlog) {
                // Update existing blog
                await Blog.findOneAndUpdate(
                    { slug: blogData.slug },
                    { $set: blogData },
                    { new: true }
                );
                updatedCount++;
            } else {
                // Create new blog if it doesn't exist
                await Blog.create(blogData);
                insertedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} blogs.`);
        console.log(`Successfully inserted ${insertedCount} new blogs.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error importing blogs:', error);
        process.exit(1);
    }
};

importFullBlogs();
