import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/colors';
import TopBar from './TopBar';

interface ScreenProps {
    children: React.ReactNode;
    /** Renders a TopBar when supplied. Omit for screens that draw their own header. */
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    largeTitle?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
    /** Wraps children in a ScrollView with consistent gutters and bottom inset. */
    scroll?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Standard screen frame: transparent over ThemeWrapper's gradient, consistent
 * 16px gutters, and enough bottom padding to clear the floating tab bar.
 */
const Screen: React.FC<ScreenProps> = ({
    children,
    title,
    subtitle,
    showBack,
    largeTitle,
    onBack,
    right,
    scroll = false,
    refreshing,
    onRefresh,
    padded = true,
    style,
    contentStyle,
}) => {
    const insets = useSafeAreaInsets();
    const bottomPad = SPACING.xxl + insets.bottom;

    const inner = padded ? styles.padded : null;

    return (
        <View style={[styles.root, style]}>
            {title ? (
                <TopBar title={title} subtitle={subtitle} showBack={showBack} onBack={onBack} right={right} large={largeTitle} />
            ) : null}

            {scroll ? (
                <ScrollView
                    style={styles.flex}
                    // flexGrow (not flex) on the content container: `flex: 1`
                    // here caps content at viewport height and kills scrolling.
                    contentContainerStyle={[styles.grow, inner, { paddingBottom: bottomPad }, contentStyle]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={!!refreshing}
                                onRefresh={onRefresh}
                                tintColor={COLORS.primary}
                                colors={[COLORS.primary]}
                                progressBackgroundColor={COLORS.backgroundElevated}
                            />
                        ) : undefined
                    }
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.flex, inner, contentStyle]}>{children}</View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    grow: {
        flexGrow: 1,
    },
    padded: {
        paddingHorizontal: SPACING.md,
    },
});

export default Screen;
