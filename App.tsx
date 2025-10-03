
import React, { useState, useCallback } from 'react';
import type { CaseDetails, CaseType } from './types';
import { caseTypeLabels } from './types';
import { generateResume } from './services/geminiService';
import Header from './components/Header';
import InputField from './components/InputField';
import TextAreaField from './components/TextAreaField';
import ResumeOutput from './components/ResumeOutput';
import { GenerateIcon, ClearIcon } from './components/Icons';

const initialCaseState: CaseDetails = {
    caseType: '',
    executionApplicant: '',
    executionRespondent: '',
    applicantAttorney: '',
    powerOfAttorneyDate: '',
    pnNumber: '',
    pnDate: '',
    ptNumber: '',
    ptDate: '',
    maNumber: '',
    maDate: '',
    pkNumber: '',
    pkDate: '',
    verdict: '',
    executionObject: '',
    lelangNumber: '',
    lelangDate: '',
    lelangObject: '',
    shtNumber: '',
    shtDate: '',
    aphtNumber: '',
    aphtDate: '',
    htObject: '',
    remainingDebt: '',
    kpnName: 'Wahyu Budi Santoso, S.H., M.H.',
    paniteraName: '',
    plhPaniteraName: 'Nurhayani Butar Butar, S.H.',
    panmudName: 'Yuniar Rohmatullah, S.H., M.H.',
};


const App: React.FC = () => {
  const [caseDetails, setCaseDetails] = useState<CaseDetails>(initialCaseState);
  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setCaseDetails((prev) => {
        const newState = { ...prev, [name]: value };

        if (name === 'paniteraName' && value) {
            newState.plhPaniteraName = '';
        } else if (name === 'plhPaniteraName' && value) {
            newState.paniteraName = '';
        }
        return newState;
    });
  };
  
  const handleClear = () => {
    setCaseDetails(initialCaseState);
    setGeneratedResume('');
    setError(null);
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDetails.caseType) {
        setError('Silakan pilih jenis perkara terlebih dahulu.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResume('');

    try {
      const result = await generateResume(caseDetails);
      setGeneratedResume(result);
    } catch (err) {
      setError(
        'Gagal membuat resume. Pastikan API Key Anda valid dan coba lagi.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [caseDetails]);

  const isPutusan = caseDetails.caseType.startsWith('putusan');

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-700 mb-6">
              Detail Perkara
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-600">Para Pihak</h3>
                    <InputField
                        label="Pemohon Eksekusi"
                        name="executionApplicant"
                        value={caseDetails.executionApplicant}
                        onChange={handleInputChange}
                        placeholder="Nama lengkap atau badan hukum"
                        required
                    />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                            label="Nama Kuasa Pemohon (Opsional)" 
                            name="applicantAttorney" 
                            value={caseDetails.applicantAttorney} 
                            onChange={handleInputChange}
                            placeholder="Nama kuasa jika ada"
                        />
                        <InputField 
                            label="Tanggal Surat Kuasa (Opsional)" 
                            name="powerOfAttorneyDate" 
                            value={caseDetails.powerOfAttorneyDate} 
                            onChange={handleInputChange} 
                            type="date" 
                        />
                     </div>
                    <InputField
                        label="Termohon Eksekusi"
                        name="executionRespondent"
                        value={caseDetails.executionRespondent}
                        onChange={handleInputChange}
                        placeholder="Nama lengkap atau badan hukum"
                        required
                    />
                </div>

                <div className="space-y-2 p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-600">Dasar Permohonan</h3>
                     <div>
                      <label htmlFor="caseType" className="block text-sm font-medium text-slate-600 mb-2">
                        Jenis Perkara
                      </label>
                      <select
                        id="caseType"
                        name="caseType"
                        value={caseDetails.caseType}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      >
                        {Object.entries(caseTypeLabels).map(([value, label]) => (
                            <option key={value} value={value} disabled={value === ''}>
                                {label}
                            </option>
                        ))}
                      </select>
                    </div>

                    {isPutusan && (
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Putusan PN" name="pnNumber" value={caseDetails.pnNumber} onChange={handleInputChange} placeholder="cth: 123/Pdt.G/2023/PN.Bdg" required />
                                <InputField label="Tanggal Putusan PN" name="pnDate" value={caseDetails.pnDate} onChange={handleInputChange} type="date" required/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Putusan PT (Opsional)" name="ptNumber" value={caseDetails.ptNumber} onChange={handleInputChange} />
                                <InputField label="Tanggal Putusan PT (Opsional)" name="ptDate" value={caseDetails.ptDate} onChange={handleInputChange} type="date" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Putusan Kasasi (Opsional)" name="maNumber" value={caseDetails.maNumber} onChange={handleInputChange} />
                                <InputField label="Tanggal Putusan Kasasi (Opsional)" name="maDate" value={caseDetails.maDate} onChange={handleInputChange} type="date" />
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Putusan PK (Opsional)" name="pkNumber" value={caseDetails.pkNumber} onChange={handleInputChange} />
                                <InputField label="Tanggal Putusan PK (Opsional)" name="pkDate" value={caseDetails.pkDate} onChange={handleInputChange} type="date" />
                            </div>
                            <TextAreaField label="Amar Putusan / Penghukuman" name="verdict" value={caseDetails.verdict} onChange={handleInputChange} rows={5} required placeholder="Salin amar putusan yang bersifat menghukum (condemnatoir)..." />
                            <TextAreaField label="Objek Eksekusi" name="executionObject" value={caseDetails.executionObject} onChange={handleInputChange} rows={3} required placeholder="Jelaskan objek yang akan dieksekusi..." />
                        </div>
                    )}

                    {caseDetails.caseType === 'risalah-lelang' && (
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Risalah Lelang" name="lelangNumber" value={caseDetails.lelangNumber} onChange={handleInputChange} required />
                                <InputField label="Tanggal Risalah Lelang" name="lelangDate" value={caseDetails.lelangDate} onChange={handleInputChange} type="date" required />
                            </div>
                            <TextAreaField label="Objek Lelang" name="lelangObject" value={caseDetails.lelangObject} onChange={handleInputChange} rows={4} required placeholder="Jelaskan objek yang telah dilelang..."/>
                        </div>
                    )}

                    {caseDetails.caseType === 'hak-tanggungan' && (
                        <div className="space-y-4 pt-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Sertipikat Hak Tanggungan (SHT)" name="shtNumber" value={caseDetails.shtNumber} onChange={handleInputChange} required />
                                <InputField label="Tanggal SHT" name="shtDate" value={caseDetails.shtDate} onChange={handleInputChange} type="date" required />
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Nomor Akta Pemberian HT (APHT)" name="aphtNumber" value={caseDetails.aphtNumber} onChange={handleInputChange} required />
                                <InputField label="Tanggal APHT" name="aphtDate" value={caseDetails.aphtDate} onChange={handleInputChange} type="date" required />
                            </div>
                             <InputField label="Sisa Hutang" name="remainingDebt" value={caseDetails.remainingDebt} onChange={handleInputChange} required placeholder="cth: Rp500.000.000,- (lima ratus juta rupiah)" />
                             <TextAreaField label="Objek Hak Tanggungan" name="htObject" value={caseDetails.htObject} onChange={handleInputChange} rows={4} required placeholder="Jelaskan objek hak tanggungan..."/>
                        </div>
                    )}
                </div>

                <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-600">Penandatangan</h3>
                    <InputField
                        label="Ketua Pengadilan Negeri Bandung"
                        name="kpnName"
                        value={caseDetails.kpnName}
                        onChange={handleInputChange}
                        required
                    />
                    <InputField
                        label="Panitera (jika definitif)"
                        name="paniteraName"
                        value={caseDetails.paniteraName}
                        onChange={handleInputChange}
                        placeholder="Kosongkan jika Plh. diisi"
                    />
                    <InputField
                        label="Plh. Panitera"
                        name="plhPaniteraName"
                        value={caseDetails.plhPaniteraName}
                        onChange={handleInputChange}
                        placeholder="Kosongkan jika Panitera diisi"
                    />
                    <InputField
                        label="Panitera Muda Perdata"
                        name="panmudName"
                        value={caseDetails.panmudName}
                        onChange={handleInputChange}
                        required
                    />
                </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    <ClearIcon />
                    Bersihkan
                  </button>
                <button
                  type="submit"
                  disabled={isLoading || !caseDetails.caseType}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  <GenerateIcon />
                  {isLoading ? 'Membuat Resume...' : 'Buat Resume'}
                </button>
              </div>
            </form>
          </div>
          <div className="sticky top-8">
            <ResumeOutput 
              resume={generatedResume} 
              isLoading={isLoading}
              error={error}
              caseDetails={caseDetails}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
