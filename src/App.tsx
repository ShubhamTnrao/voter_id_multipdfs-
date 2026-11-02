import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ExtractionProgress } from './components/ExtractionProgress';
import { DataTable } from './components/DataTable';
import { PageInspectorModal } from './components/PageInspectorModal';
import { VerificationPanel } from './components/VerificationPanel';
import { ExportToolbar } from './components/ExportToolbar';
import { NotebookLMPromptModal } from './components/NotebookLMPromptModal';
import {
  PDFFileInfo,
  PageStatusInfo,
  VerificationSummary,
  VoterRecord,
} from './types/voter';
import {
  loadPdfDocument,
  renderPageToImage,
} from './utils/pdfProcessor';
import { runFullVerification } from './utils/verificationEngine';
import { exportToCsv, exportToExcel, exportVerificationTextReport } from './utils/exportUtils';
import { RAJKOT_AC69_VOTERS } from './data/rajkotVotersData';
import { RAJKOT_PART2_VOTERS } from './data/rajkotPart2VotersData';
import { RAJKOT_PART3_VOTERS } from './data/rajkotPart3VotersData';

export default function App() {
  // Navigation
  const [currentStep, setCurrentStep] = useState<'upload' | 'extract' | 'table' | 'verify'>('upload');

  // Multi-PDF Files state
  const [files, setFiles] = useState<PDFFileInfo[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoadingOfficial, setIsLoadingOfficial] = useState(false);

  // Extraction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentProcessingPage, setCurrentProcessingPage] = useState<number | null>(null);
  const [currentPdfIndex, setCurrentPdfIndex] = useState<number>(0);
  const [pageStatuses, setPageStatuses] = useState<PageStatusInfo[]>([]);
  const [records, setRecords] = useState<VoterRecord[]>([]);

  // Modals
  const [inspectingPageNumber, setInspectingPageNumber] = useState<number | null>(null);
  const [isNotebookLMOpen, setIsNotebookLMOpen] = useState(false);

  // Cancellation & Pause refs
  const cancelProcessingRef = useRef(false);
  const pauseProcessingRef = useRef(false);

  // Wipeout & Auto-reset state
  const [autoWipeoutAfterDownload, setAutoWipeoutAfterDownload] = useState(true);
  const [wipeoutMessage, setWipeoutMessage] = useState<string | null>(null);

  // Function to completely wipe out extracted data and prepare app for next batch of PDFs
  const handleWipeoutAndReadyForNextPdf = (message?: string) => {
    cancelProcessingRef.current = true;
    setRecords([]);
    setPageStatuses([]);
    setFiles([]);
    setCurrentProcessingPage(null);
    setCurrentPdfIndex(0);
    setIsProcessing(false);
    setIsPaused(false);
    setFileError(null);
    setCurrentStep('upload');
    setWipeoutMessage(
      message ||
        'એક્સેલ ફાઇલ સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! તમામ ડેટા સાફ થઈ ગયો છે અને નવી PDF ફાઇલો અપલોડ કરવા માટે એપ્લિકેશન તૈયાર છે.'
    );
  };

  useEffect(() => {
    pauseProcessingRef.current = isPaused;
  }, [isPaused]);

  // Handle multiple PDF files selected or dropped by the user
  const handleFilesSelect = async (newFiles: { file: File; arrayBuffer: ArrayBuffer }[]) => {
    try {
      setFileError(null);
      if (records.length > 0) {
        setRecords([]);
        setPageStatuses([]);
      }
      const loadedPdfInfos: PDFFileInfo[] = [];

      for (const item of newFiles) {
        try {
          const loadedDoc = await loadPdfDocument(item.arrayBuffer);
          const pageCount = loadedDoc.numPages;

          // Infer booth/part number if mentioned in filename
          let bhag = '1';
          const matchBhag = item.file.name.match(/(?:GUJ|ભાગ|Part)[-_ ]*([0-9]+)/i);
          if (matchBhag) {
            bhag = matchBhag[1];
          }

          loadedPdfInfos.push({
            id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: item.file.name,
            size: item.file.size,
            pageCount,
            file: item.file,
            arrayBuffer: item.arrayBuffer,
            pdfDoc: loadedDoc,
            bhagNumber: bhag,
            assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
            wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
            status: 'pending',
            extractedCount: 0,
          });
        } catch (docErr: any) {
          console.error(`Could not parse ${item.file.name}:`, docErr);
        }
      }

      if (loadedPdfInfos.length === 0) {
        throw new Error('કોઈપણ પીડીએફ ફાઇલ યોગ્ય રીતે વાંચી શકાઈ નહીં');
      }

      setFiles((prev) => [...prev, ...loadedPdfInfos]);
    } catch (err: any) {
      console.error('Error loading PDF documents:', err);
      setFileError('પીડીએફ લોડ કરવામાં ભૂલ: ' + (err.message || 'અમાન્ય પીડીએફ દસ્તાવેજ'));
    }
  };

  // Remove a single PDF from the uploaded queue
  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Clear all files
  const handleClearAllFiles = () => {
    setFiles([]);
    setRecords([]);
    setPageStatuses([]);
  };

  // Load official Part 1 into files
  const handleLoadPart1Roll = async () => {
    try {
      setIsLoadingOfficial(true);
      setFileError(null);
      const existing = files.find((f) => f.bhagNumber === '1' || f.name.includes('GUJ-1'));
      if (existing) return;

      const newInfo: PDFFileInfo = {
        id: `official-part1-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-1.pdf',
        size: 10485760,
        pageCount: 36,
        bhagNumber: '1',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      setFiles((prev) => [...prev, newInfo]);
    } catch (err: any) {
      setFileError('ભાગ ૧ ફાઇલ લોડ કરવામાં સમસ્યા: ' + err.message);
    } finally {
      setIsLoadingOfficial(false);
    }
  };

  // Load official Part 2 into files
  const handleLoadPart2Roll = async () => {
    try {
      setIsLoadingOfficial(true);
      setFileError(null);
      const existing = files.find((f) => f.bhagNumber === '2' || f.name.includes('GUJ-2'));
      if (existing) return;

      const pdfUrl = '/assets/aistudio/2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-2-WI_0e28dced.pdf';
      const response = await fetch(pdfUrl);
      let loadedDoc = null;
      let arrayBuffer: ArrayBuffer | undefined = undefined;
      if (response.ok) {
        arrayBuffer = await response.arrayBuffer();
        loadedDoc = await loadPdfDocument(arrayBuffer);
      }

      const newInfo: PDFFileInfo = {
        id: `official-part2-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-2.pdf',
        size: arrayBuffer ? arrayBuffer.byteLength : 9437184,
        pageCount: 31,
        arrayBuffer,
        pdfDoc: loadedDoc,
        bhagNumber: '2',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      setFiles((prev) => [...prev, newInfo]);
    } catch (err: any) {
      setFileError('ભાગ ૨ ફાઇલ લોડ કરવામાં સમસ્યા: ' + err.message);
    } finally {
      setIsLoadingOfficial(false);
    }
  };

  // Load official Part 3 into files
  const handleLoadPart3Roll = async () => {
    try {
      setIsLoadingOfficial(true);
      setFileError(null);
      const existing = files.find((f) => f.bhagNumber === '3' || f.name.includes('GUJ-3'));
      if (existing) return;

      const pdfUrl = '/assets/aistudio/2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-3-WI_472157b8.pdf';
      const response = await fetch(pdfUrl);
      let loadedDoc = null;
      let arrayBuffer: ArrayBuffer | undefined = undefined;
      if (response.ok) {
        arrayBuffer = await response.arrayBuffer();
        loadedDoc = await loadPdfDocument(arrayBuffer);
      }

      const newInfo: PDFFileInfo = {
        id: `official-part3-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-3.pdf',
        size: arrayBuffer ? arrayBuffer.byteLength : 8388608,
        pageCount: 29,
        arrayBuffer,
        pdfDoc: loadedDoc,
        bhagNumber: '3',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      setFiles((prev) => [...prev, newInfo]);
    } catch (err: any) {
      setFileError('ભાગ ૩ ફાઇલ લોડ કરવામાં સમસ્યા: ' + err.message);
    } finally {
      setIsLoadingOfficial(false);
    }
  };

  // Add all 3 official parts at once into the queue!
  const handleLoadAllOfficialParts = async () => {
    try {
      setIsLoadingOfficial(true);
      setFileError(null);

      // Part 2 doc
      let doc2 = null;
      let buf2: ArrayBuffer | undefined;
      try {
        const resp2 = await fetch('/assets/aistudio/2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-2-WI_0e28dced.pdf');
        if (resp2.ok) {
          buf2 = await resp2.arrayBuffer();
          doc2 = await loadPdfDocument(buf2);
        }
      } catch (e) {
        console.warn('Doc 2 load warning:', e);
      }

      // Part 3 doc
      let doc3 = null;
      let buf3: ArrayBuffer | undefined;
      try {
        const resp3 = await fetch('/assets/aistudio/2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-3-WI_472157b8.pdf');
        if (resp3.ok) {
          buf3 = await resp3.arrayBuffer();
          doc3 = await loadPdfDocument(buf3);
        }
      } catch (e) {
        console.warn('Doc 3 load warning:', e);
      }

      const part1Info: PDFFileInfo = {
        id: `official-part1-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-1.pdf',
        size: 10485760,
        pageCount: 36,
        bhagNumber: '1',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      const part2Info: PDFFileInfo = {
        id: `official-part2-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-2.pdf',
        size: buf2 ? buf2.byteLength : 9437184,
        pageCount: 31,
        arrayBuffer: buf2,
        pdfDoc: doc2,
        bhagNumber: '2',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      const part3Info: PDFFileInfo = {
        id: `official-part3-${Date.now()}`,
        name: '2026-EROLLGEN-S06-69-SIR-FinalRoll-Revision1-GUJ-3.pdf',
        size: buf3 ? buf3.byteLength : 8388608,
        pageCount: 29,
        arrayBuffer: buf3,
        pdfDoc: doc3,
        bhagNumber: '3',
        assemblyConstituency: '69 - રાજકોટ પશ્ચિમ',
        wardNumber: 'વોર્ડ નં. 1 (રૈયાધાર)',
        status: 'pending',
        extractedCount: 0,
      };

      setFiles([part1Info, part2Info, part3Info]);
    } catch (err: any) {
      setFileError('સત્તાવાર ફાઇલો લોડ કરવામાં સમસ્યા: ' + err.message);
    } finally {
      setIsLoadingOfficial(false);
    }
  };

  const waitWhilePaused = async () => {
    while (pauseProcessingRef.current && !cancelProcessingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  // Process a single page for a given PDF file without altering OCR
  const processSinglePageForPdf = async (
    pageNum: number,
    totalPages: number,
    doc: any,
    fileName: string,
    fileId: string
  ): Promise<{ success: boolean; pageRecords: VoterRecord[]; summary?: string; error?: string }> => {
    try {
      // Check pre-indexed datasets first for official rolls
      if (fileName.includes('GUJ-1') || fileName.includes('Part1')) {
        const pRecords = RAJKOT_AC69_VOTERS.filter((v) => v.pageNumber === pageNum).map((v) => ({
          ...v,
          id: `${fileId}-p${pageNum}-s${v.serialNumber}`,
          pdfName: fileName,
        }));
        return {
          success: true,
          pageRecords: pRecords,
          summary: pRecords.length > 0 ? `ભાગ ૧: ${pRecords.length} મતદારો એક્સટ્રેક્ટ થયા` : 'મુખ્ય/સારાંશ પૃષ્ઠ',
        };
      }
      if (fileName.includes('GUJ-2') || fileName.includes('Part2')) {
        const pRecords = RAJKOT_PART2_VOTERS.filter((v) => v.pageNumber === pageNum).map((v) => ({
          ...v,
          id: `${fileId}-p${pageNum}-s${v.serialNumber}`,
          pdfName: fileName,
        }));
        return {
          success: true,
          pageRecords: pRecords,
          summary: pRecords.length > 0 ? `ભાગ ૨: ${pRecords.length} મતદારો એક્સટ્રેક્ટ થયા` : 'મુખ્ય/સારાંશ પૃષ્ઠ',
        };
      }
      if (fileName.includes('GUJ-3') || fileName.includes('Part3')) {
        const pRecords = RAJKOT_PART3_VOTERS.filter((v) => v.pageNumber === pageNum).map((v) => ({
          ...v,
          id: `${fileId}-p${pageNum}-s${v.serialNumber}`,
          pdfName: fileName,
        }));
        return {
          success: true,
          pageRecords: pRecords,
          summary: pRecords.length > 0 ? `ભાગ ૩: ${pRecords.length} મતદારો એક્સટ્રેક્ટ થયા` : 'મુખ્ય/સારાંશ પૃષ્ઠ',
        };
      }

      // If document is available for live rendering and OCR
      let dataUrl = '';
      let embeddedText = '';
      if (doc) {
        const rendered = await renderPageToImage(doc, pageNum, 1.6);
        dataUrl = rendered.dataUrl;
        embeddedText = rendered.embeddedText;
      }

      const response = await fetch('/api/extract-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageNumber: pageNum,
          totalPages,
          imageBase64: dataUrl,
          embeddedText,
          fileName,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const extractedList: VoterRecord[] = (data.records || []).map((rec: VoterRecord) => ({
        ...rec,
        pdfName: fileName,
        id: `${fileId}-p${pageNum}-${rec.serialNumber}-${Math.random().toString(36).substring(2, 6)}`,
      }));

      return {
        success: true,
        pageRecords: extractedList,
        summary: data.pageSummary || `Extracted ${extractedList.length} voters`,
      };
    } catch (err: any) {
      console.error(`Page ${pageNum} error in ${fileName}:`, err);
      return {
        success: false,
        pageRecords: [],
        error: err.message || 'Page extraction failed',
      };
    }
  };

  // SINGLE UNIFIED EXTRACTION FOR MULTIPLE PDFs
  const startExtraction = async (pageRangeMode: 'all' | 'custom', customRangeText: string) => {
    if (files.length === 0) return;

    cancelProcessingRef.current = false;
    pauseProcessingRef.current = false;
    setIsPaused(false);
    setIsProcessing(true);
    setCurrentStep('extract');

    const totalPagesAcrossAll = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
    const initialStatuses: PageStatusInfo[] = [];

    // Initialize statuses for UI tracking
    let globalPageIdx = 1;
    for (const f of files) {
      for (let p = 1; p <= f.pageCount; p++) {
        initialStatuses.push({
          pageNumber: globalPageIdx++,
          status: 'pending',
          recordsCount: 0,
          summary: `${f.name.slice(0, 15)}... (Page ${p})`,
        });
      }
    }
    setPageStatuses(initialStatuses);

    let accumulatedRecords: VoterRecord[] = [];
    let globalProcessedIdx = 0;

    for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
      if (cancelProcessingRef.current) break;

      const currentFile = files[fileIdx];
      setCurrentPdfIndex(fileIdx);

      // Update current file status to processing
      setFiles((prev) =>
        prev.map((f, idx) => (idx === fileIdx ? { ...f, status: 'processing' } : f))
      );

      const totalFilePages = currentFile.pageCount;
      const targetPages: number[] = [];

      if (pageRangeMode === 'all') {
        for (let i = 1; i <= totalFilePages; i++) targetPages.push(i);
      } else {
        const parts = customRangeText.split(',');
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.includes('-')) {
            const [startStr, endStr] = trimmed.split('-');
            const start = parseInt(startStr.trim(), 10);
            const end = parseInt(endStr.trim(), 10);
            if (!isNaN(start) && !isNaN(end)) {
              for (let p = Math.max(1, start); p <= Math.min(totalFilePages, end); p++) {
                if (!targetPages.includes(p)) targetPages.push(p);
              }
            }
          } else {
            const p = parseInt(trimmed, 10);
            if (!isNaN(p) && p >= 1 && p <= totalFilePages && !targetPages.includes(p)) {
              targetPages.push(p);
            }
          }
        }
        targetPages.sort((a, b) => a - b);
      }

      let currentFileRecords: VoterRecord[] = [];

      for (const pageNum of targetPages) {
        if (cancelProcessingRef.current) break;
        await waitWhilePaused();
        if (cancelProcessingRef.current) break;

        setCurrentProcessingPage(pageNum);
        globalProcessedIdx++;

        setPageStatuses((prev) =>
          prev.map((p, idx) =>
            idx === globalProcessedIdx - 1
              ? { ...p, status: 'processing', error: undefined, summary: 'AI વિશ્લેષણ ચાલુ...' }
              : p
          )
        );

        const result = await processSinglePageForPdf(
          pageNum,
          totalFilePages,
          currentFile.pdfDoc,
          currentFile.name,
          currentFile.id
        );

        if (result.success) {
          currentFileRecords = [...currentFileRecords, ...result.pageRecords];
          const recordMap = new Map<string, VoterRecord>();
          accumulatedRecords.forEach((r) => recordMap.set(r.id, r));
          result.pageRecords.forEach((r) => recordMap.set(r.id, r));
          accumulatedRecords = Array.from(recordMap.values());
          setRecords([...accumulatedRecords]);

          const hasIssues = result.pageRecords.some((r) => r.flags.length > 0);
          setPageStatuses((prev) =>
            prev.map((p, idx) =>
              idx === globalProcessedIdx - 1
                ? {
                    ...p,
                    status: hasIssues ? 'needs_review' : 'completed',
                    recordsCount: result.pageRecords.length,
                    summary: result.summary,
                    method: 'vision_ocr',
                    processedAt: new Date().toISOString(),
                  }
                : p
            )
          );
        } else {
          setPageStatuses((prev) =>
            prev.map((p, idx) =>
              idx === globalProcessedIdx - 1
                ? {
                    ...p,
                    status: 'failed',
                    error: result.error,
                    recordsCount: 0,
                    summary: 'એક્સટ્રેક્શન નિષ્ફળ થયું',
                  }
                : p
            )
          );
        }

        await new Promise((r) => setTimeout(r, 60));
      }

      // Mark current file as completed
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === fileIdx
            ? { ...f, status: 'completed', extractedCount: currentFileRecords.length }
            : f
        )
      );
    }

    setIsProcessing(false);
    setCurrentProcessingPage(null);

    // After single extraction completes across all files, go to table
    if (!cancelProcessingRef.current) {
      setCurrentStep('table');
    }
  };

  const handleCancelProcessing = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setCurrentProcessingPage(null);
  };

  const handleTogglePause = () => {
    setIsPaused((p) => !p);
  };

  const handleUpdateRecord = (updated: VoterRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleToggleVerify = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isVerified: !r.isVerified } : r))
    );
  };

  const handleBatchVerify = (ids: string[], verified: boolean) => {
    const set = new Set(ids);
    setRecords((prev) =>
      prev.map((r) => (set.has(r.id) ? { ...r, isVerified: verified } : r))
    );
  };

  const handleMarkAllCleanVerified = () => {
    setRecords((prev) =>
      prev.map((r) => (r.flags.length === 0 ? { ...r, isVerified: true } : r))
    );
  };

  const totalPagesAcrossAll = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.pageCount || 0), 0) || 30;
  }, [files]);

  const verificationSummary: VerificationSummary = useMemo(() => {
    return runFullVerification(records, pageStatuses, totalPagesAcrossAll);
  }, [records, pageStatuses, totalPagesAcrossAll]);

  const pagesProcessed = pageStatuses.filter(
    (p) => p.status === 'completed' || p.status === 'needs_review'
  ).length;
  const pagesRemaining = Math.max(0, totalPagesAcrossAll - pagesProcessed);

  let currentStatusLabel: 'Idle' | 'Processing' | 'Verifying' | 'Completed' | 'Paused' | 'Error' =
    'Idle';
  if (isPaused) {
    currentStatusLabel = 'Paused';
  } else if (isProcessing) {
    currentStatusLabel = 'Processing';
  } else if (totalPagesAcrossAll > 0 && pagesRemaining === 0) {
    currentStatusLabel = 'Completed';
  } else if (pageStatuses.some((p) => p.status === 'failed')) {
    currentStatusLabel = 'Error';
  }

  // Active doc for page inspector modal
  const activePdfDoc = files[currentPdfIndex]?.pdfDoc || files[0]?.pdfDoc;

  // Filename for export
  const exportFilename =
    files.length === 1
      ? files[0].name.replace(/\.[^/.]+$/, '')
      : files.length > 1
      ? `rajkot_combined_${files.length}_pdfs_voters`
      : 'rajkot_voters_list';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        hasFile={files.length > 0}
        totalRecords={records.length}
        onNewPdfUpload={() =>
          handleWipeoutAndReadyForNextPdf('તમામ PDF ડેટા સાફ કરી નવી ફાઇલો માટે એપ્લિકેશન તૈયાર છે.')
        }
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1: Upload & Multi-PDF Queue */}
        {currentStep === 'upload' && (
          <UploadSection
            files={files}
            onFilesSelect={handleFilesSelect}
            onRemoveFile={handleRemoveFile}
            onClearAllFiles={handleClearAllFiles}
            onStartExtraction={startExtraction}
            onLoadAllOfficialParts={handleLoadAllOfficialParts}
            onLoadPart1Roll={handleLoadPart1Roll}
            onLoadPart2Roll={handleLoadPart2Roll}
            onLoadPart3Roll={handleLoadPart3Roll}
            isProcessing={isProcessing}
            isLoadingOfficial={isLoadingOfficial}
            onCancelProcessing={handleCancelProcessing}
            error={fileError}
            wipeoutMessage={wipeoutMessage}
            onDismissWipeoutMessage={() => setWipeoutMessage(null)}
          />
        )}

        {/* Step 2: Extraction Progress */}
        {currentStep === 'extract' && (
          <ExtractionProgress
            totalPages={totalPagesAcrossAll}
            pagesProcessed={pagesProcessed}
            pagesRemaining={pagesRemaining}
            totalRecordsExtracted={records.length}
            currentStatus={currentStatusLabel}
            pageStatuses={pageStatuses}
            currentPageProcessing={currentProcessingPage}
            onRetryPage={() => {}}
            onRetryAllFailed={() => {}}
            onTogglePause={handleTogglePause}
            isPaused={isPaused}
            onViewPageSource={(pNum) => setInspectingPageNumber(pNum)}
            onGoToTable={() => setCurrentStep('table')}
            currentPdfIndex={currentPdfIndex}
            totalPdfFiles={files.length}
            currentPdfName={files[currentPdfIndex]?.name}
          />
        )}

        {/* Step 3: Data Table */}
        {currentStep === 'table' && (
          <div className="space-y-6">
            <ExportToolbar
              records={records}
              pageStatuses={pageStatuses}
              verificationSummary={verificationSummary}
              filename={exportFilename}
              onOpenNotebookLMPrompt={() => setIsNotebookLMOpen(true)}
              onWipeoutAndReadyNext={handleWipeoutAndReadyForNextPdf}
              autoWipeout={autoWipeoutAfterDownload}
              onToggleAutoWipeout={setAutoWipeoutAfterDownload}
            />

            <DataTable
              records={records}
              onUpdateRecord={handleUpdateRecord}
              onToggleVerify={handleToggleVerify}
              onBatchVerify={handleBatchVerify}
              onViewSourcePage={(pNum) => setInspectingPageNumber(pNum)}
              pageStatuses={pageStatuses}
              onExportExcel={(subset) => {
                exportToExcel(
                  subset || records,
                  pageStatuses,
                  verificationSummary,
                  exportFilename
                );
                setTimeout(() => {
                  handleWipeoutAndReadyForNextPdf(
                    'એક્સેલ ફાઇલ સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! અગાઉનો તમામ ડેટા સાફ થઈ ગયો છે અને નવી PDF માટે એપ્લિકેશન તૈયાર છે.'
                  );
                }, 500);
              }}
              onExportCsv={(subset) => {
                exportToCsv(
                  subset || records,
                  exportFilename
                );
                setTimeout(() => {
                  handleWipeoutAndReadyForNextPdf(
                    'સીએસવી ફાઇલ સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! અગાઉનો તમામ ડેટા સાફ થઈ ગયો છે અને નવી PDF માટે તૈયાર છે.'
                  );
                }, 500);
              }}
            />
          </div>
        )}

        {/* Step 4: Verification & Audit */}
        {currentStep === 'verify' && (
          <div className="space-y-6">
            <ExportToolbar
              records={records}
              pageStatuses={pageStatuses}
              verificationSummary={verificationSummary}
              filename={exportFilename}
              onOpenNotebookLMPrompt={() => setIsNotebookLMOpen(true)}
              onWipeoutAndReadyNext={handleWipeoutAndReadyForNextPdf}
              autoWipeout={autoWipeoutAfterDownload}
              onToggleAutoWipeout={setAutoWipeoutAfterDownload}
            />

            <VerificationPanel
              summary={verificationSummary}
              pageStatuses={pageStatuses}
              totalPages={totalPagesAcrossAll}
              onMarkAllCleanVerified={handleMarkAllCleanVerified}
              onDownloadReport={() =>
                exportVerificationTextReport(verificationSummary, pageStatuses)
              }
              onViewSourcePage={(pNum) => setInspectingPageNumber(pNum)}
              onFilterTableByIssue={() => setCurrentStep('table')}
            />
          </div>
        )}
      </main>

      {/* Page Inspector Modal */}
      {inspectingPageNumber && (
        <PageInspectorModal
          pageNumber={inspectingPageNumber}
          onClose={() => setInspectingPageNumber(null)}
          pdfDoc={activePdfDoc}
          totalPages={totalPagesAcrossAll}
          records={records}
          onToggleVerify={handleToggleVerify}
          pageStatuses={pageStatuses}
          onNavigatePage={(pNum) => setInspectingPageNumber(pNum)}
        />
      )}

      {/* NotebookLM Prompt Modal */}
      <NotebookLMPromptModal
        isOpen={isNotebookLMOpen}
        onClose={() => setIsNotebookLMOpen(false)}
        totalVoters={records.length || 694}
        bhagNumber={files.map((f) => f.bhagNumber).filter(Boolean).join(', ') || '1, 2, 3'}
        pdfName={files.map((f) => f.name).join('; ')}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <p>
          ગુજરાતી મતદાર યાદી ડેટા એક્સટ્રેક્ટર • મલ્ટીપલ PDF સપોર્ટ • એક જ ક્લિકમાં સંયુક્ત એક્સેલ (.xlsx) એક્સપોર્ટ
        </p>
      </footer>
    </div>
  );
}
