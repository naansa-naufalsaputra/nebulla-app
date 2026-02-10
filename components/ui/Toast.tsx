import { Toaster as SonnerToaster, toast } from 'sonner';

export const Toaster = () => {
    return (
        <SonnerToaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                },
                className: 'dark:bg-surface-dark dark:text-white dark:border-gray-700',
            }}
        />
    );
};

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};
