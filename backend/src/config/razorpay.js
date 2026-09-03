const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Fail loudly at boot rather than on a customer's checkout. A missing or
// mismatched secret is otherwise invisible here — the SDK constructs fine and
// only rejects at `orders.create` time, with a bare object that carries no
// `.message`, which surfaced to the app as a blank 500.
const missing = [];
if (!keyId) missing.push('RAZORPAY_KEY_ID');
if (!keySecret) missing.push('RAZORPAY_KEY_SECRET');

let razorpay;

if (missing.length) {
    const reason = `${missing.join(' and ')} not set in the environment`;
    console.error(
        `[razorpay] FATAL: ${reason}. Every payment will fail until this is ` +
        `configured in the deployment environment.`
    );

    // A stub rather than a throw: `new Razorpay({ key_id: undefined })` raises
    // "key_id or oauthToken is mandatory" at require time, which would take the
    // entire API down instead of just the payment routes.
    const fail = async () => {
        const error = new Error(`Payments are not configured on the server (${reason}).`);
        error.status = 503;
        throw error;
    };

    razorpay = {
        isConfigured: false,
        configError: reason,
        orders: { create: fail, fetch: fail, all: fail },
        payments: { fetch: fail, capture: fail, refund: fail, all: fail },
        subscriptions: { create: fail, fetch: fail, cancel: fail },
        plans: { create: fail, fetch: fail, all: fail },
    };
} else {
    if (!/^rzp_(test|live)_/.test(keyId)) {
        console.warn(`[razorpay] RAZORPAY_KEY_ID does not look like a Razorpay key id ("${keyId.slice(0, 8)}…").`);
    }

    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Both halves of the credential pair are present. This does not prove they
    // match — only a live API call can.
    razorpay.isConfigured = true;
    razorpay.configError = null;
}

module.exports = razorpay;
