import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
try {
  // Use jsdelivr or unpkg with current version for bulletproof worker loading in dev and prod
  const version = pdfjsLib.version || '4.10.38';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization notice:', e);
}

export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  embeddedText: string;
}

/**
 * Load PDF document from ArrayBuffer
 */
export async function loadPdfDocument(data: ArrayBuffer): Promise<any> {
  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Extract raw text from a given PDF page
 */
export async function extractPageText(pdfDoc: any, pageNumber: number): Promise<string> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map((item: any) => item.str || '');
    return strings.join(' ').trim();
  } catch (error) {
    console.warn(`Could not extract embedded text from page ${pageNumber}:`, error);
    return '';
  }
}

/**
 * Render a PDF page onto an HTML canvas and return image data URL
 */
export async function renderPageToImage(
  pdfDoc: any,
  pageNumber: number,
  scale: number = 1.6
): Promise<RenderedPage> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (!context) {
    throw new Error('Failed to get 2D context for rendering PDF page');
  }

  // Fill with white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  // Extract embedded text in parallel for prompt hint
  let embeddedText = '';
  try {
    const textContent = await page.getTextContent();
    embeddedText = textContent.items.map((item: any) => item.str || '').join(' ').trim();
  } catch (err) {
    console.warn('Error reading embedded text:', err);
  }

  // Convert to high-quality JPEG
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  // Clean up canvas
  canvas.width = 0;
  canvas.height = 0;

  return {
    pageNumber,
    dataUrl,
    width: viewport.width,
    height: viewport.height,
    embeddedText,
  };
}

/**
 * Heuristic to detect if embedded text contains recognizable Gujarati voter tokens
 */
export function containsGujaratiVoterTokens(text: string): boolean {
  if (!text || text.length < 50) return false;
  const keywords = ['મતદાર', 'નામ', 'પિતા', 'પતિ', 'માતા', 'ઉંમર', 'જાતિ', 'પુરુષ', 'સ્ત્રી', 'ઓળખપત્ર', 'મકાન'];
  let matchCount = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) matchCount++;
  }
  return matchCount >= 3;
}
