import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FreeSessionRequestsTable } from '@/components/requests/FreeSessionRequestsTable';
import { RescheduleRequestsTable } from '@/components/requests/RescheduleRequestsTable';
import { ExtraSessionRequestsTable } from '@/components/requests/ExtraSessionRequestsTable';

export function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Requests</h1>
        <p className="text-muted-foreground mt-1">
          Manage free session, reschedule, and extra session requests
        </p>
      </div>

      <Tabs defaultValue="free-sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="free-sessions">Free Sessions</TabsTrigger>
          <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
          <TabsTrigger value="extra-sessions">Extra Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="free-sessions" className="space-y-4">
          <FreeSessionRequestsTable />
        </TabsContent>
        <TabsContent value="reschedule" className="space-y-4">
          <RescheduleRequestsTable />
        </TabsContent>
        <TabsContent value="extra-sessions" className="space-y-4">
          <ExtraSessionRequestsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
