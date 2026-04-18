/**
 * Authentication Middleware for Express
 * 
 * Provides three middleware functions:
 * 
 * 1. requireAuth  — Request MUST have a valid Firebase token. Returns 401 if missing/invalid.
 * 2. optionalAuth — Attaches user context if token is present, but allows anonymous access.
 * 3. requireRole  — Factory that checks req.user exists AND has a specific role/tier.
 * 
 * After successful verification, req.user is populated with:
 *   {
 *     uid:    string,   // Firebase user ID
 *     email:  string,   // User's email
 *     name:   string,   // Display name (if available)
 *     picture: string,  // Profile picture URL (if available)
 *     token:  object    // Full decoded token (for advanced use)
 *   }
 * 
 * Usage in routes:
 *   const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
 * 
 *   router.post('/compile', requireAuth, (req, res) => {
 *       console.log('Authenticated user:', req.user.uid);
 *   });
 * 
 *   router.get('/template', optionalAuth, (req, res) => {
 *       if (req.user) { ... } else { ... }
 *   });
 */

const { admin } = require('../config/firebaseAdmin');

/**
 * Extract Bearer token from the Authorization header.
 * Supports format: "Bearer <token>"
 * 
 * @param {import('express').Request} req 
 * @returns {string|null} The token string, or null if not found
 */
function extractToken(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // Support "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }

    // Also support raw token (less common but sometimes used)
    return authHeader.trim();
}

/**
 * Verify a Firebase ID token and return the decoded payload.
 * 
 * @param {string} token - Firebase ID token
 * @returns {Promise<object|null>} Decoded token or null if invalid
 */
async function verifyToken(token) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        // Log specific error types for debugging
        if (error.code === 'auth/id-token-expired') {
            console.warn('[Auth] Token expired');
        } else if (error.code === 'auth/id-token-revoked') {
            console.warn('[Auth] Token revoked');
        } else if (error.code === 'auth/argument-error') {
            console.warn('[Auth] Malformed token');
        } else {
            console.warn('[Auth] Token verification failed:', error.code || error.message);
        }
        return null;
    }
}

/**
 * Build a user context object from a decoded Firebase token.
 * 
 * @param {object} decodedToken - Decoded Firebase ID token
 * @returns {object} User context to attach to req.user
 */
function buildUserContext(decodedToken) {
    return {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || decodedToken.displayName || null,
        picture: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
        token: decodedToken, // Full decoded token for advanced use
    };
}

/**
 * REQUIRED Authentication Middleware
 * 
 * Blocks the request with 401 if:
 *  - No Authorization header is present
 *  - The token is invalid, expired, or revoked
 * 
 * On success, attaches req.user with user context.
 */
async function requireAuth(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid Bearer token in the Authorization header.',
        });
    }

    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
        return res.status(401).json({
            error: 'Invalid or expired token',
            message: 'Your authentication token is invalid or has expired. Please sign in again.',
        });
    }

    req.user = buildUserContext(decodedToken);
    next();
}

/**
 * OPTIONAL Authentication Middleware
 * 
 * If a valid token is present, attaches req.user.
 * If no token or invalid token, sets req.user = null and continues.
 * Never blocks the request.
 * 
 * Use this for routes that work for both authenticated and anonymous users
 * but may provide enhanced features for authenticated users.
 */
async function optionalAuth(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        req.user = null;
        return next();
    }

    const decodedToken = await verifyToken(token);

    if (decodedToken) {
        req.user = buildUserContext(decodedToken);
    } else {
        req.user = null;
    }

    next();
}

/**
 * Role/Tier-based Authorization Middleware Factory
 * 
 * Creates a middleware that checks if the authenticated user has the required role.
 * Must be used AFTER requireAuth.
 * 
 * In the future, this will check the user's subscription tier from Firestore.
 * For now, it's a placeholder that always passes (all authenticated users are equal).
 * 
 * @param {string[]} allowedTiers - Array of allowed tiers, e.g., ['pro', 'enterprise']
 * @returns {Function} Express middleware
 * 
 * Usage:
 *   router.post('/premium-feature', requireAuth, requireTier(['pro', 'enterprise']), handler);
 */
function requireTier(allowedTiers = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be authenticated to access this resource.',
            });
        }

        // TODO: Fetch user tier from Firestore and check against allowedTiers
        // For now, all authenticated users are allowed (free tier)
        // Once Stripe is integrated, this will check:
        //   const userDoc = await firestore.doc(`users/${req.user.uid}`).get();
        //   const tier = userDoc.data()?.subscription?.tier || 'free';
        //   if (!allowedTiers.includes(tier)) { return res.status(403)... }

        const userTier = req.user.tier || 'free';

        if (allowedTiers.length > 0 && !allowedTiers.includes(userTier)) {
            return res.status(403).json({
                error: 'Insufficient subscription tier',
                message: `This feature requires one of the following plans: ${allowedTiers.join(', ')}. Your current plan: ${userTier}.`,
                requiredTier: allowedTiers,
                currentTier: userTier,
            });
        }

        next();
    };
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireTier,
};
