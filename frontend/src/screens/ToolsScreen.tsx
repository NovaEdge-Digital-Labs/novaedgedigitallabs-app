import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import RecommendedTools from '../components/RecommendedTools';

const { width } = Dimensions.get('window');

const ToolsScreen: React.FC<any> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'Developer', 'Business', 'Media'];

    const tools = [
        { id: '1', name: 'Image Compressor', desc: 'Reduce image size without quality loss', badge: 'Free', category: 'Media', icon: 'image', routeName: 'ImageCompressor' },
        { id: '2', name: 'QR Generator', desc: 'Generate custom QR codes instantly', badge: 'Free', category: 'Business', icon: 'qr-code', routeName: 'QRGenerator' },
        { id: '3', name: 'GST Calculator', desc: 'Calculate GST inclusive/exclusive rates', badge: 'Free', category: 'Business', icon: 'calculator', routeName: 'GSTCalculator' },
        { id: '4', name: 'EMI Calculator', desc: 'Plan your loans with detailed schedule', badge: 'Free', category: 'Business', icon: 'trending-up', routeName: 'EMICalculator' },
        { id: '5', name: 'JSON Formatter', desc: 'Format, minify, and validate JSON', badge: 'Free', category: 'Developer', icon: 'code', routeName: 'JSONFormatter' },
        { id: '6', name: 'Base64 Tool', desc: 'Encode and decode Base64 strings', badge: 'Free', category: 'Developer', icon: 'sync', routeName: 'Base64Tool' },
        { id: '7', name: 'JWT Decoder', desc: 'Decode Header, Payload of JWTs', badge: 'Pro', category: 'Developer', icon: 'shield-checkmark', routeName: 'JWTDecoder' },
        { id: '8', name: 'RegEx Tester', desc: 'Test patterns with live matching', badge: 'Pro', category: 'Developer', icon: 'search', routeName: 'RegExTester' },
    ];

    const filteredTools = tools.filter(tool =>
        (activeTab === 'All' || tool.category === activeTab) &&
        (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderToolItem = ({ item }: { item: typeof tools[0] }) => (
        <TouchableOpacity
            style={[styles.toolCard, COLORS.getGlow(COLORS.primary, 8, 0.15)]}
            onPress={() => navigation.navigate(item.routeName)}
            activeOpacity={0.7}
        >
            <View style={[styles.toolIconContainer, { backgroundColor: 'transparent' }]}>
                <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.toolInfo}>
                <View style={styles.toolHeader}>
                    <Text style={styles.toolName}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.badgeText, { color: item.badge === 'Free' ? COLORS.primary : COLORS.accent }]}>{item.badge}</Text>
                    </View>
                </View>
                <Text style={styles.toolDesc}>{item.desc}</Text>
            </View>
            {item.badge !== 'Free' && (
                <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} style={styles.lockIcon} />
            )}
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Developer Tools</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput
                        placeholder="Search tools..."
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listContainer}>
                {/* @ts-ignore */}
                <FlashList
                    data={filteredTools}
                    renderItem={renderToolItem}
                    estimatedItemSize={100}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={RecommendedTools}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                />
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `rgba(255, 255, 255, ${COLORS.effects.inputOpacity})`,
        borderRadius: COLORS.geometry.radiusMedium,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    tabsContainer: {
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: COLORS.geometry.radiusLarge,
        marginRight: 10,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeTab: {
        backgroundColor: COLORS.primary + '30',
        borderColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: COLORS.white,
    },
    listContainer: {
        flex: 1,
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        ...COLORS.glass,
        borderRadius: COLORS.geometry.radiusMedium,
        padding: 16,
        marginBottom: 16,
    },
    toolIconContainer: {
        width: 54,
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toolInfo: {
        flex: 1,
    },
    toolHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    toolName: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    toolDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    lockIcon: {
        marginLeft: 10,
    },
});

export default ToolsScreen;
