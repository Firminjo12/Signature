import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const FileDropzone = ({ onFileSelect, selectedFile }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            onFileSelect(file);
        }
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative group cursor-pointer transition-all duration-300",
                "border-2 border-dashed rounded-3xl p-12 text-center",
                isDragging
                    ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
            )}
        >
            <input
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-4">
                <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                    selectedFile ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                )}>
                    {selectedFile ? <FileText size={40} /> : <Upload size={40} />}
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">
                        {selectedFile ? selectedFile.name : "Importer votre PDF"}
                    </h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                        {selectedFile
                            ? "Document prêt pour la signature"
                            : "Glissez-déposez votre fichier ici ou cliquez pour parcourir vos dossiers"}
                    </p>
                </div>

                {selectedFile && (
                    <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 size={18} />
                        Fichier sélectionné
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileDropzone;
export { cn };
