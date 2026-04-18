const { checkUsageLimit, incrementUsage, getUserSubscription } = require('../services/subscriptionService');

function requireUsage(usageField) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const check = await checkUsageLimit(req.user.uid, usageField);

            if (!check.allowed) {
                return res.status(429).json({
                    error: 'Usage limit exceeded',
                    message: check.message,
                    current: check.current,
                    limit: check.limit,
                    tier: check.tier,
                    upgrade: check.tier === 'free',
                });
            }

            // Attach tier info to the request for downstream use
            req.user.tier = check.tier;
            req.user.usage = { current: check.current, limit: check.limit };

            // Increment usage after successful check
            await incrementUsage(req.user.uid, usageField);

            next();
        } catch (err) {
            console.error(`[Usage] Error checking ${usageField}:`, err.message);
            next();
        }
    };
}

function attachTier() {
    return async (req, res, next) => {
        if (!req.user) {
            return next();
        }

        try {
            const sub = await getUserSubscription(req.user.uid);
            req.user.tier = sub.tier || 'free';
        } catch (err) {
            req.user.tier = 'free';
        }

        next();
    };
}

module.exports = { requireUsage, attachTier };
