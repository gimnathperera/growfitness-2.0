import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParentsTable } from '@/components/users/ParentsTable';
import { CoachesTable } from '@/components/users/CoachesTable';
import { useSearchParams } from 'react-router-dom';

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'parents';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage parents and coaches</p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
        </TabsList>
        <TabsContent value="parents" className="space-y-4">
          <ParentsTable />
        </TabsContent>
        <TabsContent value="coaches" className="space-y-4">
          <CoachesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
