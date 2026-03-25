import { Injectable, Logger } from '@nestjs/common';
import * as path from 'node:path';
import type { Invoice } from '@grow-fitness/shared-types';
import type { JwtPayload } from '../auth/auth.service';
import { InvoicesService } from './invoices.service';

type InvoicePrintModule = typeof import('@grow-fitness/invoice-print');

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * In dev, `@grow-fitness/invoice-print` is loaded from dist and cached by Node.
   * Rebuilds of invoice-print otherwise require an API restart; clearing dist entries fixes that.
   */
  private loadInvoicePrintModule(): InvoicePrintModule {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const main = require.resolve('@grow-fitness/invoice-print');
        delete require.cache[main];
      } catch {
        /* optional package resolution */
      }
      const distMarker = path.join('invoice-print', 'dist') + path.sep;
      const distMarkerAlt = 'invoice-print/dist/';
      for (const key of Object.keys(require.cache)) {
        if (key.includes(distMarker) || key.includes(distMarkerAlt)) {
          delete require.cache[key];
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- runtime reload in dev
    return require('@grow-fitness/invoice-print') as InvoicePrintModule;
  }

  /**
   * Renders the shared HTML invoice template and prints to PDF via Puppeteer (Chromium).
   */
  async generatePdfBuffer(invoiceId: string, actor: JwtPayload): Promise<Buffer> {
    const { invoiceToPdfViewModel, renderInvoicePrintToFullHtml } = this.loadInvoicePrintModule();
    const invoice = (await this.invoicesService.findByIdForActor(invoiceId, actor)) as Invoice;
    const viewModel = invoiceToPdfViewModel(invoice);
    const html = renderInvoicePrintToFullHtml(viewModel);

    const puppeteer = await import('puppeteer');

    const launchOpts: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOpts);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error('Puppeteer PDF failed', err);
      throw err;
    } finally {
      await browser.close();
    }
  }
}
