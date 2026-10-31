import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/features/common/hooks/form-context";
import { getFieldError } from "@/features/common/lib/field-error";
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
  const { isInvalid, message: errorMessage } = getFieldError(field.state.meta);
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
      {isInvalid && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}
