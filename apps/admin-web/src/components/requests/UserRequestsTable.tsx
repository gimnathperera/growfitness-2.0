import { useEffect, useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { RequestSortField, SortOrder, requestsService } from '@/services/requests.service';
import { usersService } from '@/services/users.service';
import { UserRegistrationRequest, User, Kid, RequestStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Baby,
  Target,
  Activity,
  AlertCircle,
  Award,
} from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function UserRequestsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<UserRegistrationRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id as RequestSortField | undefined;
  const sortOrder = sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined;

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, error } = useApiQuery(
    [
      'requests',
      'user-registrations',
      page.toString(),
      pageSize.toString(),
      sortBy || '',
      sortOrder || '',
    ],
    () =>
      requestsService.getUserRegistrationRequests(
        page,
        pageSize,
        sortBy,
        sortOrder as SortOrder | undefined
      )
  );

  const approveMutation = useApiMutation(
    (id: string) => requestsService.approveUserRegistrationRequest(id),
    {
      invalidateQueries: [['requests', 'user-registrations'], ['users', 'parents'], ['kids']],
      onSuccess: () => {
        toast.success('Registration approved successfully');
        setDetailsOpen(false);
        setSelectedRequest(null);
      },
      onError: error => {
        toast.error('Failed to approve registration', error.message);
      },
    }
  );

  const rejectMutation = useApiMutation(
    (id: string) => requestsService.rejectUserRegistrationRequest(id),
    {
      invalidateQueries: [['requests', 'user-registrations']],
      onSuccess: () => {
        toast.success('Registration rejected');
        setDetailsOpen(false);
        setSelectedRequest(null);
      },
      onError: error => {
        toast.error('Failed to reject registration', error.message);
      },
    }
  );

  // Fetch parent details for selected request
  const getParentId = (parentId: any): string | null => {
    if (!parentId) return null;
    if (typeof parentId === 'string') return parentId;
    if (typeof parentId === 'object') {
      return parentId._id?.toString() || parentId.id?.toString() || null;
    }
    return null;
  };

  const parentId = selectedRequest ? getParentId(selectedRequest.parentId) : null;

  const { data: parentData } = useApiQuery<User & { kids?: Kid[] }>(
    ['users', 'parents', 'unapproved', parentId || 'no-id'],
    () => {
      if (!parentId) {
        throw new Error('Parent ID is required');
      }
      // Fetch unapproved parent for admin review
      return usersService.getParentById(parentId, true);
    },
    {
      enabled: detailsOpen && !!parentId,
    }
  );

  // Helper to get parent name from populated object or return ID
  const getParentName = (parentId: any): string => {
    if (!parentId) return 'N/A';
    if (typeof parentId === 'string') return parentId;
    if (typeof parentId === 'object') {
      if (parentId.parentProfile?.name) return parentId.parentProfile.name;
      if (parentId.email) return parentId.email;
    }
    return 'N/A';
  };

  // Helper to get parent email
  const getParentEmail = (parentId: any): string => {
    if (!parentId) return 'N/A';
    if (typeof parentId === 'string') return 'N/A';
    if (typeof parentId === 'object') {
      return parentId.email || 'N/A';
    }
    return 'N/A';
  };

  // Helper to get parent phone
  const getParentPhone = (parentId: any): string => {
    if (!parentId) return 'N/A';
    if (typeof parentId === 'string') return 'N/A';
    if (typeof parentId === 'object') {
      return parentId.phone || 'N/A';
    }
    return 'N/A';
  };

  // Get parent from request or fetched data
  const parent =
    parentData ||
    (selectedRequest?.parentId && typeof selectedRequest.parentId === 'object'
      ? (selectedRequest.parentId as User)
      : null);
  const kids: Kid[] = parent && 'kids' in parent && Array.isArray(parent.kids) ? parent.kids : [];

  const handleViewDetails = (request: UserRegistrationRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleApprove = (request: UserRegistrationRequest) => {
    approveMutation.mutate(request.id);
  };

  const handleReject = (request: UserRegistrationRequest) => {
    rejectMutation.mutate(request.id);
  };

  const columns: ColumnDef<UserRegistrationRequest>[] = [
    {
      id: 'parent',
      accessorFn: row => getParentName(row.parentId),
      header: 'Parent Name',
      cell: ({ row }) => getParentName(row.original.parentId),
    },
    {
      id: 'email',
      accessorFn: row => getParentEmail(row.parentId),
      header: 'Email',
      cell: ({ row }) => getParentEmail(row.original.parentId),
    },
    {
      id: 'phone',
      accessorFn: row => getParentPhone(row.parentId),
      header: 'Phone',
      cell: ({ row }) => getParentPhone(row.original.parentId),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(request)}
                  disabled={approveMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request)}
                  disabled={rejectMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {error ? (
          <ErrorState
            title="Failed to load user registration requests"
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No user registration requests found"
              manualSorting
              sorting={sorting}
              onSortingChange={setSorting}
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[100vw] sm:max-w-6xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] p-0 flex flex-col border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] shadow-[4px_4px_0_0_var(--gf-green-deep)] sm:shadow-2xl rounded-none sm:rounded-2xl">
          <DialogTitle className="sr-only">User Registration Details</DialogTitle>
          <DialogDescription className="sr-only">View detailed information about this user registration request</DialogDescription>
          {parent && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-green-50)] flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-wider text-[var(--gf-green-deep]" style={{ fontFamily: 'var(--font-display)' }}>
                      {parent.parentProfile?.name || 'N/A'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-[var(--fg-2)] font-semibold">{parent.email}</p>
                      <StatusBadge status={selectedRequest?.status || RequestStatus.PENDING} />
                    </div>
                    <p className="text-[10px] sm:text-xs text-[var(--fg-2)] font-semibold mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[var(--gf-green-deep)]" />
                      Registered {formatDate(parent.createdAt)}
                    </p>
                  </div>
                  {selectedRequest?.status === 'PENDING' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(selectedRequest)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 sm:flex-none rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-[var(--gf-green-deep)] font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] hover:bg-[var(--fg-6)] transition-all duration-200"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={approveMutation.isPending}
                        className="flex-1 sm:flex-none rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-white font-extrabold uppercase tracking-wider bg-[var(--gf-green-deep)] border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--gf-green-deep)] active:translate-y-[1px] active:shadow-[0_0_0_0_var(--gf-green-deep)] transition-all duration-200"
                      >
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
                {/* Left Sidebar - hidden on mobile, shown on lg */}
                <div className="hidden lg:flex lg:flex-col w-80 border-r border-[var(--gf-green-deep)]/10 bg-[var(--gf-green-50)]/30 p-4 sm:p-6 overflow-y-auto min-h-0">
                  {/* Profile Section */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold uppercase tracking-wider text-sm text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Profile</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-[var(--gf-green-deep)]">
                        <AvatarFallback className="text-base bg-[var(--gf-green-deep)] text-white font-extrabold">
                          {(parent.parentProfile?.name || 'N/A')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{parent.parentProfile?.name || 'N/A'}</p>
                        <p className="text-xs text-[var(--fg-2)] font-semibold mt-0.5">Parent Account</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 bg-[var(--gf-green-deep)]/10" />

                  {/* Contact Section */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-extrabold uppercase tracking-wider text-sm text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[var(--gf-green-deep)]" />
                        <span className="text-[var(--fg-2)] font-semibold">{parent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[var(--gf-green-deep)]" />
                        <span className="text-[var(--fg-2)] font-semibold">{parent.phone}</span>
                      </div>
                      {parent.parentProfile?.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-[var(--gf-green-deep)]" />
                          <span className="text-[var(--fg-2)] font-semibold">
                            {parent.parentProfile.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6 bg-[var(--gf-green-deep)]/10" />

                  {/* Highlights Section */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold uppercase tracking-wider text-sm text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Highlights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--fg-2)] font-semibold">Total Kids</span>
                        <span className="text-[var(--fg-2)] font-semibold">{kids.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--fg-2)] font-semibold">In Sports</span>
                        <span className="text-[var(--fg-2)] font-semibold">
                          {kids.filter(k => k.currentlyInSports).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--fg-2)] font-semibold">Private Sessions</span>
                        <span className="text-[var(--fg-2)] font-semibold">
                          {kids.filter(k => k.sessionType === 'INDIVIDUAL').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--fg-2)] font-semibold">Group Sessions</span>
                        <span className="text-[var(--fg-2)] font-semibold">
                          {kids.filter(k => k.sessionType === 'GROUP').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Main Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <Tabs defaultValue="overview" className="w-full flex flex-col">
                    <TabsList className="bg-[var(--gf-green-50)]/30 border-2 border-[var(--gf-green-deep)]/30 h-10 grid grid-cols-2 lg:grid-cols-1 lg:flex w-full lg:w-auto">
                      <TabsTrigger value="overview" className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-[var(--gf-green-deep)] data-[state=active]:bg-[var(--gf-green-deep)] data-[state=active]:text-white">Overview</TabsTrigger>
                      <TabsTrigger value="children" className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-[var(--gf-green-deep)] data-[state=active]:bg-[var(--gf-green-deep)] data-[state=active]:text-white">
                        Children {kids.length > 0 && `(${kids.length})`}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-6 space-y-3 sm:space-y-6">
                      {/* About Section */}
                      <div>
                        <h3 className="font-extrabold uppercase tracking-wider mb-3 text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>About</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">Name</h4>
                            <p className="text-sm font-semibold">{parent.parentProfile?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">
                              Email
                            </h4>
                            <p className="text-sm font-semibold">{parent.email}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">
                              Phone
                            </h4>
                            <p className="text-sm font-semibold">{parent.phone}</p>
                          </div>
                          {parent.parentProfile?.location && (
                            <div>
                              <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">
                                Location
                              </h4>
                              <p className="text-sm font-semibold">{parent.parentProfile.location}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">
                              Status
                            </h4>
                            <StatusBadge status={parent.status} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--fg-2)] mb-1">
                              Member Since
                            </h4>
                            <p className="text-sm font-semibold">{formatDate(parent.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="children" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-6">
                      {kids.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <Baby className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--gf-green-deep)] mx-auto mb-2 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-[var(--fg-2)] font-semibold">
                            No children registered yet
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {kids.map((kid, index) => (
                            <Card key={kid.id || index} className="overflow-hidden border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Baby className="h-4 w-4 text-[var(--gf-green-deep)]" />
                                    {kid.name}
                                  </CardTitle>
                                  <Badge variant="outline" className="font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)]">{kid.gender}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-[var(--fg-2)] font-semibold text-xs">Birth Date</p>
                                    <p className="font-semibold">{formatDate(kid.birthDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[var(--fg-2)] font-semibold text-xs">Session Type</p>
                                    <p className="font-semibold">
                                      {formatSessionType(kid.sessionType)}
                                    </p>
                                  </div>
                                </div>

                                {kid.goal && (
                                  <div className="flex items-start gap-2 pt-2 border-t border-[var(--gf-green-deep)]/10">
                                    <Target className="h-4 w-4 text-[var(--gf-green-deep)] mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Goal</p>
                                      <p className="text-sm font-semibold">{kid.goal}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-4 pt-2 border-t border-[var(--gf-green-deep)]/10">
                                  <div className="flex items-center gap-2">
                                    <Activity
                                      className={`h-4 w-4 ${
                                        kid.currentlyInSports
                                          ? 'text-[var(--gf-green-deep)]'
                                          : 'text-[var(--fg-2)]'
                                      }`}
                                    />
                                    <span className="text-xs font-semibold text-[var(--fg-2)]">
                                      {kid.currentlyInSports ? 'In Sports' : 'Not in Sports'}
                                    </span>
                                  </div>
                                </div>

                                {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                                  <div className="flex items-start gap-2 pt-2 border-t border-[var(--gf-green-deep)]/10">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                        Conditions
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {kid.medicalConditions.map((condition, idx) => (
                                          <Badge key={idx} variant="secondary" className="font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] bg-[var(--gf-green-deep)] text-white text-xs">
                                            {condition}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {kid.achievements && kid.achievements.length > 0 && (
                                  <div className="flex items-start gap-2 pt-2 border-t border-[var(--gf-green-deep)]/10">
                                    <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                        Achievements
                                      </p>
                                      <p className="text-xs font-semibold">
                                        {kid.achievements.length} achievement(s)
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
