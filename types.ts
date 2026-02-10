
export enum ViewMode {
  BLOCK = 'BLOCK',
  CANVAS = 'CANVAS'
}

export enum ToolType {
  PEN = 'PEN',
  HIGHLIGHTER = 'HIGHLIGHTER',
  ERASER = 'ERASER',
  LASSO = 'LASSO',
  CALLIGRAPHY = 'CALLIGRAPHY',
  WATERCOLOR = 'WATERCOLOR'
}

export interface BlockStyle {
  backgroundColor?: string;
  borderColor?: string;
  fontFamily?: 'Inter' | 'Kalam' | 'Times New Roman' | 'Georgia' | 'Arial' | 'Roboto' | 'Fira Code';
  fontSize?: 'small' | 'medium' | 'large';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'line-through' | 'underline';
}

export interface NoteBlock {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'todo' | 'latex' | 'image' | 'video_placeholder' | 'bullet_list' | 'numbered_list' | 'code' | 'table' | 'ink-canvas' | 'toggle' | 'quote' | 'callout' | 'divider';
  content: any; // string for text, object { drawingData: string, ocrText: string } for ink-canvas
  checked?: boolean;
  metadata?: any;
  style?: BlockStyle;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  tool: ToolType;
}

export interface AIResponse {
  text: string;
  latex?: string;
  videoUri?: string;
  relatedLinks?: { title: string; uri: string }[];
}

export interface NoteTemplate {
  name: string;
  icon: string;
  blocks: NoteBlock[];
}

export interface Folder {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  isFavorite: boolean;
  isTrashed?: boolean;
  folder?: string;
  parentId?: string | null;
  tags?: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastOpenedAt: string; // ISO 8601
  /**
   * @deprecated Legacy JSON format. Use `content` (HTML) instead.
   */
  blocks?: any[]; // Was NoteBlock[]
  content?: string; // Tiptap: HTML Content
  strokes?: Stroke[];
  // Notion-style features
  icon?: string | null; // Emoji character
  cover_url?: string | null; // Supabase storage URL
  cover_position?: number; // Vertical position percentage (0=top, 50=center, 100=bottom)
  // Page style settings (per-note)
  font_style?: 'sans' | 'serif' | 'mono'; // Font family style
  is_full_width?: boolean; // Full-width page layout
  is_small_text?: boolean; // Small text size
}

export interface NoteTreeItem extends Note {
  children: NoteTreeItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export type SidebarFilter = 'home' | 'all' | 'favorites' | 'recent' | 'trash' | string; // string represents a folder name
