import React, { useState, useEffect } from 'react';
import FileDropzone from './components/FileDropzone';
import SignaturePad from './components/SignaturePad';
import PdfEditor from './components/PdfEditor';
import { PenTool, FileText, Download, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Signature, 3: Editor

  // Initialisation du mode sombre depuis le localStorage ou système
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (!signatureUrl) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleSignatureSave = (url) => {
    console.log("App: Signature reçue, passage à l'étape 3...");
    setSignatureUrl(url);
    if (file) {
      setStep(3);
    } else {
      setStep(1);
    }
  };

  const reset = () => {
    setFile(null);
    setSignatureUrl(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar simplifiée sans animations */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SignFlow Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-100" />
            <span className="text-xl font-black text-slate-900 tracking-tight">
              SignFlow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[
              { id: 1, label: 'Upload' },
              { id: 2, label: 'Signature' },
              { id: 3, label: 'Éditeur' }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {s.id}
                </div>
                <span className={`text-sm font-semibold ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>{s.label}</span>
                {s.id < 3 && <div className="w-4 h-px bg-slate-200 ml-2" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={reset}
              className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Rendu conditionnel direct sans Framer Motion pour la stabilité */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Signez vos PDF <br />
                  <span className="text-blue-600">simplement.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                  Votre document ne quitte jamais votre ordinateur. Sécurité et rapidité garanties.
                </p>
              </div>
              <FileDropzone onFileSelect={handleFileSelect} selectedFile={file} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex items-center justify-center p-8 bg-slate-100/50">
            <div className="max-w-2xl w-full">
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => file ? setStep(3) : setStep(1)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 h-full">
            <PdfEditor
              file={file}
              signatureUrl={signatureUrl}
              onChangeSignature={() => setStep(2)}
              onFinalize={reset}
            />
          </div>
        )}
      </main>

      {step < 3 && (
        <footer className="bg-white border-t border-slate-100 px-8 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 SignFlow</p>
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
              <AlertCircle size={14} />
              100% Hors-ligne : Confidentialité totale
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
