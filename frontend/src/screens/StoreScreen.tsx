import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { storeApi } from '../api/storeApi';
import { FlashList } from '@shopify/flash-list';
import { formatCurrency } from '../utils/helpers';

const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'resume', name: 'Resumes', icon: 'document-text-outline' },
    { id: 'invoice', name: 'Invoices', icon: 'receipt-outline' },
    { id: 'ui-kit', name: 'UI Kits', icon: 'layers-outline' },
    { id: 'landing-page', name: 'Landing', icon: 'browsers-outline' },
    { id: 'figma-kit', name: 'Figma', icon: 'logo-figma' },
];

const StoreScreen = ({ navigation }: any) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = async (cat = selectedCategory, search = searchQuery) => {
        try {
            setLoading(true);
            const response = await storeApi.getProducts({ category: cat, search });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const handleSearch = () => {
        fetchProducts(selectedCategory, searchQuery);
    };

    const renderProduct = ({ item }: any) => (
        <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id, title: item.title })}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                    <View style={styles.ratingBox}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.averageRating || 'N/A'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Digital Store</Text>
                    <Text style={styles.headerSubtitle}>Premium assets for creators</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'MyPurchases' })} style={styles.purchasesBtn}>
                    <Ionicons name="download-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search templates, kits..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                </View>
            </View>

            <View style={{ height: 60, marginBottom: 15 }}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryCard,
                                selectedCategory === item.id && styles.categoryCardActive
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={18}
                                color={selectedCategory === item.id ? COLORS.white : COLORS.textMuted}
                            />
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item.id && styles.categoryTextActive
                            ]}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlashList
                    data={products}
                    renderItem={renderProduct}
                    estimatedItemSize={250}
                    numColumns={2}
                    contentContainerStyle={styles.productList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bag-handle-outline" size={64} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={styles.emptyText}>No products found in this category.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchProducts();
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
    headerSubtitle: { fontSize: 14, color: COLORS.textMuted },
    purchasesBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.backgroundSoft,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border
    },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchInputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 15, paddingHorizontal: 15, height: 50,
        borderWidth: 1, borderColor: COLORS.border
    },
    searchInput: { flex: 1, marginLeft: 10, color: COLORS.white, fontSize: 16 },
    categoryList: { paddingHorizontal: 20, paddingBottom: 10 },
    categoryCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft,
        paddingHorizontal: 15, borderRadius: 12,
        marginRight: 10, height: 40,
        borderWidth: 1, borderColor: COLORS.border
    },
    categoryCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { marginLeft: 8, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
    categoryTextActive: { color: COLORS.white },
    productList: { paddingHorizontal: 15, paddingBottom: 20 },
    productCard: {
        flex: 1, margin: 5, backgroundColor: COLORS.backgroundSoft,
        borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
        ...COLORS.getGlow(COLORS.primary, 10, 0.05)
    },
    imageContainer: { height: 140, position: 'relative' },
    productImage: { width: '100%', height: '100%' },
    categoryBadge: {
        position: 'absolute', top: 10, left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
    },
    categoryBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    productInfo: { padding: 12 },
    productTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    ratingBox: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { color: COLORS.textMuted, fontSize: 12, marginLeft: 4 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
    emptyText: { color: COLORS.textMuted, marginTop: 15, fontSize: 16 }
});

export default StoreScreen;
