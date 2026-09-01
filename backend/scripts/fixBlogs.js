const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Blog = require('../src/models/blog.model');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novaedge', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    const blogs = await Blog.find();
    for (const blog of blogs) {
        blog.body = [
            { type: 'html', content: `<p><strong>${blog.title}</strong> is an exciting topic that we are diving into today. This article will explore the depths of this subject, providing you with comprehensive insights and actionable takeaways.</p>` },
            { type: 'html', content: `<p>First, let's understand the core concepts. When dealing with such technologies, it's crucial to look at the underlying architecture. Our team has spent countless hours researching and validating these points to ensure accuracy and relevance.</p>` },
            { type: 'image', url: blog.imageUrl },
            { type: 'html', content: `<p>In conclusion, staying updated with these trends will give you a significant edge in the market. We hope this guide serves as a valuable resource for your journey.</p>` }
        ];
        
        blog.sections = [
            { title: "Introduction", content: "This is a detailed introduction section added to demonstrate full content rendering in the mobile application." },
            { title: "Deep Dive", content: "Here we go deep into the technical specifications and use cases of the platform, showing you exactly how to leverage these tools for maximum efficiency." }
        ];
        
        blog.content = "Here is an extra long string of content that can act as the main body. This proves that the content field is successfully populated and rendered on the frontend.";
        
        await blog.save();
    }
    console.log('Fixed blogs with long content!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
