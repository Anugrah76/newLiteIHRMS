import { useState, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { CorporateBackground } from '@shared/components/CorporateBackground';
import { TopBar } from '@shared/components/ui/TopBar';
import { Sidebar } from '@shared/components/Sidebar';
import { SelectField } from '@shared/components/SelectField';
import { useTheme } from '@shared/theme';
import { useToast } from '@shared/components/Toast';
import {
    Trophy, TrendingUp, Calendar, Clock, Award, Target,
    Zap, Heart, ChevronRight, AlertCircle, Sparkles, CircleFadingArrowUp
} from 'lucide-react-native';
import { useAttendanceRecords } from '@features/attendance/api/attendanceApi';
import { useLeaveQuotaByPeriod, useLeaveHistoryByPeriod } from '@features/leave/api/leaveApi';
import { WellnessAnalytics, type Achievement, type SmartRecommendation } from '@shared/utils/WellnessAnalytics';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function GamificationWellnessScreen() {
    const router = useRouter();
    const theme = useTheme();
    const toast = useToast();

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [expandedSection, setExpandedSection] = useState<string | null>('insights');

    const selectedMonthIndex = useMemo(() => months.indexOf(selectedMonth) + 1, [selectedMonth]);

    // Fetch data for selected month
    const { data: attendanceData, isLoading: attendanceLoading, refetch: refetchAttendance } =
        useAttendanceRecords({ month: selectedMonth, year: selectedYear });

    const { data: quotaData, isLoading: quotaLoading, refetch: refetchQuota } =
        useLeaveQuotaByPeriod(selectedMonthIndex, selectedYear, true);

    const { data: historyData, refetch: refetchHistory } =
        useLeaveHistoryByPeriod(selectedMonthIndex, selectedYear, true);

    const isLoading = attendanceLoading || quotaLoading;

    // Process data for analytics
    const analytics = useMemo(() => {
        if (!attendanceData?.result) return null;

        // Transform attendance data
        const attendanceDays = attendanceData.freezed === '1'
            ? (attendanceData.result.present_days as string[] | any[]).map((status: string | any, index: number) => ({
                status: typeof status === 'string' ? status : status,
                date: `${selectedYear}-${selectedMonthIndex.toString().padStart(2, '0')}-${(index + 1).toString().padStart(2, '0')}`
            }))
            : (attendanceData.result.present_days || []).map((day: any, index: number) => ({
                status: 'P',
                punchTime: day?.punchTime || '',
                date: `${selectedYear}-${selectedMonthIndex.toString().padStart(2, '0')}-${(index + 1).toString().padStart(2, '0')}`
            }));

        // Add week offs and holidays
        if (attendanceData.result.weekoff) {
            attendanceData.result.weekoff.forEach((wo: any) => {
                attendanceDays.push({ status: 'Week Off', date: wo.date || wo });
            });
        }

        // Process leave data
        const leaveData = quotaData?.leave_quota?.[0]
            ? (() => {
                const raw = quotaData.leave_quota[0];
                const totals = raw.leaves.split(',').map(Number);
                const taken = raw.leavesTaked.split(',').map(Number);
                const remaining = raw.remaining.split(',').map(Number);

                return {
                    totalLeaves: totals.reduce((a: number, b: number) => a + b, 0),
                    usedLeaves: taken.reduce((a: number, b: number) => a + b, 0),
                    remainingLeaves: remaining.reduce((a: number, b: number) => a + b, 0)
                };
            })()
            : { totalLeaves: 0, usedLeaves: 0, remainingLeaves: 0 };

        const mispunchCriteria = attendanceData.result.mispunch_criteria || '09:30:00';

        // Calculate metrics
        const wellnessScore = WellnessAnalytics.calculateWellnessScore(
            attendanceDays,
            leaveData,
            mispunchCriteria
        );

        const streaks = WellnessAnalytics.calculateStreaks(attendanceDays);
        const punctuality = WellnessAnalytics.analyzePunctuality(attendanceDays, mispunchCriteria);
        const achievements = WellnessAnalytics.generateAchievements(
            wellnessScore,
            streaks,
            punctuality,
            leaveData
        );

        const holidays = (attendanceData.result.holiday_days || []).map((h: any) => ({
            date: h.date,
            name: h.name
        }));

        const recommendations = WellnessAnalytics.generateRecommendations(
            wellnessScore,
            leaveData,
            punctuality,
            holidays
        );

        return {
            wellnessScore,
            streaks,
            punctuality,
            achievements,
            recommendations,
            leaveData
        };
    }, [attendanceData, quotaData, selectedMonth, selectedYear, selectedMonthIndex]);

    const handleRefresh = useCallback(() => {
        refetchAttendance();
        refetchQuota();
        refetchHistory();
    }, [refetchAttendance, refetchQuota, refetchHistory]);

    // Year and month options
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => ({
        label: `${currentYear - i}`,
        value: `${currentYear - i}`
    }));
    const monthOptions = months.map(month => ({ label: month, value: month }));

    return (
        <CorporateBackground>
            <TopBar title="Wellness & Achievements" showBack onMenuPress={() => setSidebarVisible(true)} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            >
                {/* Period Selector */}
                <View style={[styles.selectorCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                    <View style={styles.selectRow}>
                        <View style={styles.selectHalf}>
                            <SelectField label="Year" value={selectedYear} onValueChange={setSelectedYear} options={yearOptions} />
                        </View>
                        <View style={styles.selectHalf}>
                            <SelectField label="Month" value={selectedMonth} onValueChange={setSelectedMonth} options={monthOptions} />
                        </View>
                    </View>
                </View>

                {!analytics ? (
                    <View style={styles.emptyState}>
                        <Heart size={64} color={theme.colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Loading Wellness Data...</Text>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Select a period to view your wellness insights
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Wellness Score Card */}
                        <WellnessScoreCard score={analytics.wellnessScore.overall} theme={theme} />

                        {/* Quick Stats */}
                        <View style={styles.statsGrid}>
                            <StatCard
                                icon={<Zap size={24} color="#FFD700" />}
                                label="Current Streak"
                                value={analytics.streaks.current.toString()}
                                suffix="days"
                                theme={theme}
                            />
                            <StatCard
                                icon={<Clock size={24} color="#4ECDC4" />}
                                label="On-Time"
                                value={analytics.punctuality.onTimePercentage.toString()}
                                suffix="%"
                                theme={theme}
                            />
                            <StatCard
                                icon={<Calendar size={24} color="#FF6B6B" />}
                                label="Leaves Used"
                                value={analytics.leaveData.usedLeaves.toString()}
                                suffix={`/${analytics.leaveData.totalLeaves}`}
                                theme={theme}
                            />
                            <StatCard
                                icon={<Trophy size={24} color="#9B59B6" />}
                                label="Perfect Weeks"
                                value={analytics.streaks.perfectWeeks.toString()}
                                suffix=""
                                theme={theme}
                            />
                        </View>

                        {/* Achievements */}
                        <View style={[styles.section, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                            <View style={styles.sectionHeader}>
                                <Award size={20} color={theme.colors.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                                {analytics.achievements.map((achievement) => (
                                    <AchievementBadge key={achievement.id} achievement={achievement} theme={theme} />
                                ))}
                            </ScrollView>
                        </View>

                        {/* Insights Accordion */}
                        <TouchableOpacity
                            style={[styles.section, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}
                            onPress={() => setExpandedSection(expandedSection === 'insights' ? null : 'insights')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.sectionHeader}>
                                <TrendingUp size={20} color={theme.colors.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Wellness Breakdown</Text>
                                <ChevronRight
                                    size={20}
                                    color={theme.colors.textSecondary}
                                    style={{ transform: [{ rotate: expandedSection === 'insights' ? '90deg' : '0deg' }] }}
                                />
                            </View>
                            {expandedSection === 'insights' && (
                                <View style={styles.breakdownContainer}>
                                    <BreakdownBar
                                        label="Attendance"
                                        score={analytics.wellnessScore.breakdown.attendance}
                                        max={30}
                                        color="#10B981"
                                        theme={theme}
                                    />
                                    <BreakdownBar
                                        label="Punctuality"
                                        score={analytics.wellnessScore.breakdown.punctuality}
                                        max={30}
                                        color="#3B82F6"
                                        theme={theme}
                                    />
                                    <BreakdownBar
                                        label="Work Hours"
                                        score={analytics.wellnessScore.breakdown.workHours}
                                        max={20}
                                        color="#F59E0B"
                                        theme={theme}
                                    />
                                    <BreakdownBar
                                        label="Time Off"
                                        score={analytics.wellnessScore.breakdown.timeOff}
                                        max={20}
                                        color="#8B5CF6"
                                        theme={theme}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Recommendations */}
                        {analytics.recommendations.length > 0 && (
                            <View style={[styles.section, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
                                <View style={styles.sectionHeader}>
                                    <Sparkles size={20} color={theme.colors.primary} />
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Smart Recommendations</Text>
                                </View>
                                {analytics.recommendations.map((rec, idx) => (
                                    <RecommendationCard key={idx} recommendation={rec} theme={theme} />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
            <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </CorporateBackground>
    );
}

// Wellness Score Card Component
function WellnessScoreCard({ score, theme }: { score: number; theme: any }) {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = score / 100;
    const strokeDashoffset = circumference - progress * circumference;

    const getScoreColor = (score: number) => {
        if (score >= 85) return '#10B981';
        if (score >= 70) return '#3B82F6';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Needs Work';
    };

    const scoreColor = getScoreColor(score);

    return (
        <View style={[styles.wellnessCard, { backgroundColor: theme.colors.cardPrimary, borderColor: theme.colors.border }]}>
            <Text style={[styles.wellnessLabel, { color: theme.colors.textSecondary }]}>Overall Wellness Score</Text>
            <View style={styles.scoreRingContainer}>
                <Svg width={size} height={size}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={theme.colors.border}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={scoreColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={styles.scoreTextContainer}>
                    <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
                    <Text style={[styles.scoreMaxText, { color: theme.colors.textSecondary }]}>/100</Text>
                </View>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
                <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>{getScoreLabel(score)}</Text>
            </View>
        </View>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, suffix, theme }: any) {
    return (
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.statIconContainer}>{icon}</View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {value}
                <Text style={[styles.statSuffix, { color: theme.colors.textSecondary }]}> {suffix}</Text>
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        </View>
    );
}

// Achievement Badge Component
function AchievementBadge({ achievement, theme }: { achievement: Achievement; theme: any }) {

    const renderIcon = () => {
        if (typeof achievement.icon === 'string') {
            return <Text>{achievement.icon}</Text>

        } else {
            const IconComponent = achievement.icon
            return <IconComponent color={theme.colors.textSecondary} size={24} />
        }
    }

    return (
        <View
            style={[
                styles.achievementBadge,
                {
                    backgroundColor: achievement.earned ? achievement.color + '20' : theme.colors.surface,
                    borderColor: achievement.earned ? achievement.color : theme.colors.border,
                    opacity: achievement.earned ? 1 : 0.5
                }
            ]}
        >
            <View style={styles.recommendationIconContainer}>{renderIcon()}</View>
            <Text style={[styles.achievementName, { color: achievement.earned ? achievement.color : theme.colors.textSecondary }]}>
                {achievement.name}
            </Text>
            <Text style={[styles.achievementDesc, { color: theme.colors.textTertiary }]} numberOfLines={2}>
                {achievement.description}
            </Text>
            {achievement.progress !== undefined && (
                <View style={[styles.achievementProgress, { backgroundColor: theme.colors.border }]}>
                    <View
                        style={[
                            styles.achievementProgressFill,
                            { width: `${achievement.progress}%`, backgroundColor: achievement.color }
                        ]}
                    />
                </View>
            )}
        </View>
    );
}

// Breakdown Bar Component
function BreakdownBar({ label, score, max, color, theme }: any) {
    const percentage = (score / max) * 100;

    return (
        <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
                <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>{label}</Text>
                <Text style={[styles.breakdownScore, { color }]}>
                    {score}/{max}
                </Text>
            </View>
            <View style={[styles.breakdownBar, { backgroundColor: theme.colors.border }]}>
                <View style={[styles.breakdownFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}



// Recommendation Card Component
function RecommendationCard({ recommendation, theme }: { recommendation: SmartRecommendation; theme: any }) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return theme.colors.textSecondary;
        }
    };

    const renderIcon = () => {
        if (typeof recommendation.icon === 'string') {
            return <Text style={styles.recommendationIcon}>{recommendation.icon}</Text>
        } else {
            const IconComponent = recommendation.icon;
            return <IconComponent color={theme.colors.text} size={24} />
        }
    }

    const priorityColor = getPriorityColor(recommendation.priority);

    return (
        <View style={[styles.recommendationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderLeftColor: priorityColor }]}>
            <View style={styles.recommendationHeader}>
                <View style={styles.recommendationIconContainer}>{renderIcon()}</View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>{recommendation.title}</Text>
                    <Text style={[styles.recommendationMessage, { color: theme.colors.textSecondary }]}>{recommendation.message}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },

    selectorCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    selectRow: { flexDirection: 'row', gap: 12 },
    selectHalf: { flex: 1 },

    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    wellnessCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6
    },
    wellnessLabel: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
    scoreRingContainer: { position: 'relative', marginBottom: 16 },
    scoreTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scoreValue: { fontSize: 48, fontWeight: '800' },
    scoreMaxText: { fontSize: 16, fontWeight: '500' },
    scoreBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    scoreBadgeText: { fontSize: 14, fontWeight: '700' },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16
    },
    statCard: {
        width: (width - 48) / 2,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3
    },
    statIconContainer: { marginBottom: 12 },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    statSuffix: { fontSize: 14, fontWeight: '500' },
    statLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', flex: 1 },

    achievementsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
    achievementBadge: {
        width: 140,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        borderWidth: 2,
        alignItems: 'center'
    },
    achievementIcon: { fontSize: 40, marginBottom: 8 },
    achievementName: { fontSize: 14, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    achievementDesc: { fontSize: 11, textAlign: 'center', lineHeight: 14 },
    achievementProgress: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden'
    },
    achievementProgressFill: { height: '100%', borderRadius: 2 },

    breakdownContainer: { gap: 16, marginTop: 8 },
    breakdownItem: { gap: 8 },
    breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    breakdownLabel: { fontSize: 14, fontWeight: '600' },
    breakdownScore: { fontSize: 14, fontWeight: '700' },
    breakdownBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
    breakdownFill: { height: '100%', borderRadius: 4 },

    recommendationCard: {
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderLeftWidth: 4
    },
    recommendationHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    recommendationIcon: { fontSize: 24 },
    recommendationTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    recommendationMessage: { fontSize: 13, lineHeight: 18 },
    recommendationIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
});
