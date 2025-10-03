import { GoogleGenAI } from "@google/genai";
import type { CaseDetails } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Consolidated and robust date formatting function.
// It directly converts YYYY-MM-DD to DD/MM/YYYY and handles other cases gracefully.
const ensureDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    
    // Primary case: input from date picker is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // Fallback: if it's somehow already in DD/MM/YYYY, leave it.
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }

    // If the format is unknown or invalid, return an empty string to prevent errors.
    return '';
}


export async function generateResume(details: CaseDetails): Promise<string> {
    // Create a new object with all dates guaranteed to be in dd/mm/yyyy format or empty string
    const d = {
        ...details,
        powerOfAttorneyDate: ensureDDMMYYYY(details.powerOfAttorneyDate),
        pnDate: ensureDDMMYYYY(details.pnDate),
        ptDate: ensureDDMMYYYY(details.ptDate),
        maDate: ensureDDMMYYYY(details.maDate),
        pkDate: ensureDDMMYYYY(details.pkDate),
        lelangDate: ensureDDMMYYYY(details.lelangDate),
        shtDate: ensureDDMMYYYY(details.shtDate),
        aphtDate: ensureDDMMYYYY(details.aphtDate),
    };
    
  let prompt = '';

  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const applicant = d.applicantAttorney && d.powerOfAttorneyDate
    ? `${d.executionApplicant} / Kuasanya ${d.applicantAttorney} berdasarkan Surat Kuasa tanggal ${d.powerOfAttorneyDate}`
    : d.executionApplicant;

  const paniteraTitle = d.paniteraName ? 'Panitera,' : 'Plh. Panitera,';
  const paniteraName = d.paniteraName || d.plhPaniteraName;


  switch (d.caseType) {
    case 'hak-tanggungan':
      prompt = `
        Anda adalah asisten hukum ahli. Buat "RESUME PERKARA EKSEKUSI" untuk eksekusi Hak Tanggungan di Pengadilan Negeri Bandung berdasarkan data berikut. Gunakan bahasa hukum yang formal dan baku.

        **Data untuk diisi:**
        - Tanggal Permohonan: ${formattedDate}
        - Pemohon Eksekusi (atau Kuasanya): ${applicant}
        - Termohon Eksekusi: ${d.executionRespondent}
        - Nomor SHT: ${d.shtNumber}
        - Tanggal SHT: ${d.shtDate}
        - Nomor APHT: ${d.aphtNumber}
        - Tanggal APHT: ${d.aphtDate}
        - Objek Hak Tanggungan: ${d.htObject}
        - Sisa Hutang: ${d.remainingDebt}
        - Nama Panmud: ${d.panmudName}
        - Nama Panitera/Plh. Panitera: ${paniteraName}
        - Nama KPN: ${d.kpnName}

        **Format Output (WAJIB DIIKUTI):**
        RESUME PERKARA EKSEKUSI

        Telah membaca :
        1. Surat permohonan pemohon eksekusi tanggal ${formattedDate} dari ${applicant}, yang pada pokoknya memohon Ketua Pengadilan Negeri Bandung untuk melaksanakan eksekusi berdasarkan Sertipikat Hak Tanggungan Nomor ${d.shtNumber} tanggal ${d.shtDate}, memohon supaya ${d.executionRespondent} datang menghadap Ketua Pengadilan Negeri Bandung untuk dilakukan peneguran/aanmaning oleh Ketua tersebut, agar mereka termohon eksekusi dalam waktu 8 (delapan) hari sejak tanggal peneguran tersebut segera membayar kewajiban hutang kepada Pemohon Eksekusi;

        2. Berkas Perkara Perdata:
        a. Sertipikat Hak Tanggungan Nomor ${d.shtNumber} tanggal ${d.shtDate};
        b. Akta Pemberian Hak Tanggungan Nomor ${d.aphtNumber} tanggal ${d.aphtDate}

        3. Telaah Panitera Muda Perdata (terhadap berkas perkara):
        - Bahwa objek hak tanggungan berupa: ${d.htObject};
        - Bahwa Pemohon Eksekusi telah melampirkan berkas berupa Salinan Akta Pemberian Hak Tanggungan Nomor ${d.aphtNumber} tanggal ${d.aphtDate} dan Fotocopy Sertipikat Hak Tanggungan Nomor ${d.shtNumber} tanggal ${d.shtDate} yang telah dilegalisir pejabat yang berwenang;
        - Bahwa obyek perkara tersebut berada dalam wilayah hukum Pengadilan Negeri Bandung;
        - Bahwa Termohon Eksekusi hingga saat ini tidak melakukan pembayaran atas sisa hutangnya kepada Pemohon Eksekusi sebesar ${d.remainingDebt};
        - Bahwa apabila Termohon Eksekusi tidak membayar kewajibannya, maka objek hak tanggungan tersebut akan dilakukan pelelangan guna memenuhi kewajiban sisa hutang Termohon Eksekusi kepada Pemohon Eksekusi sebatas pada sisa hutang sebesar ${d.remainingDebt}.

        Panitera Muda Perdata,


        ${d.panmudName}

        4. Hasil Penelaahan Panitera:
        [Telaah Panitera]

        ${paniteraTitle}


        ${paniteraName}

        5. Pertimbangan Ketua Pengadilan Negeri Bandung:
        [Telaah KPN]

        Ketua Pengadilan Negeri Bandung,


        ${d.kpnName}
      `;
      break;

    case 'risalah-lelang':
      prompt = `
        Anda adalah asisten hukum ahli. Buat "RESUME PERKARA EKSEKUSI" untuk eksekusi Risalah Lelang di Pengadilan Negeri Bandung berdasarkan data berikut. Gunakan bahasa hukum yang formal dan baku.

        **Data untuk diisi:**
        - Tanggal Permohonan: ${formattedDate}
        - Pemohon Eksekusi (atau Kuasanya): ${applicant}
        - Termohon Eksekusi: ${d.executionRespondent}
        - Nomor Risalah Lelang: ${d.lelangNumber}
        - Tanggal Risalah Lelang: ${d.lelangDate}
        - Objek Lelang: ${d.lelangObject}
        - Nama Panmud: ${d.panmudName}
        - Nama Panitera/Plh. Panitera: ${paniteraName}
        - Nama KPN: ${d.kpnName}

        **Format Output (WAJIB DIIKUTI):**
        RESUME PERKARA EKSEKUSI

        Telah membaca :
        1. Surat permohonan pemohon eksekusi tanggal ${formattedDate} dari ${applicant}, yang pada pokoknya memohon Ketua Pengadilan Negeri Bandung untuk melaksanakan eksekusi berdasarkan Grose Risalah Lelang Nomor ${d.lelangNumber} tanggal ${d.lelangDate}, memohon supaya ${d.executionRespondent} datang menghadap Ketua Pengadilan Negeri Bandung untuk dilakukan peneguran/aanmaning oleh Ketua tersebut, agar mereka termohon eksekusi dalam waktu 8 (delapan) hari sejak tanggal peneguran tersebut segera mengosongkan dan menyerahkan objek yang telah laku di lelang kepada Pemohon Eksekusi;

        2. Berkas Perkara Perdata:
        a. Grose Risalah Lelang Nomor ${d.lelangNumber} tanggal ${d.lelangDate};

        3. Telaah Panitera Muda Perdata (terhadap berkas perkara):
        - Bahwa objek lelang berupa: ${d.lelangObject};
        - Bahwa Pemohon Eksekusi telah melampirkan berkas berupa Salinan Grose Risalah Lelang Nomor ${d.lelangNumber} tanggal ${d.lelangDate} yang telah dilegalisir pejabat yang berwenang;
        - Bahwa obyek perkara tersebut berada dalam wilayah hukum Pengadilan Negeri Bandung;
        - Bahwa Termohon Eksekusi hingga saat ini tidak mengosongkan dan menyerahkan objek yang telah laku di lelang kepada Pemohon Eksekusi secara sukarela.

        Panitera Muda Perdata,


        ${d.panmudName}

        4. Hasil Penelaahan Panitera:
        [Telaah Panitera]

        ${paniteraTitle}


        ${paniteraName}

        5. Pertimbangan Ketua Pengadilan Negeri Bandung:
        [Telaah KPN]

        Ketua Pengadilan Negeri Bandung,


        ${d.kpnName}
      `;
      break;

    case 'putusan-pengosongan':
    case 'putusan-pembayaran':
    case 'putusan-melakukan-sesuatu':
        const putusanJo = [
            d.ptNumber && d.ptDate && `jo. Putusan Pengadilan Tinggi Bandung Nomor ${d.ptNumber} tanggal ${d.ptDate}`,
            d.maNumber && d.maDate && `jo. Putusan Mahkamah Agung RI Nomor ${d.maNumber} tanggal ${d.maDate}`,
            d.pkNumber && d.pkDate && `jo. Putusan Mahkamah Agung RI Nomor ${d.pkNumber} tanggal ${d.pkDate}`,
        ].filter(Boolean).join(' ');

        let berkasPerkara = `a. Putusan Pengadilan Negeri Bandung Nomor ${d.pnNumber}, tanggal ${d.pnDate};`;
        if (d.ptNumber && d.ptDate) berkasPerkara += `\nb. Putusan Pengadilan Tinggi Bandung Nomor ${d.ptNumber}, tanggal ${d.ptDate};`;
        if (d.maNumber && d.maDate) berkasPerkara += `\nc. Putusan Mahkamah Agung RI Nomor ${d.maNumber}, tanggal ${d.maDate};`;
        if (d.pkNumber && d.pkDate) berkasPerkara += `\nd. Putusan Mahkamah Agung RI Nomor ${d.pkNumber}, tanggal ${d.pkDate};`;

      prompt = `
        Anda adalah asisten hukum ahli. Buat "RESUME PERKARA EKSEKUSI" untuk eksekusi Putusan Pengadilan di Pengadilan Negeri Bandung berdasarkan data berikut. Gunakan bahasa hukum yang formal dan baku.

        **Data untuk diisi:**
        - Tanggal Permohonan: ${formattedDate}
        - Pemohon Eksekusi (atau Kuasanya): ${applicant}
        - Termohon Eksekusi: ${d.executionRespondent}
        - Putusan: Putusan Pengadilan Negeri Bandung Nomor ${d.pnNumber} tanggal ${d.pnDate} ${putusanJo}
        - Berkas Perkara: ${berkasPerkara}
        - Amar Putusan / Penghukuman: ${d.verdict}
        - Objek Perkara: ${d.executionObject}
        - Nama Panmud: ${d.panmudName}
        - Nama Panitera/Plh. Panitera: ${paniteraName}
        - Nama KPN: ${d.kpnName}
        
        **Format Output (WAJIB DIIKUTI):**
        RESUME PERKARA EKSEKUSI

        Telah membaca :
        1. Surat permohonan pemohon eksekusi tanggal ${formattedDate} dari ${applicant}, yang pada pokoknya memohon Ketua Pengadilan Negeri Bandung untuk melaksanakan eksekusi Putusan Pengadilan Negeri Bandung Nomor ${d.pnNumber} tanggal ${d.pnDate} ${putusanJo}, yang telah mempunyai kekuatan hukum tetap, memohon supaya ${d.executionRespondent} datang menghadap Ketua Pengadilan Negeri Bandung untuk dilakukan peneguran/aanmaning oleh Ketua tersebut, agar mereka termohon eksekusi dalam waktu 8 (delapan) hari sejak tanggal peneguran tersebut segera melaksanakan putusan;

        2. Berkas Perkara Perdata:
        ${berkasPerkara}

        3. Telaah Panitera Muda Perdata (terhadap berkas perkara):
        - Bahwa objek perkara berupa: ${d.executionObject};
        - Bahwa Pemohon Eksekusi telah melampirkan berkas berupa putusan-putusan sebagaimana di atas dan setelah dilakukan pengecekan pada berkas bundel A bahwa fotocopy putusan-putusan tersebut sesuai dengan aslinya;
        - Bahwa putusan perkara yang dimohonkan eksekusi tersebut telah memiliki kekuatan hukum yang tetap;
        - Bahwa putusan perkara tersebut bersifat penghukuman (condemnatoir), ${d.verdict};
        - Bahwa Termohon Eksekusi hingga saat ini tidak melaksanakan isi putusan tersebut secara sukarela;
        - Bahwa berdasarkan penelitian terhadap data-data keadaan perkara didalam SIPP maupun di dalam register perkara, tidak ditemukan upaya-upaya hukum yang dilakukan lagi terkait perkara tersebut.

        Panitera Muda Perdata,


        ${d.panmudName}

        4. Hasil Penelaahan Panitera:
        [Telaah Panitera]

        ${paniteraTitle}


        ${paniteraName}

        5. Pertimbangan Ketua Pengadilan Negeri Bandung:
        [Telaah KPN]

        Ketua Pengadilan Negeri Bandung,


        ${d.kpnName}
      `;
      break;

    default:
      throw new Error("Jenis perkara tidak valid atau tidak dipilih.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Gagal berkomunikasi dengan layanan AI.");
  }
}