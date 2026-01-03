import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { HardDrive, UserCheck, Tag, Hash, Calendar, QrCode, Monitor, Smartphone, Server, Cpu, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { SkeletonStatsCard, SkeletonCard } from '@shared/components/Skeleton';

export default function MyAssetsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [totalAssets, setTotalAssets] = useState(0);
    const [allocatedAssets, setAllocatedAssets] = useState(0);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        const formData = new FormData();
        formData.append("key", user?.api_key || '');
        formData.append("indo_code", user?.indo_code || '');

        setLoading(true);
        try {
            console.log('🔍 [Fetch Assets] API:', `${process.env.EXPO_PUBLIC_API_URL}/assets/get_assets.php`);
            console.log('🔍 [Fetch Assets] Payload:', { key: user?.api_key, indo_code: user?.indo_code });

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/assets/get_assets.php`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log('✅ [Fetch Assets] Response:', result);

            if (result.status) {
                const assetsData = result.result || [];
                setAssets(assetsData);
                setTotalAssets(assetsData.length);

                const allocated = assetsData.filter((asset: any) => asset.assign_date).length;
                setAllocatedAssets(allocated);

                toast.show('success', 'Assets loaded successfully');
            } else {
                toast.show('error', 'Failed to load assets');
            }
        } catch (error: any) {
            console.error('❌ [Fetch Assets] Error:', error);
            toast.show('error', 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getAssetIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'laptop': return Monitor;
            case 'desktop': return HardDrive;
            case 'mobile': return Smartphone;
            case 'server': return Server;
            default: return Cpu;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: any = {
            laptop: '#06B6D4',
            desktop: '#0EA5E9',
            mobile: '#8B5CF6',
            server: '#EC4899',
            'ip phone': '#10B981',
            toolkit: '#F59E0B',
            default: '#64748B'
        };
        return colors[category?.toLowerCase()] || colors.default;
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return CheckCircle;
            case 'pending': return Clock;
            default: return XCircle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#10B981';
            case 'pending': return '#F59E0B';
            default: return '#EF4444';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const StatsCard = ({ title, count, icon: IconComponent, color }: any) => (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border, borderTopColor: color }]}>
            <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
                <IconComponent size={24} color={color} />
            </View>
            <View style={styles.statsContent}>
                <Text style={[styles.statsCount, { color: theme.colors.text }]}>{count}</Text>
                <Text style={[styles.statsTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
            </View>
        </View>
    );

    const AssetItem = ({ asset }: any) => {
        const IconComponent = getAssetIcon(asset.asset_type);
        const categoryColor = getCategoryColor(asset.asset_type);
        const StatusIcon = getStatusIcon(asset.status);
        const statusColor = getStatusColor(asset.status);

        return (
            <View style={[styles.assetCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                <View style={styles.assetHeader}>
                    <View style={[styles.assetIconContainer, { backgroundColor: categoryColor + '15' }]}>
                        <IconComponent size={24} color={categoryColor} />
                    </View>
                    <View style={styles.assetInfo}>
                        <Text style={[styles.assetName, { color: theme.colors.text }]}>{asset.asset_name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <StatusIcon size={14} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{asset.status}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.assetDetails}>
                    <View style={styles.detailRow}>
                        <Tag size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
                        <Text style={[styles.detailValue, { color: categoryColor }]}>{asset.asset_type}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Hash size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>SSIT Code:</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{asset.ssit_code || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Hash size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Serial No:</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{asset.serial_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Assign Date:</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(asset.assign_date)}</Text>
                    </View>
                    {asset.release_date && (
                        <View style={styles.detailRow}>
                            <Calendar size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Release Date:</Text>
                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(asset.release_date)}</Text>
                        </View>
                    )}

                    {asset.qrcode && (
                        <View style={[styles.qrContainer, { borderTopColor: theme.colors.border }]}>
                            <View style={styles.qrHeader}>
                                <QrCode size={16} color={theme.colors.textSecondary} />
                                <Text style={[styles.qrLabel, { color: theme.colors.textSecondary }]}>QR Code:</Text>
                            </View>
                            <Image source={{ uri: asset.qrcode.trim() }} style={styles.qrImage} resizeMode="contain" />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <CorporateBackground>
            <TopBar title="Company Assets" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.statsContainer}>
                    <StatsCard title="Total Assets" count={totalAssets} icon={HardDrive} color="#06B6D4" />
                    <StatsCard title="Allocated" count={allocatedAssets} icon={UserCheck} color="#10B981" />
                </View>

                {loading ? (
                    <>
                        <View style={styles.statsContainer}>
                            <SkeletonStatsCard />
                            <SkeletonStatsCard />
                        </View>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : assets.length > 0 ? (
                    <View style={styles.assetsSection}>
                        <View style={styles.sectionHeader}>
                            <HardDrive size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Assets</Text>
                        </View>
                        {assets.map((asset, index) => (
                            <AssetItem key={asset.asset_id || index} asset={asset} />
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.colors.cardPrimary }]}>
                        <HardDrive size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Assets Found</Text>
                        <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                            There are currently no assets assigned to you
                        </Text>
                    </View>
                )}
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 30 },
    statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    statsCard: { flex: 1, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderTopWidth: 4, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
    statsIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    statsContent: { flex: 1 },
    statsCount: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
    statsTitle: { fontSize: 14, fontWeight: '600' },
    loadingContainer: { paddingVertical: 50, alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16 },
    assetsSection: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    assetCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, borderWidth: 1 },
    assetHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    assetIconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    assetInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    assetName: { fontSize: 18, fontWeight: '700', flex: 1, marginRight: 10 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
    assetDetails: { gap: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailLabel: { width: 90, fontSize: 14, fontWeight: '600' },
    detailValue: { flex: 1, fontSize: 14, fontWeight: '500' },
    qrContainer: { marginTop: 10, paddingTop: 16, borderTopWidth: 1 },
    qrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    qrLabel: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
    qrImage: { width: 120, height: 120, borderRadius: 8, alignSelf: 'flex-start' },
    emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 12 },
    emptyStateText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
