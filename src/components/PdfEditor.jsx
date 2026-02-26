import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureOverlay from './SignatureOverlay';
import TextOverlay from './TextOverlay';
import { ChevronLeft, ChevronRight, Download, CheckCircle, ZoomIn, ZoomOut, Trash2, Plus, Type, PenSquare, Calendar } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfEditor = ({ file, signatureUrl, onChangeSignature, onFinalize }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [signatures, setSignatures] = useState([]);
    const [textElements, setTextElements] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [scale, setScale] = useState(1.1);
    const containerRef = useRef(null);
    const pageRef = useRef(null);

    const [finalPdfUrl, setFinalPdfUrl] = useState(null);

    // Ajout de la prop onFinalize
    // ...existing code...

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const addSignature = () => {
        if (!signatureUrl) return;
        const newSignature = {
            id: Date.now(),
            url: signatureUrl,
            page: pageNumber,
            x: 50,
            y: 50,
            width: 150,
            height: 75
        };
        setSignatures([...signatures, newSignature]);
    };

    const addText = (textValue = "Nouveau texte") => {
        const newText = {
            id: Date.now(),
            text: textValue,
            page: pageNumber,
            x: 100,
            y: 100,
            fontSize: 16,
            color: '#0f172a'
        };
        setTextElements([...textElements, newText]);
    };

    const addDate = () => {
        const today = new Date().toLocaleDateString('fr-FR');
        addText(today);
    };

    const removeSignature = (id) => {
        setSignatures(signatures.filter(s => s.id !== id));
    };

    const removeText = (id) => {
        setTextElements(textElements.filter(t => t.id !== id));
    };

    const updateSignaturePosition = (id, pos) => {
        setSignatures(signatures.map(s => s.id === id ? { ...s, ...pos } : s));
    };

    const updateTextPosition = (id, data) => {
        setTextElements(textElements.map(t => t.id === id ? { ...t, ...data } : t));
    };

    const clearAll = () => {
        if (window.confirm('Voulez-vous vraiment tout effacer ?')) {
            setSignatures([]);
            setTextElements([]);
        }
    };

    const finalizePdf = async () => {
        setIsProcessing(true);
        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // 1. Process Signatures
            for (const sig of signatures) {
                const response = await fetch(sig.url);
                const signatureBytes = await response.arrayBuffer();

                let signatureImage;
                if (sig.url.includes('image/jpeg') || sig.url.includes('image/jpg')) {
                    signatureImage = await pdfDoc.embedJpg(signatureBytes);
                } else {
                    signatureImage = await pdfDoc.embedPng(signatureBytes);
                }

                const targetPage = pages[sig.page - 1];
                const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

                const uiWidth = pdfWidth * scale;
                const uiHeight = pdfHeight * scale;

                const relX = sig.x / uiWidth;
                const relY = sig.y / uiHeight;
                const relW = sig.width / uiWidth;
                const relH = sig.height / uiHeight;

                targetPage.drawImage(signatureImage, {
                    x: relX * pdfWidth,
                    y: pdfHeight - (relY * pdfHeight) - (relH * pdfHeight),
                    width: relW * pdfWidth,
                    height: relH * pdfHeight,
                });
            }

            // 2. Process Text Elements
            for (const textItem of textElements) {
                const targetPage = pages[textItem.page - 1];
                const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

                const uiWidth = pdfWidth * scale;
                const uiHeight = pdfHeight * scale;

                const relX = textItem.x / uiWidth;
                const relY = textItem.y / uiHeight;

                // Adjust text size relative to PDF points
                const pdfFontSize = (textItem.fontSize / (uiWidth)) * pdfWidth;

                targetPage.drawText(textItem.text, {
                    x: relX * pdfWidth,
                    y: pdfHeight - (relY * pdfHeight) - pdfFontSize,
                    size: pdfFontSize,
                    font: helveticaFont,
                    color: rgb(0.06, 0.09, 0.16), // Dark slate-like color
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setFinalPdfUrl(url);

            const link = document.createElement('a');
            link.href = url;
            link.download = `signe_${file.name ? file.name.replace(/\.[^/.]+$/, "") : "document"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Délai de 1.5 seconde pour garantir que le fichier soit bien téléchargé 
            // par le navigateur completement avant d'entraîner l'actualisation de la page.
            setTimeout(() => {
                setIsProcessing(false);
                if (onFinalize) onFinalize(); // Cela exécute window.location.reload() dans App.jsx
            }, 1500);

        } catch (error) {
            console.error('PdfEditor Error:', error);
            alert(`Erreur: ${error.message}`);
            setIsProcessing(false);
        }
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.5));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4));

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center space-y-6 text-center">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2 shadow-inner">
                        <CheckCircle size={48} />
                    </div>

                    <div className="space-y-4 w-full">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">C'est signé !</h2>

                        <div className="h-px bg-slate-100 w-full my-6"></div>

                        <p className="text-xl font-bold text-slate-800">
                            Voulez-vous signer un autre document ?
                        </p>
                    </div>

                    <div className="w-full pt-4">
                        <button
                            onClick={() => {
                                // Nettoyage de l'url pour libérer la mémoire, puis rechargement de la page
                                if (finalPdfUrl) URL.revokeObjectURL(finalPdfUrl);
                                if (onFinalize) onFinalize();
                            }}
                            className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg"
                        >
                            <Plus size={24} />
                            Oui, signer un autre
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-300 px-6 py-3 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(pageNumber - 1)}
                            className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-3 text-sm font-bold text-slate-700 min-w-[100px] text-center">
                            {pageNumber} / {numPages || '-'}
                        </span>
                        <button
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber(pageNumber + 1)}
                            className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button onClick={zoomOut} className="p-2 hover:bg-white rounded-lg transition-all"><ZoomOut size={18} /></button>
                        <span className="px-2 text-xs font-black text-slate-500 w-10 text-center uppercase">{Math.round(scale * 100)}%</span>
                        <button onClick={zoomIn} className="p-2 hover:bg-white rounded-lg transition-all"><ZoomIn size={18} /></button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={addSignature}
                            disabled={!signatureUrl}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
                        >
                            <Plus size={18} /> Signature
                        </button>

                        <button
                            onClick={() => addText()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50"
                        >
                            <Type size={18} /> Texte
                        </button>

                        <button
                            onClick={addDate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50"
                        >
                            <Calendar size={18} /> Date
                        </button>

                        <button
                            onClick={onChangeSignature}
                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                            title="Modifier la signature"
                        >
                            <PenSquare size={18} />
                        </button>

                        <button
                            onClick={clearAll}
                            disabled={signatures.length === 0 && textElements.length === 0}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={finalizePdf}
                    disabled={(signatures.length === 0 && textElements.length === 0) || isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                    {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download size={20} />
                    )}
                    Finaliser PDF
                </button>
            </div>

            <div className="flex-1 overflow-auto p-12 flex justify-center bg-slate-200" ref={containerRef}>
                {!isFinished && (
                    <div className="relative mb-12 shadow-2xl bg-white" style={{ width: 'fit-content', height: 'fit-content' }}>
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="p-20 flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="font-bold text-slate-400">Préparation...</p>
                                </div>
                            }
                        >
                            <div className="relative" ref={pageRef}>
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />

                                {/* Signatures layer */}
                                {signatures.filter(s => s.page === pageNumber).map(sig => (
                                    <SignatureOverlay
                                        key={sig.id}
                                        imageUrl={sig.url}
                                        width={sig.width}
                                        height={sig.height}
                                        position={{ x: sig.x, y: sig.y }}
                                        onUpdate={(pos) => updateSignaturePosition(sig.id, pos)}
                                        onRemove={() => removeSignature(sig.id)}
                                    />
                                ))}

                                {/* Text layer */}
                                {textElements.filter(t => t.page === pageNumber).map(text => (
                                    <TextOverlay
                                        key={text.id}
                                        initialText={text.text}
                                        fontSize={text.fontSize}
                                        position={{ x: text.x, y: text.y }}
                                        onUpdate={(data) => updateTextPosition(text.id, data)}
                                        onRemove={() => removeText(text.id)}
                                    />
                                ))}
                            </div>
                        </Document>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 text-blue-400"><CheckCircle size={12} /> Mode Edition</span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-2">Double-clic sur le texte pour modifier</span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-2">Utilisez + et - pour la taille du texte</span>
            </div>
        </div>
    );
};

export default PdfEditor;
