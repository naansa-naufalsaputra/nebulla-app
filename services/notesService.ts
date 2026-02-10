
import { supabase } from '../lib/supabaseClient';
import { Note, Folder } from '../types';

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

// Map database row to app Note type
const mapNoteFromDB = (row: any): Note => ({
    id: row.id,
    title: row.title || 'Untitled',
    content: row.blocks || '', // CRITICAL: Map database 'blocks' to frontend 'content' (for TiptapEditor)
    blocks: row.blocks || [], // Keep for backward compatibility
    folder: row.folder_id || undefined,
    parentId: row.parent_id || undefined,
    tags: row.tags || [],
    isFavorite: row.is_favorite || false,
    isTrashed: row.is_trashed || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at || row.updated_at,
    // Notion-style features
    icon: row.icon || null,
    cover_url: row.cover_url || null,
    cover_position: row.cover_position ?? 50, // Default to center
    // Page Style Persistence
    font_style: row.font_style || 'sans',
    is_full_width: row.is_full_width || false,
    is_small_text: row.is_small_text || false,
});



export const notesService = {
    // --- Profile ---
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error && error.code === 'PGRST116') {
            // Profile missing, create one
            // Note: 'email' column might not exist in public.profiles depending on schema.
            // We only insert what we know fits likely schema or update triggers handle it.
            const newProfile: any = {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url
            };

            // If schema has email, it usually triggers from auth.users, but we can try passing it if needed.
            // For now, let's omit explicit email insert to avoid PGRST204 if column is missing.
            // If your profiles table HAS an email column, uncomment below:
            // newProfile.email = user.email;

            const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .upsert(newProfile)
                .select()
                .single();

            if (createError) {
                console.error("Failed to create profile:", createError);
                return null;
            }
            return createdProfile;
        }

        return data;
    },

    // --- Notes ---
    async fetchNotes() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapNoteFromDB);
    },

    async createNote(note: Partial<Note>, userId: string) {
        // 1. SANITASI EKSTRIM: Pastikan parent_id hanya bisa NULL atau UUID valid
        let sanitizedParentId = null;

        if (note.parentId) {
            const pid = String(note.parentId).trim();
            // Jika tidak kosong DAN bukan string "null" DAN bukan "undefined", maka gunakan value tersebut
            if (pid !== "" && pid !== "null" && pid !== "undefined") {
                sanitizedParentId = pid;
            }
        }

        // 2. Construct Payload - Only include id if it's not empty
        const noteToSave: any = {
            user_id: userId,
            title: note.title || 'Untitled Note',
            blocks: note.content || note.blocks || '', // CRITICAL: Map content to blocks column
            folder_id: (note.folder && note.folder.trim() !== "") ? note.folder : null,
            parent_id: sanitizedParentId,
            tags: note.tags || [],
            is_favorite: note.isFavorite || false,
            is_trashed: note.isTrashed || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Page Styles
            font_style: note.font_style || 'sans',
            is_full_width: note.is_full_width || false,
            is_small_text: note.is_small_text || false,
        };

        // Only add id if it's provided and not empty
        if (note.id && note.id.trim() !== "") {
            noteToSave.id = note.id;
        }

        // 3. Kirim ke Supabase
        const { data, error } = await supabase
            .from('notes')
            .insert(noteToSave)
            .select()
            .single();

        if (error) {
            console.error("Supabase Create Note Error:", error.message);
            throw error;
        }

        return mapNoteFromDB(data);
    },

    async updateNote(note: Note) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // CRITICAL: Database uses 'blocks' column, not 'content'
        // Map note.content (HTML from TiptapEditor) to blocks column
        // Safe logging to prevent substring error
        const contentPreview = typeof note.content === 'string'
            ? note.content.substring(0, 100)
            : JSON.stringify(note.content || '').substring(0, 100);
        console.log('💾 Saving note to blocks column:', contentPreview + '...');

        const { error } = await supabase
            .from('notes')
            .update({
                title: note.title,
                blocks: note.content || note.blocks || '', // CRITICAL: Save to 'blocks' column (database schema)
                folder_id: note.folder || null,
                parent_id: note.parentId || null,
                tags: note.tags,
                is_favorite: note.isFavorite,
                is_trashed: note.isTrashed,
                updated_at: new Date().toISOString(),
                last_opened_at: note.lastOpenedAt,
                // Notion-style features
                icon: note.icon || null,
                cover_url: note.cover_url || null,
                cover_position: note.cover_position ?? 50, // Persist vertical position
                // Page Styles
                font_style: note.font_style,
                is_full_width: note.is_full_width,
                is_small_text: note.is_small_text,
            })
            .eq('id', note.id);

        if (error) throw error;
        return note;
    },

    async trashNote(noteId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('notes')
            .update({
                is_trashed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', noteId);

        if (error) throw error;
    },


    async deleteNote(noteId: string) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) throw error;
    },

    async emptyTrash() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('user_id', user.id)
            .eq('is_trashed', true);

        if (error) throw error;
    },

    // --- Folders ---
    async fetchFolders() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data || [];
    },

    async createFolder(name: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('folders')
            .insert({
                user_id: user.id,
                name: name
            })
            .select()
            .single();

        if (error) throw error;
        return data as Folder;
    },

    async deleteFolder(folderId: string) {
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', folderId);

        if (error) throw error;
    }
};
