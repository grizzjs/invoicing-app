import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useFieldContext } from "@/features/common/hooks/form-context";

interface TextInputProps {
  label: string;
  id: string;
  description?: string;
  type?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export default function TextArea({
  label,
  description,
  id,
  className = "",
  orientation = "vertical",
}: TextInputProps) {
  const field = useFieldContext<string>();
  // Errors stay hidden until the user touches the field (or submits).
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field
      orientation={orientation}
      className={className}
      data-invalid={isInvalid}
    >
      <FieldLabel
        htmlFor={id}
        className="text-base font-medium w-24 text-right shrink-0"
      >
        {label}
      </FieldLabel>
      <Textarea
        id={id}
        placeholder={label}
        className="resize-none"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && (
        <FieldError>
          {[
            ...new Set(field.state.meta.errors.map((error) => error?.message)),
          ].join(", ")}
        </FieldError>
      )}
    </Field>
  );
}
