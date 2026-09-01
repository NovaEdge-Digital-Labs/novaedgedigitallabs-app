import { Share, Platform } from 'react-native';

interface ShareOptions {
    title: string;
    description?: string;
    category?: string;
    url?: string;
    type?: string;
}

export const shareContent = async ({
    title,
    description,
    category,
    url = 'https://novaedgedigitallabs.tech',
    type
}: ShareOptions) => {
    const categoryTag = category ? ` [${category.toUpperCase()}]` : '';
    const typeTag = type ? ` | ${type}` : '';
    const descText = description ? `\n\n"${description.substring(0, 150)}${description.length > 150 ? '...' : ''}"` : '';
    
    const shareMessage = `🚀 Check out "${title}"${categoryTag}${typeTag} on NovaEdge Digital Labs!${descText}\n\n👉 View details: ${url}\n\nDownload the App: https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech`;

    if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
            try {
                await (navigator as any).share({
                    title: `NovaEdge: ${title}`,
                    text: shareMessage,
                    url: url,
                });
                return;
            } catch (err) {
                // User cancelled or failed
            }
        }
        
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(shareMessage);
                const { useAlertStore } = require('../store/alertStore');
                useAlertStore.getState().showAlert('Copied!', 'Link and details copied to clipboard.', undefined, 'success');
            } else {
                const { useAlertStore } = require('../store/alertStore');
                useAlertStore.getState().showAlert(`Share: ${title}`, shareMessage, undefined, 'info');
            }
        } catch (e) {
            const { useAlertStore } = require('../store/alertStore');
            useAlertStore.getState().showAlert(`Share: ${title}`, shareMessage, undefined, 'info');
        }
        return;
    }

    try {
        await Share.share({
            title: `NovaEdge: ${title}`,
            message: shareMessage,
        });
    } catch (error) {
        console.error('Share error:', error);
    }
};
