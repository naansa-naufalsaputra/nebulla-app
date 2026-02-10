import React, { useRef, useState, useEffect } from 'react';
import { ToolType, Stroke } from '../types';
import { geminiService } from '../services/geminiService';
import { showToast } from './ui/Toast';

interface CanvasEditorProps {
    onNavigateToBlocks?: () => void;
    isDarkMode?: boolean;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onNavigateToBlocks, isDarkMode = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.PEN);
    const [brushSize, setBrushSize] = useState<number>(3);
    const [color, setColor] = useState(isDarkMode ? '#ffffff' : '#000000');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

    // Update default color when dark mode changes, but only if user hasn't selected a specific color
    useEffect(() => {
        setColor(isDarkMode ? '#ffffff' : '#000000');
    }, [isDarkMode]);

    // Context Navigation Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' && onNavigateToBlocks) {
                e.preventDefault();
                onNavigateToBlocks();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigateToBlocks]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High DPI Canvas setup
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            // Clear canvas before redrawing
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Redraw existing strokes
            strokes.forEach(stroke => drawStroke(ctx, stroke));
        }
    }, [strokes, isDarkMode]); // Re-run when strokes change

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.lineWidth = stroke.width;

        // Apply specific styles based on tool type
        if (stroke.tool === ToolType.HIGHLIGHTER) {
            ctx.strokeStyle = stroke.color;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.4;
            ctx.globalCompositeOperation = 'source-over';
        } else if (stroke.tool === ToolType.WATERCOLOR) {
            ctx.strokeStyle = stroke.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'source-over';
        } else if (stroke.tool === ToolType.CALLIGRAPHY) {
            ctx.strokeStyle = stroke.color;
            ctx.lineCap = 'square';
            ctx.lineJoin = 'bevel';
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        } else if (stroke.tool === ToolType.ERASER) {
            // Eraser logic: Paint with background color
            // Light mode bg: #f6f6f8, Dark mode bg: #101022
            ctx.strokeStyle = isDarkMode ? '#101022' : '#f6f6f8';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        } else {
            // Standard Pen
            ctx.strokeStyle = stroke.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();

        // Reset global settings
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);

        let initialWidth = brushSize;
        let initialColor = color;

        if (currentTool === ToolType.HIGHLIGHTER) {
            initialWidth = 20;
            initialColor = 'rgba(255, 255, 0)';
        } else if (currentTool === ToolType.ERASER) {
            initialColor = '#000000'; // Placeholder, actual color handled in drawStroke
            initialWidth = brushSize * 2;
        }

        const newStroke: Stroke = {
            points: [{ x, y, pressure: 0.5 }],
            color: initialColor,
            width: initialWidth,
            tool: currentTool
        };
        setStrokes([...strokes, newStroke]);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        if ('touches' in e) {
            // e.preventDefault(); 
        }

        const { x, y } = getCoordinates(e);
        const updatedStrokes = [...strokes];
        updatedStrokes[updatedStrokes.length - 1].points.push({ x, y, pressure: 0.5 });
        setStrokes(updatedStrokes);
    };

    const stopDrawing = () => setIsDrawing(false);

    // AI Features
    const handleOCR = async () => {
        if (!canvasRef.current) return;
        setIsProcessing(true);
        const base64 = canvasRef.current.toDataURL('image/png').split(',')[1];
        try {
            const text = await geminiService.transcribeHandwriting(base64);
            // Copy to clipboard instead of alert
            await navigator.clipboard.writeText(text);
            showToast.success("Transcribed text copied to clipboard!");
        } catch (e) {
            showToast.error("OCR Failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVeoAnimation = async () => {
        if (!canvasRef.current) return;
        setIsProcessing(true);
        const base64 = canvasRef.current.toDataURL('image/png').split(',')[1];
        try {
            // Ask user for prompt
            const userPrompt = window.prompt("Describe how you want to animate this diagram:", "Animate the flow of data in this chart");
            if (!userPrompt) { setIsProcessing(false); return; }

            const videoUrl = await geminiService.animateDiagram(base64, userPrompt);
            if (videoUrl) setGeneratedVideo(videoUrl);
        } catch (e) {
            console.error(e);
            showToast.error("Video generation failed or was cancelled.");
        } finally {
            setIsProcessing(false);
        }
    };

    const tools = [
        { id: ToolType.PEN, icon: 'edit', label: 'Pen' },
        { id: ToolType.CALLIGRAPHY, icon: 'gesture', label: 'Calligraphy' },
        { id: ToolType.WATERCOLOR, icon: 'brush', label: 'Watercolor' },
        { id: ToolType.HIGHLIGHTER, icon: 'ink_highlighter', label: 'Highlight' },
        { id: ToolType.ERASER, icon: 'ink_eraser', label: 'Eraser' },
    ];

    return (
        <div className="relative w-full h-full flex-1 overflow-hidden bg-background-light dark:bg-background-dark cursor-crosshair transition-colors duration-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none dot-grid opacity-10 dark:opacity-5 dark:invert"></div>

            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* Floating Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-float p-3 flex flex-col items-center gap-3 border border-border-color dark:border-gray-700">

                {/* Tools Row */}
                <div className="flex gap-1">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setCurrentTool(tool.id)}
                            title={tool.label}
                            className={`p-2 rounded-xl transition-all ${currentTool === tool.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">{tool.icon}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>

                {/* Properties Row */}
                <div className="flex items-center gap-4 w-full px-2">
                    {/* Size Slider */}
                    <div className="flex items-center gap-2 flex-1">
                        <span className="material-symbols-outlined text-gray-400 text-[16px]">circle</span>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            title={currentTool === ToolType.ERASER ? "Eraser Size" : "Brush Size"}
                        />
                        <span className="text-xs text-gray-400 w-4 text-center">{brushSize}</span>
                    </div>

                    {/* Color Picker (Hidden for Eraser) */}
                    {currentTool !== ToolType.ERASER && (
                        <div className="flex gap-1.5">
                            {[isDarkMode ? '#ffffff' : '#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`size-5 rounded-full border border-gray-200 dark:border-gray-600 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={handleOCR}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-soft border border-border-color dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-text-main dark:text-white transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-primary text-[20px]">{isProcessing ? 'hourglass_empty' : 'text_fields'}</span>
                    OCR
                </button>
                <button
                    onClick={handleVeoAnimation}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-soft border border-border-color dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-text-main dark:text-white transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-primary text-[20px]">{isProcessing ? 'hourglass_empty' : 'movie_filter'}</span>
                    Animate (Veo)
                </button>
            </div>

            {generatedVideo && (
                <div className="absolute bottom-4 right-4 w-64 bg-black rounded-lg shadow-xl overflow-hidden border-2 border-primary animate-in slide-in-from-bottom">
                    <div className="flex justify-between items-center p-2 bg-surface-dark text-white">
                        <span className="text-xs font-bold">Veo Generation</span>
                        <button onClick={() => setGeneratedVideo(null)}><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                    <video src={generatedVideo} controls autoPlay loop className="w-full aspect-video" />
                </div>
            )}
        </div>
    );
};

export default CanvasEditor;