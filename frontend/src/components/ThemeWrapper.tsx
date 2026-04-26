import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

interface ThemeWrapperProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children, useSafeArea = true }) => {
    const backgroundGradient = COLORS.getGradient(COLORS.backgroundGradient);

    const Content = (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={backgroundGradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Nebula Effects */}
            <View style={[styles.nebula, { top: -100, left: -100, backgroundColor: COLORS.primary + '30' }]} />
            <View style={[styles.nebula, { bottom: -150, right: -50, backgroundColor: COLORS.accent + '20' }]} />

            {children}
        </View>
    );

    if (useSafeArea) {
        return <SafeAreaView style={styles.safeArea}>{Content}</SafeAreaView>;
    }

    return Content;
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
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
