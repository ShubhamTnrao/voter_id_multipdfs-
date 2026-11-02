import React from 'react';
import { FileSpreadsheet, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentStep: 'upload' | 'extract' | 'table' | 'verify';
  onStepChange: (step: 'upload' | 'extract' | 'table' | 'verify') => void;
  hasFile: boolean;
  totalRecords: number;
  onNewPdfUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepChange,
  hasFile,
  totalRecords,
  onNewPdfUpload,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  ગુજરાતી મતદાર યાદી ડેટા એક્સટ્રેક્ટર
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" /> AI Vision OCR + Text
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Gujarati Electoral Roll PDF Data Extraction, Verification & Excel Export
              </p>
            </div>
          </div>

          {/* Workflow Step Navigation */}
          <div className="flex items-center space-x-2">
            <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => onStepChange('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  currentStep === 'upload'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold">1</span>
                <span>પીડીએફ અપલોડ (Upload)</span>
              </button>

              <button
                disabled={!hasFile}
                onClick={() => onStepChange('extract')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  !hasFile
                    ? 'text-slate-300 cursor-not-allowed'
                    : currentStep === 'extract'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold">2</span>
                <span>સ્કેનિંગ (Extraction)</span>
              </button>

              <button
                disabled={totalRecords === 0}
                onClick={() => onStepChange('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  totalRecords === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : currentStep === 'table'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold">3</span>
                <span>મતદાર ડેટા કોષ્ટક ({totalRecords})</span>
              </button>

              <button
                disabled={totalRecords === 0}
                onClick={() => onStepChange('verify')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  totalRecords === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : currentStep === 'verify'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ચકાસણી (Audit)</span>
              </button>
            </nav>

            {/* Quick Reset / Upload Next Button */}
            {onNewPdfUpload && (
              <button
                onClick={onNewPdfUpload}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1"
                title="તમામ ડેટા સાફ કરી નવી PDF અપલોડ કરો (Remove all data & start fresh)"
              >
                <span>+ નવી PDF (New PDF)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
