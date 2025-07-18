import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Rate limiting configurations
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
  message: 'Too many requests for this operation, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove any null bytes that could be used for injection
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/\0/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        value[key] = sanitizeValue(value[key]);
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// API key validation
export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Check minimum length
  if (apiKey.length < 10) {
    return false;
  }
  
  // Check for common patterns that indicate fake/test keys
  const suspiciousPatterns = [
    /^(test|fake|demo|example)/i,
    /^[a-z]+$/i, // Only letters
    /^[0-9]+$/,  // Only numbers
    /^(.)\1+$/,  // Repeated characters
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(apiKey));
};

// Session security
export const sessionSecurity = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
};

// Audit logging for sensitive operations
export const auditLog = (action: string, userId: number | null, details: any = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: details.ip || 'unknown',
  };
  
  // In production, this should go to a secure logging service
  console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
};

// Enhanced authentication middleware with audit logging
export const enhancedAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    auditLog('UNAUTHORIZED_ACCESS_ATTEMPT', null, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  // Log successful authentication for sensitive operations
  if (req.path.includes('/api/user/api-keys')) {
    auditLog('API_KEY_OPERATION', req.user.id, {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
  }
  
  next();
};

// Admin authorization middleware
export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    auditLog('ADMIN_ACCESS_ATTEMPT_UNAUTHENTICATED', null, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  // Check if user has admin role
  if (req.user.role !== 'admin') {
    auditLog('ADMIN_ACCESS_ATTEMPT_UNAUTHORIZED', req.user.id, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      userRole: req.user.role,
    });
    return res.status(403).json({ error: "Admin access required" });
  }
  
  auditLog('ADMIN_ACCESS_GRANTED', req.user.id, {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent'),
  });
  
  next();
};