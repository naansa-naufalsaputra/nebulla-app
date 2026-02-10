-- Add parent_id column to notes table
-- Relies on 'notes.id' being a UUID. 
-- ON DELETE SET NULL ensures that if a parent is deleted, children become root notes (safe approach).
-- Alternatively use ON DELETE CASCADE to delete children when parent is deleted.
ALTER TABLE notes 
ADD COLUMN parent_id UUID REFERENCES notes(id) ON DELETE SET NULL;

-- If you want children to be deleted when parent is deleted, use this instead:
-- ALTER TABLE notes ADD COLUMN parent_id UUID REFERENCES notes(id) ON DELETE CASCADE;

-- Add icon and cover_url columns to notes table
alter table notes add column if not exists icon text;
alter table notes add column if not exists cover_url text;

-- Add cover_position column for repositioning feature (0=top, 50=center, 100=bottom)
alter table notes add column if not exists cover_position float default 50.0;
