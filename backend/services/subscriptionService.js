const { admin } = require('../config/firebaseAdmin');

const db = admin.firestore();

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
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
        return { tier: 'free', status: 'active' };
    }

    const data = doc.data();
    const sub = data.subscription || {};

    if (sub.tier && sub.tier !== 'free' && sub.status === 'active') {
        if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
            return { tier: 'free', status: 'expired' };
        }
        return sub;
    }

    return { tier: 'free', status: 'active' };
}

async function updateSubscription(uid, subscriptionData) {
    const docRef = db.collection('users').doc(uid);
    await docRef.set({
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}

async function getUsage(uid) {
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
        return { compilationsToday: 0, aiAnalysesToday: 0, lastResetDate: today() };
    }

    const data = doc.data();
    const usage = data.usage || {};

    if (usage.lastResetDate !== today()) {
        const resetUsage = { compilationsToday: 0, aiAnalysesToday: 0, lastResetDate: today() };
        await docRef.set({ usage: resetUsage }, { merge: true });
        return resetUsage;
    }

    return usage;
}

async function incrementUsage(uid, field) {
    const docRef = db.collection('users').doc(uid);
    const usage = await getUsage(uid);

    usage[field] = (usage[field] || 0) + 1;
    await docRef.set({ usage }, { merge: true });

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

module.exports = {
    TIERS,
    getUserSubscription,
    updateSubscription,
    getUsage,
    incrementUsage,
    checkUsageLimit,
    getTierConfig,
};
