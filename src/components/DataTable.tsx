import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';
import { PageStatusInfo, VoterRecord } from '../types/voter';

interface DataTableProps {
  records: VoterRecord[];
  onUpdateRecord: (updatedRecord: VoterRecord) => void;
  onToggleVerify: (id: string) => void;
  onBatchVerify: (ids: string[], verified: boolean) => void;
  onViewSourcePage: (pageNumber: number) => void;
  pageStatuses: PageStatusInfo[];
  onExportExcel: (subset?: VoterRecord[]) => void;
  onExportCsv: (subset?: VoterRecord[]) => void;
}

type SortField = 'serialNumber' | 'voterName' | 'age' | 'houseNumber' | 'pageNumber' | 'epicNumber';

export const DataTable: React.FC<DataTableProps> = ({
  records,
  onUpdateRecord,
  onToggleVerify,
  onBatchVerify,
  onViewSourcePage,
  pageStatuses,
  onExportExcel,
  onExportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedVibhag, setSelectedVibhag] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('all'); // all, verified, unverified, has_issues
  const [sortField, setSortField] = useState<SortField>('serialNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Row selection
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());

  // Editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<VoterRecord | null>(null);

  // Available unique PDFs
  const availablePdfs = useMemo(() => {
    const pdfs = new Set<string>();
    records.forEach((r) => {
      if (r.pdfName) pdfs.add(r.pdfName);
    });
    return Array.from(pdfs);
  }, [records]);

  // Available unique pages
  const availablePages = useMemo(() => {
    const pages = new Set<number>();
    records.forEach((r) => pages.add(r.pageNumber));
    return Array.from(pages).sort((a, b) => a - b);
  }, [records]);

  // Available unique vibhags
  const availableVibhags = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      if (r.vibhagNumber) {
        map.set(r.vibhagNumber, r.vibhagName || `વિભાગ ${r.vibhagNumber}`);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [records]);

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.voterName.toLowerCase().includes(q) ||
          r.fatherName.toLowerCase().includes(q) ||
          r.husbandName.toLowerCase().includes(q) ||
          r.relationshipName.toLowerCase().includes(q) ||
          r.epicNumber.toLowerCase().includes(q) ||
          r.houseNumber.toLowerCase().includes(q) ||
          (r.vibhagName && r.vibhagName.toLowerCase().includes(q)) ||
          (r.vibhagNumber && r.vibhagNumber.toLowerCase().includes(q)) ||
          (r.wardNumber && r.wardNumber.toLowerCase().includes(q)) ||
          (r.bhagNumber && r.bhagNumber.toLowerCase().includes(q)) ||
          String(r.serialNumber).includes(q) ||
          String(r.age).includes(q)
      );
    }

    // PDF filter
    if (selectedPdf !== 'all') {
      result = result.filter((r) => r.pdfName === selectedPdf);
    }

    // Gender filter
    if (selectedGender !== 'all') {
      result = result.filter((r) => r.gender === selectedGender);
    }

    // Vibhag filter
    if (selectedVibhag !== 'all') {
      result = result.filter((r) => r.vibhagNumber === selectedVibhag);
    }

    // Page filter
    if (selectedPage !== 'all') {
      const pNum = parseInt(selectedPage, 10);
      result = result.filter((r) => r.pageNumber === pNum);
    }

    // Status filter
    if (selectedFilterStatus === 'verified') {
      result = result.filter((r) => r.isVerified);
    } else if (selectedFilterStatus === 'unverified') {
      result = result.filter((r) => !r.isVerified);
    } else if (selectedFilterStatus === 'has_issues') {
      result = result.filter((r) => r.flags.length > 0);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'serialNumber' || sortField === 'age' || sortField === 'pageNumber') {
        const numA = parseInt(String(a[sortField]), 10) || 0;
        const numB = parseInt(String(b[sortField]), 10) || 0;
        comparison = numA - numB;
      } else {
        const valA = String(a[sortField] || '');
        const valB = String(b[sortField] || '');
        comparison = valA.localeCompare(valB, 'gu');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, searchQuery, selectedGender, selectedPage, selectedFilterStatus, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Row selection handlers
  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = new Set(selectedRecordIds);
    if (e.target.checked) {
      paginatedRecords.forEach((r) => newSelected.add(r.id));
    } else {
      paginatedRecords.forEach((r) => newSelected.delete(r.id));
    }
    setSelectedRecordIds(newSelected);
  };

  const handleSelectRecord = (id: string) => {
    const newSelected = new Set(selectedRecordIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecordIds(newSelected);
  };

  // Edit row handlers
  const startEditing = (record: VoterRecord) => {
    setEditingRowId(record.id);
    setEditFormData({ ...record });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditFormData(null);
  };

  const saveEditing = () => {
    if (editFormData) {
      onUpdateRecord(editFormData);
      setEditingRowId(null);
      setEditFormData(null);
    }
  };

  const isAllOnPageSelected =
    paginatedRecords.length > 0 &&
    paginatedRecords.every((r) => selectedRecordIds.has(r.id));

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="શોધો: નામ, પિતાનું નામ, ઘર નંબર, EPIC, ઉંમર..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* PDF File Filter */}
            {availablePdfs.length > 1 && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-500">PDF ફાઇલ:</span>
                <select
                  value={selectedPdf}
                  onChange={(e) => {
                    setSelectedPdf(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-orange-300 bg-orange-50/50 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-950 focus:outline-hidden focus:ring-2 focus:ring-orange-500 max-w-[200px] truncate"
                >
                  <option value="all">બધી PDF ({records.length})</option>
                  {availablePdfs.map((pdf) => (
                    <option key={pdf} value={pdf}>
                      {pdf.replace(/\.[^/.]+$/, '').slice(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">જાતિ:</span>
              <select
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">તમામ જાતિ (All)</option>
                <option value="પુરુષ">પુરુષ (Male)</option>
                <option value="સ્ત્રી">સ્ત્રી (Female)</option>
                <option value="ત્રીજી જાતિ">ત્રીજી જાતિ (Other)</option>
              </select>
            </div>

            {/* Vibhag Filter */}
            {availableVibhags.length > 0 && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-500">વિભાગ:</span>
                <select
                  value={selectedVibhag}
                  onChange={(e) => {
                    setSelectedVibhag(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 max-w-[180px] truncate"
                >
                  <option value="all">તમામ વિભાગો (All)</option>
                  {availableVibhags.map(([num, name]) => (
                    <option key={num} value={num}>
                      વિભાગ {num}: {name.slice(0, 22)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">પેજ:</span>
              <select
                value={selectedPage}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">તમામ પેજ (All)</option>
                {availablePages.map((p) => (
                  <option key={p} value={String(p)}>
                    પેજ {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">સ્થિતિ:</span>
              <select
                value={selectedFilterStatus}
                onChange={(e) => {
                  setSelectedFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">તમામ રેકોર્ડ્સ ({records.length})</option>
                <option value="verified">ચકાસાયેલ (Verified)</option>
                <option value="unverified">અચકાસાયેલ (Unverified)</option>
                <option value="has_issues">ધ્યાન આપવા યોગ્ય (Has Flags)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Selection Action Bar (when rows are selected) */}
        {selectedRecordIds.size > 0 && (
          <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200 rounded-lg px-3.5 py-2 text-xs">
            <span className="font-semibold text-orange-900">
              {selectedRecordIds.size} મતદારો પસંદ થયેલ છે
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() =>
                  onBatchVerify(Array.from(selectedRecordIds), true)
                }
                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors"
              >
                પસંદ કરેલને ચકાસાયેલ ચિહ્નિત કરો (Mark Verified)
              </button>
              <button
                type="button"
                onClick={() => {
                  const subset = records.filter((r) =>
                    selectedRecordIds.has(r.id)
                  );
                  onExportExcel(subset);
                }}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition-colors"
              >
                પસંદ કરેલ Excel ડાઉનલોડ
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecordIds(new Set())}
                className="px-2 py-1 text-slate-500 hover:text-slate-800"
              >
                સાફ કરો (Clear)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold z-10 shadow-2xs">
              <tr>
                {/* Select Checkbox */}
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleSelectAllOnPage}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </th>

                {/* Serial Number */}
                <th
                  onClick={() => handleSort('serialNumber')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/70 whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>ક્રમ (Sr)</span>
                    {sortField === 'serialNumber' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* EPIC Number */}
                <th
                  onClick={() => handleSort('epicNumber')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/70 whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>ઓળખપત્ર (EPIC)</span>
                    {sortField === 'epicNumber' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Voter Full Name */}
                <th
                  onClick={() => handleSort('voterName')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/70 min-w-[200px]"
                >
                  <div className="flex items-center space-x-1">
                    <span>મતદારનું પૂરું નામ (Voter Name)</span>
                    {sortField === 'voterName' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Relative Name */}
                <th className="px-4 py-3 min-w-[190px]">
                  <span>સંબંધીનું નામ અને સંબંધ (Relative)</span>
                </th>

                {/* House Number */}
                <th
                  onClick={() => handleSort('houseNumber')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/70 whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>ઘર નં. (House)</span>
                    {sortField === 'houseNumber' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Age */}
                <th
                  onClick={() => handleSort('age')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/70 whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>ઉંમર (Age)</span>
                    {sortField === 'age' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Gender */}
                <th className="px-3 py-3 whitespace-nowrap">
                  <span>જાતિ (Gender)</span>
                </th>

                {/* Vibhag */}
                <th className="px-3 py-3 min-w-[160px]">
                  <span>વિભાગ (Vibhag)</span>
                </th>

                {/* Ward & Bhag */}
                <th className="px-3 py-3 whitespace-nowrap">
                  <span>વોર્ડ / ભાગ (Ward / Part)</span>
                </th>

                {/* PDF Page */}
                <th
                  onClick={() => handleSort('pageNumber')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-200/70 whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>પેજ (Page)</span>
                    {sortField === 'pageNumber' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>

                {/* Verification Status */}
                <th className="px-3 py-3 text-center whitespace-nowrap">
                  <span>ચકાસણી (Status)</span>
                </th>

                {/* Actions */}
                <th className="px-3 py-3 text-right whitespace-nowrap">
                  <span>ક્રિયાઓ (Actions)</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">કોઈ મતદાર રેકોર્ડ મળ્યો નથી</p>
                    <p className="text-xs text-slate-400 mt-1">
                      શોધ શબ્દો અથવા ફિલ્ટર બદલો અથવા વધુ પેજ સ્કેન કરો.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => {
                  const isEditing = editingRowId === record.id;
                  const hasFlags = record.flags.length > 0;
                  const isSelected = selectedRecordIds.has(record.id);

                  if (isEditing && editFormData) {
                    return (
                      <tr key={`${record.id}-${index}`} className="bg-orange-50/50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRecord(record.id)}
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={editFormData.serialNumber}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                serialNumber: e.target.value,
                              })
                            }
                            className="w-14 px-1.5 py-1 text-xs border border-orange-400 rounded bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={editFormData.epicNumber}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                epicNumber: e.target.value.toUpperCase(),
                              })
                            }
                            className="w-24 px-1.5 py-1 text-xs font-mono uppercase border border-orange-400 rounded bg-white"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editFormData.voterName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                voterName: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-orange-400 rounded bg-white font-medium"
                          />
                        </td>
                        <td className="px-4 py-2 space-y-1">
                          <input
                            type="text"
                            placeholder="સંબંધીનું નામ"
                            value={editFormData.relationshipName}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                relationshipName: e.target.value,
                                fatherName:
                                  editFormData.relationshipType === 'Father'
                                    ? e.target.value
                                    : editFormData.fatherName,
                                husbandName:
                                  editFormData.relationshipType === 'Husband'
                                    ? e.target.value
                                    : editFormData.husbandName,
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-orange-400 rounded bg-white"
                          />
                          <select
                            value={editFormData.relationshipType}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                relationshipType: e.target.value,
                              })
                            }
                            className="w-full px-1.5 py-0.5 text-[11px] border border-orange-400 rounded bg-white"
                          >
                            <option value="Father">પિતાનું નામ (Father)</option>
                            <option value="Husband">પતિનું નામ (Husband)</option>
                            <option value="Mother">માતાનું નામ (Mother)</option>
                            <option value="Other">અન્ય (Other)</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={editFormData.houseNumber}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                houseNumber: e.target.value,
                              })
                            }
                            className="w-16 px-1.5 py-1 text-xs border border-orange-400 rounded bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={editFormData.age}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                age: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-14 px-1.5 py-1 text-xs border border-orange-400 rounded bg-white"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={editFormData.gender}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                gender: e.target.value,
                              })
                            }
                            className="w-20 px-1 py-1 text-xs border border-orange-400 rounded bg-white"
                          >
                            <option value="પુરુષ">પુરુષ</option>
                            <option value="સ્ત્રી">સ્ત્રી</option>
                            <option value="ત્રીજી જાતિ">અન્ય</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-500">
                          {record.pageNumber}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData({
                                ...editFormData,
                                isVerified: !editFormData.isVerified,
                              })
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              editFormData.isVerified
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {editFormData.isVerified ? 'ચકાસાયેલ' : 'બાકી'}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={saveEditing}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            title="સાચવો (Save)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            title="રદ કરો (Cancel)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={`${record.id}-${index}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-orange-50/40' : ''
                      } ${hasFlags && !record.isVerified ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRecord(record.id)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                      </td>

                      {/* Serial */}
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {record.serialNumber}
                      </td>

                      {/* EPIC */}
                      <td className="px-3 py-2.5 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {record.epicNumber ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {record.epicNumber}
                          </span>
                        ) : (
                          <span className="text-red-500 font-sans text-[11px] italic">
                            ગેરહાજર
                          </span>
                        )}
                      </td>

                      {/* Voter Name */}
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span>{record.voterName}</span>
                          {hasFlags && (
                            <span
                              className="inline-flex text-amber-500"
                              title={record.flags.join(', ')}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Relative Name */}
                      <td className="px-4 py-2.5 text-slate-700">
                        <div className="flex flex-col">
                          <span>{record.relationshipName || '—'}</span>
                          <span className="text-[10px] text-slate-400">
                            {record.relationshipType === 'Father'
                              ? 'પિતા'
                              : record.relationshipType === 'Husband'
                              ? 'પતિ'
                              : record.relationshipType === 'Mother'
                              ? 'માતા'
                              : 'અન્ય'}
                          </span>
                        </div>
                      </td>

                      {/* House No */}
                      <td className="px-3 py-2.5 text-slate-800 font-medium whitespace-nowrap">
                        {record.houseNumber || '—'}
                      </td>

                      {/* Age */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            record.age < 18 || record.age > 115
                              ? 'text-red-600 bg-red-50 px-1 py-0.5 rounded'
                              : 'text-slate-800'
                          }`}
                        >
                          {record.age} વર્ષ
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            record.gender === 'પુરુષ'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : record.gender === 'સ્ત્રી'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {record.gender || 'અજ્ઞાત'}
                        </span>
                      </td>

                      {/* Vibhag */}
                      <td className="px-3 py-2.5 text-slate-700 max-w-[200px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            વિભાગ {record.vibhagNumber || '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate" title={record.vibhagName}>
                            {record.vibhagName || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Ward & Bhag */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-medium text-slate-800">{record.wardNumber || 'વોર્ડ ૧'}</span>
                          <span className="text-[10px] text-slate-500">ભાગ: {record.bhagNumber || '૧'}</span>
                        </div>
                      </td>

                      {/* Page */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                        પેજ {record.pageNumber}
                      </td>

                      {/* Verified Badge */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleVerify(record.id)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                            record.isVerified
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {record.isVerified ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              ચકાસાયેલ
                            </>
                          ) : (
                            'અચકાસાયેલ'
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewSourcePage(record.pageNumber)}
                          className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="ઓરિજિનલ PDF પેજ ખોલો"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditing(record)}
                          className="p-1.5 rounded text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="સુધારો કરો (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Export Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span>
              કુલ <span className="font-bold text-slate-900">{filteredRecords.length}</span> માંથી{' '}
              {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} થી{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} દર્શાવેલ છે
            </span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>પ્રતિ પેજ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded px-1.5 py-0.5 bg-white text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Export of filtered data */}
            <button
              type="button"
              onClick={() => onExportExcel(filteredRecords)}
              className="inline-flex items-center px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              title="ફક્ત ફિલ્ટર થયેલ રેકોર્ડ્સ ડાઉનલોડ કરો"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              ફિલ્ટર થયેલ Excel ({filteredRecords.length})
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
