const mongoose = require('mongoose');

async function updateTheme() {
    try {
        await mongoose.connect('mongodb+srv://novaedgedigitallabs:Pk8537127@novaedgedigitallabs-app.avuxbex.mongodb.net/?appName=novaedgedigitallabs-app');
        
        const platformConfigSchema = new mongoose.Schema({}, { strict: false });
        const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);

        const result = await PlatformConfig.updateMany({}, {
            $set: {
                "themeConfig.primary": "rgb(110, 86, 207)",
                "themeConfig.primaryDark": "rgb(90, 70, 180)",
                "themeConfig.glow": "rgb(110, 86, 207)",
                "themeConfig.primaryGradient": "linear-gradient(135deg, rgb(110, 86, 207), rgb(90, 70, 180))",
                "themeConfig.accent": "rgb(110, 86, 207)",
                "themeConfig.accentGradient": "linear-gradient(135deg, rgb(110, 86, 207), rgb(90, 70, 180))"
            }
        });

        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateTheme();
