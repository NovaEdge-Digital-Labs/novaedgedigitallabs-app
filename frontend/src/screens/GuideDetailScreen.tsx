import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const GuideDetailScreen = ({ route, navigation }: any) => {
    const guide = route.params?.guide;

    if (!guide) {
        return (
            <ThemeWrapper>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Error</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.white }}>Guide not found</Text>
                </View>
            </ThemeWrapper>
        );
    }

    // Generate dummy content based on the guide title for realism
    const getContent = () => {
        return (
            <View style={styles.article}>
                <Text style={styles.paragraph}>
                    Welcome to the detailed documentation for <Text style={styles.bold}>{guide.title}</Text>. 
                    This guide is designed to help you quickly understand and implement the necessary steps for this topic.
                </Text>
                
                <Text style={styles.heading}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    {guide.description} Below you will find detailed instructions and best practices to ensure you get the most out of NovaEdge Digital Labs tools.
                </Text>

                <Text style={styles.heading}>2. Key Concepts</Text>
                <View style={styles.bulletList}>
                    <View style={styles.bulletItem}>
                        <Ionicons name="ellipse" size={6} color={guide.color} style={styles.bulletIcon} />
                        <Text style={styles.bulletText}>Make sure your environment is properly configured.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Ionicons name="ellipse" size={6} color={guide.color} style={styles.bulletIcon} />
                        <Text style={styles.bulletText}>Keep your credentials and API keys secure.</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <Ionicons name="ellipse" size={6} color={guide.color} style={styles.bulletIcon} />
                        <Text style={styles.bulletText}>Review our rate limits if you are integrating API endpoints.</Text>
                    </View>
                </View>

                <View style={[styles.infoBox, { borderColor: guide.color }]}>
                    <Ionicons name="information-circle-outline" size={24} color={guide.color} style={{ marginRight: 10 }} />
                    <Text style={styles.infoText}>
                        Pro Tip: You can always reach out to our support team if you run into any specific issues not covered here.
                    </Text>
                </View>

                <Text style={styles.heading}>3. Next Steps</Text>
                <Text style={styles.paragraph}>
                    Once you have completed this guide, you can head back to the User Guides dashboard to explore other topics. We regularly update our documentation to include new features and improvements.
                </Text>
            </View>
        );
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documentation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={[styles.iconBox, { backgroundColor: `${guide.color}15` }]}>
                        <Ionicons name={guide.icon} size={32} color={guide.color} />
                    </View>
                    <Text style={styles.title}>{guide.title}</Text>
                    <Text style={styles.subtitle}>{guide.description}</Text>
                </View>

                {getContent()}
                
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    content: { padding: 20 },
    heroSection: {
        alignItems: 'center',
        marginBottom: 35,
        paddingTop: 10
    },
    iconBox: {
        width: 70,
        height: 70,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
    article: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 25,
        marginBottom: 15,
    },
    paragraph: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 24,
        marginBottom: 10
    },
    bold: { fontWeight: 'bold', color: COLORS.white },
    bulletList: { marginBottom: 20 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingRight: 15 },
    bulletIcon: { marginTop: 8, marginRight: 12 },
    bulletText: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22, flex: 1 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginVertical: 20
    },
    infoText: { flex: 1, fontSize: 14, color: COLORS.textMuted, lineHeight: 20 }
});

export default GuideDetailScreen;
