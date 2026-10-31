import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { useFieldContext } from "@/features/common/hooks/form-context";

interface CheckboxProps {
  label: string;
  id: number;
  description?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  getLabel: () => React.ReactNode;
}

export default function CheckBox({
  label,
  description,
  id,
  orientation = "horizontal",
  className = "",
  getLabel,
}: CheckboxProps) {
  const field = useFieldContext<number>();

  return (
    <Field
      orientation={orientation}
      className={`${className}`}
      data-invalid={!field.state.meta.isValid}
    >
      <Checkbox
        id={id.toString()}
        name={label}
        checked={!!field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked ? id : null)}
        onBlur={field.handleBlur}
      />

      <FieldContent>
        <FieldLabel htmlFor={label} className="text-base">
          {getLabel()}
        </FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  );
}
