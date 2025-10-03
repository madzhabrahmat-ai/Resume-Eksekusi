
export type CaseType =
  | 'putusan-pengosongan'
  | 'putusan-pembayaran'
  | 'putusan-melakukan-sesuatu'
  | 'risalah-lelang'
  | 'hak-tanggungan'
  | '';

export const caseTypeLabels: Record<string, string> = {
  '': 'Pilih Jenis Perkara...',
  'putusan-pengosongan': 'Putusan - Pengosongan',
  'putusan-pembayaran': 'Putusan - Pembayaran Sejumlah Uang',
  'putusan-melakukan-sesuatu': 'Putusan - Melakukan Sesuatu',
  'risalah-lelang': 'Risalah Lelang',
  'hak-tanggungan': 'Hak Tanggungan',
};

export interface CaseDetails {
  caseType: CaseType;
  executionApplicant: string;
  executionRespondent: string;
  applicantAttorney: string;
  powerOfAttorneyDate: string;

  // For Putusan types
  pnNumber: string;
  pnDate: string;
  ptNumber: string;
  ptDate: string;
  maNumber: string;
  maDate: string;
  pkNumber: string;
  pkDate: string;
  verdict: string; 
  executionObject: string;

  // For Risalah Lelang
  lelangNumber: string;
  lelangDate: string;
  lelangObject: string;

  // For Hak Tanggungan
  shtNumber: string;
  shtDate: string;
  aphtNumber: string;
  aphtDate: string;
  htObject: string;
  remainingDebt: string;

  // Signatories
  kpnName: string;
  paniteraName: string;
  plhPaniteraName: string;
  panmudName: string;
}
