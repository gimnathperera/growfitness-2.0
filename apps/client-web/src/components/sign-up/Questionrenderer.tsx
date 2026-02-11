import { Controller, type Control, type FieldError, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface QuestionOption {
  value: string;
  label: string;
}

interface QuestionConfig<T extends FieldPath<FieldValues>> {
  id: T;
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'multiselect' | 'boolean';
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
}

interface QuestionRendererProps<T extends FieldValues> {
  question: QuestionConfig<FieldPath<T>>;
  control: Control<T>;
  error?: FieldError;
  shouldAutoFocus?: boolean;
}

const QuestionRenderer = <T extends FieldValues>({
  question,
  control,
  error,
  shouldAutoFocus = false,
}: QuestionRendererProps<T>) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
                placeholder={question.placeholder}
                autoFocus={shouldAutoFocus}
                className="w-full text-lg px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                placeholder={question.placeholder}
                autoFocus={shouldAutoFocus}
                className="w-full text-lg px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value as string}
                onValueChange={field.onChange}
                className="space-y-3"
              >
                {question.options?.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer"
                    onClick={() => field.onChange(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'boolean':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ? 'true' : 'false'}
                onValueChange={(value) => field.onChange(value === 'true')}
                className="space-y-3"
              >
                <div
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => field.onChange(true)}
                >
                  <RadioGroupItem value="true" id={`${question.id}-yes`} />
                  <Label htmlFor={`${question.id}-yes`} className="flex-1 cursor-pointer text-base">
                    Yes
                  </Label>
                </div>
                <div
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => field.onChange(false)}
                >
                  <RadioGroupItem value="false" id={`${question.id}-no`} />
                  <Label htmlFor={`${question.id}-no`} className="flex-1 cursor-pointer text-base">
                    No
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        );

      case 'multiselect':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => {
              const value = (field.value as string[]) || [];
              
              const handleToggle = (optionValue: string) => {
                const newValue = value.includes(optionValue)
                  ? value.filter((v) => v !== optionValue)
                  : [...value, optionValue];
                field.onChange(newValue);
              };

              return (
                <div className="space-y-3">
                  {question.options?.map((option) => {
                    const isChecked = value.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        onClick={() => handleToggle(option.value)}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(option.value)}
                          id={`${question.id}-${option.value}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <span className="inline-block w-4 h-4">⚠️</span>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default QuestionRenderer;