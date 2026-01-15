import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks';
import { reportsService } from '@/services/reports.service';
import { Report, ReportType, ReportStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Trash2, Download } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GenerateReportDialog } from '@/components/reports/GenerateReportDialog';
import { ReportDetailsDialog } from '@/components/reports/ReportDetailsDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';
import { useApiMutation } from '@/hooks/useApiMutation';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

function formatReportType(type: ReportType): string {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function ReportsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('reportId');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const { toast } = useToast();

  // Sync selectedReport with URL params
  useEffect(() => {
    if (entityId && modal === 'details') {
      // Fetch report if we have ID in URL but no selectedReport
      if (!selectedReport || selectedReport.id !== entityId) {
        reportsService
          .getReportById(entityId)
          .then(response => {
            setSelectedReport(response);
          })
          .catch(() => {
            // Report not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedReport(null);
    }
  }, [entityId, modal, selectedReport, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const { data, isLoading, error, refetch } = useApiQuery(
    ['reports', page.toString(), pageSize.toString(), typeFilter, statusFilter],
    () =>
      reportsService.getReports(page, pageSize, {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      })
  );

  const deleteMutation = useApiMutation((id: string) => reportsService.deleteReport(id), {
    invalidateQueries: [['reports']],
    onSuccess: () => {
      toast.success('Report deleted successfully');
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    },
    onError: error => {
      toast.error('Failed to delete report', error.message || 'An error occurred');
    },
  });

  const handleDelete = (report: Report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteMutation.mutate(reportToDelete.id);
    }
  };

  const handleExportCSV = async (report: Report) => {
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

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatReportType(row.original.type),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'dateRange',
      header: 'Date Range',
      cell: ({ row }) => {
        const report = row.original;
        if (report.startDate && report.endDate) {
          return `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`;
        }
        if (report.startDate) {
          return `From ${formatDate(report.startDate)}`;
        }
        if (report.endDate) {
          return `Until ${formatDate(report.endDate)}`;
        }
        return 'N/A';
      },
    },
    {
      accessorKey: 'generatedAt',
      header: 'Generated',
      cell: ({ row }) => {
        const report = row.original;
        if (report.generatedAt) {
          return formatDateTime(report.generatedAt);
        }
        return 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedReport(report);
                openModal(report.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {report.status === ReportStatus.GENERATED && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleExportCSV(report)}
                title="Export CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(report)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and manage reports</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Type:</label>
            <Select
              value={typeFilter || 'all'}
              onValueChange={value => setTypeFilter(value === 'all' ? '' : (value as ReportType))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value={ReportType.ATTENDANCE}>Attendance</SelectItem>
                <SelectItem value={ReportType.FINANCIAL}>Financial</SelectItem>
                <SelectItem value={ReportType.SESSION_SUMMARY}>Session Summary</SelectItem>
                <SelectItem value={ReportType.PERFORMANCE}>Performance</SelectItem>
                <SelectItem value={ReportType.CUSTOM}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Select
              value={statusFilter || 'all'}
              onValueChange={value =>
                setStatusFilter(value === 'all' ? '' : (value as ReportStatus))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={ReportStatus.GENERATED}>Generated</SelectItem>
                <SelectItem value={ReportStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {error ? (
          <ErrorState title="Failed to load reports" onRetry={() => refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No reports found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <GenerateReportDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedReport || entityId) && (
        <ReportDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={closeModal}
          report={selectedReport || undefined}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Report"
        description={`Are you sure you want to delete "${reportToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
