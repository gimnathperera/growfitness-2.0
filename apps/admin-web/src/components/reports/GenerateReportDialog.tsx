import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';
import { GenerateReportSchema, GenerateReportDto } from '@grow-fitness/shared-schemas';
import { ReportType, SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { reportsService } from '@/services/reports.service';
import { locationsService } from '@/services/locations.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { DatePicker } from '@/components/common/DatePicker';
import { format } from 'date-fns';

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const defaultValues: GenerateReportDto = {
    type: ReportType.ATTENDANCE,
    startDate: undefined,
    endDate: undefined,
    filters: {},
  };

  const form = useForm<GenerateReportDto & { title?: string; description?: string }>({
    resolver: zodResolver(GenerateReportSchema),
    defaultValues,
  });

  const reportType = form.watch('type');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [open]);

  const generateMutation = useApiMutation(
    (data: GenerateReportDto) => reportsService.generateReport(data),
    {
      invalidateQueries: [['reports']],
      onSuccess: () => {
        toast.success('Report generated successfully');
        form.reset(defaultValues);
        setStartDate(undefined);
        setEndDate(undefined);
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to generate report', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: GenerateReportDto & { title?: string; description?: string }) => {
    const filters: Record<string, unknown> = {};

    // Add type-specific filters
    if (reportType === ReportType.ATTENDANCE || reportType === ReportType.SESSION_SUMMARY) {
      if (data.filters?.locationId) {
        filters.locationId = data.filters.locationId;
      }
      if (data.filters?.coachId) {
        filters.coachId = data.filters.coachId;
      }
    }

    if (reportType === ReportType.FINANCIAL) {
      if (data.filters?.parentId) {
        filters.parentId = data.filters.parentId;
      }
      if (data.filters?.coachId) {
        filters.coachId = data.filters.coachId;
      }
      if (data.filters?.type) {
        filters.type = data.filters.type;
      }
    }

    if (reportType === ReportType.PERFORMANCE) {
      if (data.filters?.sessionType) {
        filters.sessionType = data.filters.sessionType;
      }
    }

    if (reportType === ReportType.CUSTOM) {
      if (data.filters?.includeSessions) {
        filters.includeSessions = data.filters.includeSessions;
      }
      if (data.filters?.includeInvoices) {
        filters.includeInvoices = data.filters.includeInvoices;
      }
      if (data.filters?.includeUsers) {
        filters.includeUsers = data.filters.includeUsers;
      }
      if (data.filters?.includeKids) {
        filters.includeKids = data.filters.includeKids;
      }
      if (data.filters?.userRole) {
        filters.userRole = data.filters.userRole;
      }
      if (data.filters?.kidSessionType) {
        filters.kidSessionType = data.filters.kidSessionType;
      }
    }

    if (data.title) {
      filters.title = data.title;
    }

    const submitData: GenerateReportDto = {
      type: data.type,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };

    generateMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Generate Report</DialogTitle>
              <DialogDescription className="text-sm">
                Generate a new report with custom filters and date range
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="generate-report-form" className="space-y-4">
              <FormField label="Report Type" required error={form.formState.errors.type?.message}>
                <Select
                  value={form.watch('type')}
                  onValueChange={value => {
                    form.setValue('type', value as ReportType);
                    form.setValue('filters', {});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReportType.ATTENDANCE}>Attendance</SelectItem>
                    <SelectItem value={ReportType.FINANCIAL}>Financial</SelectItem>
                    <SelectItem value={ReportType.SESSION_SUMMARY}>Session Summary</SelectItem>
                    <SelectItem value={ReportType.PERFORMANCE}>Performance</SelectItem>
                    <SelectItem value={ReportType.CUSTOM}>Custom</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Date" error={form.formState.errors.startDate?.message}>
                  <DatePicker
                    date={startDate}
                    onSelect={date => {
                      setStartDate(date);
                      form.setValue('startDate', date ? format(date, 'yyyy-MM-dd') : undefined);
                    }}
                    placeholder="Select start date"
                  />
                </FormField>

                <FormField label="End Date" error={form.formState.errors.endDate?.message}>
                  <DatePicker
                    date={endDate}
                    onSelect={date => {
                      setEndDate(date);
                      form.setValue('endDate', date ? format(date, 'yyyy-MM-dd') : undefined);
                    }}
                    placeholder="Select end date"
                  />
                </FormField>
              </div>

              {/* Type-specific filters */}
              {(reportType === ReportType.ATTENDANCE || reportType === ReportType.SESSION_SUMMARY) && (
                <>
                  <FormField label="Location (Optional)">
                    <Select
                      value={(form.watch('filters') as any)?.locationId || 'all'}
                      onValueChange={value => {
                        const filters = form.watch('filters') || {};
                        form.setValue('filters', { ...filters, locationId: value === 'all' ? undefined : value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        {(locationsData?.data || []).map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Coach (Optional)">
                    <Select
                      value={(form.watch('filters') as any)?.coachId || 'all'}
                      onValueChange={value => {
                        const filters = form.watch('filters') || {};
                        form.setValue('filters', { ...filters, coachId: value === 'all' ? undefined : value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All coaches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All coaches</SelectItem>
                        {(coachesData?.data || []).map(coach => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.coachProfile?.name || coach.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </>
              )}

              {reportType === ReportType.PERFORMANCE && (
                <FormField label="Session Type (Optional)">
                  <Select
                    value={(form.watch('filters') as any)?.sessionType || 'all'}
                    onValueChange={value => {
                      const filters = form.watch('filters') || {};
                      form.setValue('filters', { ...filters, sessionType: value === 'all' ? undefined : value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All session types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All session types</SelectItem>
                      <SelectItem value={SessionType.INDIVIDUAL}>Individual</SelectItem>
                      <SelectItem value={SessionType.GROUP}>Group</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              {reportType === ReportType.CUSTOM && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Include Data Sources</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(form.watch('filters') as any)?.includeSessions || false}
                        onChange={e => {
                          const filters = form.watch('filters') || {};
                          form.setValue('filters', {
                            ...filters,
                            includeSessions: e.target.checked,
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Include Sessions</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(form.watch('filters') as any)?.includeInvoices || false}
                        onChange={e => {
                          const filters = form.watch('filters') || {};
                          form.setValue('filters', {
                            ...filters,
                            includeInvoices: e.target.checked,
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Include Invoices</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(form.watch('filters') as any)?.includeUsers || false}
                        onChange={e => {
                          const filters = form.watch('filters') || {};
                          form.setValue('filters', {
                            ...filters,
                            includeUsers: e.target.checked,
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Include Users</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(form.watch('filters') as any)?.includeKids || false}
                        onChange={e => {
                          const filters = form.watch('filters') || {};
                          form.setValue('filters', {
                            ...filters,
                            includeKids: e.target.checked,
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Include Kids</span>
                    </label>
                  </div>
                </div>
              )}

              <FormField label="Custom Title (Optional)">
                <Input
                  {...form.register('title')}
                  placeholder="Leave empty for auto-generated title"
                />
              </FormField>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="generate-report-form" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
