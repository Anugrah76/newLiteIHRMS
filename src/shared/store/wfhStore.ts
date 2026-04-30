import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * WFH session data returned by the start_work API
 */
export interface WfhSessionData {
    work_date: string;
    start_time: string;
    [key: string]: any;
}

/**
 * WFH store state interface
 */
interface WfhState {
    isWorkStarted: boolean;
    sessionData: WfhSessionData | null;
    /** The date (YYYY-MM-DD) on which the day was ended, null if not ended */
    dayEndedDate: string | null;
    setWorkStarted: (data: WfhSessionData) => void;
    clearWork: () => void;
    setDayEnded: (date: string) => void;
    clearDayEnded: () => void;
}

/**
 * Work From Home store
 * Persists the active WFH session across navigation and app restarts.
 * When "Start Work" succeeds, call setWorkStarted(data).
 * When "Stop Work" succeeds, call clearWork().
 * When "End Day" succeeds, call setDayEnded(date).
 */
export const useWfhStore = create<WfhState>()(
    persist(
        (set) => ({
            isWorkStarted: false,
            sessionData: null,
            dayEndedDate: null,

            setWorkStarted: (data) => {
                set({
                    isWorkStarted: true,
                    sessionData: data,
                });
            },

            clearWork: () => {
                set({
                    isWorkStarted: false,
                    sessionData: null,
                });
            },

            setDayEnded: (date) => {
                set({
                    isWorkStarted: false,
                    sessionData: null,
                    dayEndedDate: date,
                });
            },

            clearDayEnded: () => {
                set({
                    dayEndedDate: null,
                });
            },
        }),
        {
            name: 'wfh-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
