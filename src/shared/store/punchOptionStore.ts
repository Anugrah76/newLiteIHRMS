import { create } from 'zustand';
import type { PunchOption } from '@features/attendance/api/attendanceApi';

/**
 * Punch Option store state interface
 * Replaces the old PunchOptionContext from the previous project
 * 
 * empOption values:
 *   1 = Normal punch (location only)
 *   2 = Biometric + location
 *   3 = QR code scan
 *   4 = Both (biometric + QR)
 */
interface PunchOptionState {
    empOption: number | null;
    punchOptions: PunchOption[] | null;
    setEmpOption: (option: number | null) => void;
    setPunchOptions: (options: PunchOption[] | null) => void;
    clearPunchOptions: () => void;
}

/**
 * Punch Option store
 * Stores the employee's punch option mode (1-4) and office list
 * fetched before navigating to mark attendance.
 */
export const usePunchOptionStore = create<PunchOptionState>()((set) => ({
    empOption: null,
    punchOptions: null,

    setEmpOption: (option) => {
        set({ empOption: option });
    },

    setPunchOptions: (options) => {
        set({ punchOptions: options });
    },

    clearPunchOptions: () => {
        set({ empOption: null, punchOptions: null });
    },
}));
