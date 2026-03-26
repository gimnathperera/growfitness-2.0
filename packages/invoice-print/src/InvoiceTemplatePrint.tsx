import type { InvoicePdfViewModel } from './types';
import { formatLkrSlash } from './format';
import { INVOICE_PRINT_CSS_EMBEDDED } from './invoice-print-styles';

function labelWithColon(label: string): string {
  return label.endsWith(':') ? label : `${label}:`;
}

/** `preview` = admin UI (original look). `pdf` = Puppeteer / print route (reliable attachment output). */
export type InvoiceRenderMode = 'preview' | 'pdf';

export interface InvoiceTemplatePrintProps {
  data: InvoicePdfViewModel;
  /** Admin modal: `preview` (default). Server PDF + `/print/invoice`: `pdf`. */
  renderMode?: InvoiceRenderMode;
  /** When false, omit embedded &lt;style&gt; (e.g. if styles injected once at document level). */
  includeStyles?: boolean;
  /**
   * Mascot image URL or data URI. PDF rendering passes a base64 data URI (or `''` to hide).
   * When omitted (browser preview), `/images/invoice-mascot.png` is used.
   */
  mascotSrc?: string;
  /**
   * Header logo URL or data URI. PDF embeds `packages/invoice-print/assets/grow-invoice-wordmark-white.svg`.
   * When omitted (browser), `/images/grow-invoice-wordmark-white.svg` (admin `public/`) is used.
   */
  logoSrc?: string;
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

/** Bumped when the default public invoice logo asset changes (cache bust for dev). */
const LOGO_PUBLIC_CACHE_BUST = '5';

function resolveLogoSrc(logoSrc: string | undefined): string | undefined {
  if (logoSrc === undefined) {
    return `/images/grow-invoice-wordmark-white.svg?v=${LOGO_PUBLIC_CACHE_BUST}`;
  }
  if (logoSrc === '') {
    return undefined;
  }
  return logoSrc;
}

/**
 * Print-safe HTML invoice matching the Grow Fitness branded template.
 * Default `renderMode="preview"` for admin UI; Puppeteer uses `renderMode="pdf"` (see render-html).
 */
export function InvoiceTemplatePrint({
  data,
  renderMode = 'preview',
  includeStyles = true,
  mascotSrc,
  logoSrc,
}: InvoiceTemplatePrintProps) {
  const mascotUrl = resolveMascotSrc(mascotSrc);
  const logoUrl = resolveLogoSrc(logoSrc);
  const rootClass = renderMode === 'pdf' ? 'inv-root inv-root--pdf' : 'inv-root inv-root--preview';

  return (
    <>
      {includeStyles ? (
        <style dangerouslySetInnerHTML={{ __html: INVOICE_PRINT_CSS_EMBEDDED }} />
      ) : null}
      <div className={rootClass}>
        <div className="inv-white-curve" aria-hidden="true" />
        {mascotUrl ? <img className="inv-mascot" src={mascotUrl} alt="" /> : null}

        <div className="inv-content">
          <header className="inv-header">
            <div className="inv-title-wrap">
              {renderMode === 'pdf' ? (
                <>
                  <span className="inv-title-ring inv-title-ring--outer" aria-hidden="true" />
                  <span className="inv-title-ring inv-title-ring--inner" aria-hidden="true" />
                </>
              ) : null}
              <div className="inv-sketch-oval">INVOICE</div>
            </div>
            <div className="inv-logo">
              {logoUrl ? <img className="inv-logo-img" src={logoUrl} alt="" /> : null}
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
