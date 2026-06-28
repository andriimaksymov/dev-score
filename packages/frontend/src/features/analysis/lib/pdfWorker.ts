import { pdfjs } from 'react-pdf';
// `?url` lets Vite resolve the worker from node_modules and serve it in both dev
// and production (a bare `new URL(...)` specifier 404s in the dev server).
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjs };
