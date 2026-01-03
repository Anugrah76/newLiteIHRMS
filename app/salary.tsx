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
import { useSalaryDetail } from '@features/salary/hooks';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react-native';

export default function SalaryScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const { data: salaryData, isLoading } = useSalaryDetail();
    const salary = salaryData?.data;

    return (
        <CorporateBackground>
            <TopBar
                title="Salary Details"
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
                            Loading salary details...
                        </Text>
                    </View>
                ) : salary ? (
                    <>
                        {/* Header Card */}
                        <View style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
                            <View style={styles.headerTop}>
                                <Calendar width={20} height={20} color="#ffffff" />
                                <Text style={styles.periodText}>
                                    {salary.month} {salary.year}
                                </Text>
                            </View>
                            <Text style={styles.netLabel}>Net Salary</Text>
                            <Text style={styles.netAmount}>₹ {salary.net_salary}</Text>
                        </View>

                        {/* Summary Cards */}
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryCard, {
                                backgroundColor: theme.colors.cardPrimary,
                                borderColor: theme.colors.border
                            }]}>
                                <View style={[styles.summaryIcon, { backgroundColor: theme.colors.success + '20' }]}>
                                    <TrendingUp width={20} height={20} color={theme.colors.success} />
                                </View>
                                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                    Earnings
                                </Text>
                                <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
                                    ₹ {salary.total_earnings}
                                </Text>
                            </View>

                            <View style={[styles.summaryCard, {
                                backgroundColor: theme.colors.cardPrimary,
                                borderColor: theme.colors.border
                            }]}>
                                <View style={[styles.summaryIcon, { backgroundColor: theme.colors.error + '20' }]}>
                                    <TrendingDown width={20} height={20} color={theme.colors.error} />
                                </View>
                                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                    Deductions
                                </Text>
                                <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
                                    ₹ {salary.total_deductions}
                                </Text>
                            </View>
                        </View>

                        {/* Earnings Breakdown */}
                        <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Earnings</Text>
                            {salary.earnings?.map((earning, index) => (
                                <View key={index} style={styles.row}>
                                    <Text style={[styles.componentName, { color: theme.colors.textSecondary }]}>
                                        {earning.component_name}
                                    </Text>
                                    <Text style={[styles.componentAmount, { color: theme.colors.success }]}>
                                        + ₹ {earning.amount}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Deductions Breakdown */}
                        <View style={[styles.card, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Deductions</Text>
                            {salary.deductions?.map((deduction, index) => (
                                <View key={index} style={styles.row}>
                                    <Text style={[styles.componentName, { color: theme.colors.textSecondary }]}>
                                        {deduction.component_name}
                                    </Text>
                                    <Text style={[styles.componentAmount, { color: theme.colors.error }]}>
                                        - ₹ {deduction.amount}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <DollarSign width={48} height={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                            No Salary Data
                        </Text>
                        <Text style={[styles.emptySubt, { color: theme.colors.textTertiary }]}>
                            Salary details will appear here
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
    headerCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    periodText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.9,
    },
    netLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
        marginBottom: 8,
    },
    netAmount: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: '800',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: '700',
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
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    componentName: {
        fontSize: 14,
        fontWeight: '500',
    },
    componentAmount: {
        fontSize: 14,
        fontWeight: '700',
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
