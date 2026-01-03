/**
 * Wellness Analytics Engine
 * Transforms attendance, timesheet, and leave data into actionable insights
 */
import { CircleFadingArrowUp, ClockFading, TentTree, Caravan, Trophy, Sunrise, Award, Crown, Target, Clock, } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
export interface AttendanceDay {

    status: string; // "P", "A", "EL", "Week Off", etc.
    punchTime?: string; // "09:30:01,18:57:01"
    date: string;
}

export interface LeaveData {
    totalLeaves: number;
    usedLeaves: number;
    remainingLeaves: number;
}

export interface WellnessScore {
    overall: number; // 0-100
    breakdown: {
        attendance: number; // 0-30
        workHours: number; // 0-20
        timeOff: number; // 0-20
        punctuality: number; // 0-30
    };
}

export interface AttendanceStreak {
    current: number;
    longest: number;
    perfectWeeks: number;
}

export interface PunctualityAnalysis {
    onTimePercentage: number;
    averageArrivalTime: string;
    lateCount: number;
    earlyCount: number;
    trends: { [day: string]: number }; // Day-wise late arrivals
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon | string;
    earned: boolean;
    progress?: number; // 0-100 for unlocked achievements
    color: string;
}

export interface SmartRecommendation {
    type: 'leave' | 'wellness' | 'attendance' | 'alert';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: LucideIcon | string;
}

export class WellnessAnalytics {
    /**
     * Calculate overall wellness score (0-100)
     */
    static calculateWellnessScore(
        attendanceDays: AttendanceDay[],
        leaveData: LeaveData,
        mispunchCriteria: string = "09:30:00"
    ): WellnessScore {
        const attendance = this.calculateAttendanceScore(attendanceDays);
        const workHours = this.calculateWorkHoursScore(attendanceDays);
        const timeOff = this.calculateTimeOffScore(leaveData);
        const punctuality = this.calculatePunctualityScore(attendanceDays, mispunchCriteria);

        const overall = Math.round(attendance + workHours + timeOff + punctuality);

        return {
            overall: Math.min(100, Math.max(0, overall)),
            breakdown: { attendance, workHours, timeOff, punctuality }
        };
    }

    /**
     * Attendance Score (0-30)
     */
    private static calculateAttendanceScore(days: AttendanceDay[]): number {
        const workDays = days.filter(d =>
            !['Week Off', 'week off', 'Holiday', 'holiday'].includes(d.status)
        );
        const presentDays = workDays.filter(d =>
            ['P', 'p', 'EL', 'el', 'CL', 'cl', 'SL', 'sl'].includes(d.status)
        );

        if (workDays.length === 0) return 15; // Neutral if no data

        const attendanceRate = presentDays.length / workDays.length;

        let score = 15; // Base score

        // Regular attendance bonus
        if (attendanceRate >= 0.95) score += 15;
        else if (attendanceRate >= 0.85) score += 10;
        else if (attendanceRate >= 0.75) score += 5;
        else if (attendanceRate < 0.6) score -= 10; // Penalty for excessive absence

        return Math.min(30, Math.max(0, score));
    }

    /**
     * Work Hours Score (0-20)
     */
    private static calculateWorkHoursScore(days: AttendanceDay[]): number {
        const daysWithPunch = days.filter(d => d.punchTime && d.punchTime.includes(','));

        if (daysWithPunch.length === 0) return 10; // Neutral if no punch data

        let score = 10; // Base score
        let consistentCount = 0;
        let overtimeCount = 0;

        daysWithPunch.forEach(day => {
            const [punchIn, punchOut] = day.punchTime!.split(',');
            const hours = this.calculateWorkHours(punchIn, punchOut);

            // Consistent hours (7-9 hours)
            if (hours >= 7 && hours <= 9) consistentCount++;

            // Excessive overtime (>10 hours)
            if (hours > 10) overtimeCount++;
        });

        const consistencyRate = consistentCount / daysWithPunch.length;
        const overtimeRate = overtimeCount / daysWithPunch.length;

        // Consistency bonus
        if (consistencyRate >= 0.8) score += 10;
        else if (consistencyRate >= 0.6) score += 5;

        // Overtime penalty
        if (overtimeRate > 0.3) score -= 10;

        return Math.min(20, Math.max(0, score));
    }

    /**
     * Time Off Score (0-20)
     */
    private static calculateTimeOffScore(leaveData: LeaveData): number {
        if (leaveData.totalLeaves === 0) return 10; // Neutral if no leave data

        const utilizationRate = leaveData.usedLeaves / leaveData.totalLeaves;

        let score = 10; // Base score

        // Optimal utilization (60-80%)
        if (utilizationRate >= 0.6 && utilizationRate <= 0.8) score += 10;
        else if (utilizationRate >= 0.4 && utilizationRate <= 0.9) score += 5;
        else if (utilizationRate > 0.95) score -= 5; // Almost exhausted
        else if (utilizationRate < 0.2) score -= 5; // Not taking enough breaks

        return Math.min(20, Math.max(0, score));
    }

    /**
     * Punctuality Score (0-30)
     */
    private static calculatePunctualityScore(
        days: AttendanceDay[],
        mispunchCriteria: string
    ): number {
        const daysWithPunch = days.filter(d => d.punchTime && d.punchTime.includes(','));

        if (daysWithPunch.length === 0) return 15; // Neutral if no data

        const criteriaTime = this.timeToMinutes(mispunchCriteria);
        let onTimeCount = 0;

        daysWithPunch.forEach(day => {
            const [punchIn] = day.punchTime!.split(',');
            const punchInMinutes = this.timeToMinutes(punchIn);

            if (punchInMinutes <= criteriaTime) onTimeCount++;
        });

        const onTimeRate = onTimeCount / daysWithPunch.length;

        let score = 15; // Base score

        if (onTimeRate >= 0.95) score += 15;
        else if (onTimeRate >= 0.85) score += 10;
        else if (onTimeRate >= 0.7) score += 5;
        else if (onTimeRate < 0.5) score -= 10;

        return Math.min(30, Math.max(0, score));
    }

    /**
     * Calculate attendance streaks
     */
    static calculateStreaks(days: AttendanceDay[]): AttendanceStreak {
        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        let perfectWeeks = 0;
        let weekCounter = 0;

        // Process in reverse to get current streak
        const sortedDays = [...days].reverse();

        for (let i = 0; i < sortedDays.length; i++) {
            const day = sortedDays[i];
            const isPresent = ['P', 'p', 'EL', 'el', 'CL', 'cl', 'SL', 'sl'].includes(day.status);
            const isWeekOff = ['Week Off', 'week off', 'Holiday', 'holiday'].includes(day.status);

            if (isPresent || isWeekOff) {
                tempStreak++;
                weekCounter++;

                if (i === sortedDays.length - 1 || i < sortedDays.length - 1) {
                    if (tempStreak > longest) longest = tempStreak;
                }

                // Count perfect weeks (5 consecutive work days)
                if (isPresent && weekCounter === 5) {
                    perfectWeeks++;
                    weekCounter = 0;
                }
            } else {
                if (current === 0) {
                    // This is the current streak ending
                    current = tempStreak;
                }
                tempStreak = 0;
                weekCounter = 0;
            }
        }

        // If never broke streak, current equals the full streak
        if (current === 0) current = tempStreak;
        if (tempStreak > longest) longest = tempStreak;

        return { current, longest, perfectWeeks };
    }

    /**
     * Analyze punctuality patterns
     */
    static analyzePunctuality(
        days: AttendanceDay[],
        mispunchCriteria: string = "09:30:00"
    ): PunctualityAnalysis {
        const daysWithPunch = days.filter(d => d.punchTime && d.punchTime.includes(','));

        if (daysWithPunch.length === 0) {
            return {
                onTimePercentage: 0,
                averageArrivalTime: "N/A",
                lateCount: 0,
                earlyCount: 0,
                trends: {}
            };
        }

        const criteriaMinutes = this.timeToMinutes(mispunchCriteria);
        let onTimeCount = 0;
        let lateCount = 0;
        let earlyCount = 0;
        let totalMinutes = 0;
        const trends: { [day: string]: number } = {
            'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0
        };

        daysWithPunch.forEach(day => {
            const [punchIn] = day.punchTime!.split(',');
            const punchInMinutes = this.timeToMinutes(punchIn);

            totalMinutes += punchInMinutes;

            if (punchInMinutes <= criteriaMinutes) {
                onTimeCount++;
                if (punchInMinutes < criteriaMinutes - 15) earlyCount++;
            } else {
                lateCount++;
                // Track day-wise trends (would need date parsing for actual day)
            }
        });

        const avgMinutes = totalMinutes / daysWithPunch.length;
        const avgTime = this.minutesToTime(avgMinutes);

        return {
            onTimePercentage: Math.round((onTimeCount / daysWithPunch.length) * 100),
            averageArrivalTime: avgTime,
            lateCount,
            earlyCount,
            trends
        };
    }

    /**
     * Generate achievement badges
     */
    static generateAchievements(
        wellnessScore: WellnessScore,
        streaks: AttendanceStreak,
        punctuality: PunctualityAnalysis,
        leaveData: LeaveData
    ): Achievement[] {
        const achievements: Achievement[] = [
            {
                id: 'perfect_week',
                name: 'Perfect Week',
                description: '5 consecutive on-time days',
                icon: Trophy,
                earned: streaks.perfectWeeks >= 1,
                progress: Math.min(100, (streaks.perfectWeeks / 1) * 100),
                color: '#FFD700'
            },
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: '80%+ early arrivals',
                icon: Sunrise,
                earned: punctuality.earlyCount / Math.max(1, punctuality.earlyCount + punctuality.lateCount) >= 0.8,
                progress: Math.round((punctuality.earlyCount / Math.max(1, punctuality.earlyCount + punctuality.lateCount)) * 100),
                color: '#FF6B6B'
            },
            {
                id: 'wellness_champion',
                name: 'Wellness Champion',
                description: 'Overall score above 85',
                icon: Award,
                earned: wellnessScore.overall >= 85,
                progress: wellnessScore.overall,
                color: '#4ECDC4'
            },
            {
                id: 'consistency',
                name: 'Consistency',
                description: '30+ day streak',
                icon: Crown,
                earned: streaks.longest >= 30,
                progress: Math.min(100, (streaks.longest / 30) * 100),
                color: '#9B59B6'
            },
            {
                id: 'leave_optimizer',
                name: 'Leave Optimizer',
                description: 'Optimal leave usage (60-80%)',
                icon: Target,
                earned: leaveData.totalLeaves > 0 &&
                    (leaveData.usedLeaves / leaveData.totalLeaves >= 0.6) &&
                    (leaveData.usedLeaves / leaveData.totalLeaves <= 0.8),
                progress: leaveData.totalLeaves > 0 ?
                    Math.round((leaveData.usedLeaves / leaveData.totalLeaves) * 100) : 0,
                color: '#3498DB'
            },
            {
                id: 'punctuality_pro',
                name: 'Punctuality Pro',
                description: '95%+ on-time arrivals',
                icon: Clock,
                earned: punctuality.onTimePercentage >= 95,
                progress: punctuality.onTimePercentage,
                color: '#2ECC71'
            }
        ];

        return achievements;
    }

    /**
     * Generate smart recommendations
     */
    static generateRecommendations(
        wellnessScore: WellnessScore,
        leaveData: LeaveData,
        punctuality: PunctualityAnalysis,
        holidays: Array<{ date: string; name: string }> = []
    ): SmartRecommendation[] {
        const recommendations: SmartRecommendation[] = [];

        // Leave balance alert
        if (leaveData.remainingLeaves > 0 && leaveData.remainingLeaves < 5) {
            recommendations.push({
                type: 'alert',
                title: 'Low Leave Balance',
                message: `You have only ${leaveData.remainingLeaves} leaves remaining. Plan your time off wisely!`,
                priority: 'high',
                icon: '⚠️'
            });
        }

        // Wellness score improvement
        if (wellnessScore.overall < 60) {
            recommendations.push({
                type: 'wellness',
                title: 'Improve Your Wellness',
                message: 'Your wellness score is below average. Focus on consistent attendance and punctuality.',
                priority: 'high',
                icon: CircleFadingArrowUp
            });
        }

        // Punctuality improvement
        if (punctuality.onTimePercentage < 70) {
            recommendations.push({
                type: 'attendance',
                title: 'Work on Punctuality',
                message: `You're on time ${punctuality.onTimePercentage}% of the time. Try to arrive before ${punctuality.averageArrivalTime}.`,
                priority: 'medium',
                icon: ClockFading
            });
        }

        // Leave optimization
        if (leaveData.totalLeaves > 0) {
            const utilization = leaveData.usedLeaves / leaveData.totalLeaves;
            if (utilization < 0.3) {
                recommendations.push({
                    type: 'leave',
                    title: 'Take a Break',
                    message: 'You haven\'t used much of your leave balance. Consider taking time off for better work-life balance.',
                    priority: 'medium',
                    icon: TentTree
                });
            } else if (utilization > 0.9) {
                recommendations.push({
                    type: 'alert',
                    title: 'Leave Balance Running Low',
                    message: 'You\'ve used most of your leaves. Plan remaining time off carefully.',
                    priority: 'medium',
                    icon: Caravan
                });
            }
        }

        // Holiday suggestions
        if (holidays.length > 0) {
            recommendations.push({
                type: 'leave',
                title: 'Upcoming Holidays',
                message: `${holidays.length} holidays coming up! Plan leaves around them for longer breaks.`,
                priority: 'low',
                icon: Caravan
            });
        }

        return recommendations;
    }

    // Helper methods
    private static timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private static minutesToTime(minutes: number): string {
        const hrs = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    private static calculateWorkHours(punchIn: string, punchOut: string): number {
        const inMinutes = this.timeToMinutes(punchIn);
        const outMinutes = this.timeToMinutes(punchOut);
        return (outMinutes - inMinutes) / 60;
    }
}
