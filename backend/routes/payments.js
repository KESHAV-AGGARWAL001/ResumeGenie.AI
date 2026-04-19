const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
    getUserSubscription,
    updateSubscription,
    getTierConfig,
    getUsage,
} = require('../services/subscriptionService');
const { TieredCache } = require('../lib/cache');

const webhookIdempotency = new TieredCache({ maxSize: 500, defaultTTL: 60 * 60 * 1000 });

let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
} catch (err) {
    console.warn('[Payments] Stripe SDK not initialized:', err.message);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /payments/create-checkout — Create a Stripe Checkout Session
router.post('/create-checkout', requireAuth, async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Payment system not configured' });
    }

    const { priceId } = req.body;
    if (!priceId) {
        return res.status(400).json({ error: 'priceId is required' });
    }

    try {
        // Check if user already has a Stripe customer ID
        const sub = await getUserSubscription(req.user.uid);
        let customerId = sub.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: req.user.email,
                metadata: { firebaseUid: req.user.uid },
            });
            customerId = customer.id;
            await updateSubscription(req.user.uid, { stripeCustomerId: customerId });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${FRONTEND_URL}?payment=success`,
            cancel_url: `${FRONTEND_URL}?payment=cancelled`,
            metadata: { firebaseUid: req.user.uid },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('[Payments] Checkout error:', err.message);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// POST /payments/create-portal — Stripe Customer Portal (manage subscription)
router.post('/create-portal', requireAuth, async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Payment system not configured' });
    }

    try {
        const sub = await getUserSubscription(req.user.uid);

        if (!sub.stripeCustomerId) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: FRONTEND_URL,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('[Payments] Portal error:', err.message);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

// GET /payments/status — Get current subscription status + usage
router.get('/status', requireAuth, async (req, res) => {
    try {
        const sub = await getUserSubscription(req.user.uid);
        const usage = await getUsage(req.user.uid);
        const tierConfig = getTierConfig(sub.tier);

        res.json({
            subscription: {
                tier: sub.tier || 'free',
                status: sub.status || 'active',
                currentPeriodEnd: sub.currentPeriodEnd || null,
                cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
            },
            usage: {
                compilationsToday: usage.compilationsToday || 0,
                aiAnalysesToday: usage.aiAnalysesToday || 0,
            },
            limits: {
                compilationsPerDay: tierConfig.compilationsPerDay === Infinity ? 'unlimited' : tierConfig.compilationsPerDay,
                aiAnalysesPerDay: tierConfig.aiAnalysesPerDay === Infinity ? 'unlimited' : tierConfig.aiAnalysesPerDay,
                templates: tierConfig.templates,
                watermark: tierConfig.watermark,
                jdMatching: tierConfig.jdMatching,
                maxResumes: tierConfig.maxResumes === Infinity ? 'unlimited' : tierConfig.maxResumes,
            },
        });
    } catch (err) {
        console.error('[Payments] Status error:', err.message);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});

// POST /payments/webhook — Stripe Webhook Handler
// NOTE: This route receives RAW body (configured in server.js before express.json)
router.post('/webhook', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Payment system not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('[Payments] STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('[Payments] Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    if (webhookIdempotency.has(event.id)) {
        return res.json({ received: true, deduplicated: true });
    }
    webhookIdempotency.set(event.id, true);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const uid = session.metadata?.firebaseUid;
                if (uid && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    const priceId = subscription.items.data[0]?.price?.id;

                    let tier = 'pro';
                    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
                        tier = 'enterprise';
                    }

                    await updateSubscription(uid, {
                        tier,
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        status: 'active',
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    });
                    console.log(`[Payments] User ${uid} upgraded to ${tier}`);
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const customerId = invoice.customer;
                    const customer = await stripe.customers.retrieve(customerId);
                    const uid = customer.metadata?.firebaseUid;

                    if (uid) {
                        await updateSubscription(uid, {
                            status: 'active',
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                        });
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const uid = customer.metadata?.firebaseUid;

                if (uid) {
                    await updateSubscription(uid, {
                        tier: 'free',
                        status: 'cancelled',
                        stripeSubscriptionId: null,
                    });
                    console.log(`[Payments] User ${uid} subscription cancelled, reverted to free`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const uid = customer.metadata?.firebaseUid;

                if (uid) {
                    await updateSubscription(uid, {
                        status: subscription.status === 'active' ? 'active' : subscription.status,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    });
                }
                break;
            }

            default:
                break;
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`[Payments] Webhook handler error for ${event.type}:`, err.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
