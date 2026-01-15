import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { Kid } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';

interface LinkParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kid: Kid;
}

export function LinkParentDialog({ open, onOpenChange, kid }: LinkParentDialogProps) {
  const [parentId, setParentId] = useState('');
  const { toast } = useToast();

  // Set initial parentId when dialog opens or kid changes
  useEffect(() => {
    if (open) {
      // Check if kid has a parentId (string) or parent object with id
      // Handle both cases: direct parentId or populated parent object
      const currentParentId =
        kid.parentId || (kid as any).parent?.id || (kid as any).parent?.id || '';
      setParentId(currentParentId);
    } else {
      // Reset when dialog closes
      setParentId('');
    }
  }, [open, kid]);

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 100)
  );

  const linkMutation = useApiMutation(
    (parentId: string) => kidsService.linkToParent(kid.id, parentId),
    {
      invalidateQueries: [['kids']],
      onSuccess: () => {
        toast.success('Kid linked to parent successfully');
        setParentId('');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to link kid', error.message);
      },
    }
  );

  const handleSubmit = () => {
    if (!parentId) {
      toast.error('Please select a parent');
      return;
    }
    linkMutation.mutate(parentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Kid to Parent</DialogTitle>
          <DialogDescription>Link {kid.name} to a parent</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
            <CustomFormField label="Parent" required>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {(parentsData?.data || []).map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.parentProfile?.name || parent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CustomFormField>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={linkMutation.isPending}>
                {linkMutation.isPending ? 'Linking...' : 'Link'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
