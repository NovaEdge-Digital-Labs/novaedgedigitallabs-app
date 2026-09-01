const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Blog = require('../src/models/blog.model');

const fixBlogImages = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novaedgedigitallabs-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected.');

        const blogs = await Blog.find();
        let updatedCount = 0;

        for (const blog of blogs) {
            let changed = false;

            const fixUrl = (url) => {
                if (url && url.startsWith('/')) {
                    return 'https://www.novaedgedigitallabs.tech' + url;
                }
                return url;
            };

            // Fix imageUrl
            if (blog.imageUrl) {
                const fixedUrl = fixUrl(blog.imageUrl);
                if (fixedUrl !== blog.imageUrl) {
                    blog.imageUrl = fixedUrl;
                    changed = true;
                }
            }

            // Fix coverImage
            if (blog.coverImage && blog.coverImage.src) {
                const fixedSrc = fixUrl(blog.coverImage.src);
                if (fixedSrc !== blog.coverImage.src) {
                    blog.coverImage.src = fixedSrc;
                    changed = true;
                }
            }

            // Fix body images
            if (blog.body && Array.isArray(blog.body)) {
                let bodyChanged = false;
                const newBody = blog.body.map(block => {
                    if (block.type === 'image') {
                        if (block.url) {
                            const fixedUrl = fixUrl(block.url);
                            if (fixedUrl !== block.url) {
                                block.url = fixedUrl;
                                bodyChanged = true;
                            }
                        }
                        if (block.src) {
                            const fixedSrc = fixUrl(block.src);
                            if (fixedSrc !== block.src) {
                                block.src = fixedSrc;
                                bodyChanged = true;
                            }
                        }
                    }
                    return block;
                });
                
                if (bodyChanged) {
                    blog.body = newBody;
                    // Mark as modified so mongoose saves the mixed array
                    blog.markModified('body');
                    changed = true;
                }
            }

            // Fix sections images
            if (blog.sections && Array.isArray(blog.sections)) {
                let sectionsChanged = false;
                const newSections = blog.sections.map(sec => {
                    if (sec.image) {
                        const fixedImage = fixUrl(sec.image);
                        if (fixedImage !== sec.image) {
                            sec.image = fixedImage;
                            sectionsChanged = true;
                        }
                    }
                    return sec;
                });
                
                if (sectionsChanged) {
                    blog.sections = newSections;
                    blog.markModified('sections');
                    changed = true;
                }
            }

            if (changed) {
                await blog.save();
                updatedCount++;
            }
        }

        console.log(`Successfully fixed images in ${updatedCount} blogs.`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing blog images:', error);
        process.exit(1);
    }
};

fixBlogImages();
