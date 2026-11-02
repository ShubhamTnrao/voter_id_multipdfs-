import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Pause,
  Play,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PageStatusInfo } from '../types/voter';

interface ExtractionProgressProps {
  totalPages: number;
  pagesProcessed: number;
  pagesRemaining: number;
  totalRecordsExtracted: number;
  currentStatus: 'Idle' | 'Processing' | 'Verifying' | 'Completed' | 'Paused' | 'Error';
  pageStatuses: PageStatusInfo[];
  currentPageProcessing: number | null;
  onRetryPage: (pageNumber: number) => void;
  onRetryAllFailed: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  onViewPageSource: (pageNumber: number) => void;
  onGoToTable: () => void;
  currentPdfIndex?: number;
  totalPdfFiles?: number;
  currentPdfName?: string;
}

export const ExtractionProgress: React.FC<ExtractionProgressProps> = ({
  totalPages,
  pagesProcessed,
  pagesRemaining,
  totalRecordsExtracted,
  currentStatus,
  pageStatuses,
  currentPageProcessing,
  onRetryPage,
  onRetryAllFailed,
  onTogglePause,
  isPaused,
  onViewPageSource,
  onGoToTable,
  currentPdfIndex,
  totalPdfFiles,
  currentPdfName,
}) => {
  const percentComplete = totalPages > 0 ? Math.round((pagesProcessed / totalPages) * 100) : 0;
  const failedPagesCount = pageStatuses.filter((p) => p.status === 'failed').length;

  const getStatusBadge = (status: PageStatusInfo['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> પૂર્ણ (Completed)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Clock className="w-3 h-3 mr-1 text-blue-600" /> સ્કેનિંગ...
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> સમીક્ષા જરૂરી
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 mr-1 text-red-600" /> નિષ્ફળ (Failed)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            બાકી (Pending)
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Prominent Next Step / Proceed to Data Table Banner */}
      <div className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-orange-500">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold flex items-center justify-center sm:justify-start gap-2">
              <span>આગળ વધો: મતદાર ડેટા કોષ્ટક જુઓ</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-orange-900">
                {totalRecordsExtracted} મતદારો
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
              {currentStatus === 'Completed'
                ? 'તમામ પેજનું સ્કેનિંગ પૂર્ણ થયું છે! કોષ્ટકમાં પૂરો ડેટા જોવા માટે અહીં ક્લિક કરો.'
                : 'સ્કેનિંગ પ્રક્રિયા ચાલુ છે. તમે કોઈપણ સમયે એક્સટ્રેક્ટ થયેલ ડેટા કોષ્ટકમાં જોઈ શકો છો.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToTable}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-black text-orange-950 bg-white hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer border-2 border-white/80 active:scale-95"
        >
          <span>પગલું ૩: ડેટા કોષ્ટક જુઓ (Show Data Table)</span>
          <ArrowRight className="w-5 h-5 text-orange-700 stroke-[3]" />
        </button>
      </div>

      {/* Active Multi-PDF Status Banner */}
      {totalPdfFiles && totalPdfFiles > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold">
              સિંગલ એક્સટ્રેક્શન ચાલુ છે: PDF {(currentPdfIndex || 0) + 1} / {totalPdfFiles}
            </span>
            <span className="text-amber-800 font-medium truncate max-w-md">
              ({currentPdfName || 'પ્રોસેસિંગ...'})
            </span>
          </div>
          <span className="font-semibold bg-amber-200/70 px-2 py-0.5 rounded text-amber-950 text-2xs">
            બધા PDF એકસાથે કન્વર્ટ થઈ રહ્યા છે
          </span>
        </div>
      )}

      {/* Live Metric Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Pages */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">કુલ પેજ (Total Pages)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalPages}</p>
          <span className="text-[11px] text-slate-400">PDF પાનાની સંખ્યા</span>
        </div>

        {/* Processed Pages */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">પ્રક્રિયા થયેલ (Processed)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{pagesProcessed}</p>
          <span className="text-[11px] text-emerald-700/80">{percentComplete}% પૂર્ણ</span>
        </div>

        {/* Remaining Pages */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">બાકી પેજ (Remaining)</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{pagesRemaining}</p>
          <span className="text-[11px] text-slate-400">કતારમાં રહેલ પેજ</span>
        </div>

        {/* Total Voter Records */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">મતદારો મળ્યા (Extracted)</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{totalRecordsExtracted}</p>
          <span className="text-[11px] text-orange-700/80">કુલ મતદાર રેકોર્ડ્સ</span>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs col-span-2 md:col-span-1">
          <p className="text-xs font-medium text-slate-500">વર્તમાન સ્થિતિ (Status)</p>
          <div className="flex items-center space-x-1.5 mt-1">
            {currentStatus === 'Processing' && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            )}
            <p className="text-base font-bold text-slate-900">{currentStatus}</p>
          </div>
          <span className="text-[11px] text-slate-400 truncate block">
            {currentPageProcessing ? `પેજ ${currentPageProcessing} પર કાર્ય ચાલુ` : 'તૈયાર'}
          </span>
        </div>
      </div>

      {/* Progress Bar & Main Actions Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>પેજ વાઇઝ સ્કેનિંગ અને ડેટા ઓળખ પ્રક્રિયા (Live Progress)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              દરેક પેજનું હાઇ-રીઝોલ્યુશન રેન્ડરિંગ, ગુજરાતી અક્ષર વિશ્લેષણ અને ઓળખપત્ર મેપિંગ
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {currentStatus === 'Processing' && (
              <button
                type="button"
                onClick={onTogglePause}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 text-emerald-600 fill-emerald-600" />
                    ચાલુ રાખો (Resume)
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1 text-amber-600 fill-amber-600" />
                    રોકો (Pause)
                  </>
                )}
              </button>
            )}

            {failedPagesCount > 0 && (
              <button
                type="button"
                onClick={onRetryAllFailed}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-red-600" />
                નિષ્ફળ {failedPagesCount} પેજ ફરી ચલાવો
              </button>
            )}

            {totalRecordsExtracted > 0 && (
              <button
                type="button"
                onClick={onGoToTable}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 shadow-2xs transition-colors"
              >
                <span>ડેટા કોષ્ટક જુઓ ({totalRecordsExtracted})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>
              {pagesProcessed} of {totalPages} પાના પૂર્ણ ({percentComplete}%)
            </span>
            <span>{totalRecordsExtracted} મતદાર રેકોર્ડ મળ્યા</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-linear-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Page Status Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            તમામ પેજ પ્રક્રિયા સ્થિતિ વિગત (Page-by-Page Audit Grid)
          </h4>
          <span className="text-xs text-slate-500">
            કુલ {pageStatuses.length} પેજ ટ્રેક થયેલ છે
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold z-10">
              <tr>
                <th className="px-4 py-2.5">પેજ નંબર (Page)</th>
                <th className="px-4 py-2.5">પ્રક્રિયા સ્થિતિ (Status)</th>
                <th className="px-4 py-2.5">રેકોર્ડ્સ (Records)</th>
                <th className="px-4 py-2.5">પદ્ધતિ (Method)</th>
                <th className="px-4 py-2.5">સારાંશ / નોંધ (Summary)</th>
                <th className="px-4 py-2.5 text-right">ક્રિયાઓ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pageStatuses.map((page) => (
                <tr
                  key={page.pageNumber}
                  className={`hover:bg-slate-50 transition-colors ${
                    page.pageNumber === currentPageProcessing ? 'bg-blue-50/60 font-medium' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    પેજ {page.pageNumber}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(page.status)}</td>
                  <td className="px-4 py-3 font-medium">
                    {page.recordsCount > 0 ? (
                      <span className="text-slate-900 font-bold">{page.recordsCount} મતદાર</span>
                    ) : (
                      <span className="text-slate-400">0 (મુખ્ય/સારાંશ પૃષ્ઠ)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {page.method === 'vision_ocr'
                      ? 'AI Vision OCR'
                      : page.method === 'text_parsing'
                      ? 'Direct Text'
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {page.error ? (
                      <span className="text-red-600 font-medium">{page.error}</span>
                    ) : (
                      page.summary || 'પ્રક્રિયા કતારમાં...'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewPageSource(page.pageNumber)}
                      className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      title="ઓરિજિનલ પેજ જુઓ"
                    >
                      <Eye className="w-3 h-3 mr-1 text-slate-500" /> પેજ જુઓ
                    </button>
                    {(page.status === 'failed' || page.status === 'needs_review' || page.status === 'completed') && (
                      <button
                        type="button"
                        onClick={() => onRetryPage(page.pageNumber)}
                        className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors cursor-pointer"
                        title="આ પેજ ફરી સ્કેન કરો"
                      >
                        <RotateCcw className="w-3 h-3 mr-1 text-orange-600" /> ફરી કરો
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Sticky/Prominent Action Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-800">સ્કેનિંગ સ્થિતિ:</span> {pagesProcessed} / {totalPages} પેજ પ્રોસેસ થવા સાથે કુલ <span className="font-bold text-orange-600">{totalRecordsExtracted}</span> મતદાર રેકોર્ડ એક્સટ્રેક્ટ થયેલ છે.
        </div>
        <button
          type="button"
          onClick={onGoToTable}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>આગળ વધો: મતદાર ડેટા કોષ્ટક જુઓ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
