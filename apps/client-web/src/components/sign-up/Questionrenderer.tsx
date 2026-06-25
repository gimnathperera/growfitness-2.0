import { Controller, type Control, type FieldError, type FieldPath, type FieldValues } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
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
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'multiselect' | 'textarea' | 'password' | 'confirmPassword' | 'number' | 'datetime' | 'boolean';
  title: string;
  subtitle?: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  booleanOptions?: boolean;
  section?: string;
  perChildLabel?: string;
}

interface QuestionRendererProps<T extends FieldValues> {
  question: QuestionConfig<FieldPath<T>>;
  control: Control<T>;
  error?: FieldError;
  shouldAutoFocus?: boolean;
}

// Prefix used to encode a free-text "Other" condition inside the string[] value,
// e.g. "other:Severe peanut allergy"
const OTHER_VALUE = 'other';
const OTHER_PREFIX = 'other:';

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

              // Find an "other" entry — either the bare flag or "other:<text>"
              const otherEntry = value.find(
                (v) => v === OTHER_VALUE || v.startsWith(OTHER_PREFIX)
              );
              const isOtherSelected = !!otherEntry;
              const otherText =
                otherEntry && otherEntry.startsWith(OTHER_PREFIX)
                  ? otherEntry.slice(OTHER_PREFIX.length)
                  : '';
              const hasOtherOption = question.options?.some((o) => o.value === OTHER_VALUE);

              const handleToggle = (optionValue: string) => {
                if (optionValue === OTHER_VALUE) {
                  if (isOtherSelected) {
                    // Unchecking "Other" clears both the flag and any typed text
                    field.onChange(
                      value.filter((v) => v !== OTHER_VALUE && !v.startsWith(OTHER_PREFIX))
                    );
                  } else {
                    field.onChange([
                      ...value.filter((v) => v !== OTHER_VALUE && !v.startsWith(OTHER_PREFIX)),
                      OTHER_VALUE,
                    ]);
                  }
                  return;
                }

                const newValue = value.includes(optionValue)
                  ? value.filter((v) => v !== optionValue)
                  : [...value, optionValue];
                field.onChange(newValue);
              };

              const handleOtherTextChange = (text: string) => {
                const withoutOther = value.filter(
                  (v) => v !== OTHER_VALUE && !v.startsWith(OTHER_PREFIX)
                );
                field.onChange([
                  ...withoutOther,
                  text.trim() ? `${OTHER_PREFIX}${text}` : OTHER_VALUE,
                ]);
              };

              return (
                <div className="space-y-3">
                  {question.options?.map((option) => {
                    const isChecked =
                      option.value === OTHER_VALUE ? isOtherSelected : value.includes(option.value);
                    return (
                      <motion.div
                        key={option.value}
                        whileTap={{ scale: 0.985 }}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                        onClick={() => handleToggle(option.value)}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(option.value)}
                          id={`${question.id}-${option.value}`}
                          aria-labelledby={`${question.id}-${option.value}-label`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label
                          id={`${question.id}-${option.value}-label`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option.label}
                        </Label>
                      </motion.div>
                    );
                  })}

                  <AnimatePresence initial={false}>
                    {hasOtherOption && isOtherSelected && (
                      <motion.div
                        key="other-text-field"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="pl-1 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Label
                          htmlFor={`${question.id}-other-text`}
                          className="text-sm text-gray-500 mb-1.5 block"
                        >
                          Tell us more
                        </Label>
                        <Input
                          id={`${question.id}-other-text`}
                          type="text"
                          value={otherText}
                          onChange={(e) => handleOtherTextChange(e.target.value)}
                          placeholder="Type the medical condition here"
                          autoFocus
                          className="w-full text-base px-4 py-3 border-2 border-emerald-200 bg-white rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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