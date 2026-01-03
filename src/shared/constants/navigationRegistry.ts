import {
    CalendarPlus,
    CalendarCheck2,
    TicketPlus,
    Tickets,
    TicketCheck,
    IndianRupee,
    IdCard,
    HousePlug,
    FileText,
    Gift,
    Clock,
    User,
    ListTodo,
    ClipboardCheck,
    Ticket,
    PlaneTakeoff,
    ScrollText,
    SquareMenu,
    Home,
    CalendarClock,
    CalendarX,
    FileCheck2
} from 'lucide-react-native';

export interface NavigationItem {
    id: string;
    title: string;
    subtitle: string;
    route: string;
    icon: any;
    keywords: string[];
    category: 'General' | 'Staff' | 'BTA' | 'Tickets' | 'Attendance' | 'Finance';
}

export const NAVIGATION_REGISTRY: NavigationItem[] = [
    // General / Sidebar
    {
        id: 'dashboard',
        title: 'Dashboard',
        subtitle: 'Home screen overview',
        route: '/(tabs)/dashboard',
        icon: Home,
        keywords: ['home', 'main', 'index'],
        category: 'General'
    },
    {
        id: 'profile',
        title: 'My Profile',
        subtitle: 'View and edit profile',
        route: '/profile',
        icon: User,
        keywords: ['user', 'account', 'details'],
        category: 'General'
    },
    {
        id: 'timesheet',
        title: 'Time Sheet',
        subtitle: 'Weekly timesheet view',
        route: '/(tabs)/timesheet',
        icon: ListTodo,
        keywords: ['work', 'log', 'hours'],
        category: 'Attendance'
    },
    {
        id: 'dependents',
        title: 'Dependents',
        subtitle: 'Family member details',
        route: '/dependents',
        icon: ScrollText,
        keywords: ['family', 'children', 'spouse', 'nominee'],
        category: 'General'
    },
    {
        id: 'visitors',
        title: 'Visitor Notification',
        subtitle: 'Pre-register visitors',
        route: '/visitors',
        icon: IdCard,
        keywords: ['guest', 'entry', 'gate'],
        category: 'General'
    },

    // Staff Management
    {
        id: 'staff-missed-punch',
        title: 'Missed Punch Approval',
        subtitle: 'Approve team punches',
        route: '/staff-missed-punch',
        icon: CalendarClock,
        keywords: ['approve', 'correction', 'team'],
        category: 'Staff'
    },
    {
        id: 'staff-comp-off',
        title: 'Comp Off Approval',
        subtitle: 'Manage compensatory offs',
        route: '/staff-comp-off',
        icon: CalendarCheck2,
        keywords: ['approve', 'leave', 'team'],
        category: 'Staff'
    },
    {
        id: 'staff-leaves',
        title: 'Leave Approval',
        subtitle: 'Review team leave requests',
        route: '/staff-leaves',
        icon: CalendarX,
        keywords: ['approve', 'vacation', 'sick', 'team'],
        category: 'Staff'
    },
    {
        id: 'staff-fnf',
        title: 'F&F Clearance',
        subtitle: 'Full & final settlements',
        route: '/staff-fnf-clearance',
        icon: FileCheck2,
        keywords: ['resign', 'exit', 'team'],
        category: 'Staff'
    },
    {
        id: 'staff-bta',
        title: 'BTA Approval',
        subtitle: 'Approve business trips',
        route: '/staff-bta-approval',
        icon: PlaneTakeoff,
        keywords: ['travel', 'business', 'trip', 'team', 'manager'],
        category: 'Staff'
    },
    {
        id: 'staff-attendance',
        title: 'Staff Attendance',
        subtitle: 'View team attendance',
        route: '/staff-attendance',
        icon: Clock,
        keywords: ['team', 'report', 'subordinate'],
        category: 'Staff'
    },

    // BTA Hub
    {
        id: 'bta-create',
        title: 'Create BTA',
        subtitle: 'New business trip application',
        route: '/bta-calendar',
        icon: CalendarPlus,
        keywords: ['travel', 'business', 'trip', 'apply'],
        category: 'BTA'
    },
    {
        id: 'bta-list',
        title: 'My BTA List',
        subtitle: 'View trip applications',
        route: '/bta/my-events',
        icon: CalendarCheck2,
        keywords: ['travel', 'history', 'status'],
        category: 'BTA'
    },
    {
        id: 'bta-team',
        title: 'Team BTA Approvals',
        subtitle: 'Review team trips',
        route: '/bta',
        icon: ClipboardCheck,
        keywords: ['manager', 'approve'],
        category: 'BTA'
    },

    // Ticket Hub
    {
        id: 'ticket-create',
        title: 'Create Ticket',
        subtitle: 'Raise a support request',
        route: '/create-ticket',
        icon: TicketPlus,
        keywords: ['help', 'support', 'issue', 'complain'],
        category: 'Tickets'
    },
    {
        id: 'ticket-my',
        title: 'My Tickets',
        subtitle: 'View submitted tickets',
        route: '/my-tickets',
        icon: Tickets,
        keywords: ['history', 'status', 'support'],
        category: 'Tickets'
    },
    {
        id: 'ticket-assigned',
        title: 'Assigned Tickets',
        subtitle: 'Tickets assigned to you',
        route: '/assigned-tickets',
        icon: TicketCheck,
        keywords: ['resolve', 'tech', 'support'],
        category: 'Tickets'
    },

    // Attendance Options
    {
        id: 'leave-summary',
        title: 'Leave Summary',
        subtitle: 'Check leave balance',
        route: '/leave-summary',
        icon: FileText,
        keywords: ['balance', 'vacation', 'sick', 'casual', 'earned'],
        category: 'Attendance'
    },
    {
        id: 'holidays',
        title: 'Holiday List',
        subtitle: 'Company holidays',
        route: '/holidays',
        icon: Gift,
        keywords: ['calendar', 'off', 'festival'],
        category: 'Attendance'
    },
    {
        id: 'attendance-self',
        title: 'My Attendance',
        subtitle: 'View personal records',
        route: '/attendance',
        icon: Clock,
        keywords: ['history', 'punch', 'log'],
        category: 'Attendance'
    },

    // Miscellaneous
    {
        id: 'salary',
        title: 'Transferred Salary',
        subtitle: 'Salary history & slips',
        route: '/transferred-salary',
        icon: IndianRupee,
        keywords: ['pay', 'money', 'finance', 'payslip'],
        category: 'Finance'
    },
    {
        id: 'assets',
        title: 'My Assets',
        subtitle: 'Company assets inventory',
        route: '/assets',
        icon: IdCard,
        keywords: ['laptop', 'device', 'inventory'],
        category: 'General'
    },
    {
        id: 'wfh',
        title: 'Work From Home',
        subtitle: 'WFH applications',
        route: '/work-from-home',
        icon: HousePlug,
        keywords: ['remote', 'apply'],
        category: 'Attendance'
    }
];
