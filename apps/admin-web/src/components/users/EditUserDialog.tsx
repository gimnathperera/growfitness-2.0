import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as CustomFormField } from '@/components/common/FormField';
import {
  UpdateParentSchema,
  UpdateCoachSchema,
  UpdateParentDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { User, UserStatus } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  userType: 'parent' | 'coach';
}

export function EditUserDialog({ open, onOpenChange, user, userType }: EditUserDialogProps) {
  const { toast } = useToast();

  const form = useForm<UpdateParentDto | UpdateCoachDto>({
    resolver: zodResolver(userType === 'parent' ? UpdateParentSchema : UpdateCoachSchema),
    defaultValues: {
      name: userType === 'parent' ? user.parentProfile?.name : user.coachProfile?.name,
      email: user.email,
      phone: user.phone,
      location: userType === 'parent' ? user.parentProfile?.location : undefined,
      status: user.status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: userType === 'parent' ? user.parentProfile?.name : user.coachProfile?.name,
        email: user.email,
        phone: user.phone,
        location: userType === 'parent' ? user.parentProfile?.location : undefined,
        status: user.status,
      });
    }
  }, [open, user, userType, form]);

  const updateMutation = useApiMutation(
    (data: UpdateParentDto | UpdateCoachDto) => {
      if (userType === 'parent') {
        return usersService.updateParent(user.id, data as UpdateParentDto);
      } else {
        return usersService.updateCoach(user.id, data as UpdateCoachDto);
      }
    },
    {
      invalidateQueries: [[`users`, userType === 'parent' ? 'parents' : 'coaches']],
      onSuccess: () => {
        toast.success(`${userType === 'parent' ? 'Parent' : 'Coach'} updated successfully`);
        onOpenChange(false);
      },
      onError: error => {
        toast.error(`Failed to update ${userType}`, error.message);
      },
    }
  );

  const onSubmit = (data: UpdateParentDto | UpdateCoachDto) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {userType === 'parent' ? 'Parent' : 'Coach'}</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </CustomFormField>

            <CustomFormField label="Email" required error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register('email')} />
            </CustomFormField>

            <CustomFormField label="Phone" required error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} />
            </CustomFormField>

            {userType === 'parent' && (
              <CustomFormField
                label="Location"
                error={(form.formState.errors as any).location?.message}
              >
                <Input {...form.register('location')} />
              </CustomFormField>
            )}

            <CustomFormField label="Status" error={form.formState.errors.status?.message}>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userType === 'parent' ? (
                    <>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                      <SelectItem value={UserStatus.DELETED}>Deleted</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </CustomFormField>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
