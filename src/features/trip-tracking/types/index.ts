// Trip Tracking & HR Analytics Types
export interface Trip {
    id: string;
    employee_id: string;
    employee_name?: string;
    trip_purpose: string;
    start_time: string; // ISO 8601
    end_time: string | null;
    status: 'active' | 'paused' | 'completed';
    total_distance: number; // meters
    total_duration: number; // seconds
    average_speed: number; // m/s
    max_speed: number; // m/s
    total_points: number;
    start_location: LocationPoint;
    end_location: LocationPoint | null;
    locations?: LocationPoint[]; // Full route (only in detail view)
    created_at: string;
    updated_at: string;
}

export interface LocationPoint {
    id?: string;
    trip_id?: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy: number; // meters
    speed: number | null; // m/s
    altitude: number | null; // meters
    address?: string;
}

export interface TripStats {
    distance: number; // meters
    duration: number; // seconds
    avgSpeed: number; // m/s
    maxSpeed: number; // m/s
    points: number;
}

export interface EmployeeAnalytics {
    employee_id: string;
    period: 'week' | 'month' | 'year';
    from_date: string;
    to_date: string;
    total_hours: number;
    trip_count: number;
    total_distance: number; // meters
    punctuality_score: number; // 0-100
    work_locations: WorkLocation[];
    daily_hours: DailyHours[];
    time_distribution: TimeDistribution;
}

export interface WorkLocation {
    name: string;
    latitude: number;
    longitude: number;
    visit_count: number;
    total_hours: number;
}

export interface DailyHours {
    date: string;
    hours: number;
    status: 'present' | 'absent' | 'leave' | 'wfh';
}

export interface TimeDistribution {
    office: number; // hours
    field: number;
    remote: number;
}

export interface HRAnalytics {
    as_of_date: string;
    total_employees: number;
    active_today: number;
    on_trips: number;
    remote: number;
    absent: number;
    late: number;
    department_summary: DepartmentSummary[];
}

export interface DepartmentSummary {
    department: string;
    total: number;
    present: number;
    absent: number;
}

export interface HeatmapPoint {
    latitude: number;
    longitude: number;
    weight: number; // density/intensity
}

export interface PunctualityData {
    location_id: string;
    location_name: string;
    on_time_percentage: number;
    avg_delay_minutes: number;
    late_count: number;
    total_count: number;
    trend?: PunctualityTrend[];
}

export interface PunctualityTrend {
    date: string;
    on_time_percentage: number;
}

export interface DistanceTrend {
    date: string;
    total_distance: number;
    trip_count: number;
    employee_count: number;
    avg_distance_per_trip: number;
}

export interface TopTraveler {
    employee_id: string;
    employee_name: string;
    total_distance: number;
    trip_count: number;
    avg_per_trip: number;
}

export interface OfficeLocation {
    location_id: string;
    name: string;
    address: string;
    city?: string;
    latitude: number;
    longitude: number;
    geofence_radius: number; // meters
    capacity: number;
    timezone: string;
    is_active: boolean;
}
