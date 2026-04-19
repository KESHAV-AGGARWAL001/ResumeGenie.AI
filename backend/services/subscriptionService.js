const { admin } = require('../config/firebaseAdmin');
const { TieredCache } = require('../lib/cache');

const db = admin.firestore();

const subCache = new TieredCache({ maxSize: 200, defaultTTL: 5 * 60 * 1000 });
const usageCache = new TieredCache({ maxSize: 200, defaultTTL: 30 * 1000 });

const TIERS = {
    free: {
        compilationsPerDay: 3,
        aiAnalysesPerDay: 1,
        templates: ['deedy', 'jakes'],
        watermark: true,
        jdMatching: false,
        maxResumes: 1,
    },
    pro: {
        compilationsPerDay: Infinity,
        aiAnalysesPerDay: 10,
        templates: ['deedy', 'jakes', 'modern', 'moderncv', 'moderndeedy'],
        watermark: false,
        jdMatching: true,
        maxResumes: 5,
    },
    enterprise: {
        compilationsPerDay: Infinity,
        aiAnalysesPerDay: Infinity,
        templates: ['deedy', 'jakes', 'modern', 'moderncv', 'moderndeedy'],
        watermark: false,
        jdMatching: true,
        maxResumes: Infinity,
    },
};

async function getUserSubscription(uid) {
    const cached = subCache.get(`sub:${uid}`);
    if (cached) return cached;

    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
        const result = { tier: 'free', status: 'active' };
        subCache.set(`sub:${uid}`, result);
        return result;
    }

    const data = doc.data();
    const sub = data.subscription || {};

    let result;
    if (sub.tier && sub.tier !== 'free' && sub.status === 'active') {
        if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
            result = { tier: 'free', status: 'expired' };
        } else {
            result = sub;
        }
    } else {
        result = { tier: 'free', status: 'active' };
    }

    subCache.set(`sub:${uid}`, result);
    return result;
}

async function updateSubscription(uid, subscriptionData) {
    const docRef = db.collection('users').doc(uid);
    await docRef.set({
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
    subCache.delete(`sub:${uid}`);
}

async function getUsage(uid) {
    const cached = usageCache.get(`usage:${uid}`);
    if (cached) return cached;

    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
        const result = { compilationsToday: 0, aiAnalysesToday: 0, lastResetDate: today() };
        usageCache.set(`usage:${uid}`, result);
        return result;
    }

    const data = doc.data();
    const usage = data.usage || {};

    if (usage.lastResetDate !== today()) {
        const resetUsage = { compilationsToday: 0, aiAnalysesToday: 0, lastResetDate: today() };
        await docRef.set({ usage: resetUsage }, { merge: true });
        usageCache.set(`usage:${uid}`, resetUsage);
        return resetUsage;
    }

    usageCache.set(`usage:${uid}`, usage);
    return usage;
}

async function incrementUsage(uid, field) {
    const docRef = db.collection('users').doc(uid);
    const usage = await getUsage(uid);

    usage[field] = (usage[field] || 0) + 1;
    await docRef.set({ usage }, { merge: true });
    usageCache.delete(`usage:${uid}`);

    return usage;
}

async function checkUsageLimit(uid, field) {
    const sub = await getUserSubscription(uid);
    const usage = await getUsage(uid);
    const tierConfig = TIERS[sub.tier] || TIERS.free;

    let limit;
    if (field === 'compilationsToday') {
        limit = tierConfig.compilationsPerDay;
    } else if (field === 'aiAnalysesToday') {
        limit = tierConfig.aiAnalysesPerDay;
    } else {
        return { allowed: true };
    }

    const current = usage[field] || 0;

    if (current >= limit) {
        return {
            allowed: false,
            current,
            limit,
            tier: sub.tier,
            message: `You have reached your daily ${field === 'compilationsToday' ? 'compilation' : 'AI analysis'} limit (${limit}). Upgrade to Pro for more.`,
        };
    }

    return { allowed: true, current, limit, tier: sub.tier };
}

function getTierConfig(tier) {
    return TIERS[tier] || TIERS.free;
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function getCacheStats() {
    return { subscription: subCache.stats(), usage: usageCache.stats() };
}

module.exports = {
    TIERS,
    getUserSubscription,
    updateSubscription,
    getUsage,
    incrementUsage,
    checkUsageLimit,
    getTierConfig,
    getCacheStats,
};
