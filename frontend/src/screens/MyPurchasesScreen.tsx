import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { storeApi } from '../api/storeApi';

const MyPurchasesScreen = ({ navigation }: any) => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const response = await storeApi.getMyPurchases();
            setPurchases(response.data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const handleDownload = (product: any) => {
        Alert.alert('Download', `Preparing ${product.title} for download...`, [
            { text: 'Cancel' },
            {
                text: 'Download', onPress: () => {
                    // Real implementation would use Expo FileSystem
                    Alert.alert('Success', 'Download started. Check your device.');
                }
            }
        ]);
    };

    const renderPurchase = ({ item }: any) => {
        const product = item.productId;
        if (!product) return null;

        return (
            <View style={styles.purchaseCard}>
                <Image source={{ uri: product.images[0] }} style={styles.productThumb} />
                <View style={styles.purchaseInfo}>
                    <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                    <Text style={styles.purchaseDate}>Purchased on {new Date(item.purchaseDate).toLocaleDateString()}</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={() => handleDownload(product)}
                        >
                            <Ionicons name="cloud-download-outline" size={16} color={COLORS.white} />
                            <Text style={styles.btnText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.detailsBtn}
                            onPress={() => navigation.navigate('Store', {
                                screen: 'ProductDetail',
                                params: { productId: product._id, title: product.title }
                            })}
                        >
                            <Text style={styles.detailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Purchases</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={purchases}
                    renderItem={renderPurchase}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cart-outline" size={80} color={COLORS.textMuted} style={{ opacity: 0.3 }} />
                            <Text style={styles.emptyTitle}>No Purchases Yet</Text>
                            <Text style={styles.emptySubtitle}>Explore our digital store for premium assets and templates.</Text>
                            <TouchableOpacity
                                style={styles.exploreBtn}
                                onPress={() => navigation.navigate('Store')}
                            >
                                <Text style={styles.exploreBtnText}>Go to Store</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchPurchases();
                            }}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
    listContent: { padding: 20 },
    purchaseCard: {
        flexDirection: 'row', backgroundColor: COLORS.backgroundSoft,
        borderRadius: 20, padding: 12, marginBottom: 15,
        borderWidth: 1, borderColor: COLORS.border
    },
    productThumb: { width: 80, height: 80, borderRadius: 12 },
    purchaseInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    productTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
    purchaseDate: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    downloadBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, marginRight: 10
    },
    btnText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
    detailsBtn: { paddingHorizontal: 10 },
    detailsText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 20 },
    exploreBtn: {
        marginTop: 25, backgroundColor: COLORS.primary,
        paddingHorizontal: 30, paddingVertical: 12, borderRadius: 15,
        ...COLORS.getGlow(COLORS.primary, 10, 0.2)
    },
    exploreBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});

export default MyPurchasesScreen;
