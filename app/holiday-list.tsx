import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useAuthStore } from '@shared/store';
import { useToast } from '@shared/components/Toast';
import { useTheme } from '@shared/theme';
import { Calendar, Gift, Clock, PartyPopper, Sparkles } from 'lucide-react-native';

export default function HolidayListScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();
    const user = useAuthStore(state => state.user);

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [holidays, setHolidays] = useState<any[]>([]);
    const [totalHolidays, setTotalHolidays] = useState(0);
    const [upcomingHolidays, setUpcomingHolidays] = useState<any[]>([]);

    useEffect(() => {
        handleSubmit();
    }, []);

    const fetchHolidays = async () => {
        const formData = new FormData();
        formData.append("indo_code", user?.indo_code || '');
        formData.append("key", user?.api_key || '');
        formData.append("year", selectedYear);

        setLoading(true);
        try {
            console.log('🔍 [Fetch Holidays] API:', `${process.env.EXPO_PUBLIC_API_URL}/attendance/holiday_list.php`);
            console.log('🔍 [Fetch Holidays] Payload:', { indo_code: user?.indo_code, key: user?.api_key, year: selectedYear });

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/attendance/holiday_list.php`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            console.log('✅ [Fetch Holidays] Response:', result);

            if (result.status && result.data) {
                const holidayData = result.data || [];
                setHolidays(holidayData);
                setTotalHolidays(holidayData.length);

                const today = new Date();
                const upcoming = holidayData.filter((holiday: any) => {
                    const holidayDate = new Date(holiday.date);
                    return holidayDate >= today;
                }).slice(0, 3);

                setUpcomingHolidays(upcoming);
                toast.success('Holidays loaded successfully');
            } else {
                setHolidays([]);
                setTotalHolidays(0);
                setUpcomingHolidays([]);
                toast.error('Failed to load holidays');
            }
        } catch (error: any) {
            console.error('❌ [Fetch Holidays] Error:', error);
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmit = async () => {
        await fetchHolidays();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMonthName = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    const getDay = (dateString: string) => {
        const date = new Date(dateString);
        return date.getDate();
    };

    const isUpcoming = (dateString: string) => {
        const today = new Date();
        const holidayDate = new Date(dateString);

        return (
            holidayDate.getFullYear() === today.getFullYear() &&
            holidayDate.getMonth() === today.getMonth() &&
            holidayDate >= today
        );
    };

    const HolidayListItem = ({ holiday, index }: { holiday: any; index: number }) => {
        const upcoming = isUpcoming(holiday.date);
        const isFirst = index === 0;
        const isLast = index === holidays.length - 1;

        return (
            <View
                style={[
                    styles.holidayListItem,
                    { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
                    isFirst && styles.holidayListItemFirst,
                    isLast && styles.holidayListItemLast,
                    upcoming && styles.holidayListItemUpcoming
                ]}
            >
                <View style={styles.listItemDateContainer}>
                    <View style={[styles.listItemDateCircle, upcoming && styles.listItemDateCircleUpcoming, { backgroundColor: upcoming ? '#F59E0B' : theme.colors.border }]}>
                        <Text style={[styles.listItemDateDay, { color: upcoming ? '#FFFFFF' : theme.colors.text }]}>
                            {getDay(holiday.date)}
                        </Text>
                        <Text style={[styles.listItemDateMonth, { color: upcoming ? '#FFFFFF' : theme.colors.textSecondary }]}>
                            {getMonthName(holiday.date)}
                        </Text>
                    </View>
                    {upcoming && (
                        <View style={styles.listItemSparkleContainer}>
                            <Sparkles size={16} color="#F59E0B" />
                        </View>
                    )}
                </View>

                <View style={styles.listItemContent}>
                    <Text style={[styles.listItemName, { color: theme.colors.text }, upcoming && styles.listItemNameUpcoming]}>
                        {holiday.name}
                    </Text>
                    <Text style={[styles.listItemFullDate, { color: theme.colors.textSecondary }]}>
                        {formatDate(holiday.date)}
                    </Text>
                </View>

                {upcoming && (
                    <View style={styles.listItemBadge}>
                        <Text style={styles.listItemBadgeText}>Upcoming</Text>
                    </View>
                )}
            </View>
        );
    };

    const StatsCard = ({ title, count, icon: IconComponent, color, subtitle }: any) => (
        <View style={[styles.statsCard, { borderTopColor: color, backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <View style={styles.statsHeader}>
                <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
                    <IconComponent size={24} color={color} />
                </View>
                <View style={styles.statsContent}>
                    <Text style={[styles.statsCount, { color: theme.colors.text }]}>{count}</Text>
                    <Text style={[styles.statsTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
                    {subtitle && <Text style={[styles.statsSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>}
                </View>
            </View>
        </View>
    );

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`
    }));

    return (
        <CorporateBackground>
            <TopBar title="Company Holidays" onMenuPress={() => setSidebarVisible(true)} showBack />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); handleSubmit(); }} />}
            >
                <View style={[styles.formCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.primary }]}>
                    <View style={styles.formHeader}>
                        <PartyPopper size={24} color={theme.colors.primary} />
                        <Text style={[styles.formTitle, { color: theme.colors.text }]}>Select Year</Text>
                    </View>
                    <SelectField
                        label="Year"
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                        options={yearOptions}

                    />
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: loading ? theme.colors.textTertiary : theme.colors.primary }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Calendar size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Load Holidays</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {holidays.length > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <StatsCard
                                title="Total Holidays"
                                count={totalHolidays}
                                icon={Gift}
                                color="#10B981"
                                subtitle={`in ${selectedYear}`}
                            />
                            <StatsCard
                                title="Upcoming"
                                count={upcomingHolidays.length}
                                icon={Clock}
                                color="#F59E0B"
                                subtitle="holidays ahead"
                            />
                        </View>
                    </View>
                )}

                {upcomingHolidays.length > 0 && (
                    <View style={[styles.upcomingSection, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <Sparkles size={20} color="#F59E0B" />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Next Upcoming Holidays</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.upcomingScroll}>
                            {upcomingHolidays.map((holiday, index) => (
                                <View key={index} style={styles.upcomingHolidayItem}>
                                    <View style={styles.upcomingDateBadge}>
                                        <Text style={styles.upcomingDateBadgeText}>{getDay(holiday.date)}</Text>
                                        <Text style={styles.upcomingMonthBadgeText}>{getMonthName(holiday.date)}</Text>
                                    </View>
                                    <Text style={styles.upcomingHolidayName} numberOfLines={2}>{holiday.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {holidays.length > 0 && (
                    <View style={styles.holidaysSection}>
                        <View style={styles.sectionHeader}>
                            <PartyPopper size={20} color={theme.colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Holidays {selectedYear}</Text>
                        </View>
                        <View style={[styles.holidaysListContainer, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            {holidays.map((holiday, index) => (
                                <HolidayListItem key={index} holiday={holiday} index={index} />
                            ))}
                        </View>
                    </View>
                )}

                {holidays.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <PartyPopper size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Holidays Found</Text>
                        <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
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
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 30 },
    formCard: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, marginBottom: 20, borderTopWidth: 4, padding: 24, borderWidth: 1 },
    formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    formTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    button: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, flexDirection: 'row', marginTop: 8 },
    buttonIcon: { marginRight: 8 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    statsContainer: { marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 16 },
    statsCard: { flex: 1, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderTopWidth: 4, borderWidth: 1 },
    statsHeader: { flexDirection: 'row', alignItems: 'center' },
    statsIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    statsContent: { flex: 1 },
    statsCount: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
    statsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    statsSubtitle: { fontSize: 12, fontWeight: '500' },
    upcomingSection: { borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderLeftWidth: 4, borderLeftColor: '#F59E0B', borderWidth: 1 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
    upcomingScroll: { marginTop: 8 },
    upcomingHolidayItem: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginRight: 16, alignItems: 'center', minWidth: 120, borderWidth: 1, borderColor: '#FCD34D' },
    upcomingDateBadge: { backgroundColor: '#F59E0B', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    upcomingDateBadgeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    upcomingMonthBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', marginTop: -2 },
    upcomingHolidayName: { fontSize: 14, fontWeight: '600', color: '#92400E', textAlign: 'center', lineHeight: 18 },
    holidaysSection: { marginBottom: 20 },
    holidaysListContainer: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, overflow: 'hidden', borderWidth: 1 },
    holidayListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
    holidayListItemFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    holidayListItemLast: { borderBottomWidth: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    holidayListItemUpcoming: { backgroundColor: '#FFFBEB', borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
    listItemDateContainer: { alignItems: 'center', marginRight: 16 },
    listItemDateCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    listItemDateCircleUpcoming: { backgroundColor: '#F59E0B' },
    listItemDateDay: { fontSize: 18, fontWeight: '800' },
    listItemDateMonth: { fontSize: 11, fontWeight: '600', marginTop: -2 },
    listItemSparkleContainer: { marginTop: 4 },
    listItemContent: { flex: 1 },
    listItemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    listItemNameUpcoming: { fontWeight: '700' },
    listItemFullDate: { fontSize: 12 },
    listItemBadge: { backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
    listItemBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', marginTop: 24, marginBottom: 12 },
    emptyStateSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
