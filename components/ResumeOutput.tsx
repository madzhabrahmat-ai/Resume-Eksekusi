
import React, { useState, useEffect } from 'react';
import { Packer, Document, Paragraph } from 'docx';
import saveAs from 'file-saver';
import { CopyIcon, CheckIcon, WarningIcon, SaveIcon } from './Icons';

interface ResumeOutputProps {
  resume: string;
  isLoading: boolean;
  error: string | null;
}

const ResumeOutput: React.FC<ResumeOutputProps> = ({ resume, isLoading, error }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if(isCopied){
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = () => {
        if (resume) {
            navigator.clipboard.writeText(resume);
            setIsCopied(true);
        }
    }

    const handleSaveAsDocx = () => {
        if (!resume) return;

        const paragraphs = resume.split('\n').map(
            (text) => new Paragraph({ text })
        );

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'resume-perkara-eksekusi.docx');
        });
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-slate-200 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500">AI sedang bekerja membuat resume...</p>
                </div>
            )
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <WarningIcon />
                    <p className="mt-4 text-red-600 font-semibold">Terjadi Kesalahan</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                </div>
            )
        }
        if (resume) {
            return (
                <div className="relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button 
                            onClick={handleSaveAsDocx}
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Unduh sebagai Word (.docx)"
                        >
                            <SaveIcon />
                        </button>
                        <button 
                            onClick={handleCopy}
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Salin ke Clipboard"
                        >
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed p-6">
                        {resume}
                    </pre>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-700">Resume Akan Ditampilkan Disini</h3>
                <p className="text-slate-500 mt-2">
                    Isi detail perkara di sebelah kiri dan klik "Buat Resume" untuk memulai.
                </p>
            </div>
        )
    }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
             <h2 className="text-2xl font-bold text-slate-700">
              Hasil Resume
            </h2>
        </div>
        <div className="prose max-w-none">
           {renderContent()}
        </div>
    </div>
  );
};

export default ResumeOutput;