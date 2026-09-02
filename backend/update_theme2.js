const mongoose = require('mongoose');

async function updateTheme2() {
    try {
        await mongoose.connect('mongodb+srv://novaedgedigitallabs:Pk8537127@novaedgedigitallabs-app.avuxbex.mongodb.net/?appName=novaedgedigitallabs-app');
        
        const platformConfigSchema = new mongoose.Schema({}, { strict: false });
        const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);

        const result = await PlatformConfig.updateMany({}, {
            $set: {
                "themeConfig.backgroundGradient": "radial-gradient(circle at top left, rgba(110, 86, 207, 0.25), #06000F)",
                "themeConfig.border": "rgba(110, 86, 207, 0.2)"
            }
        });

        console.log('Update result 2:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateTheme2();
