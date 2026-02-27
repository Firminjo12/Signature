import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { X, GripVertical, Check, Type } from 'lucide-react';

const TextOverlay = ({ initialText, onRemove, onUpdate, position = { x: 0, y: 0 }, fontSize = 16, color = '#0f172a' }) => {
    const [text, setText] = useState(initialText);
    const [isEditing, setIsEditing] = useState(false);
    const [size, setSize] = useState({ fontSize });
    const inputRef = useRef(null);

    const x = useMotionValue(position.x);
    const y = useMotionValue(position.y);

    // Sync with props when they change (e.g. zoom)
    useEffect(() => {
        x.set(position.x);
        y.set(position.y);
    }, [position.x, position.y, x, y]);

    useEffect(() => {
        setSize({ fontSize });
    }, [fontSize]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDragEnd = () => {
        onUpdate({
            x: x.get(),
            y: y.get(),
            text,
            fontSize: size.fontSize
        });
    };

    const handleBlur = () => {
        setIsEditing(false);
        onUpdate({ x: x.get(), y: y.get(), text, fontSize: size.fontSize });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <motion.div
            drag={!isEditing}
            dragMomentum={false}
            style={{ x, y }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 left-0 z-30 group select-none touch-none"
        >
            <div className={`relative px-3 py-1.5 border-2 rounded-lg transition-all ${isEditing ? 'border-blue-500 bg-white shadow-lg' : 'border-transparent hover:border-blue-400 hover:bg-white/50'}`}>
                {/* Actions */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-2 bg-white shadow-xl border border-slate-200 rounded-full px-3 py-1">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Modifier le texte"
                        >
                            <Type size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleBlur}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        >
                            <Check size={16} />
                        </button>
                    )}
                    <div className="w-px h-4 bg-slate-200" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                    {!isEditing && (
                        <>
                            <div className="w-px h-4 bg-slate-200" />
                            <GripVertical size={16} className="text-slate-400" />
                        </>
                    )}
                </div>

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none font-medium min-w-[50px] text-slate-900"
                        style={{ fontSize: `${size.fontSize}px` }}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditing(true)}
                        className="font-medium text-slate-900 cursor-text whitespace-nowrap"
                        style={{ fontSize: `${size.fontSize}px` }}
                    >
                        {text || "Texte ici..."}
                    </div>
                )}

                {/* Font Size Adjusters */}
                {!isEditing && (
                    <div className="absolute -right-12 top-0 flex flex-col gap-1 hidden group-hover:flex">
                        <button
                            onClick={() => {
                                setSize({ fontSize: size.fontSize + 2 });
                                onUpdate({ x: x.get(), y: y.get(), text, fontSize: size.fontSize + 2 });
                            }}
                            className="w-6 h-6 bg-white border border-slate-200 rounded shadow hover:bg-slate-50 flex items-center justify-center text-xs font-bold"
                        >
                            +
                        </button>
                        <button
                            onClick={() => {
                                setSize({ fontSize: Math.max(8, size.fontSize - 2) });
                                onUpdate({ x: x.get(), y: y.get(), text, fontSize: Math.max(8, size.fontSize - 2) });
                            }}
                            className="w-6 h-6 bg-white border border-slate-200 rounded shadow hover:bg-slate-50 flex items-center justify-center text-xs font-bold"
                        >
                            -
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TextOverlay;
