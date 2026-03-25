/**
 * Grow Fitness invoice — print + Puppeteer PDF (A4).
 * - {@link INVOICE_PRINT_CSS_EMBEDDED}: use inside SPA previews (no html/body pollution).
 * - {@link INVOICE_PRINT_CSS}: full document for Puppeteer / standalone print page.
 *
 * Brand tokens match reference: emerald #2EB67D, lime headings #D0F288, black rules around items.
 */

const INVOICE_TAIL = `
.inv-white-curve {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 56%;
  height: 48%;
  background: #fff;
  border-top-left-radius: 78% 62%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.97;
}
.inv-mascot {
  position: absolute;
  bottom: 7mm;
  right: 4%;
  width: min(32vw, 190px);
  max-width: 38%;
  height: auto;
  z-index: 1;
  pointer-events: none;
  object-fit: contain;
}
.inv-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-height: calc(297mm - 26mm);
}
.inv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}
.inv-title-wrap {
  flex: 0 0 auto;
}
.inv-sketch-oval {
  display: inline-block;
  font-size: clamp(1.75rem, 4.2vw, 2.35rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  padding: 12px 36px 14px;
  border: 3px solid #000;
  border-radius: 42% 38% 44% 40% / 48% 52% 46% 50%;
  transform: rotate(-2.5deg);
  line-height: 1;
  text-transform: uppercase;
}
.inv-logo {
  flex: 0 0 auto;
  text-align: center;
  color: #fff;
}
.inv-logo-svg {
  display: block;
  width: 56px;
  height: auto;
  margin: 0 auto 6px;
}
.inv-logo-text {
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.inv-parties-dates {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 6px;
}
.inv-left-col {
  flex: 1;
  min-width: 0;
}
.inv-dates-col {
  flex: 0 0 auto;
  text-align: right;
  white-space: nowrap;
}
.inv-field-spaced {
  margin-top: 20px;
}
.inv-label-w {
  font-weight: 400;
  font-size: 11px;
  color: #fff;
  opacity: 0.95;
}
.inv-value-w {
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  margin-top: 5px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.inv-date-line {
  font-weight: 400;
  font-size: 11px;
  color: #fff;
  margin: 0 0 6px 0;
}
.inv-date-line:last-child {
  margin-bottom: 0;
}
.inv-rule {
  border: 0;
  margin: 0;
  padding: 0;
  height: 0;
}
.inv-rule--black {
  border-top: 1px solid #000;
  margin: 20px 0 0 0;
}
.inv-rule--black.inv-rule-table-top {
  margin-top: 22px;
}
.inv-table-frame {
  padding: 8px 0 12px;
}
.inv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2px;
}
.inv-th {
  padding: 10px 0 8px 0;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--inv-lime);
  text-align: left;
  vertical-align: bottom;
}
.inv-th-sub {
  text-align: right;
  width: 32%;
}
.inv-td {
  padding: 12px 0;
  font-size: 11px;
  font-weight: 400;
  color: #fff;
  vertical-align: top;
}
.inv-td-sub {
  text-align: right;
  font-weight: 400;
  white-space: nowrap;
}
.inv-table tbody .inv-tr:last-child .inv-td {
  padding-bottom: 12px;
}
.inv-rule-after-table {
  margin-top: 0;
  margin-bottom: 0;
}
.inv-total-line {
  text-align: right;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 400;
  color: #fff;
}
.inv-total-line strong {
  font-weight: 700;
  font-size: 14px;
}
.inv-bank-section {
  margin-top: 32px;
  max-width: 58%;
  padding-bottom: 8mm;
}
.inv-accent-title {
  margin: 0 0 8px 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--inv-lime);
}
.inv-ref-hint-line {
  margin: 0 0 4px 0;
  font-size: 11px;
  font-weight: 400;
  color: #fff;
}
.inv-ref-actual {
  margin: 10px 0 0 0;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  word-break: break-word;
}
.inv-bank-details-block {
  margin-top: 22px;
}
.inv-bank-line {
  margin: 0 0 6px 0;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.96);
  line-height: 1.45;
}
.inv-footer-rule.inv-rule--black {
  margin-top: auto;
  margin-bottom: 12px;
}
.inv-footer {
  text-align: center;
  font-size: 8.5px;
  font-weight: 400;
  color: #fff;
  opacity: 0.92;
  line-height: 1.55;
  padding: 0 8% 4mm;
  position: relative;
  z-index: 2;
}
`;

/** Safe inside admin/client React trees — does not set html/body (avoids Tailwind conflicts). */
export const INVOICE_PRINT_CSS_EMBEDDED = `
* {
  box-sizing: border-box;
}
.inv-root {
  --inv-green: #2eb67d;
  --inv-lime: #d0f288;
  position: relative;
  min-height: 297mm;
  width: 100%;
  background: var(--inv-green);
  overflow: hidden;
  padding: 14mm 10% 12mm;
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  font-size: 11px;
  line-height: 1.4;
  color: #fff;
  isolation: isolate;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
${INVOICE_TAIL}
`;

/** Standalone HTML document (Puppeteer): includes @page + html/body shell. */
export const INVOICE_PRINT_CSS = `
@page {
  size: A4;
  margin: 0;
}
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  padding: 0;
  min-height: 297mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
body {
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  font-size: 11px;
  line-height: 1.4;
  color: #fff;
  background: #2eb67d;
}
.inv-root {
  --inv-green: #2eb67d;
  --inv-lime: #d0f288;
  position: relative;
  min-height: 297mm;
  width: 100%;
  background: var(--inv-green);
  overflow: hidden;
  padding: 14mm 10% 12mm;
}
${INVOICE_TAIL}
`;
