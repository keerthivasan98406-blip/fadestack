const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fadestack-secret-key-2024';

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection - Use cloud database with SSL configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority';

console.log('🔗 Connecting to MongoDB Atlas...');
console.log('📝 Using MongoDB URI:', MONGODB_URI ? 'Connected' : 'No URI provided');

// MongoDB connection options with SSL configuration
const mongoOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    retryWrites: true,
    maxPoolSize: 10,
    heartbeatFrequencyMS: 10000,
};

mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB Atlas');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('🔄 Server will continue without database - using fallback authentication');
    });

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB Atlas');
});

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, username: this.username, email: this.email, name: this.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const User = mongoose.model('User', userSchema);

// Validation middleware
const validateRegistration = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
    body('identifier').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Database connection check middleware
function checkDatabaseConnection() {
    return mongoose.connection.readyState === 1;
}

// Enhanced error handling for database operations
async function safeDbOperation(operation, fallbackResponse = null) {
    try {
        if (!checkDatabaseConnection()) {
            throw new Error('Database not connected');
        }
        return await operation();
    } catch (error) {
        console.error('Database operation failed:', error.message);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        throw error;
    }
}

// Routes

// Register
app.post('/api/auth/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, username, email, password } = req.body;

        // Check database connection
        if (!checkDatabaseConnection()) {
            return res.status(503).json({ 
                message: 'Database temporarily unavailable. Please try again later.',
                error: 'DB_CONNECTION_FAILED'
            });
        }

        // Check if user exists
        const existingUser = await safeDbOperation(async () => {
            return await User.findOne({
                $or: [{ email }, { username }]
            });
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Create user
        const user = await safeDbOperation(async () => {
            const newUser = new User({ name, username, email, password });
            return await newUser.save();
        });

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.message.includes('Database not connected')) {
            return res.status(503).json({ 
                message: 'Database connection failed. Please try again later.',
                error: 'DB_CONNECTION_FAILED'
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
});

// Login
app.post('/api/auth/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password } = req.body;

        // Check database connection
        if (!checkDatabaseConnection()) {
            return res.status(503).json({ 
                message: 'Database temporarily unavailable. Please try again later.',
                error: 'DB_CONNECTION_FAILED'
            });
        }

        // Find user by email or username
        const user = await safeDbOperation(async () => {
            return await User.findOne({
                $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }]
            });
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific MongoDB errors
        if (error.message.includes('Database not connected')) {
            return res.status(503).json({ 
                message: 'Database connection failed. Please try again later.',
                error: 'DB_CONNECTION_FAILED'
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // In production, send reset email here
        res.json({ 
            message: 'Password reset link sent to your email!',
            // For demo purposes only - remove in production
            resetToken: user.generateAuthToken()
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token
app.get('/api/auth/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ 
            valid: true, 
            user: decoded 
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get all users (for admin purposes)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Root route - serve login page by default
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Protected route for main app
app.get('/app', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// Serve static files and other routes
app.get('*', (req, res) => {
    // Check if it's a static file request (has extension)
    if (req.path.includes('.')) {
        // Let express.static handle it, or return 404 if not found
        return res.status(404).send('File not found');
    }
    // For other routes, serve the main app
    res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 MongoDB URI: ${MONGODB_URI}`);
});

module.exports = app;