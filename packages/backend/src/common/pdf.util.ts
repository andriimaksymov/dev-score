import { extractText, getDocumentProxy } from 'unpdf';
import pdfParse from 'pdf-parse';

/** Max accepted PDF upload size — matches the "up to 10MB" hint in the UI. */
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

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
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    if (text && text.trim().length > 0) {
      return text;
    }
    // Empty result — let the fallback try to recover text.
  } catch {
    // Unparseable by pdf.js — fall through to the looser parser.
  }

  const data = await pdfParse(buffer);
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
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch {
    // Fall through to the flattened extractor.
  }

  return extractPdfText(buffer);
}
