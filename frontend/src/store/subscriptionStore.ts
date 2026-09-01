import { create } from 'zustand';
import { paymentApi } from '../api/paymentApi';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from './authStore';

type Plan = 'free' | 'pro' | 'business';

interface SubscriptionState {
    currentPlan: Plan;
    planExpiry: Date | null;
    isLoadingPayment: boolean;
    paymentError: string | null;
    initPayment: (plan: Exclude<Plan, 'free'>, billingCycle: 'monthly' | 'yearly') => Promise<boolean>;
    cancelSubscription: () => Promise<void>;
}

const messageFor = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.description || error?.message || fallback;

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    currentPlan: 'free',
    planExpiry: null,
    isLoadingPayment: false,
    paymentError: null,

    /**
     * Full checkout round trip. Returns true only once the backend has
     * confirmed the payment — the caller should not report success on its own.
     */
    initPayment: async (plan, billingCycle) => {
        set({ isLoadingPayment: true, paymentError: null });

        try {
            // 1. Create the order. Amount, currency and the publishable key all
            //    come from the server; nothing about price is decided here.
            const order = await paymentApi.createOrder(plan, billingCycle);

            if (!order?.orderId || !order?.keyId) {
                throw new Error('Could not start payment. Please try again shortly.');
            }

            const user = useAuthStore.getState().user;

            // 2. Hand off to Razorpay checkout.
            const data: any = await RazorpayCheckout.open({
                key: order.keyId,
                order_id: order.orderId,
                amount: order.amount,
                currency: order.currency,
                name: 'NovaEdge Digital Labs',
                description: `${plan.toUpperCase()} · ${billingCycle}`,
                image: 'https://novaedgedigitallabs.tech/logo.png',
                prefill: {
                    email: user?.email || '',
                    contact: '',
                    name: user?.name || '',
                },
                theme: { color: '#6E56CF' },
            });

            // 3. Verify. Only the Razorpay fields go up — the server resolves
            //    which plan was bought from the order it stored.
            const result = await paymentApi.verifyPayment({
                razorpayOrderId: data.razorpay_order_id,
                razorpayPaymentId: data.razorpay_payment_id,
                razorpaySignature: data.razorpay_signature,
            });

            if (!result?.success) {
                throw new Error(result?.message || 'Payment verification failed');
            }

            // 4. Trust the server's answer for what was actually activated.
            const activated: Plan = result.subscription?.plan ?? plan;
            const expiry = result.subscription?.endDate ?? null;

            if (useAuthStore.getState().user) {
                useAuthStore.getState().updateUser({ plan: activated, planExpiry: expiry });
            }

            set({
                currentPlan: activated,
                planExpiry: expiry ? new Date(expiry) : null,
                isLoadingPayment: false,
            });

            return true;
        } catch (error: any) {
            // Razorpay reports user-cancelled checkout as an error too.
            const cancelled = error?.code === 0 || /cancel/i.test(String(error?.description || ''));
            set({
                isLoadingPayment: false,
                paymentError: cancelled ? null : messageFor(error, 'Payment failed'),
            });
            return false;
        }
    },

    cancelSubscription: async () => {
        set({ isLoadingPayment: true, paymentError: null });
        try {
            // Previously mocked with a setTimeout that flipped the local plan to
            // 'free' without telling the server.
            await paymentApi.cancelSubscription();

            // Access continues until planExpiry, so the plan is not cleared here.
            set({ isLoadingPayment: false });
        } catch (error: any) {
            set({
                isLoadingPayment: false,
                paymentError: messageFor(error, 'Could not cancel subscription'),
            });
            throw error;
        }
    },
}));

export default useSubscriptionStore;
