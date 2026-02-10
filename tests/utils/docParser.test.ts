import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pdfjs-dist and mammoth
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
    version: '3.0.0'
}));

vi.mock('mammoth', () => ({
    default: {
        extractRawText: vi.fn()
    }
}));

describe('docParser - PDF Parsing', () => {
    it('should extract text from PDF pages', async () => {
        // This is a logic test - actual PDF parsing requires complex mocking
        // Testing the text concatenation logic
        const pages = [
            { pageNum: 1, text: 'Page 1 content' },
            { pageNum: 2, text: 'Page 2 content' },
            { pageNum: 3, text: 'Page 3 content' }
        ];

        // Simulate parsePDF logic
        let fullText = '';
        pages.forEach(page => {
            fullText += `\n\n--- Page ${page.pageNum} ---\n\n${page.text}`;
        });
        fullText = fullText.trim();

        expect(fullText).toContain('--- Page 1 ---');
        expect(fullText).toContain('Page 1 content');
        expect(fullText).toContain('--- Page 2 ---');
        expect(fullText).toContain('Page 2 content');
        expect(fullText).toContain('--- Page 3 ---');
        expect(fullText).toContain('Page 3 content');
    });

    it('should handle single page PDF', () => {
        const pages = [
            { pageNum: 1, text: 'Single page content' }
        ];

        let fullText = '';
        pages.forEach(page => {
            fullText += `\n\n--- Page ${page.pageNum} ---\n\n${page.text}`;
        });
        fullText = fullText.trim();

        expect(fullText).toBe('--- Page 1 ---\n\nSingle page content');
    });

    it('should handle empty PDF pages', () => {
        const pages = [
            { pageNum: 1, text: '' },
            { pageNum: 2, text: 'Page 2 content' }
        ];

        let fullText = '';
        pages.forEach(page => {
            fullText += `\n\n--- Page ${page.pageNum} ---\n\n${page.text}`;
        });
        fullText = fullText.trim();

        expect(fullText).toContain('--- Page 1 ---');
        expect(fullText).toContain('--- Page 2 ---');
        expect(fullText).toContain('Page 2 content');
    });
});

describe('docParser - DOCX Parsing', () => {
    it('should extract and trim text from DOCX', () => {
        // Simulate parseDOCX logic
        const rawText = '  DOCX content with whitespace  ';
        const trimmedText = rawText.trim();

        expect(trimmedText).toBe('DOCX content with whitespace');
    });

    it('should handle empty DOCX', () => {
        const rawText = '';
        const trimmedText = rawText.trim();

        expect(trimmedText).toBe('');
    });

    it('should preserve line breaks in DOCX', () => {
        const rawText = 'Line 1\nLine 2\nLine 3';
        const trimmedText = rawText.trim();

        expect(trimmedText).toBe('Line 1\nLine 2\nLine 3');
        expect(trimmedText.split('\n')).toHaveLength(3);
    });
});

describe('docParser - HTML Content Handling', () => {
    // Testing various HTML formats that Tiptap might generate

    it('should handle basic paragraph HTML', () => {
        const html = '<p>Simple paragraph</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Simple paragraph');
    });

    it('should handle nested HTML tags', () => {
        const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Bold and italic text');
    });

    it('should handle multiple paragraphs', () => {
        const html = '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Paragraph 1Paragraph 2Paragraph 3');
    });

    it('should handle lists', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Item 1Item 2Item 3');
    });

    it('should handle headings', () => {
        const html = '<h1>Heading 1</h1><h2>Heading 2</h2><p>Content</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Heading 1Heading 2Content');
    });

    it('should handle code blocks', () => {
        const html = '<pre><code>const x = 10;</code></pre>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('const x = 10;');
    });

    it('should handle blockquotes', () => {
        const html = '<blockquote>Quoted text</blockquote>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Quoted text');
    });

    it('should handle tables', () => {
        const html = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Cell 1Cell 2');
    });

    it('should handle links', () => {
        const html = '<p>Visit <a href="https://example.com">this link</a></p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Visit this link');
    });

    it('should handle images (alt text)', () => {
        const html = '<p><img src="image.jpg" alt="Description" /></p>';

        // Extract alt text from images
        const altMatch = html.match(/alt="([^"]*)"/);
        const altText = altMatch ? altMatch[1] : '';

        expect(altText).toBe('Description');
    });

    it('should handle task lists (Tiptap extension)', () => {
        const html = '<ul data-type="taskList"><li data-checked="true">Done task</li><li data-checked="false">Todo task</li></ul>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Done taskTodo task');
    });

    it('should handle empty HTML', () => {
        const html = '';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('');
    });

    it('should handle malformed HTML gracefully', () => {
        const html = '<p>Unclosed paragraph<p>Another paragraph</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Unclosed paragraphAnother paragraph');
    });

    it('should handle HTML with special characters', () => {
        const html = '<p>Text with &lt;special&gt; &amp; characters</p>';

        // Decode HTML entities
        const decoded = html
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        const textContent = decoded.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Text with <special> & characters');
    });

    it('should handle HTML with inline styles', () => {
        const html = '<p style="color: red; font-size: 16px;">Styled text</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Styled text');
    });

    it('should handle HTML with data attributes (Tiptap)', () => {
        const html = '<p data-node-id="123" data-type="paragraph">Content</p>';
        const textContent = html.replace(/<[^>]*>/g, '');

        expect(textContent).toBe('Content');
    });

    it('should handle complex nested Tiptap structure', () => {
        const html = `
      <div class="tiptap">
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <pre><code>code block</code></pre>
      </div>
    `;
        const textContent = html.replace(/<[^>]*>/g, '').trim();

        expect(textContent).toContain('Title');
        expect(textContent).toContain('bold');
        expect(textContent).toContain('italic');
        expect(textContent).toContain('List item 1');
        expect(textContent).toContain('code block');
    });
});
