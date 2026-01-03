import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useAssets } from '@features/assets/hooks';
import { Package, Calendar, Hash } from 'lucide-react-native';

export default function AssetsScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const { data: assets, isLoading } = useAssets();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'assigned':
            case 'active':
                return theme.colors.success;
            case 'returned':
                return theme.colors.textSecondary;
            default:
                return theme.colors.warning;
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="My Assets"
                onMenuPress={() => setSidebarVisible(true)}
                onSearchPress={() => toast.show('info', 'Search', 'Coming soon')}
                onNotificationPress={() => toast.show('info', 'Notifications', 'Coming soon')}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading assets...
                        </Text>
                    </View>
                ) : (assets?.result?.length || 0) > 0 ? (
                    assets?.result?.map((asset, index) => (
                        <View
                            key={index}
                            style={[styles.card, {
                                backgroundColor: theme.colors.cardPrimary,
                                borderColor: theme.colors.border
                            }]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Package width={24} height={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.headerContent}>
                                    <Text style={[styles.assetName, { color: theme.colors.text }]}>
                                        {asset.asset_name}
                                    </Text>
                                    <Text style={[styles.assetType, { color: theme.colors.textSecondary }]}>
                                        {asset.asset_type}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(asset.status) + '20' },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(asset.status) },
                                        ]}
                                    >
                                        {asset.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.infoRow}>
                                    <Hash width={16} height={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        Code:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                        {asset.ssit_code}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Calendar width={16} height={16} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                        Assigned:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                        {asset.assign_date}
                                    </Text>
                                </View>

                                {asset.asset_description && (
                                    <View style={[styles.descContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                                            {asset.asset_description}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Package width={48} height={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                            No Assets Assigned
                        </Text>
                        <Text style={[styles.emptySubt, { color: theme.colors.textTertiary }]}>
                            Your assigned assets will appear here
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    assetName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    assetType: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        width: 80,
    },
    infoValue: {
        fontSize: 14,
        flex: 1,
    },
    descContainer: {
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    emptyCard: {
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubt: {
        fontSize: 14,
        marginTop: 8,
    },
});
