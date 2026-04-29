import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import affiliateApi, { AffiliateLink } from '../api/affiliateApi';
import { COLORS } from '../constants/colors';

const RecommendedTools = () => {
    const navigation = useNavigation<any>();
    const [tools, setTools] = useState<AffiliateLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        const data = await affiliateApi.getAffiliateLinks();
        // Show only first 4 tools as preview
        setTools(data.slice(0, 4));
        setLoading(false);
    };

    const handlePress = async (tool: AffiliateLink) => {
        // Track click
        await affiliateApi.trackAffiliateClick(tool._id, Platform.OS as any);

        // Open URL
        const supported = await Linking.canOpenURL(tool.trackingUrl);
        if (supported) {
            await Linking.openURL(tool.trackingUrl);
        }
    };

    if (loading || tools.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Recommended Tools</Text>
                    <Text style={styles.subtitle}>Trusted resources for your digital projects</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('RecommendedTools')}
                    style={styles.seeAllBtn}
                >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tools.map((tool) => (
                    <TouchableOpacity
                        key={tool._id}
                        style={styles.cardWrapper}
                        onPress={() => handlePress(tool)}
                        activeOpacity={0.8}
                    >
                        <BlurView intensity={30} tint="dark" style={styles.card}>
                            <View style={styles.logoContainer}>
                                <Image source={{ uri: tool.logo }} style={styles.logo} />
                            </View>

                            <Text style={styles.toolName}>{tool.name}</Text>
                            <Text style={styles.toolDesc} numberOfLines={1}>{tool.description}</Text>

                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{tool.rating.toFixed(1)}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{tool.category}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['#00f2fe', '#4facfe']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Get Started</Text>
                            </LinearGradient>
                        </BlurView>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 4,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
        marginRight: 2,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    cardWrapper: {
        marginRight: 15,
        borderRadius: COLORS.geometry.radiusMedium,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    card: {
        padding: 16,
        width: 180,
        alignItems: 'center',
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.backgroundSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    toolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    toolDesc: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.white,
        marginLeft: 4,
        marginRight: 10,
        fontWeight: '600',
    },
    categoryBadge: {
        backgroundColor: COLORS.backgroundSoft,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    button: {
        width: '100%',
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RecommendedTools;
