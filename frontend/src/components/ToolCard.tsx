import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

const ToolCard = ({ title, description, onPress }: { title: string, description: string, onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        ...COLORS.glass,
        padding: 18,
        borderRadius: COLORS.geometry.radiusMedium,
        marginVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    description: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 6,
        lineHeight: 20,
    },
});

export default ToolCard;
