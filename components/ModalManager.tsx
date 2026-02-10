import React from 'react';
import SettingsModal from './SettingsModal';
import CreateFolderModal from './CreateFolderModal';
import ExportModal from './ExportModal';
import SaveTemplateModal from './SaveTemplateModal';
import ConfirmModal from './modals/ConfirmModal';
import TemplateGallery from './TemplateGallery';
import { Note, NoteBlock } from '../types';

interface ModalManagerProps {
    settings: {
        isOpen: boolean;
        onClose: () => void;
    };
    createFolder: {
        isOpen: boolean;
        onClose: () => void;
        onSave: (name: string) => Promise<void>;
    };
    exportModal: {
        isOpen: boolean;
        onClose: () => void;
        note?: Note;
    };
    saveTemplate: {
        isOpen: boolean;
        onClose: () => void;
        onSave: (name: string, category: string) => void;
    };
    migration: {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
    };
    templates: {
        isOpen: boolean;
        onClose: () => void;
        onSelect: (title: string, blocks: NoteBlock[], font: string) => Promise<void>;
        onHover: (title: string | null, blocks: NoteBlock[] | null, font: string | null) => void;
    };
}

export const ModalManager: React.FC<ModalManagerProps> = ({
    settings,
    createFolder,
    exportModal,
    saveTemplate,
    migration,
    templates
}) => {
    return (
        <>
            <SettingsModal
                isOpen={settings.isOpen}
                onClose={settings.onClose}
            />

            <CreateFolderModal
                isOpen={createFolder.isOpen}
                onClose={createFolder.onClose}
                onSave={createFolder.onSave}
            />

            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={exportModal.onClose}
                note={exportModal.note}
            />

            <SaveTemplateModal
                isOpen={saveTemplate.isOpen}
                onClose={saveTemplate.onClose}
                onSave={saveTemplate.onSave}
            />

            <ConfirmModal
                isOpen={migration.isOpen}
                onClose={migration.onClose}
                onConfirm={migration.onConfirm}
                title="Migrate Local Data"
                message="Found local notes from a previous session. Do you want to migrate them to your cloud database? This will verify efficient data storage."
                confirmText="Migrate Now"
            />

            <TemplateGallery
                isOpen={templates.isOpen}
                onClose={templates.onClose}
                onSelectTemplate={templates.onSelect}
                onHoverTemplate={templates.onHover}
            />
        </>
    );
};
