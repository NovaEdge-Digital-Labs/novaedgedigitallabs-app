const PricingTier = require('../models/PricingTier.model');

const defaultTiers = [
    {
        tierId: 'Basic',
        name: 'Basic Listing',
        category: 'job_posting',
        price: 0,
        originalPrice: 499,
        currency: 'INR',
        badge: 'FREE',
        description: 'Standard listing on NovaEdge jobs feed.',
        features: ['30 Days Visibility', 'Standard Search Placement', 'Direct Candidate Applications'],
        durationDays: 30,
        isActive: true
    },
    {
        tierId: 'Featured',
        name: 'Featured Listing',
        category: 'job_posting',
        price: 2999,
        originalPrice: 4999,
        currency: 'INR',
        badge: 'POPULAR',
        description: 'Highlighted job post with 2x candidate applications.',
        features: ['30 Days Visibility', 'Featured Highlight Badge', 'Priority Search Placement', 'Direct Candidate Email Alerts'],
        durationDays: 30,
        isActive: true
    },
    {
        tierId: 'Premium',
        name: 'Premium Listing',
        category: 'job_posting',
        price: 4999,
        originalPrice: 7999,
        currency: 'INR',
        badge: 'BEST VALUE',
        description: 'Top rank placement + social media push + candidate matching.',
        features: ['60 Days Visibility', 'Top Priority Rank', 'Glow Gold Badge', 'Social Media Blast', 'Instant Candidate Alerts'],
        durationDays: 60,
        isActive: true
    },
    {
        tierId: 'ProSeeker',
        name: 'Premium Candidate Pass',
        category: 'seeker_membership',
        price: 499,
        originalPrice: 999,
        currency: 'INR',
        badge: 'PRO PASS',
        description: 'Highlighted candidate profile for employers.',
        features: ['Verified Candidate Badge', 'Top Feed Placement', 'Direct Employer Contact'],
        durationDays: 30,
        isActive: true
    },
    {
        tierId: 'StarterSub',
        name: 'Starter Subscription',
        category: 'business_subscription',
        price: 999,
        originalPrice: 1999,
        currency: 'INR',
        badge: 'STARTER',
        description: 'For individual recruiters and small teams.',
        features: ['5 Premium Job Listings / Mo', 'Basic Candidate Search', 'Email Support'],
        durationDays: 30,
        isActive: true
    },
    {
        tierId: 'ProSub',
        name: 'Pro Subscription',
        category: 'business_subscription',
        price: 2999,
        originalPrice: 4999,
        currency: 'INR',
        badge: 'MOST POPULAR',
        description: 'For growing startups and hiring managers.',
        features: ['Unlimited Premium Job Posts', 'Featured Candidate Access', 'Priority Support', 'Verified Company Profile'],
        durationDays: 30,
        isActive: true
    },
    {
        tierId: 'BusinessSub',
        name: 'Business Enterprise Plan',
        category: 'business_subscription',
        price: 7999,
        originalPrice: 11999,
        currency: 'INR',
        badge: 'ENTERPRISE',
        description: 'For agencies and large enterprise recruiters.',
        features: ['Unlimited All Job Listings', 'Full Resume Database Search', 'Dedicated Hiring Account Manager', 'API Access & Webhooks'],
        durationDays: 30,
        isActive: true
    }
];

const seedPricingTiers = async () => {
    try {
        for (const tier of defaultTiers) {
            await PricingTier.findOneAndUpdate(
                { tierId: tier.tierId },
                { $setOnInsert: tier },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Pricing Tiers Seeded/Verified in DB');
    } catch (error) {
        console.error('Pricing Tiers Seeding Error:', error);
    }
};

module.exports = { seedPricingTiers, defaultTiers };
