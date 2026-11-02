import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { PageStatusInfo, VerificationSummary, VoterRecord } from '../types/voter';
import { exportToCsv, exportToExcel, exportVerificationTextReport } from '../utils/exportUtils';

interface ExportToolbarProps {
  records: VoterRecord[];
  pageStatuses: PageStatusInfo[];
  verificationSummary: VerificationSummary;
  filename?: string;
  onOpenNotebookLMPrompt?: () => void;
  onWipeoutAndReadyNext?: (reasonMessage?: string) => void;
  autoWipeout?: boolean;
  onToggleAutoWipeout?: (enabled: boolean) => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  records,
  pageStatuses,
  verificationSummary,
  filename = 'gujarati_voter_list',
  onOpenNotebookLMPrompt,
  onWipeoutAndReadyNext,
  autoWipeout = true,
  onToggleAutoWipeout,
}) => {
  const handleExportExcel = () => {
    exportToExcel(records, pageStatuses, verificationSummary, filename);
    if (onWipeoutAndReadyNext) {
      setTimeout(() => {
        onWipeoutAndReadyNext(
          `એક્સેલ ફાઇલ (${filename}.xlsx) સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! અગાઉનો તમામ ડેટા દૂર કરવામાં આવ્યો છે અને નવી PDF માટે એપ્લિકેશન તૈયાર છે.`
        );
      }, 500);
    }
  };

  const handleExportCsv = () => {
    exportToCsv(records, filename);
    if (onWipeoutAndReadyNext) {
      setTimeout(() => {
        onWipeoutAndReadyNext(
          `સીએસવી ફાઇલ (${filename}.csv) સફળતાપૂર્વક ડાઉનલોડ થઈ ગઈ છે! અગાઉનો તમામ ડેટા દૂર કરવામાં આવ્યો છે અને નવી PDF માટે એપ્લિકેશન તૈયાર છે.`
        );
      }, 500);
    }
  };

  const handleExportReport = () => {
    exportVerificationTextReport(verificationSummary, pageStatuses);
  };

  const handleManualWipeout = () => {
    if (onWipeoutAndReadyNext) {
      onWipeoutAndReadyNext('તમામ ડેટા સાફ કરવામાં આવ્યો છે. નવી PDF અપલોડ કરવા માટે એપ્લિકેશન તૈયાર છે.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Download className="w-4 h-4 text-orange-600" />
            <span>ડેટા એક્સપોર્ટ અને વિશ્લેષણ વિકલ્પો (Export & Analysis Options)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            વિભાગ, વોર્ડ, ભાગ અને PDF નામ સાથે Excel/CSV ડાઉનલોડ કરો • ડાઉનલોડ બાદ નવી PDF માટે ઓટો-રીસેટ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* NotebookLM Prompt Button */}
          {onOpenNotebookLMPrompt && (
            <button
              type="button"
              onClick={onOpenNotebookLMPrompt}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-1.5 text-orange-600" />
              <span>NotebookLM પ્રોમ્પ્ટ</span>
            </button>
          )}

          {/* Download Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Excel ફાઇલ ડાઉનલોડ કર્યા પછી ડેટા સાફ થઈ જશે અને નવી પીડીએફ માટે એપ્લિકેશન તૈયાર થશે"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Excel ડાઉનલોડ (.xlsx)</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={records.length === 0}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="CSV ફાઇલ ડાઉનલોડ કર્યા પછી ડેટા સાફ થઈ જશે અને નવી પીડીએફ માટે એપ્લિકેશન તૈયાર થશે"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-600" />
            <span>CSV ડાઉનલોડ (.csv)</span>
          </button>

          {/* Download Audit Report */}
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 mr-1 text-slate-700" />
            <span>ઓડિટ રિપોર્ટ (.txt)</span>
          </button>

          {/* Manual Wipeout & Ready Next PDF button */}
          {onWipeoutAndReadyNext && (
            <button
              type="button"
              onClick={handleManualWipeout}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs transition-colors cursor-pointer"
              title="તમામ ડેટા સાફ કરી નવી PDF માટે એપ્લિકેશન તૈયાર કરો"
            >
              <RotateCcw className="w-4 h-4 mr-1 text-rose-600" />
              <span>+ નવી PDF (New PDF / Reset)</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto Wipeout Toggle Settings */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoWipeout}
            onChange={(e) => onToggleAutoWipeout && onToggleAutoWipeout(e.target.checked)}
            className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
          />
          <span className="font-semibold text-slate-800">
            ડાઉનલોડ કર્યા પછી આપમેળે ડેટા સાફ કરો અને નવી PDF માટે તૈયાર થાઓ (Auto wipeout data after download and ready app for next PDF)
          </span>
        </label>
        {autoWipeout && (
          <span className="text-2xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>ઓટો-વાઇપઆઉટ સક્રિય છે</span>
          </span>
        )}
      </div>
    </div>
  );
};
