import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Trash2,
  Plus,
  Files,
  FileCheck2,
  FileSpreadsheet,
} from 'lucide-react';
import { PDFFileInfo } from '../types/voter';
import { generateSampleGujaratiPdf } from '../utils/sampleRollGenerator';

interface UploadSectionProps {
  files: PDFFileInfo[];
  onFilesSelect: (newFiles: { file: File; arrayBuffer: ArrayBuffer }[]) => Promise<void>;
  onRemoveFile: (fileId: string) => void;
  onClearAllFiles: () => void;
  onStartExtraction: (pageRange: 'all' | 'custom', customRange: string) => void;
  onLoadAllOfficialParts: () => void;
  onLoadPart1Roll: () => void;
  onLoadPart2Roll: () => void;
  onLoadPart3Roll: () => void;
  isProcessing: boolean;
  isLoadingOfficial: boolean;
  onCancelProcessing: () => void;
  error: string | null;
  wipeoutMessage?: string | null;
  onDismissWipeoutMessage?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  files,
  onFilesSelect,
  onRemoveFile,
  onClearAllFiles,
  onStartExtraction,
  onLoadAllOfficialParts,
  onLoadPart1Roll,
  onLoadPart2Roll,
  onLoadPart3Roll,
  isProcessing,
  isLoadingOfficial,
  onCancelProcessing,
  error,
  wipeoutMessage,
  onDismissWipeoutMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRangeText, setCustomRangeText] = useState('1-31');
  const [localErr, setLocalErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileList = async (fileList: FileList | File[]) => {
    setLocalErr(null);
    const validFiles: { file: File; arrayBuffer: ArrayBuffer }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf') {
        const arrayBuffer = await f.arrayBuffer();
        validFiles.push({ file: f, arrayBuffer });
      }
    }

    if (validFiles.length === 0) {
      setLocalErr('કૃપા કરીને માત્ર માન્ય PDF ફાઇલો અપલોડ કરો (Please upload valid PDF files)');
      return;
    }

    await onFilesSelect(validFiles);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileList(e.target.files);
      // Reset input value so same files can be re-selected if deleted
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSamplePdf = async () => {
    try {
      setLocalErr(null);
      setIsGeneratingSample(true);
      const { file, arrayBuffer } = await generateSampleGujaratiPdf();
      await onFilesSelect([{ file, arrayBuffer }]);
    } catch (err: any) {
      console.error('Error generating sample:', err);
      setLocalErr('Failed to generate sample PDF: ' + err.message);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const totalPagesInQueue = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  const totalSizeInQueue = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 mb-2">
              <Files className="w-3.5 h-3.5" />
              <span>મલ્ટીપલ PDF સપોર્ટ (Multiple PDF Support)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              પગલું ૧: એક અથવા એકથી વધુ ગુજરાતી મતદાર યાદી PDF અપલોડ કરો
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              તમે એકસાથે એક અથવા એકથી વધારે PDF ફાઇલો અપલોડ કરી શકો છો. સિંગલ ક્લિક એક્સટ્રેક્શન દ્વારા તમામ PDF પ્રોસેસ થઈને સંયુક્ત એક્સેલ શીટ (.xlsx) માં કન્વર્ટ થશે.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLoadAllOfficialParts}
              disabled={isLoadingOfficial || isProcessing}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="ભાગ ૧, ભાગ ૨ અને ભાગ ૩ ત્રણેય સત્તાવાર PDF ઉમેરો"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-orange-600" />
              <span>બધા ૩ ભાગ એકસાથે ઉમેરો (All 3 Parts)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSamplePdf}
              disabled={isGeneratingSample || isProcessing}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileCheck2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>નમૂના PDF (Sample)</span>
            </button>
          </div>
        </div>

        {/* Multi-file Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            એક અથવા એકથી વધુ PDF ફાઇલો અહીં ખેંચીને મૂકો (Drag & Drop Multiple PDFs here)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            અથવા તમારા કમ્પ્યુટરથી એકસાથે ઘણી PDF પસંદ કરવા માટે બ્રાઉઝ કરો
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 pointer-events-none"
          >
            PDF ફાઇલો પસંદ કરો (Browse Files)
          </button>

          <div className="mt-3 flex items-center justify-center space-x-3 text-xs text-slate-500">
            <span>સપોર્ટ: મલ્ટીપલ PDF સિલેક્શન</span>
            <span>•</span>
            <span>ઓટોમેટીક એક્સેલ કન્વર્ઝન (.xlsx)</span>
            <span>•</span>
            <span>દરેક ભાગનું અલગ શીટ + સંયુક્ત માસ્ટર શીટ</span>
          </div>
        </div>

        {/* Quick individual load buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">સત્તાવાર રાજકોટ પશ્ચિમ (૬૯) મતદાર યાદી:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onLoadPart1Roll}
              disabled={isLoadingOfficial || isProcessing}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors cursor-pointer"
            >
              + ભાગ ૧ (૮૯૩ મતદારો)
            </button>
            <button
              type="button"
              onClick={onLoadPart2Roll}
              disabled={isLoadingOfficial || isProcessing}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors cursor-pointer"
            >
              + ભાગ ૨ (૬૯૪ મતદારો)
            </button>
            <button
              type="button"
              onClick={onLoadPart3Roll}
              disabled={isLoadingOfficial || isProcessing}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors cursor-pointer"
            >
              + ભાગ ૩ (૬૭૯ મતદારો)
            </button>
          </div>
        </div>
      </div>

      {/* Wipeout Success Banner */}
      {wipeoutMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-950 flex items-center space-x-1.5">
                <span>ડેટા સફળતાપૂર્વક સાચવાયો અને ક્લિયર થયો!</span>
                <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-200/60 text-emerald-800">
                  નવી પીડીએફ માટે તૈયાર
                </span>
              </h4>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">{wipeoutMessage}</p>
            </div>
          </div>
          {onDismissWipeoutMessage && (
            <button
              onClick={onDismissWipeoutMessage}
              className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md transition-colors cursor-pointer"
              title="સંદેશ બંધ કરો"
            >
              <span className="text-sm font-bold">✕</span>
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {(error || localErr) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold">ભૂલ આવી છે (Error Occurred)</h4>
            <p className="mt-0.5 text-xs text-red-700">{error || localErr}</p>
          </div>
        </div>
      )}

      {/* Queued PDF Files List Card */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-300">
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Files className="w-5 h-5 text-orange-600" />
                <span>અપલોડ થયેલ PDF કતાર (Uploaded PDF Queue)</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  {files.length} ફાઇલો
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                કુલ પેજ: <span className="font-semibold text-slate-800">{totalPagesInQueue} પેજ</span> | કુલ કદ:{' '}
                <span className="font-semibold text-slate-800">{formatFileSize(totalSizeInQueue)}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>વધુ PDF ઉમેરો (Add More)</span>
              </button>

              <button
                type="button"
                onClick={onClearAllFiles}
                disabled={isProcessing}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                title="તમામ ફાઇલો કાઢી નાખો"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>બધી કાઢો (Clear All)</span>
              </button>
            </div>
          </div>

          {/* List of files */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={file.id || idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-3 text-2xs text-slate-500 mt-1">
                      <span>કદ: {formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>
                        પેજ:{' '}
                        <strong className="text-slate-700 font-semibold">{file.pageCount || 0}</strong>
                      </span>
                      {file.bhagNumber && (
                        <>
                          <span>•</span>
                          <span>ભાગ: {file.bhagNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-3">
                  {file.status === 'completed' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> પૂર્ણ ({file.extractedCount || 0})
                    </span>
                  ) : file.status === 'processing' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                      સ્કેનિંગ...
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-slate-200 text-slate-700">
                      તૈયાર (Ready)
                    </span>
                  )}

                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="આ PDF કાઢી નાખો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Page Range Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                એક્સટ્રેક્શન શ્રેણી (Page Range)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageRangeMode('all')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    pageRangeMode === 'all'
                      ? 'border-orange-500 bg-orange-50 text-orange-800 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  તમામ પેજ ({totalPagesInQueue} Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setPageRangeMode('custom')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    pageRangeMode === 'custom'
                      ? 'border-orange-500 bg-orange-50 text-orange-800 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  કસ્ટમ પેજ (Custom Range)
                </button>
              </div>
            </div>

            {pageRangeMode === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  પેજ નંબર દાખલ કરો (દા.ત. 1-3, 5, 8-10)
                </label>
                <input
                  type="text"
                  value={customRangeText}
                  onChange={(e) => setCustomRangeText(e.target.value)}
                  placeholder="દા.ત. 1-3 અથવા 2, 4"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          {/* Single Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3 border-t border-slate-100">
            <div className="flex items-center text-xs text-slate-600">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>
                સિંગલ એક્સટ્રેક્શન: તમામ {files.length} PDF માંથી ડેટા એક્સટ્રેક્ટ થઈ Excel (.xlsx) તૈયાર થશે
              </span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {isProcessing ? (
                <button
                  type="button"
                  onClick={onCancelProcessing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                >
                  રદ કરો (Cancel Processing)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartExtraction(pageRangeMode, customRangeText)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {files.length > 1
                      ? `બધી (${files.length}) PDF એક્સટ્રેક્ટ કરો (Extract All PDFs)`
                      : 'એક્સટ્રેક્શન શરૂ કરો (Start Extraction)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
