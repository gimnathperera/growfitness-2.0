import type {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Controller } from 'react-hook-form';
import type { QuestionConfig } from '@/types/question-config';

interface QuestionRendererProps<TFormValues extends FieldValues = FieldValues> {
  question: QuestionConfig<FieldPath<TFormValues>>;
  control: Control<TFormValues>;
  error?: FieldError;
  shouldAutoFocus?: boolean;
}

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
} as const;

const errorVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
} as const;

const QuestionRenderer = <TFormValues extends FieldValues = FieldValues>({
  question,
  control,
  error,
  shouldAutoFocus = true,
}: QuestionRendererProps<TFormValues>) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const val =
                (field.value as PathValue<TFormValues, Path<TFormValues>>) ??
                '';
              return (
                <motion.input
                  {...field}
                  value={val as string}
                  type="text"
                  placeholder={question.placeholder}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'email': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field: { value, onChange, ...field } }) => {
              const val =
                (value as PathValue<TFormValues, Path<TFormValues>>) ?? '';
              return (
                <motion.input
                  {...field}
                  value={val as string}
                  type="email"
                  onChange={e => onChange(e.target.value)}
                  placeholder={question.placeholder}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'password': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field: { value, onChange, ...field } }) => {
              const val =
                (value as PathValue<TFormValues, Path<TFormValues>>) ?? '';
              return (
                <motion.input
                  {...field}
                  value={val as string}
                  type="password"
                  onChange={e => onChange(e.target.value)}
                  placeholder={question.placeholder}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'phone': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const val =
                (field.value as PathValue<TFormValues, Path<TFormValues>>) ??
                '';
              return (
                <motion.input
                  {...field}
                  value={val as string}
                  type="tel"
                  placeholder={question.placeholder}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'number': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const raw = field.value as PathValue<
                TFormValues,
                Path<TFormValues>
              >;
              const val = raw === undefined ? '' : (raw as number);
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                field.onChange(v === '' ? undefined : Number(v));
              };
              return (
                <motion.input
                  {...field}
                  value={val as number | ''}
                  type="number"
                  onChange={handleChange}
                  placeholder={question.placeholder}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'date': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const val =
                (field.value as PathValue<TFormValues, Path<TFormValues>>) ??
                '';
              return (
                <motion.input
                  {...field}
                  value={val as string}
                  type="date"
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'textarea': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const val =
                (field.value as PathValue<TFormValues, Path<TFormValues>>) ??
                '';
              return (
                <motion.textarea
                  {...field}
                  value={val as string}
                  placeholder={question.placeholder}
                  rows={4}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-lg sm:text-xl bg-amber-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 resize-none text-gray-900 ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-amber-200 focus:border-emerald-400'
                  }`}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  autoFocus={shouldAutoFocus}
                />
              );
            }}
          />
        );
      }

      case 'select': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const current = field.value as string | number | undefined;
              return (
                <motion.div
                  className="grid gap-3 sm:gap-4 w-full"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {question.options?.map((option, index) => (
                    <motion.button
                      key={String(option.value)}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          option.value as PathValue<
                            TFormValues,
                            Path<TFormValues>
                          >,
                        )
                      }
                      style={{
                        backgroundColor:
                          current === option.value ? '#ecfdf5' : '#fffbeb',
                        borderColor:
                          current === option.value ? '#10b981' : '#f3e8d0',
                      }}
                      className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${
                        current === option.value
                          ? 'border-emerald-500 bg-emerald-50 shadow-md !bg-emerald-50 !border-emerald-500'
                          : 'border-amber-200 bg-amber-50 hover:border-amber-300 !bg-amber-50 !border-amber-200 hover:!bg-amber-100 hover:border-amber-300'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        {option.icon && (
                          <span className="text-2xl sm:text-3xl">
                            {option.icon}
                          </span>
                        )}
                        <div className="flex-1">
                          <span className="text-lg sm:text-xl font-medium text-gray-900">
                            {option.label}
                          </span>
                        </div>
                        {current === option.value && (
                          <motion.div
                            className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              );
            }}
          />
        );
      }

      case 'multiselect': {
        return (
          <Controller
            name={question.id as Path<TFormValues>}
            control={control}
            render={({ field }) => {
              const selectedValues: (string | boolean)[] = Array.isArray(field.value)
                ? (field.value as (string | boolean)[])
                : [];

              const toggleOption = (optionValue: string | boolean) => {
                const newValues = selectedValues.includes(optionValue)
                  ? selectedValues.filter(v => v !== optionValue)
                  : [...selectedValues, optionValue];
                field.onChange(
                  newValues as PathValue<TFormValues, Path<TFormValues>>,
                );
              };

              return (
                <motion.div
                  className="grid gap-3 sm:gap-4 w-full"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {question.options?.map((option, index) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <motion.button
                        key={String(option.value)}
                        type="button"
                        onClick={() => toggleOption(String(option.value))}
                        style={{
                          backgroundColor: isSelected ? '#ecfdf5' : '#fffbeb',
                          borderColor: isSelected ? '#10b981' : '#f3e8d0',
                        }}
                        className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md !bg-emerald-50 !border-emerald-500'
                            : 'border-amber-200 bg-amber-50 hover:border-amber-300 !bg-amber-50 !border-amber-200 hover:!bg-amber-100 hover:border-amber-300'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          {option.icon && (
                            <span className="text-2xl sm:text-3xl">
                              {option.icon}
                            </span>
                          )}
                          <div className="flex-1">
                            <span className="text-lg sm:text-xl font-medium text-gray-900">
                              {option.label}
                            </span>
                          </div>
                          <div
                            className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                className="w-2 h-2 bg-white rounded-sm"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}

                  {selectedValues.length > 0 && (
                    <motion.div
                      className="mt-2 p-3 bg-emerald-50 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-emerald-700">
                        Selected: {selectedValues.length} goal
                        {selectedValues.length !== 1 ? 's' : ''}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderInput()}

      <AnimatePresence>
        {error && (
          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="text-red-500 text-sm sm:text-base font-medium px-2"
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionRenderer;