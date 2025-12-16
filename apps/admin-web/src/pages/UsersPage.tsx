import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParentsTable } from '@/components/users/ParentsTable';
import { CoachesTable } from '@/components/users/CoachesTable';

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage parents and coaches</p>
      </div>

      <Tabs defaultValue="parents" className="space-y-4">
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
