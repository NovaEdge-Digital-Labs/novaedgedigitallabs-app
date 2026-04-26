import { create } from 'zustand';
import { paymentApi } from '../api/paymentApi';
import RazorpayCheckout from 'react-native-razorpay';
import { CONFIG } from '../constants/config';
import { useAuthStore } from './authStore';

interface SubscriptionState {
    currentPlan: 'free' | 'pro' | 'business';
    planExpiry: Date | null;
    isLoadingPayment: boolean;
    paymentError: string | null;
    initPayment: (plan: string, billingCycle: string) => Promise<void>;
    verifyPayment: (paymentData: any) => Promise<void>;
    cancelSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    currentPlan: 'free',
    planExpiry: null,
    isLoadingPayment: false,
    paymentError: null,

    initPayment: async (plan, billingCycle) => {
        set({ isLoadingPayment: true, paymentError: null });
        try {
            // 1. Create order on backend
            const orderResponse = await paymentApi.createOrder(plan, billingCycle);
            const { id: order_id, amount, currency } = orderResponse.order;

            const user = useAuthStore.getState().user;

            // 2. Open Razorpay Checkout
            var options = {
                description: `Upgrade to ${plan.toUpperCase()}`,
                image: 'https://novaedgedigitallabs.tech/logo.png', // Replace with your actual logo URL
                currency: currency,
                key: 'YOUR_RAZORPAY_KEY', // Need to pass this from backend or config, ideally backend returns it or it's public key
                amount: amount,
                name: 'NovaEdge',
                order_id: order_id,
                prefill: {
                    email: user?.email || '',
                    contact: '',
                    name: user?.name || ''
                },
                theme: { color: '#f97316' } // COLORS.primary
            };

            const data = await RazorpayCheckout.open(options);

            // 3. Verify payment with backend
            await useSubscriptionStore.getState().verifyPayment({
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_order_id: data.razorpay_order_id,
                razorpay_signature: data.razorpay_signature,
                plan,
                billingCycle
            });

        } catch (error: any) {
            set({
                isLoadingPayment: false,
                paymentError: error.description || error.message || 'Payment failed or cancelled'
            });
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const verificationResult = await paymentApi.verifyPayment(paymentData);

            // Update auth store with new plan
            const user = useAuthStore.getState().user;
            if (user) {
                useAuthStore.getState().updateUser({
                    plan: paymentData.plan as any,
                    planExpiry: verificationResult.planExpiry
                });
            }

            set({
                currentPlan: paymentData.plan as any,
                isLoadingPayment: false
            });
        } catch (error: any) {
            set({
                isLoadingPayment: false,
                paymentError: error.message || 'Payment verification failed'
            });
            throw error;
        }
    },

    cancelSubscription: async () => {
        // Implement cancel logic via API
        set({ isLoadingPayment: true });
        try {
            // const response = await paymentApi.cancelSubscription();
            // Mocking for now
            setTimeout(() => {
                const user = useAuthStore.getState().user;
                if (user) {
                    useAuthStore.getState().updateUser({ plan: 'free' });
                }
                set({ currentPlan: 'free', isLoadingPayment: false });
            }, 1000);
        } catch (error: any) {
            set({ isLoadingPayment: false, paymentError: error.message });
        }
    }
}));
