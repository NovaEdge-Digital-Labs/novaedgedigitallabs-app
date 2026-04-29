const { PlatformConfig } = require('../models/PlatformConfig');

const getPlatformConfig = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = new PlatformConfig();
            await config.save();
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePlatformConfig = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = new PlatformConfig(req.body);
        } else {
            Object.assign(config, req.body);
        }
        await config.save();
        res.json({ success: true, message: "Configuration updated successfully", config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlatformConfig,
    updatePlatformConfig
};
