import React, { useEffect, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
} from 'lucide-react';
import { PageStatusInfo, VoterRecord } from '../types/voter';
import { renderPageToImage } from '../utils/pdfProcessor';

interface PageInspectorModalProps {
  pageNumber: number | null;
  onClose: () => void;
  pdfDoc: any;
  totalPages: number;
  records: VoterRecord[];
  onToggleVerify: (id: string) => void;
  pageStatuses: PageStatusInfo[];
  onNavigatePage: (pageNum: number) => void;
}

export const PageInspectorModal: React.FC<PageInspectorModalProps> = ({
  pageNumber,
  onClose,
  pdfDoc,
  totalPages,
  records,
  onToggleVerify,
  pageStatuses,
  onNavigatePage,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter records for this page
  const pageRecords = records.filter((r) => r.pageNumber === pageNumber);
  const pageStatus = pageStatuses.find((p) => p.pageNumber === pageNumber);

  useEffect(() => {
    let isCancelled = false;

    async function loadPage() {
      if (!pdfDoc || !pageNumber) return;
      setIsLoading(true);
      try {
        const rendered = await renderPageToImage(pdfDoc, pageNumber, 2.0); // high res 2.0 scale
        if (!isCancelled) {
          setPageImage(rendered.dataUrl);
        }
      } catch (err) {
        console.error('Error rendering page in inspector:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadPage();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  if (!pageNumber) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
              {pageNumber}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>ઓરિજિનલ PDF પેજ {pageNumber} ચકાસણી દર્શક (Page Comparison)</span>
                {pageStatus && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    સ્થિતિ: {pageStatus.status}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                મૂળ દસ્તાવેજ સાથે એક્સટ્રેક્ટ થયેલ {pageRecords.length} મતદારો સરખાવો
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={() => onNavigatePage(pageNumber - 1)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              title="અગાઉનું પેજ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2">
              પેજ {pageNumber} / {totalPages}
            </span>
            <button
              type="button"
              disabled={pageNumber >= totalPages}
              onClick={() => onNavigatePage(pageNumber + 1)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
              title="આગળનું પેજ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Zoom Controls */}
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
              title="નાનું કરો (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-mono text-slate-500 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
              title="મોટું કરો (Zoom In)"
            >
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
              title="રીસેટ (Reset)"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Split: Left Image Viewer, Right Extracted Voter Records */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
          {/* Left: Original PDF Page Viewer */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[300px]">
            {isLoading ? (
              <div className="text-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium">પેજ રેન્ડર થઈ રહ્યું છે...</p>
              </div>
            ) : pageImage ? (
              <div
                className="transition-transform duration-150 origin-top shadow-xl rounded-lg overflow-hidden bg-white"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={pageImage}
                  alt={`Original Electoral Roll Page ${pageNumber}`}
                  className="max-w-none w-[850px] object-contain select-none"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">પેજ ઇમેજ ઉપલબ્ધ નથી</p>
            )}
          </div>

          {/* Right: Side Panel with Extracted Voters */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                આ પેજના એક્સટ્રેક્ટ થયેલ મતદારો ({pageRecords.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                {pageRecords.filter((r) => r.isVerified).length} ચકાસાયેલ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
              {pageRecords.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  આ પેજ પર કોઈ મતદાર રેકોર્ડ મળ્યો નથી (દા.ત. મુખ્ય પૃષ્ઠ અથવા નકશો).
                </div>
              ) : (
                pageRecords.map((voter, vIdx) => (
                  <div
                    key={`${voter.id}-${vIdx}`}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      voter.isVerified
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : voter.flags.length > 0
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">
                          #{voter.serialNumber}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">
                          {voter.epicNumber || 'EPIC Missing'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleVerify(voter.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer ${
                          voter.isVerified
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{voter.isVerified ? 'ચકાસાયેલ' : 'ચકાસો'}</span>
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">નામ:</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {voter.voterName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          {voter.relationshipType === 'Husband'
                            ? 'પતિ'
                            : voter.relationshipType === 'Mother'
                            ? 'માતા'
                            : 'પિતા'}:
                        </span>
                        <span className="text-slate-800 text-right">
                          {voter.relationshipName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ઘર નંબર:</span>
                        <span className="font-medium text-slate-800">
                          {voter.houseNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ઉંમર / જાતિ:</span>
                        <span className="font-medium text-slate-800">
                          {voter.age} વર્ષ • {voter.gender}
                        </span>
                      </div>
                    </div>

                    {voter.flags.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-amber-100 text-[10px] text-amber-700 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
                        <span>ધ્યાન આપો: {voter.flags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
