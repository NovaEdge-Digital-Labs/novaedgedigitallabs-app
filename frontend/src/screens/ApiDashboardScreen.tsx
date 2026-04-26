import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Clipboard,
    FlatList,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import developerApi, { ApiUsageStats, ApiCallLog } from '../api/developerApi';

const { width } = Dimensions.get('window');

const ApiDashboardScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState('');
    const [stats, setStats] = useState<ApiUsageStats | null>(null);
    const [history, setHistory] = useState<ApiCallLog[]>([]);
    const [activeTab, setActiveTab] = useState('usage'); // usage, history, snippets

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const keyRes = await developerApi.getApiKey();
            setApiKey(keyRes.apiKey);

            const statsRes = await developerApi.getUsageStats();
            setStats(statsRes.stats);
            setHistory(statsRes.history);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch API details');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        Clipboard.setString(apiKey);
        Alert.alert('Success', 'API Key copied to clipboard');
    };

    const handleRegenerate = () => {
        Alert.alert(
            'Regenerate API Key',
            'This will deactivate your current key. Any external integrations using the old key will stop working. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Regenerate',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await developerApi.regenerateApiKey();
                            setApiKey(res.apiKey);
                            Alert.alert('Success', 'New API Key generated');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to regenerate key');
                        }
                    }
                }
            ]
        );
    };

    const renderUsage = () => {
        if (!stats) return null;
        const percentage = (stats.monthlyCalls / stats.monthlyLimit) * 100;

        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Monthly Quota</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%` }]} />
                    </View>
                    <View style={styles.quotaRow}>
                        <Text style={styles.quotaText}>{stats.monthlyCalls} / {stats.monthlyLimit} calls</Text>
                        <Text style={styles.quotaPercentage}>{percentage.toFixed(1)}%</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Tool Breakdown</Text>
                {stats.toolBreakdown.map((item, index) => (
                    <View key={index} style={styles.breakdownItem}>
                        <View style={styles.breakdownLabelRow}>
                            <Text style={styles.breakdownName}>{item._id.split('/').pop()?.toUpperCase()}</Text>
                            <Text style={styles.breakdownCount}>{item.count} calls</Text>
                        </View>
                        <View style={styles.breakdownBarBg}>
                            <View
                                style={[
                                    styles.breakdownBar,
                                    { width: `${(item.count / stats.monthlyCalls) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderHistory = () => (
        <View style={styles.tabContent}>
            {history.length === 0 ? (
                <Text style={styles.emptyText}>No API calls found yet.</Text>
            ) : (
                history.map((log) => (
                    <View key={log._id} style={styles.historyItem}>
                        <View style={styles.historyTop}>
                            <Text style={[styles.methodText, { color: getMethodColor(log.method) }]}>{log.method}</Text>
                            <Text style={styles.endpointText}>{log.endpoint}</Text>
                        </View>
                        <View style={styles.historyBottom}>
                            <Text style={styles.historyTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                            <View style={styles.historyRight}>
                                <Text style={styles.historyLatency}>{log.responseTime}ms</Text>
                                <View style={[styles.statusBadge, { backgroundColor: log.statusCode < 300 ? '#10b98120' : '#ef444420' }]}>
                                    <Text style={[styles.statusText, { color: log.statusCode < 300 ? '#10b981' : '#ef4444' }]}>
                                        {log.statusCode}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'POST': return '#10b981';
            case 'GET': return '#3b82f6';
            default: return COLORS.textMuted;
        }
    };

    const renderSnippets = () => {
        const [lang, setLang] = useState('js');

        const snippets: any = {
            js: `fetch('https://novaedgedigitallabs.tech/api/v1/tools/generate-qr', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({
    text: 'Hello NovaEdge'
  })
})
.then(res => res.json())
.then(console.log);`,
            python: `import requests

url = "https://novaedgedigitallabs.tech/api/v1/tools/generate-qr"
headers = {
    "x-api-key": "${apiKey}",
    "Content-Type": "application/json"
}
data = {"text": "Hello NovaEdge"}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
            curl: `curl -X POST https://novaedgedigitallabs.tech/api/v1/tools/generate-qr \\
     -H "x-api-key: ${apiKey}" \\
     -H "Content-Type: application/json" \\
     -d '{"text": "Hello NovaEdge"}'`
        };

        return (
            <View style={styles.tabContent}>
                <View style={styles.snippetTabs}>
                    {['js', 'python', 'curl'].map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.snippetTab, lang === t && styles.activeSnippetTab]}
                            onPress={() => setLang(t)}
                        >
                            <Text style={[styles.snippetTabText, lang === t && styles.activeSnippetTabText]}>
                                {t.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.codeContainer}>
                    <Text style={styles.codeText}>{snippets[lang]}</Text>
                </View>
                <TouchableOpacity style={styles.copySnippetBtn} onPress={() => {
                    Clipboard.setString(snippets[lang]);
                    Alert.alert('Copied', 'Code snippet copied to clipboard');
                }}>
                    <Ionicons name="copy-outline" size={16} color="white" />
                    <Text style={styles.copySnippetText}>Copy Code</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <ThemeWrapper>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Developer API</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.keySection}>
                    <Text style={styles.label}>Your API Key</Text>
                    <View style={styles.keyContainer}>
                        <Text style={styles.apiKeyText} numberOfLines={1}>{apiKey}</Text>
                        <View style={styles.keyActions}>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleRegenerate}>
                                <Ionicons name="refresh-outline" size={20} color="#f59e0b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.hint}>Keep this key secret. Do not share it in public repositories.</Text>
                </View>

                <View style={styles.tabHeader}>
                    {['usage', 'history', 'snippets'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'usage' && renderUsage()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'snippets' && renderSnippets()}

                <TouchableOpacity
                    style={styles.docsBtn}
                    onPress={() => navigation.navigate('Support', { title: 'API Documentation' })}
                >
                    <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                    <Text style={styles.docsBtnText}>View Full API Documentation</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
    keySection: { padding: 20 },
    label: { color: COLORS.textMuted, fontSize: 14, marginBottom: 10 },
    keyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    apiKeyText: { flex: 1, color: COLORS.white, fontSize: 14, fontFamily: 'monospace' },
    keyActions: { flexDirection: 'row' },
    actionBtn: { marginLeft: 15 },
    hint: { color: COLORS.textMuted, fontSize: 12, marginTop: 10, fontStyle: 'italic' },
    tabHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tabButton: { paddingVertical: 15, marginRight: 30 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabButtonText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
    activeTabText: { color: COLORS.primary },
    tabContent: { padding: 20 },
    card: {
        backgroundColor: COLORS.backgroundSoft,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 25,
    },
    cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    progressBarContainer: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 12 },
    progressBar: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
    quotaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    quotaText: { color: COLORS.textMuted, fontSize: 14 },
    quotaPercentage: { color: COLORS.white, fontWeight: 'bold' },
    sectionTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    breakdownItem: { marginBottom: 20 },
    breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    breakdownName: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
    breakdownCount: { color: COLORS.textMuted, fontSize: 12 },
    breakdownBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
    breakdownBar: { height: 6, backgroundColor: COLORS.secondary, borderRadius: 3 },
    historyItem: {
        backgroundColor: COLORS.backgroundSoft,
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    historyTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    methodText: { fontWeight: 'bold', fontSize: 12, marginRight: 10 },
    endpointText: { color: COLORS.white, fontSize: 13, fontFamily: 'monospace' },
    historyBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyTime: { color: COLORS.textMuted, fontSize: 11 },
    historyRight: { flexDirection: 'row', alignItems: 'center' },
    historyLatency: { color: COLORS.textMuted, fontSize: 11, marginRight: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 50 },
    snippetTabs: { flexDirection: 'row', marginBottom: 15 },
    snippetTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginRight: 10 },
    activeSnippetTab: { backgroundColor: COLORS.primary },
    snippetTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: 'bold' },
    activeSnippetTabText: { color: 'white' },
    codeContainer: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    codeText: { color: '#d1d1d1', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
    copySnippetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundSoft,
        padding: 12,
        borderRadius: 12,
        marginTop: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    copySnippetText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 8 },
    docsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        margin: 20,
        padding: 18,
        borderRadius: 16,
    },
    docsBtnText: { flex: 1, color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 12 },
});

export default ApiDashboardScreen;
