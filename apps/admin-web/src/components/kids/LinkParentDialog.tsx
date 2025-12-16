import { useState } from 'react';
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

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 1000)
  );

  const linkMutation = useApiMutation(
    (parentId: string) => kidsService.linkToParent(kid._id, parentId),
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

        <div className="space-y-4">
          <CustomFormField label="Parent" required>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                {parentsData?.data.map(parent => (
                  <SelectItem key={parent._id} value={parent._id}>
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
      </DialogContent>
    </Dialog>
  );
}
