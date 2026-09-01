import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

/**
 * App background.
 *
 * Deliberately almost nothing: a near-flat vertical wash from a marginally
 * lifted top to the base colour. The previous animated aurora competed with
 * every list, form and table in the product and made dense text harder to
 * read; contrast now comes from surface elevation, not from colour behind
 * the content.
 *
 * pointerEvents="none" throughout — a decorative layer must never intercept
 * scroll or taps.
 */
const AppBackground: React.FC<{ animated?: boolean }> = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
            colors={['#0C0D11', COLORS.background, COLORS.background]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
    </View>
);

export default AppBackground;
