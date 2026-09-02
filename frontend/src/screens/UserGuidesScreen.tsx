import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const guides = [
    {
        id: '1',
        title: 'Getting Started with NovaEdge',
        description: 'Learn how to set up your account, configure your workspace, and invite team members.',
        icon: 'rocket-outline',
        color: '#3b82f6'
    },
    {
        id: '2',
        title: 'Developer API Integration',
        description: 'Step-by-step guide to generating API keys and authenticating your requests.',
        icon: 'code-slash-outline',
        color: '#10b981'
    },
    {
        id: '3',
        title: 'Managing Billing & Subscriptions',
        description: 'Understand how billing cycles work and how to upgrade to a premium plan.',
        icon: 'card-outline',
        color: '#8b5cf6'
    },
    {
        id: '4',
        title: 'Using Built-in Developer Tools',
        description: 'Discover how to use tools like QR Generator, GST Calculator, and RegEx Tester effectively.',
        icon: 'construct-outline',
        color: '#f59e0b'
    },
    {
        id: '5',
        title: 'Account Security Best Practices',
        description: 'Tips and tricks to keep your account, API keys, and workspace data completely secure.',
        icon: 'shield-checkmark-outline',
        color: '#ef4444'
    }
];

const UserGuidesScreen = ({ navigation }: any) => {
    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Guides</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.heroCard, COLORS.getGlow(COLORS.primary, 15, 0.15)]}>
                    <Ionicons name="book" size={48} color={COLORS.primary} style={{ marginBottom: 15 }} />
                    <Text style={styles.heroTitle}>Help Center & Guides</Text>
                    <Text style={styles.heroDesc}>
                        Find everything you need to master NovaEdge Digital Labs tools and services.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>ALL GUIDES</Text>

                {guides.map((guide) => (
                    <TouchableOpacity
                        key={guide.id}
                        style={styles.guideCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('GuideDetail', { guide })}
                    >
                        <View style={[styles.iconBox, { backgroundColor: `${guide.color}15` }]}>
                            <Ionicons name={guide.icon as any} size={24} color={guide.color} />
                        </View>
                        <View style={styles.guideInfo}>
                            <Text style={styles.guideTitle}>{guide.title}</Text>
                            <Text style={styles.guideDesc}>{guide.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    content: { padding: 20 },
    heroCard: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 10 },
    heroDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        marginBottom: 15,
        letterSpacing: 1,
        marginLeft: 5
    },
    guideCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    guideInfo: { flex: 1, paddingRight: 10 },
    guideTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 5 },
    guideDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 }
});

export default UserGuidesScreen;
