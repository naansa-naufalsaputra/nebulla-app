import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (action: string) => void;
  onClose: () => void;
}

const SlashMenu = React.forwardRef<any, SlashMenuProps>(({ position, onSelect, onClose }, ref) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [adjustedStyle, setAdjustedStyle] = useState<{ top?: number; bottom?: number; left: number }>({
    top: position.top,
    left: position.left
  });

  const items = [
    // --- Basic Blocks ---
    { header: "Basic Blocks" },
    { id: 'text', icon: 'notes', label: 'Text', desc: 'Plain paragraph' },
    { id: 'h1', icon: 'title', label: 'Heading 1', desc: 'Big section heading' },
    { id: 'h2', icon: 'format_h2', label: 'Heading 2', desc: 'Medium heading' },
    { id: 'h3', icon: 'format_h3', label: 'Heading 3', desc: 'Small heading' },
    { id: 'bullet', icon: 'format_list_bulleted', label: 'Bullet List', desc: 'Simple list' },
    { id: 'number', icon: 'format_list_numbered', label: 'Numbered List', desc: 'Ordered list' },
    { id: 'todo', icon: 'check_box', label: 'To-do List', desc: 'Track tasks' },
    { id: 'toggle', icon: 'expand_circle_down', label: 'Toggle List', desc: 'Collapsible content' },

    // --- Insert / Media ---
    { header: "Insert / Media" },
    { id: 'quote', icon: 'format_quote', label: 'Quote', desc: 'Capture a quote' },
    { id: 'divider', icon: 'horizontal_rule', label: 'Divider', desc: 'Visual separator' },
    { id: 'callout', icon: 'lightbulb', label: 'Callout', desc: 'Highlighted info box' },
    { id: 'code', icon: 'code', label: 'Code Block', desc: 'Capture snippets' },
    { id: 'table', icon: 'table_chart', label: 'Table', desc: 'Simple data table' },
    { id: 'image', icon: 'image', label: 'Image', desc: 'Upload or embed' },

    // --- AI Intelligence ---
    { header: "AI Intelligence" },
    { id: 'ai-ask', icon: 'auto_awesome', label: 'Ask AI', desc: 'Let AI write for you' },
    { id: 'ai-summarize', icon: 'summarize', label: 'Summarize', desc: 'Draft a summary' },
    { id: 'ai-brainstorm', icon: 'psychology', label: 'Brainstorm', desc: 'Generate ideas' },
    { id: 'ai-math', icon: 'calculate', label: 'Solve Math', desc: 'Solve equation' },
    { id: 'ai-search', icon: 'travel_explore', label: 'Research', desc: 'Find sources' },
    { id: 'ai-translate', icon: 'translate', label: 'Translate', desc: 'Convert language' },
  ];

  // Filter out headers for navigation index mapping
  const actionableItems = items.filter(i => !i.header);

  React.useImperativeHandle(ref, () => ({
    onUp: () => {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : actionableItems.length - 1));
    },
    onDown: () => {
      setSelectedIndex(prev => (prev < actionableItems.length - 1 ? prev + 1 : 0));
    },
    onEnter: () => {
      const item = actionableItems[selectedIndex];
      if (item && item.id) onSelect(item.id);
    }
  }));

  // Scroll to selected item
  useEffect(() => {
    const selectedEl = document.getElementById(`slash-item-${selectedIndex}`);
    if (selectedEl && menuRef.current) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Smart Positioning Logic
  useLayoutEffect(() => {
    if (menuRef.current) {
      // Use client rects to ensure we don't overflow
      const windowHeight = window.innerHeight;

      // Simple logic: if click is in bottom half, show menu above.
      // 400px is approx menu height
      if (position.top > windowHeight - 400) {
        setAdjustedStyle({
          bottom: windowHeight - position.top + 10,
          left: position.left
        });
      } else {
        setAdjustedStyle({
          top: position.top + 10,
          left: position.left
        });
      }
    }
  }, [position]);

  useEffect(() => {
    const handleInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onClose();
        }
      }
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [onClose]);

  // Render helper
  let actionIndex = 0;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[300px] animate-in fade-in zoom-in-95 duration-200"
      style={adjustedStyle}
    >
      <div className="bg-white/80 dark:bg-surface-dark/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-menu overflow-hidden flex flex-col max-h-[400px]">
        <div className="overflow-y-auto p-1.5 flex flex-col gap-0.5">
          {items.map((item, index) => {
            if (item.header) {
              return (
                <div key={`header-${index}`} className="px-3 py-1 mt-1 first:mt-0">
                  <span className="text-[10px] font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">{item.header}</span>
                </div>
              );
            }

            const currentActionIndex = actionIndex++;
            const isSelected = selectedIndex === currentActionIndex;

            return (
              <button
                key={item.id || `item-${index}`}
                id={`slash-item-${currentActionIndex}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent editor blur
                  if (item.id) onSelect(item.id);
                }}
                onMouseEnter={() => setSelectedIndex(currentActionIndex)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 group
                ${isSelected
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-text-main dark:text-gray-200'}`}
              >
                <div className={`size-8 rounded-md flex items-center justify-center border transition-colors shrink-0 shadow-sm
                 ${item.id?.startsWith('ai')
                    ? (isSelected ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 border-primary/20 text-primary')
                    : (isSelected ? 'bg-white border-primary text-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400')}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] truncate ${isSelected ? 'text-primary/70' : 'text-text-secondary dark:text-gray-500'}`}>{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SlashMenu;