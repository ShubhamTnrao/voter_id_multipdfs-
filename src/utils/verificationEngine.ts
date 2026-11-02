import { PageStatusInfo, VerificationIssue, VerificationSummary, VoterRecord } from '../types/voter';

export function runFullVerification(
  records: VoterRecord[],
  pageStatuses: PageStatusInfo[],
  totalPages: number
): VerificationSummary {
  const issues: VerificationIssue[] = [];
  const epicMap = new Map<string, VoterRecord[]>();
  const personKeyMap = new Map<string, VoterRecord[]>();

  let missingEpicsCount = 0;
  let suspiciousAgesCount = 0;
  let incompleteNamesCount = 0;

  // 1. Check Page Status Completeness
  const unprocessedPagesCount = pageStatuses.filter(
    (p) => p.status === 'pending' || p.status === 'processing'
  ).length;

  const failedPagesCount = pageStatuses.filter((p) => p.status === 'failed').length;

  // Verify missing page coverage
  const processedPageNumbers = new Set(pageStatuses.map((p) => p.pageNumber));
  for (let i = 1; i <= totalPages; i++) {
    if (!processedPageNumbers.has(i)) {
      issues.push({
        id: `unprocessed-p${i}`,
        type: 'sequence_gap',
        title: `પેજ ${i} પ્રક્રિયા થયેલ નથી (Unprocessed Page)`,
        description: `પેજ નંબર ${i} ની હજી સુધી પ્રક્રિયા કરવામાં આવી નથી.`,
        severity: 'error',
        pageNumber: i,
      });
    }
  }

  // Report failed pages
  pageStatuses.forEach((p) => {
    if (p.status === 'failed') {
      issues.push({
        id: `failed-p${p.pageNumber}`,
        type: 'sequence_gap',
        title: `પેજ ${p.pageNumber} નિષ્ફળ (Failed Page)`,
        description: `પેજ નંબર ${p.pageNumber} નું એક્સટ્રેક્શન નિષ્ફળ થયું: ${p.error || 'અજાણી ભૂલ'}`,
        severity: 'error',
        pageNumber: p.pageNumber,
      });
    }
  });

  // 2. Analyze Records
  records.forEach((rec, idx) => {
    // Missing or invalid EPIC
    if (!rec.epicNumber || rec.epicNumber.trim().length < 5) {
      missingEpicsCount++;
      issues.push({
        id: `missing-epic-${rec.id}`,
        type: 'missing_epic',
        title: `મતદાર ઓળખપત્ર (EPIC) ગેરહાજર`,
        description: `ક્રમ ${rec.serialNumber || idx + 1} (પેજ ${rec.pageNumber}) પર EPIC નંબર ઉપલબ્ધ નથી અથવા અપૂર્ણ છે.`,
        severity: 'warning',
        recordId: rec.id,
        pageNumber: rec.pageNumber,
        field: 'epicNumber',
      });
    } else {
      // Group by EPIC to find duplicates
      const cleanEpic = rec.epicNumber.trim().toUpperCase();
      const existing = epicMap.get(cleanEpic) || [];
      existing.push(rec);
      epicMap.set(cleanEpic, existing);
    }

    // Incomplete Name
    if (!rec.voterName || rec.voterName.trim().length < 2) {
      incompleteNamesCount++;
      issues.push({
        id: `incomplete-name-${rec.id}`,
        type: 'incomplete_name',
        title: `મતદારનું નામ અપૂર્ણ`,
        description: `ક્રમ ${rec.serialNumber || idx + 1} પર મતદારનું નામ મળ્યું નથી.`,
        severity: 'error',
        recordId: rec.id,
        pageNumber: rec.pageNumber,
        field: 'voterName',
      });
    }

    // Suspicious Age (< 18 or > 115)
    if (rec.age < 18 || rec.age > 115) {
      suspiciousAgesCount++;
      issues.push({
        id: `suspicious-age-${rec.id}`,
        type: 'suspicious_age',
        title: `શંકાસ્પદ ઉંમર (${rec.age})`,
        description: `મતદાર ${rec.voterName || 'અજ્ઞાત'} ની ઉંમર ${rec.age} વર્ષ નોંધાયેલ છે (સામાન્ય માન્યતા: ૧૮ થી ૧૧૫).`,
        severity: 'warning',
        recordId: rec.id,
        pageNumber: rec.pageNumber,
        field: 'age',
      });
    }

    // Check duplicate person by Name + House + Relative
    if (rec.voterName && rec.houseNumber) {
      const personKey = `${rec.voterName.trim()}_${rec.houseNumber.trim()}_${rec.relationshipName.trim()}`;
      const existingKey = personKeyMap.get(personKey) || [];
      existingKey.push(rec);
      personKeyMap.set(personKey, existingKey);
    }
  });

  // 3. Duplicate EPICs
  let duplicateEpicsCount = 0;
  epicMap.forEach((group, epic) => {
    if (group.length > 1) {
      duplicateEpicsCount += group.length;
      issues.push({
        id: `dup-epic-${epic}`,
        type: 'duplicate_epic',
        title: `ડુપ્લિકેટ EPIC નંબર: ${epic}`,
        description: `આ EPIC નંબર ${group.length} અલગ-અલગ મતદારો સાથે જોવા મળ્યો છે (પેજ: ${group.map((g) => g.pageNumber).join(', ')}).`,
        severity: 'warning',
        field: 'epicNumber',
      });
    }
  });

  // 4. Missing Serial Number Continuity per page
  const pageToRecords = new Map<number, VoterRecord[]>();
  records.forEach((r) => {
    const list = pageToRecords.get(r.pageNumber) || [];
    list.push(r);
    pageToRecords.set(r.pageNumber, list);
  });

  pageToRecords.forEach((pageRecs, pageNum) => {
    const numericSerials = pageRecs
      .map((r) => parseInt(r.serialNumber, 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (numericSerials.length > 2) {
      for (let i = 0; i < numericSerials.length - 1; i++) {
        const diff = numericSerials[i + 1] - numericSerials[i];
        if (diff > 1 && diff <= 5) {
          issues.push({
            id: `gap-p${pageNum}-${numericSerials[i]}`,
            type: 'sequence_gap',
            title: `ક્રમ નંબરમાં અંતરાલ (Gap in Serial Numbers)`,
            description: `પેજ ${pageNum} પર ક્રમ ${numericSerials[i]} અને ${numericSerials[i + 1]} વચ્ચે અંતરાલ જણાય છે.`,
            severity: 'info',
            pageNumber: pageNum,
          });
        }
      }
    }
  });

  const verifiedRecords = records.filter((r) => r.isVerified).length;
  const unverifiedRecords = records.length - verifiedRecords;

  // Never 100% complete if unprocessed or failed pages remain
  const isFullyComplete =
    totalPages > 0 &&
    unprocessedPagesCount === 0 &&
    failedPagesCount === 0 &&
    pageStatuses.length === totalPages;

  return {
    totalRecords: records.length,
    verifiedRecords,
    unverifiedRecords,
    duplicateEpicsCount,
    missingEpicsCount,
    suspiciousAgesCount,
    incompleteNamesCount,
    unprocessedPagesCount,
    failedPagesCount,
    isFullyComplete,
    issues,
  };
}
