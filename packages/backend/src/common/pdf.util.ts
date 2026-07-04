import { extractText, getDocumentProxy } from 'unpdf';
import pdfParse from 'pdf-parse';

/** Max accepted PDF upload size — matches the "up to 10MB" hint in the UI. */
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

/**
 * Bound PDF parsing: a crafted PDF (deep object graphs, decompression bombs)
 * can otherwise pin the event loop or hang the request indefinitely.
 */
const PDF_PARSE_TIMEOUT_MS = 20_000;

const withParseTimeout = async <T>(promise: Promise<T>): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                `PDF parsing timed out after ${PDF_PARSE_TIMEOUT_MS}ms`,
              ),
            ),
          PDF_PARSE_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Accept a "%PDF-" header anywhere in the first 1KB. Some exporters prepend a
 * BOM or comment before the header, so requiring it at byte 0 wrongly rejects
 * otherwise-valid PDFs. We still validate by content, not the spoofable
 * client Content-Type.
 */
export function isPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 1024).toString('latin1').includes('%PDF-');
}

/**
 * Extract plain text from a PDF buffer.
 *
 * Primary parser is unpdf (a maintained pdf.js wrapper). Modern pdf.js is
 * stricter than the older engine in pdf-parse and rejects some real-world
 * exports ("Invalid PDF structure"), so we fall back to pdf-parse for broad
 * compatibility. Throws only when both parsers fail.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const text = await withParseTimeout(
      (async () => {
        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const extracted = await extractText(pdf, { mergePages: true });
        return extracted.text;
      })(),
    );
    if (text && text.trim().length > 0) {
      return text;
    }
    // Empty result — let the fallback try to recover text.
  } catch {
    // Unparseable by pdf.js — fall through to the looser parser.
  }

  const data = await withParseTimeout(pdfParse(buffer));
  return data.text;
}

/**
 * Extract text while preserving line breaks, which the LinkedIn section parser
 * needs to recognise section headers. pdf-parse keeps the document's line
 * layout (unpdf flattens everything to one line), so it's the primary here;
 * unpdf is the fallback for PDFs pdf-parse rejects.
 */
export async function extractPdfTextWithLayout(
  buffer: Buffer,
): Promise<string> {
  try {
    const data = await withParseTimeout(pdfParse(buffer));
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch {
    // Fall through to the flattened extractor.
  }

  return extractPdfText(buffer);
}
