import React, { useState } from 'react';
import { Sparkles, Copy, Check, X, BookOpen, Lightbulb, ExternalLink } from 'lucide-react';

interface NotebookLMPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalVoters: number;
  bhagNumber?: string;
  pdfName?: string;
}

export const NotebookLMPromptModal: React.FC<NotebookLMPromptModalProps> = ({
  isOpen,
  onClose,
  totalVoters,
  bhagNumber = '2',
  pdfName = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'part2' | 'part1' | 'combined'>('part2');

  if (!isOpen) return null;

  const part2Prompt = `
# Prompt for Google NotebookLM: Gujarat Electoral Roll - AC 69 (Rajkot West) Part 2 Deep Analysis

You are a Senior Political Scientist, Election Demographer, and Electoral Data Analyst. I have uploaded the official Electoral Roll PDF for Gujarat Assembly Constituency 69 (Rajkot West), Polling Station / Part 2 (ડૉ. ઝાકીર હુસૈન પ્રાથમિક શાળા નં. ૯૧-૨, રૈયાધાર, રાજકોટ) containing 694 voter records (362 Male, 332 Female) across 9 distinct residential sections (વિભાગો) and a supplementary list (પૂરવણી-1).

Please perform an in-depth, data-grounded demographic, sociological, and booth management analysis of this document and answer the following core analysis requirements:

---

### 1. BOOTH SUMMARY & ADMINISTRATIVE CONTEXT
- **Assembly Constituency**: 69 - Rajkot West (૬૯ - રાજકોટ પશ્ચિમ)
- **Parliamentary Constituency**: 10 - Rajkot (૧૦ - રાજકોટ)
- **Part / Booth No**: 2 (ભાગ નંબર ૨)
- **Polling Station Location**: Dr. Zakir Hussain Primary School No. 91-2, Raiyadhar, Rajkot
- **Total Electors**: 694 (Male: 362, Female: 332)
- **Sex Ratio**: 917 females per 1,000 males. Analyze how this compares to Rajkot city average and urban Gujarat.

---

### 2. SECTION-WISE (વિભાગ વાઇઝ) DEMOGRAPHIC BREAKDOWN
Analyze each of the 9 geographic sections in Part 2:
1. **વિભાગ ૧**: 1-ઈન્દિરાનગર મફતિયાપરા શેરી નં. 5, ધરમનગર પાસે, 150 ફૂટ રીંગ રોડ, રૈયા-38 (Serials 1 - 123)
2. **વિભાગ ૨**: 2-ઈન્દિરાનગર મફતિયાપરા શેરી નં-16, રૈયા-39 (Serials 124 - 131)
3. **વિભાગ ૩**: 3-રૈયાધાર ટાઉનશીપ આવાસ, પાણીના ટાંકા સામે, રૈયાધાર, રાજકોટ (Serials 132 - 190)
4. **વિભાગ ૪**: 4-ઈન્દિરાનગર, મફતિયાપરા શેરી નં. 8, ધરમનગર પાસે, 150 ફૂટ રીંગ રોડ, રૈયા-38 (Serials 191 - 335)
5. **વિભાગ ૫**: 5-સ્લમ ક્વાર્ટસ શેરી નં.-6, રૈયાધાર, રૈયા રોડ, રૈયા-40, રાજકોટ (Serials 336 - 408)
6. **વિભાગ ૬**: 6-સ્લમ પ્લોટ શેરી નં. 2 (રૈયા), શાંતિનગર સામે, રૈયાધાર, રૈયા-41, રાજકોટ (Serials 409 - 502)
7. **વિભાગ ૭**: 7-સ્લમ પ્લોટ શેરી નં. 4 (રૈયા), શાંતિનગર સામે, રૈયાધાર, રૈયા-41, રાજકોટ (Serials 503 - 562)
8. **વિભાગ ૮**: 8-સ્લમ ક્વાર્ટસ શેરી નં.-9, રૈયાધાર, રૈયા રોડ, રૈયા-40, રાજકોટ (Serials 563 - 646)
9. **વિભાગ ૯**: 9-જાહેર શૌચાલયની બાજુમાં, રાણીમાં રૂડીમાં ચોક પાસે, 80 ફુટ રોડ, રૈયાધાર, રૈયા-42, રાજકોટ (Serials 647 - 690)
10. **પૂરવણી-૧ (વધારા યાદી)**: Late additions (Serials 691 - 694)

*For each section, extract and tabulate:*
- Voter count & booth percentage share
- Male vs Female counts and local sex ratio
- Major housing patterns (Slum Quarters vs Township Awas vs Settlement Streets)

---

### 3. AGE COHORTS & VOTER GENERATIONS
- **First-Time Voters (18–21 years)**: Count, list names, and identify which sections have high youth concentrations.
- **Young Workforce (22–35 years)**: Employment, aspiration, and mobile voter concerns.
- **Middle-Aged (36–59 years)**: Family leaders and community anchors.
- **Senior Citizens (60–79 years)**: Elders needing community support.
- **Super Seniors (80+ years)**: ECI Form 12D Home Voting eligible candidates.

---

### 4. COMMUNITY, SURNAME & FAMILY NETWORKS
- Analyze key surnames across the slum quarters, plots, and township:
  - Parmar, Solanki, Chavda, Gohel, Vaghela, Jadav, Rathod, Makwana, Jadeja, Amroniya, Bamba, Jogarana, Satiya, Nimavat, Kherani, etc.
- Identify the largest household clusters (House Numbers with 4+ registered family voters).
- Analyze single-voter houses vs multi-generation joint families.

---

### 5. CIVIC & BOOTH MOBILIZATION STRATEGY
Provide 5 actionable takeaways for:
1. **ECI Booth Level Officer (BLO)**: 100% voter slip delivery and accessibility at Dr. Zakir Hussain School.
2. **Turnout Enhancement**: Strategies for raising female participation in Raiyadhar township and slum plots.
3. **Public Amenities**: Water supply, drainage, 80-ft road access, sanitation near public convenience blocks.

Please format your response in clean Markdown with clear bilingual (Gujarati & English) subheadings.
`.trim();

  const part1Prompt = `
# Prompt for Google NotebookLM: Gujarat Electoral Roll - AC 69 (Rajkot West) Part 1 Deep Analysis

You are a Senior Political Scientist and Election Demographer. I have uploaded the official Electoral Roll PDF for Gujarat Assembly Constituency 69 (Rajkot West), Polling Station / Part 1 (રૈયાધાર પ્રાથમિક શાળા નં. ૯૧-૧, રાજકોટ) containing 893 voter records (485 Male, 408 Female) across 5 residential sections and a supplementary list (પૂરવણી-1).

Please perform an in-depth demographic, sociological, and booth analysis answering:
1. **Booth Overview**: Part 1, Dr. Zakir Hussain Primary School Room 3, Raiyadhar, 893 electors.
2. **Section Breakdown**:
   - વિભાગ ૧: Indiranagar Street 1, near Dharamnagar (Serials 1 - 279)
   - વિભાગ ૨: Indiranagar Street 3, near Dharamnagar (Serials 280 - 361)
   - વિભાગ ૩: Indiranagar Street 4, near Dharamnagar (Serials 362 - 437)
   - વિભાગ ૪: Indiranagar Street 6, near Dharamnagar (Serials 438 - 622)
   - વિભાગ ૫: Suncity Haven & Suncity Plus, opp. Water Tank (Serials 623 - 866)
   - પૂરવણી-૧: Serials 867 - 893
3. **Socio-Economic Contrast**: Compare the Mafatiyapara settlement (Sections 1–4) with the high-rise gated society of Suncity Haven (Section 5).
4. **Age Cohorts**: 18-21 (Youth), 22-35 (Workforce), 36-59 (Middle), 60+ (Seniors).
5. **Community Clans**: Prominent surnames in Indiranagar vs Suncity Haven.
6. **Actionable Recommendations**: BLO voter assistance, female turnout, and civic priorities.
`.trim();

  const combinedPrompt = `
# Prompt for Google NotebookLM: Comparative Electoral Analysis - AC 69 Part 1 vs Part 2 (Raiyadhar, Rajkot)

You are an expert Political Scientist and Election Data Strategist. I have uploaded the Electoral Rolls for both Part 1 (893 voters) and Part 2 (694 voters) of Assembly Constituency 69 (Rajkot West), representing the twin polling stations located at Dr. Zakir Hussain Primary School No. 91 (Raiyadhar, Ward 1). Combined total: 1,587 electors.

Please provide a comparative cross-booth intelligence report:
1. **Comparative Booth Profiles**: Compare demographics, sex ratio, and voting density of Part 1 vs Part 2.
2. **Micro-Geographic Comparison**: Compare Indiranagar streets (1, 3, 4, 6 in Part 1 vs 5, 8, 16 in Part 2), Raiyadhar Township Awas, Slum Quarters, Slum Plots, and Suncity Haven apartments.
3. **Combined Age Distribution**: Demographic pyramid of the entire 1,587-voter cluster.
4. **Family Networks & Cross-Booth Migration**: Check families split between Part 1 and Part 2.
5. **Master Campaign & Governance Plan**: Comprehensive civic and voter turnout roadmap for Ward 1 Raiyadhar.
`.trim();

  const currentPrompt = activeTab === 'part2' ? part2Prompt : activeTab === 'part1' ? part1Prompt : combinedPrompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-orange-50 via-white to-blue-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Google NotebookLM Master Prompts</span>
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  ૧-ક્લિક કોપી
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                પીડીએફને NotebookLM માં અપલોડ કર્યા પછી આ પ્રોમ્પ્ટ પેસ્ટ કરી સંપૂર્ણ વિશ્લેષણ મેળવો
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('part2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'part2'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ભાગ ૨ પ્રોમ્પ્ટ (૬૯૪ મતદારો)
            </button>
            <button
              onClick={() => setActiveTab('part1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'part1'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ભાગ ૧ પ્રોમ્પ્ટ (૮૯૩ મતદારો)
            </button>
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'combined'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              સંયુક્ત તુલના (૧,૫૮૭ મતદારો)
            </button>
          </div>
          <div className="hidden sm:flex items-center text-xs text-slate-500 space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>હાલમાં સક્રિય: {activeTab === 'part2' ? 'ભાગ ૨' : activeTab === 'part1' ? 'ભાગ ૧' : 'બંને ભાગ'}</span>
          </div>
        </div>

        {/* Instruction Tips */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/60 flex items-start space-x-2 text-xs text-amber-900">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>ઉપયોગ કરવાની રીત:</strong> notebooklm.google.com ખોલો &gt; નવી નોટબુક બનાવી મતદાર યાદી PDF અપલોડ કરો &gt; નીચે આપેલ પ્રોમ્પ્ટ કોપી કરી NotebookLM ચેટમાં પેસ્ટ કરો.
          </p>
        </div>

        {/* Prompt Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200 shadow-2xs leading-relaxed max-h-[460px] overflow-y-auto selection:bg-orange-100">
            {currentPrompt}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <a
            href="https://notebooklm.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <span>NotebookLM ખોલો</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              બંધ કરો
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                  પ્રોમ્પ્ટ કોપી થઈ ગયો!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  પ્રોમ્પ્ટ કોપી કરો (Copy Prompt)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
