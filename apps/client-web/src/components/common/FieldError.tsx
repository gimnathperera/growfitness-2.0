type FieldErrorProps = {
  id: string;
  message?: string;
};

/** Inline validation error with assertive semantics for assistive tech. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
