import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks';
import { auditService } from '@/services/audit.service';
import { AuditLog } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { formatDateTime } from '@/lib/formatters';
import { AuditLogDetailsDialog } from '@/components/audit/AuditLogDetailsDialog';
import { DatePicker } from '@/components/common/DatePicker';
import { format } from 'date-fns';

export function AuditPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [actorIdFilter, setActorIdFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>();
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, error } = useApiQuery(
    [
      'audit',
      page.toString(),
      pageSize.toString(),
      actorIdFilter,
      entityTypeFilter,
      startDateFilter?.toISOString() || '',
      endDateFilter?.toISOString() || '',
    ],
    () =>
      auditService.getAuditLogs(page, pageSize, {
        actorId: actorIdFilter || undefined,
        entityType: entityTypeFilter || undefined,
        startDate: startDateFilter ? format(startDateFilter, 'yyyy-MM-dd') : undefined,
        endDate: endDateFilter ? format(endDateFilter, 'yyyy-MM-dd') : undefined,
      })
  );

  // Helper to extract actor ID/email from populated object or string
  const getActorDisplay = (actorId: any): string => {
    if (!actorId) return 'N/A';
    if (typeof actorId === 'string') return actorId;
    if (typeof actorId === 'object') {
      // If it's a populated user object
      if (actorId.email) return actorId.email;
      if (actorId._id) return actorId._id.toString();
      if (actorId.id) return actorId.id;
    }
    return 'N/A';
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
    },
    {
      accessorKey: 'entityId',
      header: 'Entity ID',
    },
    {
      accessorKey: 'actorId',
      header: 'Actor',
      cell: ({ row }) => getActorDisplay(row.original.actorId),
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => formatDateTime(row.original.timestamp),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedLog(log);
              setDetailsDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground mt-1">View system activity logs</p>
      </div>

      <div className="space-y-4">
        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Actor ID:</label>
            <Input
              placeholder="Filter by actor ID"
              value={actorIdFilter}
              onChange={e => setActorIdFilter(e.target.value)}
              className="w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Entity Type:</label>
            <Input
              placeholder="Filter by entity type"
              value={entityTypeFilter}
              onChange={e => setEntityTypeFilter(e.target.value)}
              className="w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Start Date:</label>
            <DatePicker
              date={startDateFilter}
              onSelect={setStartDateFilter}
              placeholder="Select start date"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">End Date:</label>
            <DatePicker
              date={endDateFilter}
              onSelect={setEndDateFilter}
              placeholder="Select end date"
            />
          </div>
        </FilterBar>

        {error ? (
          <div>Error loading audit logs</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No audit logs found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      {selectedLog && (
        <AuditLogDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          log={selectedLog}
        />
      )}
    </div>
  );
}
