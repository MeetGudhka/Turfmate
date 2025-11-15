const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');

// Rate limiting middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// API specific limiters
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 5 requests
    message: 'Too many login attempts, please try again after an hour'
});

const sanitizeInput = (obj) => {
    if (typeof obj !== 'object') return obj;

    return Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] === 'string') {
            acc[key] = sanitizeHtml(obj[key], {
                allowedTags: [], // No HTML tags allowed
                allowedAttributes: {} // No attributes allowed
            });
        } else if (typeof obj[key] === 'object') {
            acc[key] = sanitizeInput(obj[key]);
        } else {
            acc[key] = obj[key];
        }
        return acc;
    }, Array.isArray(obj) ? [] : {});
};

const setupSecurity = (app) => {
    // Basic security headers
    app.use(helmet());

    // CORS configuration
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    app.use('/api/', rateLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);

    // Data sanitization against XSS
    app.use(xss());

    // Prevent parameter pollution
    app.use(hpp());

    // Input sanitization middleware
    app.use((req, res, next) => {
        if (req.body) req.body = sanitizeInput(req.body);
        if (req.query) req.query = sanitizeInput(req.query);
        next();
    });

    // Security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Content-Security-Policy', "default-src 'self'");
        next();
    });

    // Error handling for rate limiting
    app.use((err, req, res, next) => {
        if (err.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: err.message
            });
        }
        next(err);
    });
};

module.exports = {
    setupSecurity,
    sanitizeInput,
    rateLimiter,
    authLimiter
};