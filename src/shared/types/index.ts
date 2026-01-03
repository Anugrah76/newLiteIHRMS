/**
 * Common API Response structure
 */
export interface ApiResponse<T = any> {
    status: number;
    message: string;
    response?: string | number;
    data: T;
}

/**
 * User entity
 */
export interface User {
    indo_code: string;
    fullName: string;
    emp_code: string;
    email: string;
    profile_photo?: string;
    api_key: string;
    manager_id?: string;
    manager_indo_code?: string;
    username?: string;
    user_type?: string;
    [key: string]: any;
}

/**
 * Company configuration
 */
export interface CompanyConfig {
    company_name?: string;
    logo_url: string;
    base_url: string;
    youtube_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
}

/**
 * Punch Time data
 */
export interface PunchTime {
    punch_date: string;
    punch_in_time: string | null;
    punch_out_time: string | null;
    status: number;
}

/**
 * Login request payload
 */
export interface LoginRequest {
    uname: string;
    pass: string;
    imei_number: string;
    device_detail: string;
    login_location: string;
}

/**
 * Login response
 */
export interface LoginResponse extends ApiResponse<User> {
    api_key: string;
    indo_code: string;
}
