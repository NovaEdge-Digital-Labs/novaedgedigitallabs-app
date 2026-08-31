import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                {Content}
            </SafeAreaView>
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
