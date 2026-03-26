import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as path from 'node:path';
import type { Invoice } from '@grow-fitness/shared-types';
import { InvoiceType } from '@grow-fitness/shared-types';
import type { JwtPayload } from '../auth/auth.service';
import { InvoicesService } from './invoices.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';

type InvoicePrintModule = typeof import('@grow-fitness/invoice-print');

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly notificationService: NotificationService
  ) {}

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
    const invoice = (await this.invoicesService.findByIdForActor(invoiceId, actor)) as Invoice;
    return this.renderInvoiceToPdfBuffer(invoice);
  }

  async sendInvoicePdfByEmail(
    invoiceId: string,
    actor: JwtPayload
  ): Promise<{ pdfEmailedAt: Date }> {
    const invoice = (await this.invoicesService.findByIdForActor(invoiceId, actor)) as Invoice;
    const to = this.resolveRecipientEmail(invoice);
    if (!to) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'No email on file for this invoice recipient.',
      });
    }
    const pdfBuffer = await this.renderInvoiceToPdfBuffer(invoice);
    const filename = `invoice-${invoiceId}.pdf`;
    const recipientName =
      invoice.type === InvoiceType.PARENT_INVOICE
        ? invoice.parent?.parentProfile?.name
        : invoice.coach?.coachProfile?.name;
    await this.notificationService.sendInvoicePdfEmail({
      to,
      recipientName,
      pdfBuffer,
      filename,
    });
    const pdfEmailedAt = await this.invoicesService.markInvoicePdfEmailed(invoiceId);
    return { pdfEmailedAt };
  }

  private resolveRecipientEmail(invoice: Invoice): string | undefined {
    if (invoice.type === InvoiceType.PARENT_INVOICE) {
      const e = invoice.parent?.email?.trim();
      return e || undefined;
    }
    if (invoice.type === InvoiceType.COACH_PAYOUT) {
      const e = invoice.coach?.email?.trim();
      return e || undefined;
    }
    return undefined;
  }

  private async renderInvoiceToPdfBuffer(invoice: Invoice): Promise<Buffer> {
    const { invoiceToPdfViewModel, renderInvoicePrintToFullHtml } = this.loadInvoicePrintModule();
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
      // A4 at ~96dpi so vw/% match the admin invoice preview (default Puppeteer viewport skews layout).
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
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
