import Toast from 'react-native-toast-message';

interface ToastProps {
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
}

export const CorporateToast = {
    show: ({ type, title, message }: ToastProps) => {
        Toast.show({
            type: type,
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
        });
    },
    hide: () => {
        Toast.hide();
    }
};
