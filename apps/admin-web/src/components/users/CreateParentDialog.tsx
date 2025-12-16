import { useState } from 'react';
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
import { format } from 'date-fns';

interface CreateParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateParentDialog({ open, onOpenChange }: CreateParentDialogProps) {
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

  const createMutation = useApiMutation(
    (data: CreateParentDto) => usersService.createParent(data),
    {
      invalidateQueries: [['users', 'parents']],
      onSuccess: () => {
        toast.success('Parent created successfully');
        form.reset();
        setStep(1);
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to create parent', error.message);
      },
    }
  );

  const onSubmit = (data: CreateParentDto) => {
    if (step === 1) {
      setStep(2);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Create Parent - Step 1' : 'Create Parent - Step 2'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Enter parent information' : 'Enter kids information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <>
              <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
                <Input {...form.register('name')} />
              </CustomFormField>

              <CustomFormField label="Email" required error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register('email')} />
              </CustomFormField>

              <CustomFormField label="Phone" required error={form.formState.errors.phone?.message}>
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
                    <input
                      type="checkbox"
                      id={`currentlyInSports-${index}`}
                      {...form.register(`kids.${index}.currentlyInSports`)}
                      className="rounded"
                    />
                    <label htmlFor={`currentlyInSports-${index}`} className="text-sm">
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

          <div className="flex justify-between">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {step === 1 ? 'Next' : createMutation.isPending ? 'Creating...' : 'Create Parent'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
