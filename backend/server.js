const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'AI-Powered Job Recruitment Portal API is active',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Job Recruitment Portal Backend running on http://localhost:${PORT}`);
});

// Graceful rejection handling
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] Error: ${err.message}`);
});

module.exports = app;
