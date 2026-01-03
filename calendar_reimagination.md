# Unified Calendar Reimagination

## Feature Summary
The **Unified Calendar** is a central hub designed to streamline the employee experience by consolidating Attendance, Timesheet management, and Leave applications into a single, intuitive interface.

**Key Capabilities:**
- **Holistic View:** Users can visualize their work status (Present, Leave, Holiday, etc.) alongside their timesheet submission status on a monthly calendar.
- **Smart Filtering:** Toggle between "All", "Attendance", "Timesheet", and "Leave" views to focus on specific information.
- **Interactive Details:** Tapping any date reveals a detailed summary modal.
- **Quick Actions:**
  - **Fill Timesheet:** Directly from the calendar for missing dates.
  - **View Timesheet:** Review submitted entries.
  - **Apply for Leave:** Initiate a leave request for specific dates.

## Architecture

### Component Structure
- **File:** `app/(tabs)/unified-calendar.tsx`
- **Component:** `UnifiedCalendarScreen`

### Data Integration
The screen integrates data from multiple domain hooks:
1.  **Attendance:** `useAttendanceRecords` fetches monthly attendance data (Present, Leave, Comp Off, Holidays, etc.).
2.  **Timesheet:** `useTimesheetCalendar` fetches the status of timesheets (Draft vs. Submitted) for the month.

### State Management
- **`currentMonth`**: Tracks the currently viewed month (Date object).
- **`viewFilter`**: Controls the active filter ('all' | 'attendance' | 'timesheet' | 'leave').
- **`selectedDay`**: Stores data for the currently tapped date to populate the detail modal.
- **`modalVisible`**: Toggles the detail modal.

### UI/UX Design
- **Library:** React Native core components with `lucide-react-native` for icons.
- **Theming:** Fully integrated with the application's theme system (`useTheme`) for dark/light mode support.
- **Visuals:** Use of color-coded dots and badges (Green for Present/Submitted, Purple for Leave, Amber for Draft/Comp Off).

## Walkthrough

### 1. Accessing the Calendar
Navigate to the **Unified Calendar** tab. You are greeted with the current month's view.
- **Header:** Displays the month name and navigation arrows.
- **Info Card:** Briefly explains the unified nature of the view.

### 2. Filtering the View
Use the tabs below the header to change context:
- **All:** Default view showing all indicators.
- **Attendance:** Highlights only attendance statuses (Present, Absent, etc.).
- **Timesheet:** Highlights dates with Draft or Submitted timesheets.
- **Leave:** Highlights leave days.

### 3. Viewing Daily Details
Tap on any date (e.g., today or a past date). A **Day Summary Modal** slides up:
- **Attendance Section:** Shows "Present", "On Leave", or "Holiday" with a status badge.
- **Timesheet Section:** 
  - Shows "Submitted" or "Draft" status.
  - If no timesheet exists, a **Fill Timesheet** button appears (for past/current dates).
  - If a timesheet exists, a **View Timesheet** button is available.
- **Leave Section:** Provides an **Apply for Leave** button to quickly start a request for that date.

### 4. Navigation
- Swipe or use the arrow buttons to move between months.
- Future months are viewable but actions are restricted where appropriate.
