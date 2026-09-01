import { create } from 'zustand';
import { Alert as RNAlert, AlertButton as RNAlertButton } from 'react-native';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertButton {
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
    visible: boolean;
    title: string;
    message?: string;
    type: AlertType;
    buttons: AlertButton[];
    showAlert: (title: string, message?: string, buttons?: AlertButton[], type?: AlertType) => void;
    hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],

    showAlert: (title: string, message: string = '', buttons: AlertButton[] = [{ text: 'OK' }], type?: AlertType) => {
        let inferredType: AlertType = type || 'info';
        if (!type) {
            const lowerTitle = (title || '').toLowerCase();
            const lowerMsg = (message || '').toLowerCase();
            if (
                lowerTitle.includes('error') ||
                lowerTitle.includes('failed') ||
                lowerMsg.includes('failed') ||
                lowerMsg.includes('error') ||
                lowerMsg.includes('not authorized') ||
                lowerMsg.includes('token')
            ) {
                inferredType = 'error';
            } else if (
                lowerTitle.includes('success') ||
                lowerMsg.includes('success') ||
                lowerTitle.includes('welcome') ||
                lowerTitle.includes('copied') ||
                lowerTitle.includes('done')
            ) {
                inferredType = 'success';
            } else if (
                lowerTitle.includes('warning') ||
                lowerTitle.includes('permission') ||
                lowerTitle.includes('required') ||
                lowerTitle.includes('authentication')
            ) {
                inferredType = 'warning';
            }
        }

        set({
            visible: true,
            title: title || 'Notice',
            message: message || '',
            type: inferredType,
            buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
        });
    },

    hideAlert: () => set({ visible: false }),
}));

let isPatched = false;
export const patchGlobalAlert = () => {
    if (isPatched) return;
    isPatched = true;

    RNAlert.alert = (title: string, message?: string, buttons?: RNAlertButton[], options?: any) => {
        const formattedButtons: AlertButton[] = (buttons || []).map((b) => ({
            text: b.text || 'OK',
            onPress: b.onPress ? () => (b.onPress as () => void)() : undefined,
            style: b.style,
        }));
        useAlertStore.getState().showAlert(title, message, formattedButtons);
    };
};
