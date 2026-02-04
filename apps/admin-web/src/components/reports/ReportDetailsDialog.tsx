import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report, ReportStatus } from '@grow-fitness/shared-types';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useApiQuery } from '@/hooks/useApiQuery';
import { reportsService } from '@/services/reports.service';
import { useModalParams } from '@/hooks/useModalParams';
import { useToast } from '@/hooks/useToast';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: Report;
}

function formatReportType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function renderReportData(data: Record<string, unknown> | undefined): JSX.Element {
  if (!data) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  const renderValue = (value: unknown, _key?: string): JSX.Element | string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="ml-4 space-y-2">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <div key={k}>
              <span className="text-sm font-medium text-muted-foreground">{k}: </span>
              <span className="text-sm">{renderValue(v, k)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="ml-4 space-y-1">
          {value.map((item, index) => (
            <div key={index} className="text-sm">
              {typeof item === 'object' ? (
                <div className="p-2 border rounded">
                  {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}:</span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                String(item)
              )}
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <h4 className="text-sm font-semibold mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
          <div className="text-sm">{renderValue(value, key)}</div>
        </div>
      ))}
    </div>
  );
}

export function ReportDetailsDialog({ open, onOpenChange, report: reportProp }: ReportDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('reportId');
  const { toast } = useToast();

  // Fetch report from URL if prop not provided
  const { data: reportFromUrl, isLoading } = useApiQuery<Report>(
    ['reports', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Report ID is required');
      }
      return reportsService.getReportById(entityId);
    },
    {
      enabled: open && !reportProp && !!entityId,
    }
  );

  const report = reportProp || reportFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  const handleExportCSV = async () => {
    if (!report) return;

    try {
      const blob = await reportsService.exportCSV(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error: any) {
      toast.error('Failed to export report', error.message || 'An error occurred');
    }
  };

  if (!report && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Report...</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">{report.title}</DialogTitle>
                  <DialogDescription className="text-sm">
                    {report.description || 'Report details'}
                  </DialogDescription>
                </div>
                {report.status === ReportStatus.GENERATED && (
                  <Button onClick={handleExportCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="text-sm font-medium">{formatReportType(report.type)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <StatusBadge status={report.status} />
                </div>
              </div>

              <Separator />

              {report.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                  <p className="text-sm">{formatDate(report.startDate)}</p>
                </div>
              )}

              {report.endDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                  <p className="text-sm">{formatDate(report.endDate)}</p>
                </div>
              )}

              {report.generatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Generated At</h3>
                  <p className="text-sm">{formatDateTime(report.generatedAt)}</p>
                </div>
              )}

              <Separator />

              {report.status === ReportStatus.GENERATED && report.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Data</CardTitle>
                  </CardHeader>
                  <CardContent>{renderReportData(report.data as Record<string, unknown>)}</CardContent>
                </Card>
              )}

              {report.status === ReportStatus.FAILED && report.data && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Generation Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">
                      {typeof report.data.error === 'string'
                        ? report.data.error
                        : 'An error occurred while generating the report'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {report.status === ReportStatus.PENDING && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Report is pending generation...
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
