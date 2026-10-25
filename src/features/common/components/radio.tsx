import { Field, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/features/common/hooks/form-context";
import { cn } from "@/lib/utils";

interface CheckboxProps<T> {
  label: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  entities: T[];
  getLabel: (entity: T) => React.ReactNode;
}

export default function Radio<T extends { id: string | number }>({
  entities,
  orientation = "horizontal",
  className = "",
  getLabel,
}: CheckboxProps<T>) {
  const field = useFieldContext<string>();

  return (
    <FieldSet>
      <Field
        orientation={orientation}
        className={`${className}`}
        data-invalid={!field.state.meta.isValid}
      >
        <RadioGroup
          value={field.state.value}
          onValueChange={(value) => {
            field.handleChange(value);
            field.handleBlur();
          }}
        >
          {entities.map((e) => (
            <div className="flex items-center gap-3 border-b">
              <RadioGroupItem
                value={String(e.id)}
                id={String(e.id)}
                className="flex flex-col gap-0"
              />
              <Label
                htmlFor={String(e.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-1 py-3 cursor-pointer",
                  "hover:bg-muted/40 transition-colors",
                )}
              >
                {getLabel(e)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Field>
    </FieldSet>
  );
}
