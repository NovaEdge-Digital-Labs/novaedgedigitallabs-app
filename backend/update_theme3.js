const mongoose = require('mongoose');

async function updateTheme3() {
    try {
        await mongoose.connect('mongodb+srv://novaedgedigitallabs:Pk8537127@novaedgedigitallabs-app.avuxbex.mongodb.net/?appName=novaedgedigitallabs-app');
        
        const platformConfigSchema = new mongoose.Schema({}, { strict: false });
        const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);

        const result = await PlatformConfig.updateMany({}, {
            $set: {
                "themeConfig.primary": "#6E56CF",
                "themeConfig.primaryDark": "#5B45B0",
                "themeConfig.glow": "#6E56CF",
                "themeConfig.primaryGradient": "linear-gradient(135deg, #6E56CF, #5B45B0)",
                "themeConfig.accent": "#6E56CF",
                "themeConfig.accentGradient": "linear-gradient(135deg, #6E56CF, #5B45B0)"
            }
        });

        console.log('Update result 3:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateTheme3();
