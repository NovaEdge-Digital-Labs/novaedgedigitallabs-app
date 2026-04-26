export const PLAN_LIMITS = {
    free: {
        qrPerDay: 5,
        compressPerDay: 10,
        invoicePerMonth: 3,
        gstUnlimited: true,
        emiUnlimited: true,
    },
    pro: {
        all: 'unlimited',
        noAds: true,
    },
    business: {
        all: 'unlimited',
        noAds: true,
        aiTools: true,
        apiAccess: true,
    },
};
