# @grow-fitness/invoice-print

HTML/React invoice template + SSR string for **Puppeteer** PDF generation.

## Usage

### Preview (React)

```tsx
import { InvoiceTemplatePrint, invoiceToPdfViewModel } from '@grow-fitness/invoice-print';

const vm = invoiceToPdfViewModel(invoice);
return <InvoiceTemplatePrint data={vm} />;
```

### Server PDF (NestJS) — implemented

- `GET /api/invoices/:id/pdf` (admin JWT) returns `application/pdf` via Puppeteer + `renderInvoicePrintToFullHtml`.
- Optional env: `PUPPETEER_EXECUTABLE_PATH` (e.g. Docker `google-chrome-stable`).

### Admin app integration

- **Modal preview:** `InvoiceDetailsDialog` renders `InvoiceTemplatePrint` + **Download** calls `invoicesService.downloadInvoicePdf(id)` (blob from the endpoint above).
- **Dedicated print URL:** `/print/invoice/:invoiceId` (authenticated) — same HTML; use browser *Print → Save as PDF* if needed without the API.

## Build

This package emits **CommonJS** to `dist/`. Run before `nest build`:

```bash
pnpm --filter @grow-fitness/invoice-print run build
```

## 100% pixel parity with Canva PDF

Not guaranteed without the original design source:

- **Fonts**: Arial/Helvetica substitutes may differ slightly from Canva’s embedded fonts.
- **Sub-pixel metrics**: Chromium vs PDF viewer rounding can differ by &lt;1px.
- **Colors**: `print-color-adjust: exact` helps; spot colors may still vary by printer/profile.

Tune `invoice-print-styles.ts` against a screenshot overlay if you need stricter match.
