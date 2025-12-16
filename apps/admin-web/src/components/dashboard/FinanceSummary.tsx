import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinanceSummary as FinanceSummaryType } from '@/services/dashboard.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface FinanceSummaryProps {
  data?: FinanceSummaryType;
  isLoading: boolean;
}

export function FinanceSummary({ data, isLoading }: FinanceSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      className: 'text-green-600',
    },
    {
      title: 'Pending Invoices',
      value: data.pendingInvoices,
      icon: AlertCircle,
      className: 'text-yellow-600',
    },
    {
      title: 'Paid Invoices',
      value: data.paidInvoices,
      icon: CheckCircle,
      className: 'text-green-600',
    },
    {
      title: 'Overdue Invoices',
      value: data.overdueInvoices,
      icon: TrendingUp,
      className: 'text-red-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-muted ${card.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.className}`}>{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
