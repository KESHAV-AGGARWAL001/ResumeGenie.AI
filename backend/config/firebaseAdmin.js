/**
 * Firebase Admin SDK Initialization
 * 
 * This module initializes the Firebase Admin SDK for server-side token
 * verification. It supports two modes:
 * 
 * 1. Service Account JSON file (recommended for production)
 *    → Set FIREBASE_SERVICE_ACCOUNT_PATH in .env
 * 
 * 2. Application Default Credentials / Project ID only (simpler setup)
 *    → Set FIREBASE_PROJECT_ID in .env (or uses VITE_FIREBASE_PROJECT_ID)
 * 
 * The Admin SDK is used to:
 *  - Verify Firebase ID tokens sent from the frontend
 *  - Extract user identity (uid, email, name) for request context
 */

const admin = require('firebase-admin');

function initializeFirebaseAdmin() {
    // Prevent re-initialization
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

    try {
        if (serviceAccountPath) {
            // Production: Use service account JSON file
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('[Firebase Admin] Initialized with service account.');
        } else if (projectId) {
            // Development / fallback: Use project ID only
            // This works when running on GCP or with Application Default Credentials
            admin.initializeApp({
                projectId: projectId,
            });
            console.log(`[Firebase Admin] Initialized with project ID: ${projectId}`);
        } else {
            // Last resort: Initialize without explicit config
            // Firebase Admin SDK will try to auto-detect environment
            admin.initializeApp();
            console.warn('[Firebase Admin] Initialized without explicit config. Token verification may fail.');
        }
    } catch (error) {
        console.error('[Firebase Admin] Initialization failed:', error.message);
        throw error;
    }

    return admin.app();
}

// Initialize on import
initializeFirebaseAdmin();

module.exports = { admin };
