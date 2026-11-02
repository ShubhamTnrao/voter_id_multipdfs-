import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Copy,
  Users,
  FileQuestion,
  FileDown,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PageStatusInfo, VerificationSummary, VoterRecord } from '../types/voter';

interface VerificationPanelProps {
  summary: VerificationSummary;
  pageStatuses: PageStatusInfo[];
  totalPages: number;
  onMarkAllCleanVerified: () => void;
  onDownloadReport: () => void;
  onViewSourcePage: (pageNum: number) => void;
  onFilterTableByIssue: (type: string) => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  summary,
  pageStatuses,
  totalPages,
  onMarkAllCleanVerified,
  onDownloadReport,
  onViewSourcePage,
  onFilterTableByIssue,
}) => {
  const verifiedPercentage =
    summary.totalRecords > 0
      ? Math.round((summary.verifiedRecords / summary.totalRecords) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner Status */}
      <div
        className={`rounded-xl border p-5 shadow-xs ${
          summary.isFullyComplete
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-amber-50/60 border-amber-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                summary.isFullyComplete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {summary.isFullyComplete
                  ? 'તમામ પાના સફળતાપૂર્વક ચકાસાયેલ છે (Full Page Verification Completed)'
                  : 'ચકાસણી ઓડિટ અને અપૂર્ણતા સમીક્ષા (Audit & Review Pending)'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {summary.isFullyComplete
                  ? `કુલ ${summary.totalRecords} મતદારોની તમામ ${totalPages} પાના પરથી સંપૂર્ણ ચોકસાઈ સાથે ચકાસણી થયેલ છે.`
                  : `સાવચેતી: કેટલાક પેજ અથવા મતદાર રેકોર્ડ્સમાં ધ્યાન આપવા યોગ્ય વિસંગતતાઓ અથવા અપૂર્ણતાઓ છે.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onDownloadReport}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <FileDown className="w-4 h-4 mr-1.5 text-slate-600" />
              ચકાસણી અહેવાલ (Audit Report)
            </button>
            {summary.unverifiedRecords > 0 && (
              <button
                type="button"
                onClick={onMarkAllCleanVerified}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                સાફ રેકોર્ડ્સ ચકાસાયેલ કરો
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Extracted */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">કુલ મતદારો</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalRecords}</p>
          <span className="text-[11px] text-slate-400">એક્સટ્રેક્ટ થયેલ</span>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">ચકાસાયેલ (Verified)</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary.verifiedRecords}</p>
          <span className="text-[11px] text-emerald-700">{verifiedPercentage}% કન્ફર્મ</span>
        </div>

        {/* Duplicate EPICs */}
        <div
          onClick={() => onFilterTableByIssue('duplicate_epic')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <p className="text-xs text-slate-500 font-medium">ડુપ્લિકેટ ઓળખપત્ર</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary.duplicateEpicsCount}</p>
          <span className="text-[11px] text-amber-700 underline">EPIC ચકાસો</span>
        </div>

        {/* Missing EPICs */}
        <div
          onClick={() => onFilterTableByIssue('missing_epic')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <p className="text-xs text-slate-500 font-medium">ગેરહાજર ઓળખપત્ર</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary.missingEpicsCount}</p>
          <span className="text-[11px] text-amber-700 underline">EPIC નથી મળ્યા</span>
        </div>

        {/* Suspicious Ages */}
        <div
          onClick={() => onFilterTableByIssue('suspicious_age')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <p className="text-xs text-slate-500 font-medium">શંકાસ્પદ ઉંમર (&lt;18/&gt;115)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{summary.suspiciousAgesCount}</p>
          <span className="text-[11px] text-slate-500 underline">ઉંમર તપાસો</span>
        </div>

        {/* Unprocessed / Failed Pages */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">અપૂર્ણ / નિષ્ફળ પેજ</p>
          <p
            className={`text-xl font-bold mt-1 ${
              summary.failedPagesCount > 0 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {summary.unprocessedPagesCount + summary.failedPagesCount}
          </p>
          <span className="text-[11px] text-slate-400">પેજ કવરેજ</span>
        </div>
      </div>

      {/* Detailed Issues List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>શોધાયેલ વિસંગતતાઓ અને ચેતવણીઓ ({summary.issues.length} Issues Detected)</span>
          </h3>
          <span className="text-xs text-slate-500">
            કૃપા કરીને આ રેકોર્ડ્સને મૂળ PDF સાથે સરખાવી વેરિફાય કરો
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {summary.issues.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                અભિનંદન! કોઈ વિસંગતતા કે ભૂલ મળી નથી.
              </p>
              <p className="text-slate-500 mt-1">
                તમામ મતદારોના નામ, ઓળખપત્ર નંબર, ઉંમર અને સંબંધ વિગતો માન્ય ફોર્મેટમાં છે.
              </p>
            </div>
          ) : (
            summary.issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between text-xs gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {issue.severity === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <FileQuestion className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{issue.title}</span>
                      {issue.pageNumber && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          પેજ {issue.pageNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-0.5">{issue.description}</p>
                  </div>
                </div>

                {issue.pageNumber && (
                  <button
                    type="button"
                    onClick={() => onViewSourcePage(issue.pageNumber!)}
                    className="shrink-0 inline-flex items-center px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                  >
                    <span>પેજ જુઓ</span>
                    <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
