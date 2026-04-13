import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { InvoicePdfViewModel } from './types';
import { InvoiceTemplatePrint } from './InvoiceTemplatePrint';
import { INVOICE_PRINT_CSS } from './invoice-print-styles';

const GOOGLE_FONTS_MONTSERRAT =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';

type NodeFs = {
  existsSync: (path: string) => boolean;
  readFileSync: (path: string) => { toString: (encoding: 'base64') => string };
};

type NodePath = {
  join: (...parts: string[]) => string;
};

function tryRequire<T>(id: string): T | undefined {
  try {
    // Hide require from bundlers; Node loads this file via CJS (`tsconfig.module=CommonJS`).
    // eslint-disable-next-line no-new-func -- intentional dynamic require
    const req = new Function('m', 'try { return require(m); } catch { return undefined; }') as (
      m: string
    ) => T | undefined;
    return req(id);
  } catch {
    return undefined;
  }
}

function readMascotDataUri(): string | undefined {
  const fs = tryRequire<NodeFs>('node:fs');
  const path = tryRequire<NodePath>('node:path');
  if (!fs || !path || typeof __dirname !== 'string') {
    return undefined;
  }
  const candidates = [
    path.join(__dirname, '..', 'assets', 'invoice-mascot.png'),
    path.join(__dirname, 'assets', 'invoice-mascot.png'),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        return `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch {
      /* optional asset */
    }
  }
  return undefined;
}

/** Invoice logo for generated HTML/PDF output. */
function readInvoiceLogoDataUri(): string | undefined {
  const fs = tryRequire<NodeFs>('node:fs');
  const path = tryRequire<NodePath>('node:path');
  if (!fs || !path || typeof __dirname !== 'string') {
    return undefined;
  }
  const svgCandidates = [
    path.join(__dirname, '..', 'assets', 'grow-invoice-wordmark-white.svg'),
    path.join(__dirname, 'assets', 'grow-invoice-wordmark-white.svg'),
  ];
  for (const filePath of svgCandidates) {
    try {
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        return `data:image/svg+xml;base64,${buf.toString('base64')}`;
      }
    } catch {
      /* optional asset */
    }
  }
  return undefined;
}

/**
 * Full HTML document for Puppeteer `page.setContent` / print preview.
 * Styles are in &lt;head&gt;; body matches {@link InvoiceTemplatePrint} without duplicate &lt;style&gt;.
 */
export function renderInvoicePrintToFullHtml(data: InvoicePdfViewModel): string {
  const bodyInner = renderToStaticMarkup(
    createElement(InvoiceTemplatePrint, {
      data,
      renderMode: 'pdf',
      includeStyles: false,
      mascotSrc: readMascotDataUri() ?? '',
      logoSrc: readInvoiceLogoDataUri() ?? '',
    })
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Invoice</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${GOOGLE_FONTS_MONTSERRAT}" rel="stylesheet"/>
<style>${INVOICE_PRINT_CSS}</style>
</head>
<body>
${bodyInner}
</body>
</html>`;
}
