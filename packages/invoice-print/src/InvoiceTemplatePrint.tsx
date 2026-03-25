import type { InvoicePdfViewModel } from './types';
import { formatLkrSlash } from './format';
import { INVOICE_PRINT_CSS_EMBEDDED } from './invoice-print-styles';

function labelWithColon(label: string): string {
  return label.endsWith(':') ? label : `${label}:`;
}

export interface InvoiceTemplatePrintProps {
  data: InvoicePdfViewModel;
  /** When false, omit embedded &lt;style&gt; (e.g. if styles injected once at document level). */
  includeStyles?: boolean;
  /**
   * Mascot image URL or data URI. PDF rendering passes a base64 data URI (or `''` to hide).
   * When omitted (browser preview), `/images/invoice-mascot.png` is used.
   */
  mascotSrc?: string;
}

function resolveMascotSrc(mascotSrc: string | undefined): string | undefined {
  if (mascotSrc === undefined) {
    return '/images/invoice-mascot.png';
  }
  if (mascotSrc === '') {
    return undefined;
  }
  return mascotSrc;
}

/**
 * Print-safe HTML invoice matching the Grow Fitness branded template.
 * Same markup is server-rendered for Puppeteer PDF generation.
 */
export function InvoiceTemplatePrint({
  data,
  includeStyles = true,
  mascotSrc,
}: InvoiceTemplatePrintProps) {
  const mascotUrl = resolveMascotSrc(mascotSrc);

  return (
    <>
      {includeStyles ? (
        <style dangerouslySetInnerHTML={{ __html: INVOICE_PRINT_CSS_EMBEDDED }} />
      ) : null}
      <div className="inv-root">
        <div className="inv-white-curve" aria-hidden="true" />
        {mascotUrl ? <img className="inv-mascot" src={mascotUrl} alt="" /> : null}

        <div className="inv-content">
          <header className="inv-header">
            <div className="inv-title-wrap">
              <div className="inv-sketch-oval">INVOICE</div>
            </div>
            <div className="inv-logo">
              <svg
                className="inv-logo-svg"
                viewBox="0 0 64 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M32 8 L56 64 H8 Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="24" cy="40" r="3.2" fill="currentColor" />
                <circle cx="40" cy="40" r="3.2" fill="currentColor" />
                <path
                  d="M25 50 Q32 57 39 50"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="inv-logo-text">GROW</div>
            </div>
          </header>

          <div className="inv-parties-dates">
            <div className="inv-left-col">
              <div className="inv-field">
                <div className="inv-label-w">{labelWithColon(data.invoiceToLabel)}</div>
                <div className="inv-value-w">{data.invoiceTo}</div>
              </div>
              {data.showKidsRow ? (
                <div className="inv-field inv-field-spaced">
                  <div className="inv-label-w">Kids name:</div>
                  <div className="inv-value-w">{data.kidsName}</div>
                </div>
              ) : null}
            </div>
            <div className="inv-dates-col">
              <p className="inv-date-line">Issue Date: {data.issueDate}</p>
              <p className="inv-date-line">Valid Till : {data.validTill}</p>
            </div>
          </div>

          <hr className="inv-rule inv-rule--black inv-rule-table-top" />

          <div className="inv-table-frame">
            <table className="inv-table">
              <thead>
                <tr>
                  <th className="inv-th">Description</th>
                  <th className="inv-th inv-th-sub">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} className="inv-tr">
                    <td className="inv-td">
                      {idx + 1}) {item.description}
                    </td>
                    <td className="inv-td inv-td-sub">{formatLkrSlash(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="inv-rule inv-rule--black inv-rule-after-table" />

          <div className="inv-total-line">
            Total fee: <strong>{formatLkrSlash(data.totalAmount)}</strong>
          </div>

          <div className="inv-bank-section">
            <div>
              <h3 className="inv-accent-title">Bank reference</h3>
              <p className="inv-ref-hint-line">kid&apos;s name-Month-Fee</p>
              <p className="inv-ref-hint-line">Ex: John October Fee</p>
              {data.bankReference.trim() ? (
                <p className="inv-ref-actual">{data.bankReference}</p>
              ) : null}
            </div>
            <div className="inv-bank-details-block">
              <h3 className="inv-accent-title">Bank details</h3>
              <p className="inv-bank-line">Account Name - {data.bankDetails.accountName}</p>
              <p className="inv-bank-line">Account Number - {data.bankDetails.accountNumber}</p>
              <p className="inv-bank-line">Bank Branch - {data.bankDetails.bankBranch}</p>
            </div>
          </div>

          <hr className="inv-rule inv-rule--black inv-footer-rule" />
          <footer className="inv-footer">
            *This is a computer generated invoice. No signature required
          </footer>
        </div>
      </div>
    </>
  );
}
