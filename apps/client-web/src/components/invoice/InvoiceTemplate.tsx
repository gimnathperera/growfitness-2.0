import {
  CalendarDays,
  FileText,
  Hash,
  User as UserIcon,
} from 'lucide-react';
import type { Invoice, User } from '@grow-fitness/shared-types';
import { formatCurrency, formatDate, formatInvoiceType } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

interface InvoiceTemplateProps {
  invoice: Invoice & {
    parent?: Pick<User, 'email'> & {
      parentProfile?: Pick<
        NonNullable<User['parentProfile']>,
        'name'
      >;
    };
    coach?: Pick<User, 'email'> & {
      coachProfile?: Pick<
        NonNullable<User['coachProfile']>,
        'name'
      >;
    };
    kidName?: string;
  };
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  return (
    <div
      id="invoice-template"
      className="w-[740px] bg-white overflow-hidden p-20"
    >
      {/* ================= HEADER ================= */}
      <div className="bg-emerald-500 px-9 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2.5">
            <img
              src="/images/logo.png"
              alt="Grow Fitness"
              className="h-9 w-9 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Grow Fitness
            </h1>
            <p className="text-sm text-white/90">
              Kids Gym & Training
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-base font-bold tracking-wider text-white mb-2">
            INVOICE
          </p>
          {/* <StatusBadge status={invoice.status} /> */}
          <p className="text-sm font-semibold tracking-wider text-gray-900 mb-2">
            {invoice.status}
          </p>
        </div>
      </div>

      {/* ================= META ================= */}
      <div className="px-9 py-8 grid grid-cols-2 gap-x-16 gap-y-8">
        <Meta
          icon={<Hash className="h-4 w-4" />}
          label="Invoice ID"
          value={invoice.id}
        />

        <Meta
          icon={<FileText className="h-4 w-4" />}
          label="Type"
          value={formatInvoiceType(invoice.type)}
        />

        {invoice.type === 'PARENT_INVOICE' ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
              <UserIcon className="h-4 w-4 mt-0.5" />
              <span>Billed To</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900">
                {invoice.parent?.parentProfile?.name || 'Unknown Parent'}
              </p>
              {invoice.kidName && (
                <p className="text-sm text-gray-700 mt-1">
                  For: {invoice.kidName}
                </p>
              )}
              {invoice.parent?.email && (
                <p className="text-sm text-gray-500">
                  {invoice.parent.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
              <UserIcon className="h-4 w-4 mt-0.5" />
              <span>Coach</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900">
                {invoice.coach?.coachProfile?.name || 'Unknown Coach'}
              </p>
              {invoice.coach?.email && (
                <p className="text-sm text-gray-500">
                  {invoice.coach.email}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
            <span className="mt-0.5"><CalendarDays className="h-4 w-4" /></span>
            <span>Dates</span>
          </div>

          <p className="text-[15px] font-semibold text-gray-900">
            Created: {formatDate(invoice.createdAt)}
          </p>
          <p className="text-[15px] font-semibold text-gray-900">
            Due: {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <div className="px-9 pb-8">
        <h3 className="mb-5 text-base font-semibold text-gray-900">
          Items
        </h3>

        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50/50">
          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold text-gray-500 bg-gray-100/80 uppercase tracking-wide">
            <span className="col-span-7">Description</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-3 text-right end-0">Amount</span>
          </div>

          {/* Rows */}
          {invoice.items?.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 px-5 py-4 border-t border-gray-200 text-sm bg-white"
            >
              <span className="col-span-7 text-gray-900">
                {item.description}
              </span>
              <span className="col-span-2 text-center text-gray-700">
                {item.amount ?? 1}
              </span>
              <span className="col-span-3 text-right font-semibold text-gray-900 end-0">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

  <Separator className="mb-4 w-full" />
      {/* ================= TOTAL ================= */}
      <div className="px-9 pb-8 flex justify-end">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center px-2">
            <span className="font-bold text-lg text-gray-900">
              Total
            </span>
            <span className="font-bold text-2xl text-emerald-600">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="bg-gray-50 px-9 py-5 text-center text-sm text-gray-500">
        Thank you for choosing Grow Fitness Kids! 🏃
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Meta({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
        <span className="mt-0.5">{icon}</span>
        <span>{label}</span>
      </div>

      <p className="text-[15px] font-semibold text-gray-900">{value}</p>

      {subValue && (
        <p className="text-sm text-gray-500">
          {subValue}
        </p>
      )}
    </div>
  );
}