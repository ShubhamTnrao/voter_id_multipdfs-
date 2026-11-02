import { jsPDF } from 'jspdf';

export interface SampleVoter {
  serial: number;
  epic: string;
  name: string;
  relType: string;
  relName: string;
  house: string;
  age: number;
  gender: 'પુરુષ' | 'સ્ત્રી';
}

const SAMPLE_PAGE_2_VOTERS: SampleVoter[] = [
  { serial: 1, epic: 'GJ04025101', name: 'પટેલ રમેશભાઈ મગનભાઈ', relType: 'પિતાનું નામ', relName: 'મગનભાઈ પટેલ', house: '૧', age: 52, gender: 'પુરુષ' },
  { serial: 2, epic: 'GJ04025102', name: 'પટેલ ગીતાબેન રમેશભાઈ', relType: 'પતિનું નામ', relName: 'રમેશભાઈ પટેલ', house: '૧', age: 48, gender: 'સ્ત્રી' },
  { serial: 3, epic: 'GJ04025103', name: 'પટેલ ભાવિક રમેશભાઈ', relType: 'પિતાનું નામ', relName: 'રમેશભાઈ પટેલ', house: '૧', age: 24, gender: 'પુરુષ' },
  { serial: 4, epic: 'GJ04025104', name: 'શાહ કમલેશકુમાર રમણલાલ', relType: 'પિતાનું નામ', relName: 'રમણલાલ શાહ', house: '૨/એ', age: 60, gender: 'પુરુષ' },
  { serial: 5, epic: 'GJ04025105', name: 'શાહ નયનાબેન કમલેશભાઈ', relType: 'પતિનું નામ', relName: 'કમલેશભાઈ શાહ', house: '૨/એ', age: 56, gender: 'સ્ત્રી' },
  { serial: 6, epic: 'GJ04025106', name: 'શાહ તુષાર કમલેશકુમાર', relType: 'પિતાનું નામ', relName: 'કમલેશકુમાર', house: '૨/એ', age: 31, gender: 'પુરુષ' },
  { serial: 7, epic: 'GJ04025107', name: 'જોષી દિલીપભાઈ હરિપ્રસાદ', relType: 'પિતાનું નામ', relName: 'હરિપ્રસાદ જોષી', house: '૩', age: 45, gender: 'પુરુષ' },
  { serial: 8, epic: 'GJ04025108', name: 'જોષી વૈશાલીબેન દિલીપભાઈ', relType: 'પતિનું નામ', relName: 'દિલીપભાઈ જોષી', house: '૩', age: 41, gender: 'સ્ત્રી' },
  { serial: 9, epic: 'GJ04025109', name: 'જોષી પૂજન દિલીપભાઈ', relType: 'પિતાનું નામ', relName: 'દિલીપભાઈ જોષી', house: '૩', age: 19, gender: 'પુરુષ' },
  { serial: 10, epic: 'GJ04025110', name: 'ઠાકોર ભવાનજી પ્રતાપજી', relType: 'પિતાનું નામ', relName: 'પ્રતાપજી ઠાકોર', house: '૪', age: 67, gender: 'પુરુષ' },
  { serial: 11, epic: 'GJ04025111', name: 'ઠાકોર શાંતાબેન ભવાનજી', relType: 'પતિનું નામ', relName: 'ભવાનજી ઠાકોર', house: '૪', age: 62, gender: 'સ્ત્રી' },
  { serial: 12, epic: 'GJ04025112', name: 'ઠાકોર દિનેશભાઈ ભવાનજી', relType: 'પિતાનું નામ', relName: 'ભવાનજી ઠાકોર', house: '૪', age: 38, gender: 'પુરુષ' },
  { serial: 13, epic: 'GJ04025113', name: 'પરમાર બાબુભાઈ જીવણભાઈ', relType: 'પિતાનું નામ', relName: 'જીવણભાઈ પરમાર', house: '૫', age: 50, gender: 'પુરુષ' },
  { serial: 14, epic: 'GJ04025114', name: 'પરમાર કૈલાશબેન બાબુભાઈ', relType: 'પતિનું નામ', relName: 'બાબુભાઈ પરમાર', house: '૫', age: 46, gender: 'સ્ત્રી' },
  { serial: 15, epic: 'GJ04025115', name: 'પરમાર મયૂર બાબુભાઈ', relType: 'પિતાનું નામ', relName: 'બાબુભાઈ પરમાર', house: '૫', age: 22, gender: 'પુરુષ' },
  { serial: 16, epic: 'GJ04025116', name: 'દેસાઈ નરેન્દ્રભાઈ શંકરલાલ', relType: 'પિતાનું નામ', relName: 'શંકરલાલ દેસાઈ', house: '૬', age: 54, gender: 'પુરુષ' },
  { serial: 17, epic: 'GJ04025117', name: 'દેસાઈ પારુલબેન નરેન્દ્રભાઈ', relType: 'પતિનું નામ', relName: 'નરેન્દ્રભાઈ દેસાઈ', house: '૬', age: 51, gender: 'સ્ત્રી' },
  { serial: 18, epic: 'GJ04025118', name: 'દેસાઈ ચિંતન નરેન્દ્રભાઈ', relType: 'પિતાનું નામ', relName: 'નરેન્દ્રભાઈ', house: '૬', age: 27, gender: 'પુરુષ' },
  { serial: 19, epic: 'GJ04025119', name: 'સોની મહેશભાઈ ભોગીલાલ', relType: 'પિતાનું નામ', relName: 'ભોગીલાલ સોની', house: '૭/બી', age: 58, gender: 'પુરુષ' },
  { serial: 20, epic: 'GJ04025120', name: 'સોની રક્ષાબેન મહેશભાઈ', relType: 'પતિનું નામ', relName: 'મહેશભાઈ સોની', house: '૭/બી', age: 53, gender: 'સ્ત્રી' },
  { serial: 21, epic: 'GJ04025121', name: 'મેવાડા હસમુખભાઈ ચુનીલાલ', relType: 'પિતાનું નામ', relName: 'ચુનીલાલ મેવાડા', house: '૮', age: 63, gender: 'પુરુષ' },
  { serial: 22, epic: 'GJ04025122', name: 'મેવાડા લીલાબેન હસમુખભાઈ', relType: 'પતિનું નામ', relName: 'હસમુખભાઈ મેવાડા', house: '૮', age: 59, gender: 'સ્ત્રી' },
  { serial: 23, epic: 'GJ04025123', name: 'મેવાડા પ્રતીક હસમુખભાઈ', relType: 'પિતાનું નામ', relName: 'હસમુખભાઈ મેવાડા', house: '૮', age: 29, gender: 'પુરુષ' },
  { serial: 24, epic: 'GJ04025124', name: 'ચૌહાણ ગોવિંદભાઈ મોહનભાઈ', relType: 'પિતાનું નામ', relName: 'મોહનભાઈ ચૌહાણ', house: '૯', age: 49, gender: 'પુરુષ' },
  { serial: 25, epic: 'GJ04025125', name: 'ચૌહાણ મંજુલાબેન ગોવિંદભાઈ', relType: 'પતિનું નામ', relName: 'ગોવિંદભાઈ ચૌહાણ', house: '૯', age: 44, gender: 'સ્ત્રી' },
  { serial: 26, epic: 'GJ04025126', name: 'ચૌહાણ વિપુલ ગોવિંદભાઈ', relType: 'પિતાનું નામ', relName: 'ગોવિંદભાઈ ચૌહાણ', house: '૯', age: 23, gender: 'પુરુષ' },
  { serial: 27, epic: 'GJ04025127', name: 'વ્યાસ હરેશકુમાર કેશવલાલ', relType: 'પિતાનું નામ', relName: 'કેશવલાલ વ્યાસ', house: '૧૦', age: 61, gender: 'પુરુષ' },
  { serial: 28, epic: 'GJ04025128', name: 'વ્યાસ દર્શનાબેન હરેશભાઈ', relType: 'પતિનું નામ', relName: 'હરેશભાઈ વ્યાસ', house: '૧૦', age: 57, gender: 'સ્ત્રી' },
  { serial: 29, epic: 'GJ04025129', name: 'વ્યાસ યશ હરેશકુમાર', relType: 'પિતાનું નામ', relName: 'હરેશકુમાર વ્યાસ', house: '૧૦', age: 28, gender: 'પુરુષ' },
  { serial: 30, epic: 'GJ04025130', name: 'રાઠોડ પ્રકાશભાઈ જેઠાભાઈ', relType: 'પિતાનું નામ', relName: 'જેઠાભાઈ રાઠોડ', house: '૧૧', age: 47, gender: 'પુરુષ' },
];

const SAMPLE_PAGE_3_VOTERS: SampleVoter[] = [
  { serial: 31, epic: 'GJ04025131', name: 'રાઠોડ જયાબેન પ્રકાશભાઈ', relType: 'પતિનું નામ', relName: 'પ્રકાશભાઈ રાઠોડ', house: '૧૧', age: 43, gender: 'સ્ત્રી' },
  { serial: 32, epic: 'GJ04025132', name: 'રાઠોડ હાર્દિક પ્રકાશભાઈ', relType: 'પિતાનું નામ', relName: 'પ્રકાશભાઈ રાઠોડ', house: '૧૧', age: 21, gender: 'પુરુષ' },
  { serial: 33, epic: 'GJ04025133', name: 'શાહ અતુલભાઈ મણિલાલ', relType: 'પિતાનું નામ', relName: 'મણિલાલ શાહ', house: '૧૨', age: 65, gender: 'પુરુષ' },
  { serial: 34, epic: 'GJ04025134', name: 'શાહ રસીલાબેન અતુલભાઈ', relType: 'પતિનું નામ', relName: 'અતુલભાઈ શાહ', house: '૧૨', age: 60, gender: 'સ્ત્રી' },
  { serial: 35, epic: 'GJ04025135', name: 'શાહ નિરવ અતુલભાઈ', relType: 'પિતાનું નામ', relName: 'અતુલભાઈ શાહ', house: '૧૨', age: 34, gender: 'પુરુષ' },
  { serial: 36, epic: 'GJ04025136', name: 'શાહ કિંજલબેન નિરવભાઈ', relType: 'પતિનું નામ', relName: 'નિરવભાઈ શાહ', house: '૧૨', age: 31, gender: 'સ્ત્રી' },
  { serial: 37, epic: 'GJ04025137', name: 'પ્રજાપતિ વિષ્ણુભાઈ કાળીદાસ', relType: 'પિતાનું નામ', relName: 'કાળીદાસ પ્રજાપતિ', house: '૧૩', age: 53, gender: 'પુરુષ' },
  { serial: 38, epic: 'GJ04025138', name: 'પ્રજાપતિ ભારતીબેન વિષ્ણુભાઈ', relType: 'પતિનું નામ', relName: 'વિષ્ણુભાઈ પ્રજાપતિ', house: '૧૩', age: 49, gender: 'સ્ત્રી' },
  { serial: 39, epic: 'GJ04025139', name: 'પ્રજાપતિ કલ્પેશ વિષ્ણુભાઈ', relType: 'પિતાનું નામ', relName: 'વિષ્ણુભાઈ પ્રજાપતિ', house: '૧૩', age: 26, gender: 'પુરુષ' },
  { serial: 40, epic: 'GJ04025140', name: 'મોદી પ્રદીપકુમાર નટવરલાલ', relType: 'પિતાનું નામ', relName: 'નટવરલાલ મોદી', house: '૧૪', age: 55, gender: 'પુરુષ' },
  { serial: 41, epic: 'GJ04025141', name: 'મોદી વર્ષાબેન પ્રદીપકુમાર', relType: 'પતિનું નામ', relName: 'પ્રદીપકુમાર મોદી', house: '૧૪', age: 50, gender: 'સ્ત્રી' },
  { serial: 42, epic: 'GJ04025142', name: 'મોદી રાહુલ પ્રદીપકુમાર', relType: 'પિતાનું નામ', relName: 'પ્રદીપકુમાર મોદી', house: '૧૪', age: 25, gender: 'પુરુષ' },
  { serial: 43, epic: 'GJ04025143', name: 'મિશ્રા સંજયભાઈ રામનારાયણ', relType: 'પિતાનું નામ', relName: 'રામનારાયણ મિશ્રા', house: '૧૫', age: 48, gender: 'પુરુષ' },
  { serial: 44, epic: 'GJ04025144', name: 'મિશ્રા સુનિતાબેન સંજયભાઈ', relType: 'પતિનું નામ', relName: 'સંજયભાઈ મિશ્રા', house: '૧૫', age: 44, gender: 'સ્ત્રી' },
  { serial: 45, epic: 'GJ04025145', name: 'વાઘેલા સુરેશસિંહ ચંદુભા', relType: 'પિતાનું નામ', relName: 'ચંદુભા વાઘેલા', house: '૧૬', age: 59, gender: 'પુરુષ' },
  { serial: 46, epic: 'GJ04025146', name: 'વાઘેલા મંગળાબા સુરેશસિંહ', relType: 'પતિનું નામ', relName: 'સુરેશસિંહ વાઘેલા', house: '૧૬', age: 55, gender: 'સ્ત્રી' },
  { serial: 47, epic: 'GJ04025147', name: 'વાઘેલા વિક્રમસિંહ સુરેશસિંહ', relType: 'પિતાનું નામ', relName: 'સુરેશસિંહ વાઘેલા', house: '૧૬', age: 32, gender: 'પુરુષ' },
  { serial: 48, epic: 'GJ04025148', name: 'દવે અનિલભાઈ બળવંતરાય', relType: 'પિતાનું નામ', relName: 'બળવંતરાય દવે', house: '૧૭', age: 64, gender: 'પુરુષ' },
  { serial: 49, epic: 'GJ04025149', name: 'દવે ચેતનાબેન અનિલભાઈ', relType: 'પતિનું નામ', relName: 'અનિલભાઈ દવે', house: '૧૭', age: 58, gender: 'સ્ત્રી' },
  { serial: 50, epic: 'GJ04025150', name: 'દવે અંકિતકુમાર અનિલભાઈ', relType: 'પિતાનું નામ', relName: 'અનિલભાઈ દવે', house: '૧૭', age: 30, gender: 'પુરુષ' },
  { serial: 51, epic: 'GJ04025151', name: 'પંચાલ રમેશચંદ્ર છગનલાલ', relType: 'પિતાનું નામ', relName: 'છગનલાલ પંચાલ', house: '૧૮', age: 66, gender: 'પુરુષ' },
  { serial: 52, epic: 'GJ04025152', name: 'પંચાલ તારાબેન રમેશચંદ્ર', relType: 'પતિનું નામ', relName: 'રમેશચંદ્ર પંચાલ', house: '૧૮', age: 61, gender: 'સ્ત્રી' },
  { serial: 53, epic: 'GJ04025153', name: 'પંચાલ જિગ્નેશ રમેશચંદ્ર', relType: 'પિતાનું નામ', relName: 'રમેશચંદ્ર પંચાલ', house: '૧૮', age: 35, gender: 'પુરુષ' },
  { serial: 54, epic: 'GJ04025154', name: 'પંચાલ નેહાબેન જિગ્નેશભાઈ', relType: 'પતિનું નામ', relName: 'જિગ્નેશભાઈ પંચાલ', house: '૧૮', age: 32, gender: 'સ્ત્રી' },
  { serial: 55, epic: 'GJ04025155', name: 'શાહ મુકેશકુમાર ચીમનલાલ', relType: 'પિતાનું નામ', relName: 'ચીમનલાલ શાહ', house: '૧૯/૧', age: 57, gender: 'પુરુષ' },
  { serial: 56, epic: 'GJ04025156', name: 'શાહ બીનાબેન મુકેશકુમાર', relType: 'પતિનું નામ', relName: 'મુકેશકુમાર શાહ', house: '૧૯/૧', age: 52, gender: 'સ્ત્રી' },
  { serial: 57, epic: 'GJ04025157', name: 'સોલંકી કિશોરભાઈ નાનજીભાઈ', relType: 'પિતાનું નામ', relName: 'નાનજીભાઈ સોલંકી', house: '૨૦', age: 46, gender: 'પુરુષ' },
  { serial: 58, epic: 'GJ04025158', name: 'સોલંકી ભાવનાબેન કિશોરભાઈ', relType: 'પતિનું નામ', relName: 'કિશોરભાઈ સોલંકી', house: '૨૦', age: 42, gender: 'સ્ત્રી' },
  { serial: 59, epic: 'GJ04025159', name: 'સોલંકી મિહિર કિશોરભાઈ', relType: 'પિતાનું નામ', relName: 'કિશોરભાઈ સોલંકી', house: '૨૦', age: 20, gender: 'પુરુષ' },
  { serial: 60, epic: 'GJ04025160', name: 'ત્રિવેદી વિનોદરાય શંભુપ્રસાદ', relType: 'પિતાનું નામ', relName: 'શંભુપ્રસાદ ત્રિવેદી', house: '૨૧', age: 72, gender: 'પુરુષ' },
];

/**
 * Render Page 1 (Cover / Summary Page) onto a Canvas
 */
function renderCoverPageCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1240; // A4 aspect at 150 DPI
  canvas.height = 1754;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inner double border
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#64748b';
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('ભારતનું ચૂંટણી પંચ (ELECTION COMMISSION OF INDIA)', canvas.width / 2, 100);

  ctx.font = 'bold 28px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('મતદાર યાદી - ૨૦૨૬ (ELECTORAL ROLL - 2026)', canvas.width / 2, 150);

  ctx.font = '22px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('ગુજરાત રાજ્ય (GUJARAT STATE)', canvas.width / 2, 190);

  // Division line
  ctx.beginPath();
  ctx.moveTo(60, 220);
  ctx.lineTo(canvas.width - 60, 220);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Section 1: Assembly Constituency Box
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('૧. વિધાનસભા મતદાર વિભાગની વિગતો:', 70, 265);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 285, canvas.width - 140, 160);

  ctx.font = '20px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('વિધાનસભા મતદાર વિભાગનો નંબર અને નામ:  ૫૨ - ગાંધીનગર દક્ષિણ', 90, 325);
  ctx.fillText('લોકસભા મતદાર વિભાગનો નંબર અને નામ:     ૦૬ - ગાંધીનગર', 90, 365);
  ctx.fillText('અનામત સ્થિતિ:                          સામાન્ય (General)', 90, 405);

  // Section 2: Polling Station Box
  ctx.font = 'bold 24px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('૨. મતદાન મથકની વિગતો:', 70, 495);

  ctx.strokeRect(70, 515, canvas.width - 140, 180);
  ctx.font = '20px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('મતદાન મથક નંબર અને નામ:    ૧૪૫ - પ્રાથમિક શાળા, સેક્ટર - ૭, પૂર્વ વિભાગ', 90, 555);
  ctx.fillText('મતદાન મથકનું સરનામું:         સેક્ટર - ૭/બી, ગાંધીનગર - ૩૮૨૦૦૭', 90, 595);
  ctx.fillText('મતદાન મથકનો પ્રકાર:          પુરુષ અને સ્ત્રી સંયુક્ત', 90, 635);
  ctx.fillText('મૂળ યાદીનો પ્રકાર:           ખાસ સંક્ષિપ્ત સુધારણા યાદી ૨૦૨૬', 90, 675);

  // Section 3: Summary of Voters
  ctx.font = 'bold 24px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('૩. મતદારોની સંખ્યાનો સારાંશ:', 70, 745);

  // Table
  const tableX = 70;
  const tableY = 765;
  const colWidths = [150, 240, 240, 240, 230];
  const rowHeight = 45;

  ctx.strokeRect(tableX, tableY, canvas.width - 140, rowHeight * 4);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(tableX, tableY, canvas.width - 140, rowHeight);

  ctx.strokeStyle = '#94a3b8';
  // horizontal dividers
  for (let r = 1; r < 4; r++) {
    ctx.beginPath();
    ctx.moveTo(tableX, tableY + r * rowHeight);
    ctx.lineTo(tableX + canvas.width - 140, tableY + r * rowHeight);
    ctx.stroke();
  }

  // Header cells
  ctx.font = 'bold 19px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ક્રમ', tableX + 20, tableY + 30);
  ctx.fillText('પુરુષ મતદાર', tableX + 170, tableY + 30);
  ctx.fillText('સ્ત્રી મતદાર', tableX + 410, tableY + 30);
  ctx.fillText('ત્રીજી જાતિ', tableX + 650, tableY + 30);
  ctx.fillText('કુલ મતદારો', tableX + 890, tableY + 30);

  // Row 1
  ctx.font = '19px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('૧', tableX + 20, tableY + rowHeight + 30);
  ctx.fillText('૩૨ (Thirty Two)', tableX + 170, tableY + rowHeight + 30);
  ctx.fillText('૨૮ (Twenty Eight)', tableX + 410, tableY + rowHeight + 30);
  ctx.fillText('૦ (Zero)', tableX + 650, tableY + rowHeight + 30);
  ctx.fillText('૬૦ (Sixty)', tableX + 890, tableY + rowHeight + 30);

  // Map Box / Layout sketch area
  ctx.font = 'bold 22px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillText('૪. મતદાન મથક નકશો / વિસ્તાર રેખાચિત્ર:', 70, 995);
  ctx.strokeStyle = '#94a3b8';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(70, 1015, canvas.width - 140, 500);
  ctx.strokeRect(70, 1015, canvas.width - 140, 500);

  ctx.fillStyle = '#64748b';
  ctx.font = '24px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('[ મતદાન મથક પરિસર નકશો તથા નજરી નકશો - સેક્ટર ૭ ]', canvas.width / 2, 1260);

  // Footer
  ctx.font = '18px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('પેજ ૧ / ૩ (મુખ્ય સારાંશ પૃષ્ઠ)', canvas.width / 2, 1690);

  return canvas;
}

/**
 * Render Voter Record Page (3 columns x 10 rows = 30 voter boxes) onto a Canvas
 */
function renderVoterPageCanvas(pageNumber: number, voters: SampleVoter[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Page Header
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 20, canvas.width - 60, 45);

  ctx.font = 'bold 18px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.fillText('વિધાનસભા મતદાર વિભાગ: ૫૨ - ગાંધીનગર દક્ષિણ', 45, 48);

  ctx.textAlign = 'center';
  ctx.fillText('વિભાગ નંબર: ૧ - સેક્ટર ૭ પૂર્વ', canvas.width / 2, 48);

  ctx.textAlign = 'right';
  ctx.fillText(`મતદાન મથક: ૧૪૫ | પેજ ${pageNumber} / ૩`, canvas.width - 45, 48);

  // Grid coordinates: 3 columns x 10 rows
  const gridStartX = 30;
  const gridStartY = 75;
  const totalCols = 3;
  const totalRows = 10;
  const cardWidth = Math.floor((canvas.width - 60) / totalCols); // ~393px
  const cardHeight = Math.floor((canvas.height - 110) / totalRows); // ~164px

  voters.forEach((v, index) => {
    const col = index % totalCols;
    const row = Math.floor(index / totalCols);

    const x = gridStartX + col * cardWidth;
    const y = gridStartY + row * cardHeight;

    // Card border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    // Card top bar (Serial Number left, EPIC right)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 1, y + 1, cardWidth - 2, 28);
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(x, y + 29);
    ctx.lineTo(x + cardWidth, y + 29);
    ctx.stroke();

    // Serial number
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px "Noto Sans Gujarati", Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${v.serial}`, x + 8, y + 21);

    // EPIC Number
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px Inter, "Noto Sans Gujarati", sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(v.epic, x + cardWidth - 8, y + 21);

    // Photo placeholder box on right
    const photoBoxW = 75;
    const photoBoxH = 95;
    const photoBoxX = x + cardWidth - photoBoxW - 8;
    const photoBoxY = y + 36;

    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(photoBoxX + 1, photoBoxY + 1, photoBoxW - 2, photoBoxH - 2);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Noto Sans Gujarati", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ફોટો', photoBoxX + photoBoxW / 2, photoBoxY + 45);
    ctx.fillText('ઉપલબ્ધ છે', photoBoxX + photoBoxW / 2, photoBoxY + 62);

    // Voter Details on left
    ctx.textAlign = 'left';
    const textStartX = x + 8;
    let lineY = y + 50;

    // Name
    ctx.font = '14px "Noto Sans Gujarati", Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('મતદારનું નામ:', textStartX, lineY);
    ctx.font = 'bold 14px "Noto Sans Gujarati", Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(v.name, textStartX, lineY + 18);

    lineY += 38;
    // Relative
    ctx.font = '13px "Noto Sans Gujarati", Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`${v.relType}:`, textStartX, lineY);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(v.relName, textStartX, lineY + 16);

    lineY += 34;
    // House & Age / Gender line
    ctx.font = '13px "Noto Sans Gujarati", Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`ઘર નંબર: `, textStartX, lineY);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${v.house}`, textStartX + 60, lineY);

    lineY += 20;
    ctx.fillStyle = '#334155';
    ctx.fillText(`ઉંમર: `, textStartX, lineY);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${v.age}`, textStartX + 38, lineY);

    ctx.fillStyle = '#334155';
    ctx.fillText(`જાતિ: `, textStartX + 90, lineY);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${v.gender}`, textStartX + 128, lineY);
  });

  // Page Footer
  ctx.font = '14px "Noto Sans Gujarati", Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText(`પેજ ${pageNumber} / ૩ - કુલ મતદારો ૩૦`, canvas.width / 2, canvas.height - 12);

  return canvas;
}

/**
 * Generate a complete 3-Page Official Gujarati Electoral Roll PDF in memory
 */
export async function generateSampleGujaratiPdf(): Promise<{
  file: File;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  // Page 1: Cover Page
  const canvas1 = renderCoverPageCanvas();
  const imgData1 = canvas1.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  // Page 2: Voter records 1 to 30
  doc.addPage();
  const canvas2 = renderVoterPageCanvas(2, SAMPLE_PAGE_2_VOTERS);
  const imgData2 = canvas2.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  // Page 3: Voter records 31 to 60
  doc.addPage();
  const canvas3 = renderVoterPageCanvas(3, SAMPLE_PAGE_3_VOTERS);
  const imgData3 = canvas3.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData3, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  const arrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const file = new File([blob], 'Gujarat_Electoral_Roll_AC52_PS145.pdf', { type: 'application/pdf' });

  return {
    file,
    arrayBuffer,
    pageCount: 3,
  };
}
