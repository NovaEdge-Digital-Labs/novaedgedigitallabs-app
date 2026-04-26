const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AffiliateLink = require('../src/models/AffiliateLink.model');
const dbConnect = require('../src/config/db');

async function addAffiliate(jsonFilePath) {
    try {
        await dbConnect();

        const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

        if (Array.isArray(data)) {
            for (const item of data) {
                await AffiliateLink.findOneAndUpdate(
                    { name: item.name },
                    item,
                    { upsert: true, new: true }
                );
                console.log(`Successfully added/updated: ${item.name}`);
            }
        } else {
            await AffiliateLink.findOneAndUpdate(
                { name: data.name },
                data,
                { upsert: true, new: true }
            );
            console.log(`Successfully added/updated: ${data.name}`);
        }

        console.log('All affiliate links processed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding affiliate link:', error.message);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node scripts/add-affiliate.js <path_to_json_file>');
    process.exit(1);
}

addAffiliate(args[0]);
