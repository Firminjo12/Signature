import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';

const SignatureOverlay = ({ imageUrl, onRemove, onUpdate, width = 200, height = 100, position = { x: 0, y: 0 } }) => {
    const [size, setSize] = useState({ width, height });

    // Use motion values for smooth dragging and state synchronization
    const x = useMotionValue(position.x);
    const y = useMotionValue(position.y);

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
            style={{ x, y, width: size.width, height: size.height }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 left-0 cursor-move group select-none touch-none z-20"
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
                />

                {/* Resize Handle */}
                <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-nwse-resize shadow-lg"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startWidth = size.width;

                        const handleMouseMove = (moveEvent) => {
                            const delta = moveEvent.clientX - startX;
                            const newWidth = Math.max(50, startWidth + delta);
                            const newHeight = newWidth * (height / width); // Use initial aspect ratio
                            setSize({ width: newWidth, height: newHeight });
                            onUpdate({ x: x.get(), y: y.get(), width: newWidth, height: newHeight });
                        };

                        const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                    }}
                >
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
            </div>
        </motion.div>
    );
};

export default SignatureOverlay;
