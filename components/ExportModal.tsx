import React, { useState } from 'react';
import { Note } from '../types';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | undefined;
}

type ExportFormat = 'markdown' | 'html' | 'rtf' | 'txt' | 'json';

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, note }) => {
    const [format, setFormat] = useState<ExportFormat>('markdown');
    const [includeStyles, setIncludeStyles] = useState(true);

    if (!isOpen || !note) return null;

    const generateContent = () => {
        switch (format) {
            case 'markdown': return generateMarkdown();
            case 'html': return generateHTML();
            case 'rtf': return generateRTF();
            case 'txt': return generateTXT();
            case 'json': return JSON.stringify(note, null, 2);
            default: return '';
        }
    };

    const generateMarkdown = () => {
        let content = `# ${note.title}\n\n`;
        (note.blocks || []).forEach(block => {
            if (block.type === 'heading1') content += `# ${block.content}\n\n`;
            else if (block.type === 'heading2') content += `## ${block.content}\n\n`;
            else if (block.type === 'bullet_list') content += `- ${block.content}\n`;
            else if (block.type === 'numbered_list') content += `1. ${block.content}\n`; // simplified
            else if (block.type === 'todo') content += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
            else if (block.type === 'code') content += "```" + (block.metadata?.language || '') + "\n" + block.content + "\n```\n\n";
            else if (block.type === 'table') {
                // Simple markdown table conversion
                const rows = block.content.split('\n');
                if (rows.length > 0) {
                    const headers = rows[0].split(',');
                    content += `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n`;
                    for (let i = 1; i < rows.length; i++) {
                        content += `| ${rows[i].split(',').join(' | ')} |\n`;
                    }
                    content += '\n';
                }
            }
            else content += `${block.content}\n\n`;
        });
        return content;
    };

    const generateHTML = () => {
        let styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kalam:wght@300;400;700&display=swap');
                body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; }
                h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; }
                h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                p { line-height: 1.6; margin-bottom: 1rem; }
                ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                li { margin-bottom: 0.25rem; }
                code { background: #f1f5f9; padding: 0.2rem 0.4rem; rounded: 4px; font-family: monospace; }
                pre { background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
                th, td { border: 1px solid #cbd5e1; padding: 0.5rem; text-align: left; }
                th { background: #f8fafc; font-weight: 600; }
                .todo { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
                .checked { text-decoration: line-through; color: #94a3b8; }
                .font-handwriting { font-family: 'Kalam', cursive; }
            </style>
        `;
        let body = `<h1>${note.title}</h1>`;

        (note.blocks || []).forEach(block => {
            let styleStr = '';
            if (includeStyles) {
                if (block.style?.backgroundColor) styleStr += `background-color: ${block.style.backgroundColor}; padding: 8px; border-radius: 4px; `;
                if (block.style?.fontFamily === 'Kalam') styleStr += `font-family: 'Kalam', cursive; `;
            }
            const styleAttr = styleStr ? ` style="${styleStr}"` : '';

            if (block.type === 'heading1') body += `<h1${styleAttr}>${block.content}</h1>`;
            else if (block.type === 'heading2') body += `<h2${styleAttr}>${block.content}</h2>`;
            else if (block.type === 'bullet_list') body += `<ul${styleAttr}><li>${block.content}</li></ul>`;
            else if (block.type === 'numbered_list') body += `<ol${styleAttr}><li>${block.content}</li></ol>`;
            else if (block.type === 'todo') body += `<div class="todo ${block.checked ? 'checked' : ''}"${styleAttr}>${block.checked ? '☑' : '☐'} ${block.content}</div>`;
            else if (block.type === 'code') body += `<pre${styleAttr}><code>${block.content}</code></pre>`;
            else if (block.type === 'table') {
                const rows = block.content.split('\n');
                let tableHtml = `<table${styleAttr}>`;
                rows.forEach((row: string, i: number) => {
                    tableHtml += '<tr>';
                    row.split(',').forEach(cell => {
                        tableHtml += i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
                    });
                    tableHtml += '</tr>';
                });
                tableHtml += '</table>';
                body += tableHtml;
            }
            else if (block.type === 'image') body += `<img src="${block.content}" style="max-width:100%; border-radius:8px; margin: 1rem 0;" />`;
            else body += `<p${styleAttr}>${block.content}</p>`;
        });

        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${note.title}</title>${includeStyles ? styles : ''}</head><body>${body}</body></html>`;
    };

    const generateRTF = () => {
        // Basic RTF Header
        let rtf = `{\\rtf1\\ansi\\deff0\\nouicompat{\\fonttbl{\\f0\\fnil\\fcharset0 Helvetica;}{\\f1\\fnil\\fcharset0 Courier New;}}\n`;
        // Color Table
        rtf += `{\\colortbl ;\\red0\\green0\\blue0;\\red255\\green0\\blue0;\\red0\\green0\\blue255;\\red255\\green255\\blue200;}\n`; // Index 4 is light yellow for highlight example

        // Title
        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\f0\\fs48 ${sanitizeRTF(note.title)}\\par\\b0\\fs24\n`;

        (note.blocks || []).forEach(block => {
            const text = sanitizeRTF(typeof block.content === 'string' ? block.content : '[Content]');

            // Simple highlighting mapping
            let highlight = "";
            if (includeStyles && block.style?.backgroundColor) {
                // Currently just checking if exists, mapping to index 4 (yellowish) for any color to keep simple
                highlight = "\\highlight4 ";
            }

            if (block.type === 'heading1') rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\fs36 ${highlight}${text}\\par\\b0\\fs24\n`;
            else if (block.type === 'heading2') rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\fs28 ${highlight}${text}\\par\\b0\\fs24\n`;
            else if (block.type === 'bullet_list') rtf += `\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1\\bullet\\tab ${highlight}${text}\\par\n`;
            else if (block.type === 'numbered_list') rtf += `\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1 1.\\tab ${highlight}${text}\\par\n`;
            else if (block.type === 'code') rtf += `\\pard\\sa200\\sl276\\slmult1\\f1\\fs20 ${highlight}${text}\\par\\f0\\fs24\n`;
            else if (block.type === 'todo') rtf += `\\pard\\sa200\\sl276\\slmult1 [${block.checked ? 'X' : ' '}] ${highlight}${text}\\par\n`;
            else rtf += `\\pard\\sa200\\sl276\\slmult1 ${highlight}${text}\\par\n`;
        });

        rtf += `}`;
        return rtf;
    };

    const generateTXT = () => {
        let content = `${note.title.toUpperCase()}\n\n`;
        (note.blocks || []).forEach(block => {
            if (typeof block.content !== 'string') return;

            if (block.type === 'heading1') content += `\n[ ${block.content.toUpperCase()} ]\n\n`;
            else if (block.type === 'heading2') content += `\n${block.content}\n${'-'.repeat(block.content.length)}\n\n`;
            else if (block.type === 'bullet_list') content += `* ${block.content}\n`;
            else if (block.type === 'numbered_list') content += `1. ${block.content}\n`;
            else if (block.type === 'todo') content += `[${block.checked ? 'x' : ' '}] ${block.content}\n`;
            else content += `${block.content}\n\n`;
        });
        return content;
    };

    const sanitizeRTF = (str: string) => {
        return str.replace(/[\\{}]/g, (match) => '\\' + match).replace(/\n/g, '\\par ');
    };

    const handleDownload = () => {
        const content = generateContent();
        let extension = 'md';
        let mimeType = 'text/markdown';

        if (format === 'html') { extension = 'html'; mimeType = 'text/html'; }
        else if (format === 'rtf') { extension = 'rtf'; mimeType = 'application/rtf'; }
        else if (format === 'txt') { extension = 'txt'; mimeType = 'text/plain'; }
        else if (format === 'json') { extension = 'json'; mimeType = 'application/json'; }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    const handlePrint = () => {
        window.print();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 w-[400px] z-10 border border-border-color dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-text-main dark:text-white">Export Note</h3>
                    <button onClick={onClose}><span className="material-symbols-outlined text-gray-400">close</span></button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">Format</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['markdown', 'html', 'json', 'txt'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-all ${format === f
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {f === 'txt' ? 'Plain Text' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <input
                            type="checkbox"
                            id="styles"
                            checked={includeStyles}
                            onChange={(e) => setIncludeStyles(e.target.checked)}
                            className="rounded text-primary focus:ring-primary border-gray-300 bg-white dark:bg-gray-700"
                        />
                        <label htmlFor="styles" className="text-sm text-text-main dark:text-white cursor-pointer select-none">
                            Include visual styles (colors, block types)
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generateContent());
                                alert("Copied to clipboard!");
                            }}
                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Copy Text
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            Download
                        </button>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="w-full py-2.5 border border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-sm transition-all"
                    >
                        Print / Save as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;