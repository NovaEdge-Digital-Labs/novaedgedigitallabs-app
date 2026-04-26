const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./src/config/db');

// Connect Database
connectDB();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline styles/scripts in static pages
}));
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Serve static files (Privacy Policy, Terms, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const toolsRoutes = require('./src/routes/tools.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const leadsRoutes = require('./src/routes/leads.routes');
const storeRoutes = require('./src/routes/store.routes');
const featuredRoutes = require('./src/routes/featured.routes');
const affiliateRoutes = require('./src/routes/affiliate.routes');
const marketplaceRoutes = require('./src/routes/marketplace.routes');
const employerRoutes = require('./src/routes/employer.routes');
const jobRoutes = require('./src/routes/job.routes');
const courseRoutes = require('./src/routes/course.routes');
const developerRoutes = require('./src/routes/developer.routes');
const adminRoutes = require('./src/routes/admin.routes');
const apiV1Routes = require('./src/routes/apiV1.routes');
const { toolsRateLimit, authRateLimit } = require('./src/middleware/rateLimit.middleware');

app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tools', toolsRateLimit, toolsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/v1', apiV1Routes);

// Mock dynamic route mounting
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to NovaEdge API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
