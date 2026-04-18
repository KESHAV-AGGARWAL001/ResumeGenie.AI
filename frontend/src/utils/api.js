/**
 * Centralized API Helper for ResumeGenie.AI
 * 
 * This module wraps the browser's fetch() to automatically:
 *  1. Attach the Firebase ID token as a Bearer token in the Authorization header
 *  2. Use the correct backend base URL
 *  3. Handle common error patterns
 * 
 * Usage:
 *   import { apiGet, apiPost, apiPostFile, getAuthHeaders } from '../utils/api';
 * 
 *   // JSON POST with auth
 *   const result = await apiPost('/ai/analyze', { resumeText, jobDescription });
 * 
 *   // GET with auth
 *   const data = await apiGet('/upload/extract?filename=resume.pdf');
 * 
 *   // File upload with auth
 *   const uploaded = await apiPostFile('/upload', formData);
 * 
 *   // Get just the headers (for custom fetch calls)
 *   const headers = await getAuthHeaders();
 */

import { auth } from '../firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Get the current user's Firebase ID token.
 * Returns null if the user is not signed in.
 * 
 * The token is automatically refreshed if it's expired.
 */
async function getIdToken() {
    const user = auth.currentUser;
    if (!user) {
        return null;
    }

    try {
        // forceRefresh = false → uses cached token unless expired
        const token = await user.getIdToken(false);
        return token;
    } catch (error) {
        console.error('[API] Failed to get ID token:', error.message);
        return null;
    }
}

/**
 * Build authorization headers with the Firebase ID token.
 * Returns an object with the Authorization header, or empty object if not signed in.
 * 
 * @returns {Promise<object>} Headers object
 */
export async function getAuthHeaders() {
    const token = await getIdToken();
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

/**
 * Make an authenticated GET request to the backend.
 * 
 * @param {string} path - API path (e.g., '/upload/extract?filename=test.pdf')
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<Response>} Raw fetch Response
 */
export async function apiGet(path, options = {}) {
    const authHeaders = await getAuthHeaders();

    return fetch(`${BACKEND_URL}${path}`, {
        method: 'GET',
        headers: {
            ...authHeaders,
            ...options.headers,
        },
        ...options,
    });
}

/**
 * Make an authenticated POST request with a JSON body.
 * 
 * @param {string} path - API path (e.g., '/compile')
 * @param {object} body - Request body (will be JSON.stringify'd)
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<Response>} Raw fetch Response
 */
export async function apiPost(path, body, options = {}) {
    const authHeaders = await getAuthHeaders();

    return fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...options.headers,
        },
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * Make an authenticated POST request with FormData (file upload).
 * Does NOT set Content-Type — browser will auto-set multipart/form-data boundary.
 * 
 * @param {string} path - API path (e.g., '/upload')
 * @param {FormData} formData - Form data with file(s)
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<Response>} Raw fetch Response
 */
export async function apiPostFile(path, formData, options = {}) {
    const authHeaders = await getAuthHeaders();

    return fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: {
            // Do NOT set Content-Type for FormData — browser auto-sets with boundary
            ...authHeaders,
            ...options.headers,
        },
        body: formData,
        ...options,
    });
}

/**
 * Backend base URL (exported for edge cases where direct fetch is needed).
 */
export { BACKEND_URL };
