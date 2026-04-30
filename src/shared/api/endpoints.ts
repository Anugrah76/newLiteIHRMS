/**
 * API Endpoints
 * Migrated from services/apiConfig.js
 * Base URL is now managed by Zustand store and injected via Axios interceptor
 */
export const API_ENDPOINTS = {
    // ---------------- AUTH ----------------
    login: () => '/login/login',
    forgotPw: () => '/login/forgot_password',

    // ---------------- PUNCH ----------------
    punch: () => '/punch/punch',
    getPunchAttendanceOption: () => '/punch/get_punch_attendance_option',
    getPunchTime: () => '/punch/get_punch_time',
    markAttendanceFromQR: (ofc: string, mode: string, indo_code: string, key: string, email: string, lat: string, long: string, address: string, city: string) =>
        `/attendance/mark-attendance-from-qrcode?ofc=${ofc}&mode=${mode}&indo_code=${indo_code}&key=${key}&email=${email}&lat=${lat}&long=${long}&address=${address}&city=${city}`,
    attendanceRecord: () => '/attendance/get_attendance_record',

    // ---------------- PROFILE ----------------
    profileInfo: () => '/profile/profile_info',

    // ---------------- COMPOFF ----------------
    applyCompoff: () => '/Compoff/apply_compoff',
    approveCompoff: () => '/Compoff/approve_compoff_hod',
    compoffList: () => '/Compoff/hod_all_compoff_list',

    // ---------------- LEAVE ----------------
    viewLeaves: () => '/leave/view_leaves',
    leaveQuota: () => '/leave/leave_quota',
    approveLeave: () => '/leave/approve_leave_hod',
    leaveList: () => '/leave/hod_all_leave_list',
    leaveTypes: () => '/leaves/master/get_leave_types',
    leaveRequest: () => '/leave/apply_leave',

    // ---------------- RESIGNATION ----------------
    resignationList: () => '/Resignation/hod_all_resign_list',
    approveResignation: () => '/Resignation/approve_reject_resignation_hod',

    // ---------------- MISSPUNCH ----------------
    missedPunch: () => '/punch/mispunch',
    missPunchList: () => '/punch/hod_all_mispunch_list',
    approveMPunch: () => '/punch/approve_mispunch_hod',

    // ---------------- STAFF ATTENDANCE ----------------
    StaffAttendanceList: () => '/MarkAttendance/check_for_access/',
    StaffAttendanceApprove: () => '/MarkAttendance/mark_employees_attendance_manually/',

    // ---------------- BTA ----------------
    BTAList: () => '/bta/btr/get_my_team_btr_list.',
    BTAApprove: () => '/bta/btr/approve_bta_hod',
    createEvent: () => '/bta/events/create_new_event',
    submitEvent: () => '/bta/events/submit_event',
    getMyEvents: () => '/bta/events/get_my_event_list',
    updateEvent: () => '/bta/events/update_event',
    createEventTravel: () => '/bta/events/create_new_event_travel',
    createEventHotel: () => '/bta/events/create_new_event_hotel_booking',
    cancelEvent: () => '/bta/events/cancel_event',
    getBTALeaveRecordList: () => '/bta/events/get_my_bta_leave_record_list',
    getEventTravel: () => '/bta/events/get_event_travel_by_event_id',
    updateEventTravel: () => '/bta/events/update_event_travel',
    getEventHotel: () => '/bta/events/get_event_hotel_booking_by_event_id',
    updateEventHotel: () => '/bta/events/update_event_hotel_booking',
    getTravelModes: () => '/masters/get_travel_modes',
    getTravelTypes: () => '/masters/get_travel_types',

    // ---------------- WFH ----------------
    startWork: () => '/WFH/start_work',
    stopWork: () => '/WFH/stop_work',
    logsWork: () => '/WFH/get_my_logs',
    wfhFilter: () => '/WFH/filter',
    endDay: () => '/WFH/end_day',

    // ---------------- SALARY ----------------
    salaryDetail: () => '/salary/get_salary_detail',

    // ---------------- TICKET ----------------
    createTicket: () => '/ticket/add_new_ticket',
    assignedTicket: () => '/ticket/view_my_assigned_ticket',
    myTicket: () => '/ticket/view_my_ticket',
    ticketHandler: () => '/task/ticket_department_handler',
    ticketChat: () => '/Task/ticket_chat',



    // ---------------- HOLIDAY & DEPENDENTS ----------------
    holidayList: () => '/Holiday/get_holidays_list',
    getDependents: () => '/dependents/get_dependents_info',
    addDependent: () => '/dependents/add_new_dependent',
    updateDependent: () => '/dependents/update_dependent',
    deleteDependent: () => '/dependents/delete_dependent',

    // ---------------- ASSETS ----------------
    getAssets: () => '/assets/view',

    // ---------------- TASK & KRA ----------------
    draftKRA: () => '/TaskPMS/get_draft_kra_date',
    submitKRA: () => '/TaskPMS/get_submit_kra_date_v2',
    getKRA: () => '/TaskPMS/get_kra',
    fillTimeSheet: () => '/TaskPMS/fill_time_sheet',
    saveAdditionalTask: () => '/TaskPMS/save_additional_task',

    // ---------------- VISITORS MODULE ----------------
    getAllVisitors: () => '/visitors/get_my_meetings_list',
    updateVisitorDetail: () => '/visitors/update_visitor_detail',
    searchVisitor: () => '/visitors/search_visitor',
    getVisitorDocumentsTypes: () => '/visitors/get_documents_types_list',
    getVisitorCities: () => '/visitors/get_cities_list',
    visitorNotifications: () => '/visitors/visitor_notification_list',
    getStatesList: () => '/Master_states/get_states_list',
    approveRejectVisitorRequest: () => '/visitors/approve_reject_visiting_request',
} as const;
