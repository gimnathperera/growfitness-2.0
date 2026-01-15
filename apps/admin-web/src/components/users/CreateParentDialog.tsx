import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { CreateParentSchema, CreateParentDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateParentDialog({ open, onOpenChange }: CreateParentDialogProps) {
  const { closeModal } = useModalParams('userId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<CreateParentDto>({
    resolver: zodResolver(CreateParentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      password: '',
      kids: [
        {
          name: '',
          gender: '',
          birthDate: '',
          goal: '',
          currentlyInSports: false,
          medicalConditions: [],
          sessionType: SessionType.INDIVIDUAL,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'kids',
  });

  const defaultValues = {
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    kids: [
      {
        name: '',
        gender: '',
        birthDate: '',
        goal: '',
        currentlyInSports: false,
        medicalConditions: [],
        sessionType: SessionType.INDIVIDUAL,
      },
    ],
  };

  // Reset form and step when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setStep(1);
    } else {
      form.reset(defaultValues);
      setStep(1);
    }
  }, [open]);

  const createMutation = useApiMutation(
    (data: CreateParentDto) => usersService.createParent(data),
    {
      invalidateQueries: [
        ['users', 'parents'],
        ['users', 'parents', 'all'],
      ],
      onSuccess: () => {
        toast.success('Parent created successfully');
        form.reset(defaultValues);
        setStep(1);
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create parent', error.message || 'An error occurred');
      },
    }
  );

  const handleNext = async () => {
    // Validate only Step 1 fields before advancing
    const isValid = await form.trigger(['name', 'email', 'phone', 'password']);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = (data: CreateParentDto) => {
    if (step === 1) {
      // This shouldn't be called for step 1, but handle it just in case
      handleNext();
    } else {
      const formattedData = {
        ...data,
        kids: data.kids.map(kid => ({
          ...kid,
          birthDate:
            typeof kid.birthDate === 'string'
              ? kid.birthDate
              : format(kid.birthDate as Date, 'yyyy-MM-dd'),
        })),
      };
      createMutation.mutate(formattedData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">
                {step === 1 ? 'Create Parent - Step 1' : 'Create Parent - Step 2'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {step === 1 ? 'Enter parent information' : 'Enter kids information'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-parent-form" className="space-y-4">
            {step === 1 ? (
              <>
                <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
                  <Input {...form.register('name')} />
                </CustomFormField>

                <CustomFormField
                  label="Email"
                  required
                  error={form.formState.errors.email?.message}
                >
                  <Input type="email" {...form.register('email')} />
                </CustomFormField>

                <CustomFormField
                  label="Phone"
                  required
                  error={form.formState.errors.phone?.message}
                >
                  <Input {...form.register('phone')} />
                </CustomFormField>

                <CustomFormField label="Location" error={form.formState.errors.location?.message}>
                  <Input {...form.register('location')} />
                </CustomFormField>

                <CustomFormField
                  label="Password"
                  required
                  error={form.formState.errors.password?.message}
                >
                  <Input type="password" {...form.register('password')} />
                </CustomFormField>
              </>
            ) : (
              <>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Kid {index + 1}</h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <CustomFormField
                      label="Name"
                      required
                      error={form.formState.errors.kids?.[index]?.name?.message}
                    >
                      <Input {...form.register(`kids.${index}.name`)} />
                    </CustomFormField>

                    <CustomFormField
                      label="Gender"
                      required
                      error={form.formState.errors.kids?.[index]?.gender?.message}
                    >
                      <Select
                        value={form.watch(`kids.${index}.gender`)}
                        onValueChange={value => form.setValue(`kids.${index}.gender`, value)}
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
                      error={form.formState.errors.kids?.[index]?.birthDate?.message}
                    >
                      <DatePicker
                        date={
                          form.watch(`kids.${index}.birthDate`)
                            ? new Date(form.watch(`kids.${index}.birthDate`))
                            : undefined
                        }
                        onSelect={date =>
                          form.setValue(
                            `kids.${index}.birthDate`,
                            date ? format(date, 'yyyy-MM-dd') : ''
                          )
                        }
                        enableYearMonthDropdown
                      />
                    </CustomFormField>

                    <CustomFormField
                      label="Goal"
                      error={form.formState.errors.kids?.[index]?.goal?.message}
                    >
                      <Input {...form.register(`kids.${index}.goal`)} />
                    </CustomFormField>

                    <CustomFormField
                      label="Session Type"
                      required
                      error={form.formState.errors.kids?.[index]?.sessionType?.message}
                    >
                      <Select
                        value={form.watch(`kids.${index}.sessionType`)}
                        onValueChange={value =>
                          form.setValue(`kids.${index}.sessionType`, value as SessionType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SessionType.INDIVIDUAL}>Individual</SelectItem>
                          <SelectItem value={SessionType.GROUP}>Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </CustomFormField>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`currentlyInSports-${index}`}
                        checked={form.watch(`kids.${index}.currentlyInSports`)}
                        onCheckedChange={checked => form.setValue(`kids.${index}.currentlyInSports`, checked === true)}
                      />
                      <label htmlFor={`currentlyInSports-${index}`} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Currently in sports
                      </label>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      name: '',
                      gender: '',
                      birthDate: '',
                      goal: '',
                      currentlyInSports: false,
                      medicalConditions: [],
                      sessionType: SessionType.INDIVIDUAL,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Kid
                </Button>
              </>
            )}

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-between">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                {step === 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" form="create-parent-form" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Parent'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
