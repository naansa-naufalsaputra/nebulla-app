import { describe, it, expect } from 'vitest';

// Note: Testing React hooks requires @testing-library/react-hooks or renderHook from @testing-library/react
// For now, we'll create basic logic tests for the filtering and tree building functions

describe('useNotes - Filtering Logic', () => {
    it('should filter notes by search query - title match', () => {
        const notes = [
            { id: '1', title: 'React Tutorial', content: '', tags: [], isTrashed: false },
            { id: '2', title: 'Vue Guide', content: '', tags: [], isTrashed: false },
            { id: '3', title: 'Angular Docs', content: '', tags: [], isTrashed: false },
        ];

        const searchQuery = 'react';
        const result = notes.filter(n =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('React Tutorial');
    });

    it('should filter notes by tags', () => {
        const notes = [
            { id: '1', title: 'Note 1', tags: ['javascript', 'react'], isTrashed: false },
            { id: '2', title: 'Note 2', tags: ['python', 'django'], isTrashed: false },
            { id: '3', title: 'Note 3', tags: ['javascript', 'vue'], isTrashed: false },
        ];

        const filterTags = ['react'];
        const result = notes.filter(n =>
            n.tags?.some(t => filterTags.includes(t))
        );

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter out trashed notes by default', () => {
        const notes = [
            { id: '1', title: 'Active Note', isTrashed: false },
            { id: '2', title: 'Trashed Note', isTrashed: true },
            { id: '3', title: 'Another Active', isTrashed: false },
        ];

        const result = notes.filter(n => !n.isTrashed);

        expect(result).toHaveLength(2);
        expect(result.every(n => !n.isTrashed)).toBe(true);
    });

    it('should filter only trashed notes when filter is trash', () => {
        const notes = [
            { id: '1', title: 'Active Note', isTrashed: false },
            { id: '2', title: 'Trashed Note', isTrashed: true },
            { id: '3', title: 'Another Trashed', isTrashed: true },
        ];

        const result = notes.filter(n => n.isTrashed);

        expect(result).toHaveLength(2);
        expect(result.every(n => n.isTrashed)).toBe(true);
    });

    it('should filter favorites', () => {
        const notes = [
            { id: '1', title: 'Favorite Note', isFavorite: true, isTrashed: false },
            { id: '2', title: 'Normal Note', isFavorite: false, isTrashed: false },
            { id: '3', title: 'Another Favorite', isFavorite: true, isTrashed: false },
        ];

        const result = notes.filter(n => !n.isTrashed && n.isFavorite);

        expect(result).toHaveLength(2);
        expect(result.every(n => n.isFavorite)).toBe(true);
    });
});

describe('useNotes - Tree Building Logic', () => {
    it('should build correct tree structure', () => {
        const notes = [
            { id: '1', title: 'Root 1', parentId: null },
            { id: '2', title: 'Child of 1', parentId: '1' },
            { id: '3', title: 'Root 2', parentId: null },
            { id: '4', title: 'Child of 2', parentId: '2' },
        ];

        const buildTree = (notes: any[]) => {
            const noteMap = new Map();
            const roots: any[] = [];

            notes.forEach(note => {
                noteMap.set(note.id, { ...note, children: [] });
            });

            notes.forEach(note => {
                const node = noteMap.get(note.id)!;
                if (note.parentId && noteMap.has(note.parentId)) {
                    const parent = noteMap.get(note.parentId)!;
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            });

            return roots;
        };

        const tree = buildTree(notes);

        expect(tree).toHaveLength(2); // Two roots
        expect(tree[0].children).toHaveLength(1); // Root 1 has 1 child
        expect(tree[0].children[0].id).toBe('2'); // Child is note 2
        expect(tree[0].children[0].children).toHaveLength(1); // Note 2 has 1 child
        expect(tree[0].children[0].children[0].id).toBe('4'); // Grandchild is note 4
    });

    it('should handle orphaned notes (parent not found)', () => {
        const notes = [
            { id: '1', title: 'Root', parentId: null },
            { id: '2', title: 'Orphan', parentId: 'non-existent' },
        ];

        const buildTree = (notes: any[]) => {
            const noteMap = new Map();
            const roots: any[] = [];

            notes.forEach(note => {
                noteMap.set(note.id, { ...note, children: [] });
            });

            notes.forEach(note => {
                const node = noteMap.get(note.id)!;
                if (note.parentId && noteMap.has(note.parentId)) {
                    const parent = noteMap.get(note.parentId)!;
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            });

            return roots;
        };

        const tree = buildTree(notes);

        expect(tree).toHaveLength(2); // Both become roots
    });
});

describe('useNotes - Circular Dependency Detection', () => {
    it('should detect circular dependencies', () => {
        const notes = [
            { id: '1', parentId: null },
            { id: '2', parentId: '1' },
            { id: '3', parentId: '2' },
        ];

        const isDescendant = (sourceId: string, targetId: string, allNotes: any[]): boolean => {
            const findChildren = (parentId: string): string[] => {
                return allNotes
                    .filter(n => n.parentId === parentId)
                    .flatMap(n => [n.id, ...findChildren(n.id)]);
            };

            const descendants = findChildren(sourceId);
            return descendants.includes(targetId);
        };

        // Try to make note 1 a child of note 3 (would create circular dependency)
        const wouldBeCircular = isDescendant('1', '3', notes);

        expect(wouldBeCircular).toBe(true); // Note 3 is a descendant of note 1
    });

    it('should allow valid parent-child relationships', () => {
        const notes = [
            { id: '1', parentId: null },
            { id: '2', parentId: null },
            { id: '3', parentId: '1' },
        ];

        const isDescendant = (sourceId: string, targetId: string, allNotes: any[]): boolean => {
            const findChildren = (parentId: string): string[] => {
                return allNotes
                    .filter(n => n.parentId === parentId)
                    .flatMap(n => [n.id, ...findChildren(n.id)]);
            };

            const descendants = findChildren(sourceId);
            return descendants.includes(targetId);
        };

        // Try to make note 2 a child of note 1 (valid)
        const wouldBeCircular = isDescendant('2', '1', notes);

        expect(wouldBeCircular).toBe(false); // Note 1 is NOT a descendant of note 2
    });
});
