import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Clipboard, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const endpoints = [
    {
        id: 'generate-qr',
        method: 'POST',
        path: '/api/v1/tools/generate-qr',
        title: 'Generate QR Code',
        description: 'Generate a QR code image from a given string or URL.',
        requestBody: `{\n  "text": "https://novaedgedigitallabs.tech"\n}`,
        response: `{\n  "success": true,\n  "qrCode": "data:image/png;base64,iVBORw0KGgo..."\n}`
    },
    {
        id: 'calculate-gst',
        method: 'POST',
        path: '/api/v1/tools/calculate-gst',
        title: 'Calculate GST',
        description: 'Calculate GST amounts for a given base amount and rate.',
        requestBody: `{\n  "amount": 1000,\n  "rate": 18,\n  "isInclusive": false\n}`,
        response: `{\n  "success": true,\n  "data": {\n    "baseAmount": 1000,\n    "gstAmount": 180,\n    "totalAmount": 1180,\n    "cgst": 90,\n    "sgst": 90\n  }\n}`
    },
    {
        id: 'calculate-emi',
        method: 'POST',
        path: '/api/v1/tools/calculate-emi',
        title: 'Calculate EMI',
        description: 'Calculate monthly loan EMI and total interest payable.',
        requestBody: `{\n  "principal": 500000,\n  "rate": 8.5,\n  "tenure": 5,\n  "tenureType": "years"\n}`,
        response: `{\n  "success": true,\n  "data": {\n    "emi": 10258.27,\n    "totalInterest": 115496.20,\n    "totalAmount": 615496.20\n  }\n}`
    },
    {
        id: 'generate-invoice',
        method: 'POST',
        path: '/api/v1/tools/generate-invoice',
        title: 'Generate Invoice',
        description: 'Generate a professional PDF invoice from provided details.',
        requestBody: `{\n  "invoiceNumber": "INV-001",\n  "clientName": "Acme Corp",\n  "amount": 5000\n}`,
        response: `{\n  "success": true,\n  "pdfUrl": "https://..."\n}`
    },
    {
        id: 'compress-image',
        method: 'POST',
        path: '/api/v1/tools/compress-image',
        title: 'Compress Image',
        description: 'Compress an image file to reduce its size. Requires multipart/form-data.',
        requestBody: `Form Data:\n  image: (file object)`,
        response: `{\n  "success": true,\n  "originalSize": 1024000,\n  "compressedSize": 256000,\n  "url": "https://..."\n}`
    },
    {
        id: 'get-jobs',
        method: 'GET',
        path: '/api/v1/jobs',
        title: 'Get Jobs',
        description: 'Fetch the latest active job postings.',
        requestBody: `No body required`,
        response: `{\n  "success": true,\n  "count": 10,\n  "data": [...]\n}`
    },
    {
        id: 'get-academy',
        method: 'GET',
        path: '/api/v1/academy',
        title: 'Get Courses',
        description: 'Fetch available academy courses.',
        requestBody: `No body required`,
        response: `{\n  "success": true,\n  "count": 5,\n  "data": [...]\n}`
    },
    {
        id: 'get-marketplace',
        method: 'GET',
        path: '/api/v1/marketplace',
        title: 'Get Gigs',
        description: 'Fetch freelance gigs from the marketplace.',
        requestBody: `No body required`,
        response: `{\n  "success": true,\n  "count": 12,\n  "data": [...]\n}`
    },
    {
        id: 'get-store',
        method: 'GET',
        path: '/api/v1/store',
        title: 'Get Digital Products',
        description: 'Fetch digital products available in the store.',
        requestBody: `No body required`,
        response: `{\n  "success": true,\n  "count": 8,\n  "data": [...]\n}`
    }
];

const ApiReferenceScreen = ({ navigation }: any) => {
    const [expandedId, setExpandedId] = useState<string | null>(endpoints[0].id);

    const handleCopy = (text: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied', 'Snippet copied to clipboard');
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>API Reference</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introBox}>
                    <Text style={styles.introTitle}>NovaEdge Developer API</Text>
                    <Text style={styles.introText}>
                        Our REST API allows you to integrate NovaEdge tools directly into your applications.
                        All API requests must include your API key in the headers.
                    </Text>
                    <View style={styles.authBox}>
                        <Text style={styles.authBoxTitle}>Authentication Header</Text>
                        <View style={styles.codeBlock}>
                            <Text style={styles.codeText}>x-api-key: YOUR_API_KEY_HERE</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>ENDPOINTS</Text>

                {endpoints.map((ep) => (
                    <View key={ep.id} style={styles.endpointCard}>
                        <TouchableOpacity
                            style={styles.endpointHeader}
                            activeOpacity={0.7}
                            onPress={() => setExpandedId(expandedId === ep.id ? null : ep.id)}
                        >
                            <View style={styles.endpointTitleRow}>
                                <View style={styles.methodBadge}>
                                    <Text style={styles.methodText}>{ep.method}</Text>
                                </View>
                                <Text style={styles.endpointPath}>{ep.path}</Text>
                            </View>
                            <Ionicons
                                name={expandedId === ep.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={COLORS.textMuted}
                            />
                        </TouchableOpacity>

                        {expandedId === ep.id && (
                            <View style={styles.endpointBody}>
                                <Text style={styles.endpointName}>{ep.title}</Text>
                                <Text style={styles.endpointDesc}>{ep.description}</Text>
                                
                                <Text style={styles.blockLabel}>Request Body (JSON)</Text>
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{ep.requestBody}</Text>
                                    <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopy(ep.requestBody)}>
                                        <Ionicons name="copy-outline" size={16} color={COLORS.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.blockLabel}>Example Response</Text>
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{ep.response}</Text>
                                </View>
                            </View>
                        )}
                    </View>
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
            },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    content: { padding: 20 },
    introBox: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    introTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 10 },
    introText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, marginBottom: 20 },
    authBox: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    authBoxTitle: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6', marginBottom: 8, textTransform: 'uppercase' },
    codeBlock: {
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        padding: 12,
        position: 'relative'
    },
    codeText: { color: '#d4d4d4', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 15, letterSpacing: 1 },
    endpointCard: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden'
    },
    endpointHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    endpointTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    methodBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 12
    },
    methodText: { color: '#10b981', fontSize: 12, fontWeight: 'bold' },
    endpointPath: { color: COLORS.white, fontSize: 14, fontWeight: '500', flex: 1 },
    endpointBody: { padding: 15, borderTopWidth: 1, borderTopColor: COLORS.border },
    endpointName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
    endpointDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
    blockLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 8, marginTop: 15, textTransform: 'uppercase' },
    copyBtn: { position: 'absolute', top: 10, right: 10, padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6 }
});

export default ApiReferenceScreen;
