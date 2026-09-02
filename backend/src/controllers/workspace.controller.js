const Project = require('../models/Project.model');
const Course = require('../models/Course.model');
const Service = require('../models/Service.model');

exports.getWorkspaceOverview = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch ongoing projects
        const projects = await Project.find({ clientId: userId, status: 'in-progress' }).limit(3);
        
        let activeProjects = [];
        if (projects.length > 0) {
            activeProjects = projects.map(p => ({
                id: p._id,
                title: p.title,
                status: 'In Progress',
                description: p.description || 'Project is currently being worked on.',
                progress: Math.floor(Math.random() * 50) + 10 // Mock progress as model doesn't store this yet
            }));
        }

        // Fetch recommended courses
        const courses = await Course.find({}).select('title description _id category').limit(2);
        
        // Fetch recommended services
        const services = await Service.find({ isActive: true }).select('title shortDescription _id category').limit(2);

        // Support tickets (Mocked as empty array until model is implemented)
        const activeTickets = [];

        res.status(200).json({
            success: true,
            data: {
                activeProjects,
                activeTickets,
                recommendations: {
                    courses: courses.map(c => ({
                        id: c._id,
                        title: c.title,
                        description: c.description.substring(0, 50) + '...',
                        category: c.category
                    })),
                    services: services.map(s => ({
                        id: s._id,
                        title: s.title,
                        description: s.shortDescription,
                        category: s.category
                    }))
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
