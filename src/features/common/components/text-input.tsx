import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/features/common/hooks/form-context";

interface TextInputProps<T> {
  label: string;
  id: string;
  description?: string;
  type?: "text" | "number";
  placeholder?: string;
  maxLength?: number;
  format?: (value: T) => string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  hideError?: boolean;
  initialValue?: string;
  onChange?: (value) => void;
}

export default function TextInput<T>({
  label,
  description,
  id,
  placeholder,
  maxLength,
  type = "text",
  format = (value) => (value ? value.toString() : ""),
  orientation = "vertical",
  className = "",
  hideLabel = false,
  disabled = false,
  hideError = false,
  initialValue = "",
  onChange = () => {},
}: TextInputProps<T>) {
  const field = useFieldContext<T>();
  // Errors stay hidden until the user touches the field (or submits).
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  placeholder = placeholder ?? label;
  return (
    <Field
      orientation={orientation}
      className={className}
      data-invalid={isInvalid}
    >
      {!hideLabel && (
        <FieldLabel
          htmlFor={id}
          className="text-base font-medium w-24 text-right shrink-0"
        >
          {label}
        </FieldLabel>
      )}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        value={format(field.state.value) ?? initialValue}
        onBlur={field.handleBlur}
        disabled={disabled}
        onChange={(e) => {
          // Store the formatted value so the field never holds characters
          // the formatter hides from the user (e.g. pasted extra digits).
          field.handleChange(
            (type === "text"
              ? format(e.target.value as T)
              : Number(e.target.value)) as T,
          );
          onChange(e.target.value);
        }}
        aria-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!hideError && isInvalid && (
        <FieldError>
          {[
            ...new Set(field.state.meta.errors.map((error) => error?.message)),
          ].join(", ")}
        </FieldError>
      )}
    </Field>
  );
}
