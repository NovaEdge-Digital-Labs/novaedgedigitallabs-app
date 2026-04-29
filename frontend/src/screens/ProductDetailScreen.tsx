import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { storeApi } from '../api/storeApi';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/helpers';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }: any) => {
    const { productId } = route.params;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const user = useAuthStore((state) => state.user);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await storeApi.getProductDetails(productId);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product details:', error);
            Alert.alert('Error', 'Could not load product details.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [productId]);

    const handlePurchase = async () => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please login to purchase products.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Profile') }
            ]);
            return;
        }

        try {
            setBuying(true);
            const orderResponse = await storeApi.createOrder(productId);
            const order = orderResponse.data;

            const options = {
                description: product.description.substring(0, 50),
                image: 'https://novaedgedigitallabs.tech/logo.png',
                currency: order.currency,
                key: 'rzp_test_dummy', // This should be from your env usually
                amount: order.amount,
                name: 'NovaEdge Store',
                order_id: order.id,
                prefill: {
                    email: user.email,
                    contact: '',
                    name: user.name
                },
                theme: { color: COLORS.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                // handle success
                await storeApi.verifyPayment({
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                });
                Alert.alert('Success', 'Payment successful! You can now download the product.');
                fetchDetails(); // Refresh to show download button
            }).catch((error: any) => {
                // handle failure
                console.log('Payment failed:', error);
                Alert.alert('Payment Failed', error.description || 'Transaction cancelled');
            });
        } catch (error: any) {
            console.error('Purchase error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to initiate purchase');
        } finally {
            setBuying(false);
        }
    };

    const handleDownload = () => {
        const url = storeApi.getDownloadUrl(productId);
        // In a real app, you might use expo-file-system to download and save
        // For simplicity, we'll open in browser or use Linking
        Alert.alert('Download', 'Redirecting to secure download server...', [
            { text: 'Cancel' },
            {
                text: 'Download', onPress: () => {
                    // We'll use a signed URL or just simple Linking if verified
                    // Real implementation would use Expo FileSystem for better UX
                    Alert.alert('Info', 'Download started. Check your browser/downloads.');
                }
            }
        ]);
    };

    if (loading) {
        return (
            <ThemeWrapper>
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => Share.share({ message: `Check out ${product.title} on NovaEdge: ${product.images[0]}` })}
                    style={styles.backBtn}
                >
                    <Ionicons name="share-outline" size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageGallery}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
                        scrollEventThrottle={16}
                    >
                        {product.images.map((img: string, idx: number) => (
                            <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
                        ))}
                    </ScrollView>
                    <View style={styles.indicatorContainer}>
                        {product.images.map((_: any, idx: number) => (
                            <View
                                key={idx}
                                style={[styles.indicator, activeImage === idx && styles.indicatorActive]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{product.title}</Text>
                            <Text style={styles.category}>{product.category.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.statText}>{product.averageRating || 'New'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="download-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.statText}>{product.totalSales} Sales</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                            <Text style={styles.statText}>Verified</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    {product.features && product.features.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>What's Included</Text>
                            {product.features.map((feat: string, idx: number) => (
                                <View key={idx} style={styles.featureItem}>
                                    <Ionicons name="checkbox" size={18} color={COLORS.primary} />
                                    <Text style={styles.featureText}>{feat}</Text>
                                </View>
                            ))}
                        </>
                    )}

                    <View style={styles.reviewsSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.sectionTitle}>Reviews ({product.reviews?.length || 0})</Text>
                            <TouchableOpacity>
                                <Text style={{ color: COLORS.primary, fontSize: 12 }}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.slice(0, 3).map((rev: any, idx: number) => (
                                <View key={idx} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewerName}>{rev.userId.name}</Text>
                                        <View style={styles.ratingBox}>
                                            <Ionicons name="star" size={10} color="#FFD700" />
                                            <Text style={styles.ratingValue}>{rev.rating}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noReviews}>No reviews yet. Be the first to rate!</Text>
                        )}
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                {product.isPurchased ? (
                    <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
                        <Ionicons name="cloud-download-outline" size={20} color={COLORS.white} />
                        <Text style={styles.btnText}>DOWNLOAD ASSETS</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={handlePurchase}
                        disabled={buying}
                    >
                        {buying ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.btnText}>BUY NOW - {formatCurrency(product.price)}</Text>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center'
    },
    imageGallery: { width: width, height: 350, backgroundColor: COLORS.backgroundSoft },
    galleryImage: { width: width, height: 350, resizeMode: 'cover' },
    indicatorContainer: {
        position: 'absolute', bottom: 20, width: '100%',
        flexDirection: 'row', justifyContent: 'center'
    },
    indicator: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4
    },
    indicatorActive: { backgroundColor: COLORS.white, width: 24 },
    detailsContainer: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: COLORS.background, marginTop: -30 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, flex: 1 },
    category: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold', marginTop: 5 },
    price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft, padding: 15,
        borderRadius: 16, marginBottom: 25
    },
    statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    statText: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginLeft: 6 },
    statDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 12 },
    description: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22, marginBottom: 25 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    featureText: { color: COLORS.white, marginLeft: 10, fontSize: 14 },
    reviewsSection: { marginTop: 30 },
    reviewCard: {
        backgroundColor: COLORS.backgroundSoft, padding: 15,
        borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewerName: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
    ratingBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5
    },
    ratingValue: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    reviewComment: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
    noReviews: { color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    bottomBar: {
        position: 'absolute', bottom: 0, width: '100%',
        padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20,
        backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border
    },
    buyBtn: {
        backgroundColor: COLORS.primary, height: 56, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        ...COLORS.getGlow(COLORS.primary, 15, 0.3)
    },
    downloadBtn: {
        backgroundColor: '#10b981', height: 56, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        ...COLORS.getGlow('#10b981', 15, 0.3)
    },
    btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, marginHorizontal: 10 }
});

export default ProductDetailScreen;
