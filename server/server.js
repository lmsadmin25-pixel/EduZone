const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Passport config
require('./config/passport')(passport);

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL || true   // same-origin in production
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduZone API is running' });
});

// Global error handler
app.use(errorHandler);

// ─── Serve React frontend in production ────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(clientBuild));

  // Catch-all: send index.html for any route React Router should handle
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduZone server running on port ${PORT}`);
});
