import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import AuroraBackground from './AuroraBackground';

interface ThemeWrapperProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
    /** Turn off aurora drift on heavy screens (video, long lists). */
    animatedBackground?: boolean;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
    children,
    useSafeArea = true,
    animatedBackground = true,
}) => {
    const { theme, fetchTheme } = useThemeStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchTheme();
    }, []);

    const Content = (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <AuroraBackground animated={animatedBackground} />
            {children}
        </View>
    );

    if (useSafeArea) {
        // Reduce the top inset specifically for Android because the default safe area is sometimes too large
        const topPadding = Platform.OS === 'android' ? Math.max(insets.top - 20, 10) : insets.top;
        
        return (
            <View style={[
                styles.safeArea, 
                { 
                    backgroundColor: theme.background,
                    paddingTop: topPadding,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }
            ]}>
                {Content}
            </View>
        );
    }

    return Content;
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        // Keeps the oversized aurora blooms from inflating page height on web.
        overflow: 'hidden',
    },
});

export default ThemeWrapper;
