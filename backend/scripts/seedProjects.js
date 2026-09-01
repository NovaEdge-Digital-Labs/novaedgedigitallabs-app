const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Project = require('../src/models/Project.model');
const User = require('../src/models/User.model');
const fs = require('fs');

const seedProjects = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not set in backend/.env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find or fallback client user to set as clientId
        let client = await User.findOne({ role: { $in: ['employer', 'business', 'admin'] } });
        if (!client) {
            client = await User.findOne({});
        }

        const clientId = client ? client._id : new mongoose.Types.ObjectId("66b1a1111111111111111111");
        console.log(`📌 Using Client ID: ${clientId}`);

        const jsonPath = path.join(__dirname, '../../client_projects.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const projectsData = JSON.parse(rawData);

        console.log(`📦 Found ${projectsData.length} projects to insert/update...`);

        for (const item of projectsData) {
            const projectPayload = {
                title: item.title,
                description: item.description,
                budgetRange: item.budgetRange,
                deadline: new Date(item.deadline.$date || item.deadline),
                skillsRequired: item.skillsRequired || [],
                status: item.status || 'open',
                totalProposals: item.totalProposals || 0,
                clientId: clientId
            };

            await Project.findOneAndUpdate(
                { title: item.title },
                projectPayload,
                { upsert: true, new: true }
            );
            console.log(`   ✔️  Seeded Client Project: "${item.title}"`);
        }

        console.log('\n🎉 All Client Projects successfully added to database!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding projects:', error);
        process.exit(1);
    }
};

seedProjects();
