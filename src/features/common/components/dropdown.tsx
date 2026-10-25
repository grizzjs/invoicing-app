import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/features/common/hooks/form-context";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../components/ui/field";

export default function Dropdown({
  label,
  id,
  description,
  entities,
  orientation = "vertical",
  className = "",
}: {
  label: string;
  id: string;
  description?: string;
  entities: { key: string; value: string }[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const field = useFieldContext<string>();
  return (
    <Field orientation={orientation} className={className}>
      <FieldLabel
        htmlFor={id}
        className="text-base font-medium w-24 text-right shrink-0"
      >
        {label}
      </FieldLabel>

      <Select
        value={field.state.value}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValueChange={(value) => field.handleChange(value as any)}
      >
        <SelectTrigger id={id} onBlur={field.handleBlur} className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {entities.map((e) => (
            <SelectItem value={e.key}>{e.value}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && <FieldDescription>{description}</FieldDescription>}
      {!field.state.meta.isValid && (
        <FieldError>
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </FieldError>
      )}
    </Field>
  );
}
