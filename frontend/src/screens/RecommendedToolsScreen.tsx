import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import affiliateApi, { AffiliateLink } from '../api/affiliateApi';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 1; // Vertical list for now, can be 2 for grid

const RecommendedToolsScreen = ({ navigation }: any) => {
    const [tools, setTools] = useState<AffiliateLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const data = await affiliateApi.getAffiliateLinks();
            setTools(data);
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = async (tool: AffiliateLink) => {
        await affiliateApi.trackAffiliateClick(tool._id, Platform.OS as any);
        const supported = await Linking.canOpenURL(tool.trackingUrl);
        if (supported) {
            await Linking.openURL(tool.trackingUrl);
        }
    };

    const renderToolItem = ({ item }: { item: AffiliateLink }) => (
        <TouchableOpacity
            style={[styles.cardWrapper, COLORS.getGlow(COLORS.primary, 10, 0.2)]}
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
        >
            <BlurView intensity={40} tint="dark" style={styles.card}>
                <View style={styles.cardRow}>
                    <View style={styles.logoContainer}>
                        <Image source={{ uri: item.logo }} style={styles.logo} />
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.titleRow}>
                            <Text style={styles.toolName}>{item.name}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                            </View>
                        </View>

                        <Text style={styles.toolDesc} numberOfLines={2}>{item.description}</Text>

                        <View style={styles.footerRow}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>

                            <LinearGradient
                                colors={['#00f2fe', '#4facfe']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Get Started</Text>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Recommended Tools</Text>
                    <Text style={styles.headerSubtitle}>Best resources picked by experts</Text>
                </View>
            </View>

            <View style={styles.listContainer}>
                {/* @ts-ignore */}
                <FlashList
                    data={tools}
                    renderItem={renderToolItem}
                    estimatedItemSize={140}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Loading premium tools...</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No recommendations found.</Text>
                            </View>
                        )
                    }
                />
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    listContainer: {
        flex: 1,
    },
    cardWrapper: {
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    card: {
        padding: 16,
    },
    cardRow: {
        flexDirection: 'row',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toolName: {
        fontSize: 19,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    toolDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 18,
        marginVertical: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.white,
        marginLeft: 4,
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    categoryBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 16,
    }
});

export default RecommendedToolsScreen;
