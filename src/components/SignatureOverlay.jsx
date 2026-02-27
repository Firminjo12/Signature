import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';

const SignatureOverlay = ({ imageUrl, onRemove, onUpdate, onSelect, width = 200, height = 100, position = { x: 0, y: 0 }, opacity = 1, isSelected = false }) => {
    const [size, setSize] = useState({ width, height });

    // Use motion values for smooth dragging and state synchronization
    const x = useMotionValue(position.x);
    const y = useMotionValue(position.y);

    // Sync with props when they change (e.g. zoom)
    useEffect(() => {
        x.set(position.x);
        y.set(position.y);
    }, [position.x, position.y, x, y]);

    useEffect(() => {
        setSize({ width, height });
    }, [width, height]);

    const handleDragEnd = () => {
        onUpdate({
            x: x.get(),
            y: y.get(),
            width: size.width,
            height: size.height
        });
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onPointerDown={onSelect}
            style={{ x, y, width: size.width, height: size.height, opacity, zIndex: isSelected ? 40 : 20 }}
            onDragEnd={handleDragEnd}
            className={`absolute top-0 left-0 cursor-move group select-none touch-none ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
        >
            <div className="relative w-full h-full border-2 border-transparent group-hover:border-blue-500 rounded-lg p-1 transition-colors bg-white/10">
                {/* Toolbar */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-2 bg-white shadow-xl border border-slate-200 rounded-full px-3 py-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-200" />
                    <GripVertical size={16} className="text-slate-400" />
                </div>

                <img
                    src={imageUrl}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none"
                    style={{ filter: 'contrast(1.4) brightness(0.8)' }} // Augmente la "noirceur" visuelle
                />

                {/* Resize Handle - Larger and touch-friendly */}
                <div
                    className={`absolute -bottom-2 -right-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-nwse-resize shadow-xl z-30 transition-opacity ${isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = size.width;
                        const startHeight = size.height;

                        const handlePointerMove = (moveEvent) => {
                            // Calculate delta based on whichever dimension changed more to keep it natural
                            const deltaX = moveEvent.clientX - startX;
                            const newWidth = Math.max(60, startWidth + deltaX);

                            // Maintain aspect ratio
                            const aspectRatio = height / width;
                            const newHeight = newWidth * aspectRatio;

                            setSize({ width: newWidth, height: newHeight });
                            onUpdate({
                                x: x.get(),
                                y: y.get(),
                                width: newWidth,
                                height: newHeight
                            });
                        };

                        const handlePointerUp = () => {
                            window.removeEventListener('pointermove', handlePointerMove);
                            window.removeEventListener('pointerup', handlePointerUp);
                        };

                        window.addEventListener('pointermove', handlePointerMove);
                        window.addEventListener('pointerup', handlePointerUp);
                    }}
                >
                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner" />
                </div>
            </div>
        </motion.div>
    );
};

export default SignatureOverlay;
