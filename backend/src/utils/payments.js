const crypto = require('crypto');
const razorpay = require('../config/razorpay');

/**
 * Razorpay's checkout signature covers exactly one thing: that this
 * `orderId|paymentId` pair came from Razorpay. It does NOT attest to the plan,
 * the amount, the product, or the user. Anything else must be read from our own
 * pending record — never from the request body.
 */
const verifySignature = (orderId, paymentId, signature) => {
    if (!orderId || !paymentId || !signature) return false;
    if (!process.env.RAZORPAY_KEY_SECRET) return false;

    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(signature), 'utf8');
    // timingSafeEqual throws on length mismatch, so guard first.
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * Verify a webhook payload against the RAW request body. Razorpay signs the
 * exact bytes it sent, so this must never be handed a re-serialized object.
 */
const verifyWebhookSignature = (rawBody, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature || !rawBody) return false;

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(signature), 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * Ask Razorpay directly whether the order was paid, and for how much. This is
 * the authority on amount — the client never supplies it, and a valid signature
 * on an unpaid or underpaid order is not enough to grant anything.
 *
 * @param {string} orderId
 * @param {number} expectedAmountPaise
 */
const assertOrderPaid = async (orderId, expectedAmountPaise) => {
    let order;
    try {
        order = await razorpay.orders.fetch(orderId);
    } catch (err) {
        return { ok: false, reason: 'Could not confirm the order with Razorpay' };
    }

    if (!order) return { ok: false, reason: 'Order not found' };
    if (order.status !== 'paid') {
        return { ok: false, reason: `Order is not paid (status: ${order.status})` };
    }

    const paid = Number(order.amount_paid);
    const expected = Number(expectedAmountPaise);
    if (!Number.isFinite(expected) || paid !== expected) {
        return { ok: false, reason: 'Paid amount does not match the amount owed' };
    }

    return { ok: true, order };
};

/** Calendar-accurate term end, so a yearly plan lands on the same date next year. */
const addMonths = (date, months) => {
    const d = new Date(date.getTime());
    const targetDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Clamp for short months: 31 Jan + 1 month should be 28/29 Feb, not 3 Mar.
    if (d.getDate() < targetDay) d.setDate(0);
    return d;
};

const termEnd = (billingCycle, from = new Date()) =>
    billingCycle === 'monthly' ? addMonths(from, 1) : addMonths(from, 12);

module.exports = {
    verifySignature,
    verifyWebhookSignature,
    assertOrderPaid,
    addMonths,
    termEnd,
};
