import { create } from 'zustand';

interface SidebarState {
    isVisible: boolean;
    setSidebarVisible: (visible: boolean) => void;
    toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isVisible: false,
    setSidebarVisible: (visible) => set({ isVisible: visible }),
    toggleSidebar: () => set((state) => ({ isVisible: !state.isVisible })),
}));
