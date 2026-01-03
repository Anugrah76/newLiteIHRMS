import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import { useHolidays } from '@features/holidays/hooks';
import { Calendar, Sun, PartyPopper } from 'lucide-react-native';

export default function HolidaysScreen() {
    const theme = useTheme();
    const toast = useToast();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [holidays, setHolidays] = useState<any[]>([]);

    const holidaysMutation = useHolidays();
    const loading = holidaysMutation.isPending;

    // Generate year options (current year and 5 years back)
    const yearOptions = Array.from({ length: 8 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`,
    }));

    // Load holidays on initial mount with current year
    useEffect(() => {
        handleLoadHolidays();
    }, []);

    const handleLoadHolidays = async () => {
        try {
            console.log('🔍 [Holidays] Loading for year:', selectedYear);
            const result = await holidaysMutation.mutateAsync(selectedYear);

            console.log('📦 [Holidays] Full result:', result);

            // API returns status: 1 for success
            if (result.status === 1 && result.data && result.data.length > 0) {
                setHolidays(result.data);
                toast.show('success', 'Holidays loaded successfully');
            } else {
                setHolidays([]);
                toast.show('info', 'No holidays found for this year');
            }
        } catch (error: any) {
            console.error('❌ [Holidays] Error:', error);
            toast.show('error', 'Failed to load holidays');
            setHolidays([]);
        }
    };

    return (
        <CorporateBackground>
            <TopBar
                title="Company Holidays"
                onMenuPress={() => setSidebarVisible(true)}
                showBack
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Year Selection Card */}
                <View style={[styles.filterCard, {
                    backgroundColor: theme.colors.cardPrimary,
                    borderColor: theme.colors.border,
                    borderTopColor: theme.colors.primary
                }]}>
                    <View style={styles.filterHeader}>
                        <PartyPopper size={24} color={theme.colors.primary} />
                        <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
                            Select Year
                        </Text>
                    </View>

                    <SelectField
                        label="Year"
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                        options={yearOptions}
                    />

                    <TouchableOpacity
                        style={[styles.loadButton, {
                            backgroundColor: loading ? theme.colors.textTertiary : theme.colors.primary
                        }]}
                        onPress={handleLoadHolidays}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Calendar size={20} color="#FFFFFF" />
                                <Text style={styles.loadButtonText}>Load Holidays</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Holidays List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                            Loading holidays...
                        </Text>
                    </View>
                ) : holidays.length > 0 ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <PartyPopper size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                All Holidays {selectedYear}
                            </Text>
                        </View>

                        {holidays.map((holiday, index) => (
                            <View
                                key={index}
                                style={[styles.card, {
                                    backgroundColor: theme.colors.cardPrimary,
                                    borderColor: theme.colors.border
                                }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Sun width={24} height={24} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.headerContent}>
                                        <Text style={[styles.holidayName, { color: theme.colors.text }]}>
                                            {holiday.name}
                                        </Text>
                                        <Text style={[styles.holidayDay, { color: theme.colors.textSecondary }]}>
                                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </Text>
                                    </View>
                                    <View style={[styles.dateContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                                            {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>

                                {holiday.description && (
                                    <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                                            {holiday.description}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <Calendar width={48} height={48} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>
                            No Holidays Found
                        </Text>
                        <Text style={[styles.emptySubt, { color: theme.colors.textTertiary }]}>
                            Select a year and load holidays to view the list
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
    filterCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderTopWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
    },
    loadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
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
    holidayName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    holidayDay: {
        fontSize: 13,
        fontWeight: '500',
    },
    dateContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '700',
    },
    descriptionContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
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
        textAlign: 'center',
    },
});
