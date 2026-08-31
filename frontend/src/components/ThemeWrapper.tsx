import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';

interface ThemeWrapperProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children, useSafeArea = true }) => {
    const { theme, fetchTheme, getGradient } = useThemeStore();

    useEffect(() => {
        fetchTheme();
    }, []);

    const backgroundGradient = getGradient(theme.backgroundGradient);

    const Content = (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            {/* Decorative only: these must never intercept scroll or taps. */}
            <LinearGradient
                colors={backgroundGradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
            />
            <View
                pointerEvents="none"
                style={[styles.nebula, { top: -100, left: -100, backgroundColor: theme.primary + '30' }]}
            />
            <View
                pointerEvents="none"
                style={[styles.nebula, { bottom: -150, right: -50, backgroundColor: theme.accent + '20' }]}
            />

            {children}
        </View>
    );

    if (useSafeArea) {
        return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>{Content}</SafeAreaView>;
    }

    return Content;
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    nebula: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.4,
        transform: [{ scale: 1.5 }],
    }
});

export default ThemeWrapper;
