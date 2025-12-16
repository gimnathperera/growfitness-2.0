import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Kid } from '@grow-fitness/shared-types';
import { formatDate } from '@/lib/formatters';
import { formatSessionType } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

interface KidDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kid: Kid;
}

export function KidDetailsDialog({ open, onOpenChange, kid }: KidDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kid Details</DialogTitle>
          <DialogDescription>View kid profile information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-sm font-medium">{kid.name}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                <p className="text-sm">{kid.gender}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Birth Date</h3>
                <p className="text-sm">{formatDate(kid.birthDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Goal</h3>
                <p className="text-sm">{kid.goal || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Session Type</h3>
                <p className="text-sm">{formatSessionType(kid.sessionType)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Currently in Sports</h3>
                <p className="text-sm">{kid.currentlyInSports ? 'Yes' : 'No'}</p>
              </div>

              {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Medical Conditions</h3>
                  <p className="text-sm">{kid.medicalConditions.join(', ')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <p className="text-sm text-muted-foreground">Sessions will be displayed here</p>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <p className="text-sm text-muted-foreground">Achievements will be displayed here</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
