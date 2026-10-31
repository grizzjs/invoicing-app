import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { useFieldContext } from "@/features/common/hooks/form-context";
import { getFieldError } from "@/features/common/lib/field-error";

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
  const { isInvalid, message: errorMessage } = getFieldError(field.state.meta);
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
      {isInvalid && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}
