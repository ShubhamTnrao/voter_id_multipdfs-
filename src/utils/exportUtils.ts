import * as XLSX from 'xlsx';
import { PageStatusInfo, VerificationSummary, VoterRecord } from '../types/voter';

/**
 * Cleanly trigger a file download in the browser without popup blocking
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Format records into standardized Gujarati/English columns
 */
export function formatVoterRecordsForExport(records: VoterRecord[]) {
  return records.map((r, idx) => ({
    'ક્રમ નંબર (Serial No)': r.serialNumber || idx + 1,
    'ઓળખપત્ર નંબર (EPIC No)': r.epicNumber || '',
    'મતદારનું નામ (Full Name)': r.voterName || '',
    'સંબંધનો પ્રકાર (Relation Type)': r.relationshipType || '',
    'સંબંધીનું નામ (Relative Name)': r.relationshipName || '',
    'પિતાનું નામ (Father Name)': r.fatherName || '',
    'પતિનું નામ (Husband Name)': r.husbandName || '',
    'માતાનું નામ (Mother Name)': r.motherName || '',
    'અન્ય સંબંધી (Other Relation)': r.otherRelationName || '',
    'ઘર / મકાન નંબર (House No)': r.houseNumber || '',
    'ઉંમર (Age)': r.age || '',
    'જાતિ (Gender)': r.gender || '',
    'વિભાગ નંબર (Vibhag No)': r.vibhagNumber || '',
    'વિભાગનું નામ (Vibhag Name)': r.vibhagName || '',
    'વોર્ડ નંબર (Ward No)': r.wardNumber || '',
    'ભાગ નંબર (Bhag No)': r.bhagNumber || '',
    'PDF ફાઇલનું નામ (PDF Name)': r.pdfName || '',
    'PDF પેજ નંબર (Page No)': r.pageNumber,
    'ચકાસાયેલ (Verified)': r.isVerified ? 'હા (Yes)' : 'ના (No)',
    'સ્થિતિ / ચેતવણીઓ (Flags)': r.flags.join(', ') || 'કોઈ નહીં',
  }));
}

/**
 * Export to Excel (.xlsx) with both Voters Data Sheet and Verification Sheet
 */
/**
 * Export to Excel (.xlsx) with Master Combined Sheet, per-PDF sheets (if multiple), and Verification Sheets
 */
export function exportToExcel(
  records: VoterRecord[],
  pageStatuses: PageStatusInfo[],
  summary: VerificationSummary,
  baseFilename: string = 'gujarati_voter_list'
) {
  const wb = XLSX.utils.book_new();

  const colsConfig = [
    { wch: 10 }, // Serial
    { wch: 18 }, // EPIC
    { wch: 30 }, // Name
    { wch: 16 }, // Rel Type
    { wch: 30 }, // Rel Name
    { wch: 25 }, // Father
    { wch: 25 }, // Husband
    { wch: 20 }, // Mother
    { wch: 20 }, // Other
    { wch: 15 }, // House
    { wch: 10 }, // Age
    { wch: 12 }, // Gender
    { wch: 14 }, // Vibhag No
    { wch: 45 }, // Vibhag Name
    { wch: 22 }, // Ward No
    { wch: 12 }, // Bhag No
    { wch: 55 }, // PDF Name
    { wch: 12 }, // Page
    { wch: 14 }, // Verified
    { wch: 28 }, // Flags
  ];

  // Sheet 1: Master Combined Voters Data
  const voterRows = formatVoterRecordsForExport(records);
  const wsVoters = XLSX.utils.json_to_sheet(voterRows);
  wsVoters['!cols'] = colsConfig;
  XLSX.utils.book_append_sheet(wb, wsVoters, 'તમામ મતદારો (All Voters)');

  // If there are multiple distinct PDFs, create a dedicated tab for each PDF!
  const uniquePdfs = Array.from(new Set(records.map((r) => r.pdfName || 'Unknown PDF'))).filter(Boolean);
  if (uniquePdfs.length > 1) {
    const usedSheetNames = new Set<string>(['તમામ મતદારો (All Voters)']);

    uniquePdfs.forEach((pdf, index) => {
      const pdfRecords = records.filter((r) => (r.pdfName || 'Unknown PDF') === pdf);
      if (pdfRecords.length === 0) return;

      const pdfRows = formatVoterRecordsForExport(pdfRecords);
      const wsPdf = XLSX.utils.json_to_sheet(pdfRows);
      wsPdf['!cols'] = colsConfig;

      // Extract a clean short name for the Excel sheet (max 31 chars, no invalid chars : \ / ? * [ ])
      let cleanName = pdf.replace(/\.pdf$/i, '').replace(/[\\/?*[\]:]/g, '_').trim();
      if (cleanName.length > 25) {
        cleanName = `PDF_${index + 1}_${cleanName.slice(-18)}`;
      }
      if (cleanName.length > 31) {
        cleanName = cleanName.slice(0, 31);
      }
      while (usedSheetNames.has(cleanName)) {
        cleanName = cleanName.slice(0, 28) + `_${index + 1}`;
      }
      usedSheetNames.add(cleanName);

      XLSX.utils.book_append_sheet(wb, wsPdf, cleanName);
    });
  }

  // Sheet: Verification Report
  const pageReportRows = pageStatuses.map((p) => ({
    'પેજ નંબર (Page)': p.pageNumber,
    'પ્રક્રિયા સ્થિતિ (Status)': p.status,
    'મતદારોની સંખ્યા (Voters Count)': p.recordsCount,
    'એક્સટ્રેક્શન પદ્ધતિ (Method)': p.method || 'vision_ocr',
    'સારાંશ / નોંધ (Summary)': p.summary || '',
    'ભૂલ / સમસ્યા (Errors)': p.error || 'કોઈ નહીં',
  }));

  const wsVerification = XLSX.utils.json_to_sheet(pageReportRows);
  wsVerification['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
    { wch: 35 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsVerification, 'ચકાસણી સારાંશ (Audit)');

  // Sheet: Issues Log
  const issueRows = summary.issues.map((iss, i) => ({
    'અનુક્રમ (Sr)': i + 1,
    'પેજ (Page)': iss.pageNumber || 'N/A',
    'પ્રકાર (Type)': iss.type,
    'ગંભીરતા (Severity)': iss.severity,
    'શીર્ષક (Title)': iss.title,
    'વિગત (Description)': iss.description,
  }));
  const wsIssues = XLSX.utils.json_to_sheet(issueRows);
  XLSX.utils.book_append_sheet(wb, wsIssues, 'સમસ્યાઓની યાદી (Issues)');

  // Write file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${baseFilename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export to CSV with UTF-8 BOM so Gujarati Unicode characters render in Excel without mojibake
 */
export function exportToCsv(
  records: VoterRecord[],
  baseFilename: string = 'gujarati_voters'
) {
  const rows = formatVoterRecordsForExport(records);
  if (rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row: any) =>
      headers
        .map((header) => {
          const val = row[header] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  // Prepend \uFEFF (UTF-8 Byte Order Mark) for Excel Unicode compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${baseFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export Verification Audit Report as formatted text file
 */
export function exportVerificationTextReport(
  summary: VerificationSummary,
  pageStatuses: PageStatusInfo[],
  filename: string = 'voter_verification_report.txt'
) {
  const dateStr = new Date().toLocaleString('gu-IN');
  let content = `========================================================================\n`;
  content += `  ગુજરાતી મતદાર યાદી ડેટા એક્સટ્રેક્ટર - ચકાસણી અહેવાલ (VERIFICATION REPORT)\n`;
  content += `  Generated: ${dateStr}\n`;
  content += `========================================================================\n\n`;

  content += `[1] એકંદર સારાંશ (OVERALL SUMMARY):\n`;
  content += `------------------------------------------------------------------------\n`;
  content += `  કુલ એક્સટ્રેક્ટ થયેલ મતદારો (Total Records):  ${summary.totalRecords}\n`;
  content += `  ચકાસાયેલ મતદારો (Verified Records):          ${summary.verifiedRecords}\n`;
  content += `  અપૂર્ણ / અચકાસાયેલ મતદારો (Unverified):     ${summary.unverifiedRecords}\n`;
  content += `  ડુપ્લિકેટ ઓળખપત્ર (Duplicate EPICs):         ${summary.duplicateEpicsCount}\n`;
  content += `  ગેરહાજર ઓળખપત્ર (Missing EPICs):           ${summary.missingEpicsCount}\n`;
  content += `  શંકાસ્પદ ઉંમરના કિસ્સા (Suspicious Ages):   ${summary.suspiciousAgesCount}\n`;
  content += `  અપૂર્ણ નામ (Incomplete Names):               ${summary.incompleteNamesCount}\n`;
  content += `  બાકી / નિષ્ફળ પેજ (Unprocessed/Failed):      ${summary.unprocessedPagesCount + summary.failedPagesCount}\n`;
  content += `  સંપૂર્ણતા સ્થિતિ (Completeness Status):     ${summary.isFullyComplete ? '૧૦૦% પૂર્ણ (Fully Completed)' : 'અપૂર્ણ (Incomplete / Pending Review)'}\n\n`;

  content += `[2] પેજ વાઇઝ પ્રક્રિયા સ્થિતિ (PAGE PROCESSING BREAKDOWN):\n`;
  content += `------------------------------------------------------------------------\n`;
  pageStatuses.forEach((p) => {
    content += `  પેજ ${String(p.pageNumber).padStart(3, ' ')}: [${p.status.toUpperCase()}] - ${p.recordsCount} મતદારો | પદ્ધતિ: ${p.method || 'N/A'}`;
    if (p.summary) content += ` | ${p.summary}`;
    if (p.error) content += ` | ભૂલ: ${p.error}`;
    content += `\n`;
  });
  content += `\n`;

  content += `[3] ધ્યાનાકર્ષક સમસ્યાઓની યાદી (DETAILED ISSUES LOG - ${summary.issues.length} Items):\n`;
  content += `------------------------------------------------------------------------\n`;
  if (summary.issues.length === 0) {
    content += `  કોઈ વિસંગતતા કે સમસ્યા જણાઈ નથી. તમામ ડેટા સુસંગત છે.\n`;
  } else {
    summary.issues.forEach((iss, i) => {
      content += `  ${i + 1}. [${iss.severity.toUpperCase()}] [પેજ ${iss.pageNumber || 'N/A'}] ${iss.title}\n`;
      content += `     વિગત: ${iss.description}\n`;
    });
  }

  content += `\n========================================================================\n`;
  content += `અહેવાલ સમાપ્ત (End of Report)\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}
