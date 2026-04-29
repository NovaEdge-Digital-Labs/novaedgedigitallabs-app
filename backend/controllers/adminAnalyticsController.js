const { Analytics } = require('../models/Analytics');
const { User } = require('../models/User');

const getAnalytics = async (req, res) => {
    try {
        let latest = await Analytics.findOne().sort({ createdAt: -1 });

        if (!latest) {
            latest = new Analytics({
                metrics: {
                    avgSessionDuration: 272,
                    bounceRate: 24.5,
                    retentionRate: 68,
                    activeNodes: 1204,
                    trafficSources: [
                        { label: "Jan", value: 45 },
                        { label: "Feb", value: 52 },
                        { label: "Mar", value: 38 },
                        { label: "Apr", value: 65 },
                        { label: "May", value: 48 },
                        { label: "Jun", value: 72 },
                        { label: "Jul", value: 85 },
                    ],
                    regionalDistribution: [
                        { country: "United States", value: "45%", color: "bg-blue-500" },
                        { country: "United Kingdom", value: "18%", color: "bg-purple-500" },
                        { country: "Germany", value: "12%", color: "bg-green-500" },
                        { country: "India", value: "9%", color: "bg-orange-500" },
                        { country: "Others", value: "16%", color: "bg-neutral-500" },
                    ]
                }
            });
            await latest.save();
        }

        res.json({
            success: true,
            analytics: latest.metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching analytics",
            error: error.message
        });
    }
};

const refreshAnalytics = async (req, res) => {
    try {
        const userCount = await User.countDocuments();

        const newAnalytics = new Analytics({
            metrics: {
                avgSessionDuration: Math.floor(Math.random() * 100) + 200,
                bounceRate: Math.floor(Math.random() * 10) + 20,
                retentionRate: Math.floor(Math.random() * 20) + 50,
                activeNodes: userCount * 3 + Math.floor(Math.random() * 100),
                trafficSources: [
                    { label: "Jan", value: 40 + Math.random() * 10 },
                    { label: "Feb", value: 50 + Math.random() * 10 },
                    { label: "Mar", value: 35 + Math.random() * 10 },
                    { label: "Apr", value: 60 + Math.random() * 10 },
                    { label: "May", value: 45 + Math.random() * 10 },
                    { label: "Jun", value: 70 + Math.random() * 10 },
                    { label: "Jul", value: 80 + Math.random() * 10 },
                ],
                regionalDistribution: [
                    { country: "United States", value: "42%", color: "bg-blue-500" },
                    { country: "United Kingdom", value: "20%", color: "bg-purple-500" },
                    { country: "Germany", value: "14%", color: "bg-green-500" },
                    { country: "India", value: "10%", color: "bg-orange-500" },
                    { country: "Others", value: "14%", color: "bg-neutral-500" },
                ]
            }
        });

        await newAnalytics.save();

        res.json({
            success: true,
            message: "Analytics refreshed",
            analytics: newAnalytics.metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error refreshing analytics",
            error: error.message
        });
    }
};

module.exports = {
    getAnalytics,
    refreshAnalytics
};
