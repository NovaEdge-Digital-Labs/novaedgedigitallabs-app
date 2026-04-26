require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const cloudinary = require('../src/config/cloudinary');
const Product = require('../src/models/Product.model');
const fs = require('fs');
const path = require('path');

const addProduct = async (productDataPath, zipFilePath, imageFilePaths) => {
    try {
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 2. Read Product Data
        const productData = JSON.parse(fs.readFileSync(productDataPath, 'utf8'));
        console.log('Read product metadata:', productData.title);

        // 3. Upload Images
        const imageUrls = [];
        for (const imgPath of imageFilePaths) {
            console.log(`Uploading image: ${imgPath}`);
            const result = await cloudinary.uploader.upload(imgPath, {
                folder: 'novaedge/products/previews'
            });
            imageUrls.push(result.secure_url);
        }

        // 4. Upload Zip File (as raw/private if possible)
        console.log(`Uploading zip file: ${zipFilePath}`);
        const zipResult = await cloudinary.uploader.upload(zipFilePath, {
            resource_type: 'raw',
            folder: 'novaedge/products/downloads',
            access_mode: 'authenticated', // Higher security if your plan supports it
            type: 'private' // This makes the URL inaccessible without a signed link or admin key
        });

        // 5. Save to Database
        const product = new Product({
            ...productData,
            images: imageUrls,
            zipUrl: zipResult.secure_url,
            zipPublicId: zipResult.public_id
        });

        await product.save();
        console.log('Product saved successfully with ID:', product._id);

        process.exit(0);
    } catch (error) {
        console.error('Error adding product:', error);
        process.exit(1);
    }
};

// Simple CLI handling
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: node add-product.js <meta.json> <file.zip> <img1.jpg> <img2.jpg> ...');
    process.exit(1);
}

const [meta, zip, ...images] = args;
addProduct(path.resolve(meta), path.resolve(zip), images.map(img => path.resolve(img)));
