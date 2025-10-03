import React, { useState, useEffect } from 'react';
import { Packer, Document, Paragraph, TextRun, AlignmentType, Numbering, Indent } from 'docx';
import saveAs from 'file-saver';
import { CopyIcon, CheckIcon, WarningIcon, SaveIcon } from './Icons';
import type { CaseDetails } from '../types';
import { caseTypeLabels } from '../types';


interface ResumeOutputProps {
  resume: string;
  isLoading: boolean;
  error: string | null;
  caseDetails: CaseDetails;
}

const ResumeOutput: React.FC<ResumeOutputProps> = ({ resume, isLoading, error, caseDetails }) => {
    const [isCopied, setIsCopied] = useState(false);

    // This regex finds lines that are entirely bolded with markdown (e.g., "**TITLE**")
    // and removes the asterisks. The 'g' flag ensures all such lines are affected,
    // and 'm' allows '^' and '$' to match the start/end of lines.
    const cleanedResume = resume.replace(/^\s*\*\*(.*)\*\*\s*$/gm, '$1');

    useEffect(() => {
        if(isCopied){
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = () => {
        if (cleanedResume) {
            navigator.clipboard.writeText(cleanedResume);
            setIsCopied(true);
        }
    }

    const handleSaveAsDocx = () => {
        if (!cleanedResume) return;
        
        const caseTypeLabel = caseDetails ? caseTypeLabels[caseDetails.caseType] || 'Eksekusi' : 'Eksekusi';
        const applicantName = caseDetails ? caseDetails.executionApplicant.trim() || 'Pemohon' : 'Pemohon';
        const filename = `Resume - ${caseTypeLabel} - ${applicantName}.docx`;


        const signatoryTitles = [
            'Panitera Muda Perdata,',
            'Plh. Panitera,',
            'Panitera,',
            'Ketua Pengadilan Negeri Bandung,',
        ];

        const signatoryNames = [
            caseDetails.kpnName,
            caseDetails.paniteraName,
            caseDetails.plhPaniteraName,
            caseDetails.panmudName,
        ].filter(Boolean);
        
        const lines = cleanedResume.split('\n');
        const paragraphs: Paragraph[] = [];
        
        const pemohonRegex = /, sebagai Pemohon Eksekusi;$/;
        const termohonRegex = /, sebagai Termohon Eksekusi;$/;
        const melawanString = 'Melawan';

        const mainNumberedListRegex = /^\d+\.\s+/;
        const letteredListRegex = /^[a-z]\.\s+/;
        const bulletListRegex = /^-\s+/;
        
        let applyTelaahIndent = false;
        let titleFound = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (!titleFound) {
                if (trimmedLine) { // This is the first non-empty line
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: trimmedLine, bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 360 },
                    }));
                    titleFound = true;
                } else { // This is an empty line before the title
                    paragraphs.push(new Paragraph({ text: '' }));
                }
                continue; // Move to the next line
            }

            const isSignatoryTitle = signatoryTitles.includes(trimmedLine);
            const isSignatoryName = signatoryNames.includes(trimmedLine);

            if (pemohonRegex.test(trimmedLine) || termohonRegex.test(trimmedLine) || trimmedLine === melawanString) {
                paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine)],
                    alignment: AlignmentType.CENTER,
                }));
                applyTelaahIndent = false;
                continue;
            }

            if (isSignatoryTitle || isSignatoryName) {
                paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine)],
                    alignment: AlignmentType.CENTER,
                }));
                applyTelaahIndent = false;
                continue;
            }
            
            if (mainNumberedListRegex.test(trimmedLine)) {
                const text = trimmedLine.replace(mainNumberedListRegex, '');
                paragraphs.push(new Paragraph({
                    children: [new TextRun(text)],
                    numbering: { reference: "default-numbering", level: 0 },
                    alignment: AlignmentType.JUSTIFIED,
                }));

                if (text.startsWith('Hasil Penelaahan Panitera') || text.startsWith('Pertimbangan Ketua Pengadilan Negeri Bandung')) {
                    applyTelaahIndent = true;
                } else {
                    applyTelaahIndent = false;
                }
            } else if (letteredListRegex.test(trimmedLine)) {
                 paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine.replace(letteredListRegex, ''))],
                    numbering: { reference: "default-numbering", level: 1 },
                    alignment: AlignmentType.JUSTIFIED,
                }));
                applyTelaahIndent = false;
            } else if (bulletListRegex.test(trimmedLine)) {
                 paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine.replace(bulletListRegex, ''))],
                    numbering: { reference: "default-numbering", level: 2 },
                    alignment: AlignmentType.JUSTIFIED,
                }));
                applyTelaahIndent = false;
            } else if (applyTelaahIndent && trimmedLine) {
                 paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine)],
                    alignment: AlignmentType.JUSTIFIED,
                    indent: { left: 720 },
                }));
            } else if(trimmedLine) {
                paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine)],
                    alignment: AlignmentType.JUSTIFIED,
                }));
            } else {
                paragraphs.push(new Paragraph({ text: '' }));
            }
        }

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: 'Arial',
                            size: 24, // 12pt
                        },
                    },
                },
            },
            numbering: {
                config: [
                    {
                        reference: 'default-numbering',
                        levels: [
                            {
                                level: 0,
                                format: 'decimal',
                                text: '%1.',
                                alignment: AlignmentType.START,
                                style: { paragraph: { indent: { left: 360, hanging: 360 } } },
                            },
                            {
                                level: 1,
                                format: 'lowerLetter',
                                text: '%2.',
                                alignment: AlignmentType.START,
                                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                            },
                            {
                                level: 2,
                                format: 'bullet',
                                text: '•',
                                alignment: AlignmentType.START,
                                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                            },
                        ],
                    },
                ],
            },
            sections: [{
                children: paragraphs,
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, filename);
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
        if (cleanedResume) {
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
                        {cleanedResume}
                    </pre>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
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