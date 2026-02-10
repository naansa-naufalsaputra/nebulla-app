import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { showToast } from '../components/ui/Toast';
import { Note } from '../types';

interface UseAppEffectsParams {
    setIsAIModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSession: React.Dispatch<React.SetStateAction<any>>;
    setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoadingData: boolean;
    notesLength: number;
    setLocalNotesToMigrate: React.Dispatch<React.SetStateAction<Note[] | null>>;
    setIsMigrationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    notesError: string | null;
}

/**
 * Custom hook to manage all side effects for the App component
 * Handles: keyboard shortcuts, auth session, migration check, and error toasts
 */
export const useAppEffects = ({
    setIsAIModalOpen,
    setSession,
    setAuthLoading,
    isLoadingData,
    notesLength,
    setLocalNotesToMigrate,
    setIsMigrationModalOpen,
    notesError
}: UseAppEffectsParams): void => {

    // Keyboard Shortcuts (Ctrl+J / Cmd+J for AI Modal)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                setIsAIModalOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [setIsAIModalOpen]);

    // Auth Session Management
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [setSession, setAuthLoading]);

    // Local Data Migration Check
    useEffect(() => {
        if (!isLoadingData && notesLength === 0) {
            const localNotes = localStorage.getItem('nebulla_notes_data');
            if (localNotes) {
                try {
                    const parsedLocal: Note[] = JSON.parse(localNotes);
                    if (parsedLocal.length > 0) {
                        setLocalNotesToMigrate(parsedLocal);
                        setIsMigrationModalOpen(true);
                    }
                } catch (e) {
                    console.error("Migration check failed:", e);
                }
            }
        }
    }, [isLoadingData, notesLength, setLocalNotesToMigrate, setIsMigrationModalOpen]);

    // Error Toast Notifications
    useEffect(() => {
        if (notesError) {
            showToast.error(notesError);
        }
    }, [notesError]);
};
