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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { CreateKidSchema, CreateKidDto } from '@grow-fitness/shared-schemas';
import { SessionType, UploadKind } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { uploadFileViaGcs } from '@/services/uploads.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { DatePicker } from '@/components/common/DatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';
import { FileDropzone } from '@/components/common/FileDropzone';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Check } from 'lucide-react';

const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

interface CreateKidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKidDialog({ open, onOpenChange }: CreateKidDialogProps) {
  const { closeModal } = useModalParams('kidId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [showProfilePhotoUrl, setShowProfilePhotoUrl] = useState(false);

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 100)
  );

  const defaultValues = {
    name: '',
    gender: '',
    birthDate: '',
    goal: '',
    currentlyInSports: false,
    medicalConditions: [],
    sessionType: SessionType.INDIVIDUAL,
    parentId: '',
    profilePhotoUrl: undefined,
  };

  const form = useForm<CreateKidDto>({
    resolver: zodResolver(CreateKidSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setProfilePhotoFile(null);
      setShowProfilePhotoUrl(false);
    } else {
      form.reset(defaultValues);
      setProfilePhotoFile(null);
      setShowProfilePhotoUrl(false);
    }
  }, [open]);

  const createMutation = useApiMutation(
    async ({
      data,
      profilePhotoFile: f,
    }: {
      data: CreateKidDto;
      profilePhotoFile: File | null;
    }) => {
      const created = await kidsService.createKid(data);
      if (f) await uploadFileViaGcs(UploadKind.KID_AVATAR, created.id, f);
      return created;
    },
    {
      invalidateQueries: [['kids'], ['kids', 'all']],
      onSuccess: () => {
        toast.success('Kid created successfully');
        form.reset(defaultValues);
        setProfilePhotoFile(null);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create kid', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateKidDto) => {
    const formattedData: CreateKidDto = {
      ...data,
      birthDate:
        typeof data.birthDate === 'string'
          ? data.birthDate
          : format(data.birthDate as Date, 'yyyy-MM-dd'),
      profilePhotoUrl: profilePhotoFile ? undefined : data.profilePhotoUrl || undefined,
    };
    createMutation.mutate({ data: formattedData, profilePhotoFile });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Kid</DialogTitle>
              <DialogDescription className="text-sm">Add a new kid to the system</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-kid-form" className="space-y-4">


              <CustomFormField
                label="Parent"
                required
                error={form.formState.errors.parentId?.message}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Select value={form.watch('parentId')} onValueChange={(value) => form.setValue('parentId', value)}>
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
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command
                      filter={(value: string, search: string) => {
                        const parent = (parentsData?.data || []).find(
                          p => p.id === value
                        );

                        if (!parent) return 0;

                        const label = [parent.parentProfile?.name, parent.email]
                          .filter(Boolean)
                          .join(' ')
                          .toLowerCase();

                        return label.includes(search.toLowerCase()) ? 1 : 0;
                      }}
                      className="w-full"
                    >
                      <CommandInput placeholder="Search parent..." />

                      <CommandEmpty>No parent found.</CommandEmpty>

                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {(parentsData?.data || []).map(parent => {
                          const label =
                            parent.parentProfile?.name || parent.email;

                          return (
                            <CommandItem
                              key={parent.id}
                              value={parent.id}
                              onSelect={() => {
                                form.setValue('parentId', parent.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  form.watch('parentId') === parent.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />

                              {label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CustomFormField>

              <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
                <Input {...form.register('name')} />
              </CustomFormField>

              <div className="space-y-2">
                <CustomFormField
                  label="Profile photo"
                  error={form.formState.errors.profilePhotoUrl?.message}
                >
                  <FileDropzone
                    value={profilePhotoFile}
                    onChange={setProfilePhotoFile}
                    accept={IMAGE_UPLOAD_TYPES}
                    maxSizeBytes={MAX_IMAGE_UPLOAD_BYTES}
                    preview="image"
                    label="Drop photo here or browse"
                    description="JPEG, PNG, or WebP up to 5MB"
                    disabled={createMutation.isPending}
                  />
                </CustomFormField>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={() => setShowProfilePhotoUrl(v => !v)}
                >
                  {showProfilePhotoUrl ? 'Hide photo URL field' : 'Paste photo URL instead'}
                </Button>
                {showProfilePhotoUrl && (
                  <Input type="url" placeholder="https://..." {...form.register('profilePhotoUrl')} />
                )}
              </div>

              <CustomFormField label="Gender" required error={form.formState.errors.gender?.message}>
                <Select
                  value={form.watch('gender')}
                  onValueChange={value => form.setValue('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </CustomFormField>

              <CustomFormField
                label="Birth Date"
                required
                error={form.formState.errors.birthDate?.message}
              >
                <DatePicker
                  date={form.watch('birthDate') ? new Date(form.watch('birthDate')) : undefined}
                  onSelect={date => form.setValue('birthDate', date ? format(date, 'yyyy-MM-dd') : '')}
                  enableYearMonthDropdown
                />
              </CustomFormField>

              <CustomFormField
                label="Goal"
                error={form.formState.errors.goal?.message}
              >
                <Select
                  value={form.watch(`goal`)}
                  onValueChange={value => form.setValue(`goal`, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Build strength">Build strength</SelectItem>
                    <SelectItem value="Improve coordination">Improve coordination</SelectItem>
                    <SelectItem value="Make friends">Make friends</SelectItem>
                    <SelectItem value="I don't know/ Basic fitness">I don't know/ Basic fitness</SelectItem>
                  </SelectContent>
                </Select>
              </CustomFormField>

              <CustomFormField
                label="Session Type"
                required
                error={form.formState.errors.sessionType?.message}
              >
                <Select
                  value={form.watch('sessionType')}
                  onValueChange={value => form.setValue('sessionType', value as SessionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SessionType.INDIVIDUAL}>Private</SelectItem>
                    <SelectItem value={SessionType.GROUP}>Group</SelectItem>
                    <SelectItem value={SessionType.BOTH}>Both</SelectItem>
                  </SelectContent>
                </Select>
              </CustomFormField>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentlyInSports"
                  checked={form.watch('currentlyInSports')}
                  onCheckedChange={checked => form.setValue('currentlyInSports', checked === true)}
                />
                <label htmlFor="currentlyInSports" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Currently in sports
                </label>
              </div>

              <CustomFormField
                label="Medical Conditions (Optional)"
                error={form.formState.errors.medicalConditions?.message}
              >
                <div className="space-y-3">
                  {[
                    'Asthma',
                    'Allergies',
                    'Diabetes',
                    'Heart conditions',
                    'Joint issues',
                    'Others',
                  ].map(condition => {
                    const selectedConditions =
                      form.watch('medicalConditions') || [];

                    return (
                      <div
                        key={condition}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`medical-condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={checked => {
                            if (checked === true) {
                              form.setValue('medicalConditions', [
                                ...selectedConditions,
                                condition,
                              ]);
                            } else {
                              form.setValue(
                                'medicalConditions',
                                selectedConditions.filter(
                                  item => item !== condition
                                )
                              );
                            }
                          }}
                        />

                        <label
                          htmlFor={`medical-condition-${condition}`}
                          className="text-sm font-normal leading-none"
                        >
                          {condition}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CustomFormField>

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-kid-form" disabled={createMutation.isPending || !form.formState.isValid}>
                {createMutation.isPending ? 'Creating...' : 'Create Kid'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}