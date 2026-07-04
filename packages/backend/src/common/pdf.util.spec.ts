import { isPdf, MAX_PDF_BYTES } from './pdf.util';

describe('isPdf', () => {
  it('accepts a buffer starting with the PDF magic bytes', () => {
    expect(isPdf(Buffer.from('%PDF-1.7 rest of document'))).toBe(true);
  });

  it('accepts a header preceded by a BOM or exporter comment (within 1KB)', () => {
    expect(isPdf(Buffer.from('﻿%PDF-1.4 body'))).toBe(true);
    expect(isPdf(Buffer.from('% exporter comment\n%PDF-1.4 body'))).toBe(true);
  });

  it('rejects non-PDF content', () => {
    expect(isPdf(Buffer.from('PK\x03\x04 zip archive'))).toBe(false);
    expect(isPdf(Buffer.from('<html>not a pdf</html>'))).toBe(false);
    expect(isPdf(Buffer.alloc(0))).toBe(false);
  });

  it('rejects a header that only appears after the first 1KB', () => {
    const late = Buffer.concat([Buffer.alloc(1024, 'a'), Buffer.from('%PDF-')]);
    expect(isPdf(late)).toBe(false);
  });
});

describe('MAX_PDF_BYTES', () => {
  it('matches the documented 10MB upload cap', () => {
    expect(MAX_PDF_BYTES).toBe(10 * 1024 * 1024);
  });
});
