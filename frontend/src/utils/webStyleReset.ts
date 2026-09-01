import { Platform } from 'react-native';

/**
 * React Native Web renders TextInput as a real <input>/<textarea>, so browsers
 * paint their default focus ring over our own focus border. Screens use raw
 * TextInput in many places, so this is done once globally rather than per field.
 */
export const applyWebStyleReset = () => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    if (document.getElementById('nova-web-reset')) return;

    const style = document.createElement('style');
    style.id = 'nova-web-reset';
    style.textContent = `
        input:focus, textarea:focus, select:focus, [contenteditable]:focus {
            outline: none !important;
            box-shadow: none !important;
        }
        input, textarea { caret-color: #ac4bff; }
        ::selection { background: rgba(172, 75, 255, 0.35); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
            background: rgba(172, 75, 255, 0.35);
            border-radius: 999px;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(172, 75, 255, 0.55); }
    `;
    document.head.appendChild(style);
};

export default applyWebStyleReset;
