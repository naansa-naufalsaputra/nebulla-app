import { Editor } from '@tiptap/react';
import { useState } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

interface ExportMenuProps {
    editor: Editor;
}

export const ExportMenu = ({ editor }: ExportMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = () => {
        setIsExporting(true);
        const element = document.querySelector('.ProseMirror'); // Target the editor content

        if (!element) {
            console.error('Editor content not found');
            setIsExporting(false);
            return;
        }

        const opt = {
            margin: 10,
            filename: `document-${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
        };

        // Add a temporary class to ensure styles are captured if needed, 
        // essentially we rely on the existing classes. 
        // html2pdf should capture computed styles.

        html2pdf().set(opt).from(element as HTMLElement).save().then(() => {
            setIsExporting(false);
            setIsOpen(false);
        }).catch((err: any) => {
            console.error('PDF Export failed:', err);
            setIsExporting(false);
        });
    };

    const handleExportMarkdown = () => {
        // Access the markdown storage from the extension
        const markdown = (editor.storage as any)['markdown']?.getMarkdown();

        if (!markdown) {
            console.error('Markdown extension not found or content empty');
            return;
        }

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `document-${new Date().toISOString().slice(0, 10)}.md`);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Export"
            >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                <span className="hidden sm:inline">Export</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-1">
                            <button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="w-full text-left px-3 py-2 text-sm text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
                                {isExporting ? 'Generating PDF...' : 'Download PDF'}
                            </button>
                            <button
                                onClick={handleExportMarkdown}
                                className="w-full text-left px-3 py-2 text-sm text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px] text-blue-500">markdown</span>
                                Download Markdown
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
