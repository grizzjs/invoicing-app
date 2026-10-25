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

  placeholder = placeholder ?? label;
  return (
    <Field
      orientation={orientation}
      className={className}
      data-invalid={!field.state.meta.isValid}
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
        value={format(field.state.value) ?? initialValue}
        onBlur={field.handleBlur}
        disabled={disabled}
        onChange={(e) => {
          field.handleChange(
            (type === "text" ? e.target.value : Number(e.target.value)) as T,
          );
          onChange(e.target.value);
        }}
        aria-invalid={!field.state.meta.isValid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!hideError && !field.state.meta.isValid && (
        <FieldError>
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </FieldError>
      )}
    </Field>
  );
}
