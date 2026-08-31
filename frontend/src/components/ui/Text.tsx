import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type TextVariant =
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'eyebrow'
    | 'bodyLarge'
    | 'body'
    | 'bodyStrong'
    | 'label'
    | 'caption'
    | 'button';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'faint' | 'accent' | 'success' | 'error' | 'warning';

interface TextProps extends RNTextProps {
    variant?: TextVariant;
    tone?: TextTone;
    /** Convenience alias so callers don't reach for a style object for one colour. */
    color?: string;
    center?: boolean;
    style?: StyleProp<TextStyle>;
}

const toneColor = (tone: TextTone): string => {
    switch (tone) {
        case 'secondary': return COLORS.textLight;
        case 'muted': return COLORS.textMuted;
        case 'faint': return COLORS.textFaint ?? COLORS.textMuted;
        case 'accent': return COLORS.accent;
        case 'success': return COLORS.success;
        case 'error': return COLORS.error;
        case 'warning': return COLORS.warning;
        default: return COLORS.text;
    }
};

const Text: React.FC<TextProps> = ({
    variant = 'body',
    tone = 'primary',
    color,
    center,
    style,
    children,
    ...rest
}) => (
    <RNText
        style={[
            TYPOGRAPHY[variant],
            { color: color ?? toneColor(tone) },
            center && { textAlign: 'center' },
            style,
        ]}
        {...rest}
    >
        {children}
    </RNText>
);

export default Text;
