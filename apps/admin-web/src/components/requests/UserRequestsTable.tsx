import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { requestsService } from '@/services/requests.service';
import { usersService } from '@/services/users.service';
import { UserRegistrationRequest, User, Kid, RequestStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Mail, Phone, MapPin, Calendar, Baby, Target, Activity, AlertCircle, Award } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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

  const { data, isLoading, error } = useApiQuery(
    ['requests', 'user-registrations', page.toString(), pageSize.toString()],
    () => requestsService.getUserRegistrationRequests(page, pageSize)
  );

  const approveMutation = useApiMutation(
    (id: string) => requestsService.approveUserRegistrationRequest(id),
    {
      invalidateQueries: [
        ['requests', 'user-registrations'],
        ['users', 'parents'],
        ['kids'],
      ],
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
  const parent = parentData || (selectedRequest?.parentId && typeof selectedRequest.parentId === 'object' ? selectedRequest.parentId as User : null);
  const kids: Kid[] = (parent && 'kids' in parent && Array.isArray(parent.kids)) ? parent.kids : [];

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
      accessorKey: 'parentId',
      header: 'Parent Name',
      cell: ({ row }) => getParentName(row.original.parentId),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => getParentEmail(row.original.parentId),
    },
    {
      accessorKey: 'phone',
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
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(request)}
            >
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
            />
            {data && <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />}
          </>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
          {parent && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{parent.parentProfile?.name || 'N/A'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{parent.email}</p>
                      <StatusBadge status={selectedRequest?.status || RequestStatus.PENDING} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Registered {formatDate(parent.createdAt)}
                    </p>
                  </div>
                  {selectedRequest?.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(selectedRequest)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-80 border-r bg-muted/20 p-6 overflow-y-auto min-h-0">
                  {/* Profile Section */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Profile</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarFallback className="text-base">
                          {(parent.parentProfile?.name || 'N/A')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{parent.parentProfile?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Parent Account</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Contact Section */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-sm">Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{parent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{parent.phone}</span>
                      </div>
                      {parent.parentProfile?.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{parent.parentProfile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Highlights Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Highlights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Kids</span>
                        <span className="text-muted-foreground">{kids.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">In Sports</span>
                        <span className="text-muted-foreground">
                          {kids.filter(k => k.currentlyInSports).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Individual Sessions</span>
                        <span className="text-muted-foreground">
                          {kids.filter(k => k.sessionType === 'INDIVIDUAL').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Group Sessions</span>
                        <span className="text-muted-foreground">
                          {kids.filter(k => k.sessionType === 'GROUP').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Main Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="children">
                        Children {kids.length > 0 && `(${kids.length})`}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* About Section */}
                      <div>
                        <h3 className="font-semibold mb-3">About</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                            <p className="text-sm">{parent.parentProfile?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                            <p className="text-sm">{parent.email}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                            <p className="text-sm">{parent.phone}</p>
                          </div>
                          {parent.parentProfile?.location && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                Location
                              </h4>
                              <p className="text-sm">{parent.parentProfile.location}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                            <StatusBadge status={parent.status} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Member Since
                            </h4>
                            <p className="text-sm">{formatDate(parent.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="children" className="mt-6">
                      {kids.length === 0 ? (
                        <div className="text-center py-12">
                          <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No children registered yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kids.map((kid, index) => (
                            <Card key={kid.id || index} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Baby className="h-4 w-4" />
                                    {kid.name}
                                  </CardTitle>
                                  <Badge variant="outline">{kid.gender}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground text-xs">Birth Date</p>
                                    <p className="font-medium">{formatDate(kid.birthDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Session Type</p>
                                    <p className="font-medium">{formatSessionType(kid.sessionType)}</p>
                                  </div>
                                </div>

                                {kid.goal && (
                                  <div className="flex items-start gap-2 pt-2 border-t">
                                    <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Goal</p>
                                      <p className="text-sm">{kid.goal}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-4 pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <Activity
                                      className={`h-4 w-4 ${
                                        kid.currentlyInSports
                                          ? 'text-green-600'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {kid.currentlyInSports ? 'In Sports' : 'Not in Sports'}
                                    </span>
                                  </div>
                                </div>

                                {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                                  <div className="flex items-start gap-2 pt-2 border-t">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Medical Conditions
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {kid.medicalConditions.map((condition, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {condition}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {kid.achievements && kid.achievements.length > 0 && (
                                  <div className="flex items-start gap-2 pt-2 border-t">
                                    <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Achievements</p>
                                      <p className="text-xs">{kid.achievements.length} achievement(s)</p>
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
