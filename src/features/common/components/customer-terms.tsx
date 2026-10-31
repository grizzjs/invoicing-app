import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useFieldContext } from "@/features/common/hooks/form-context";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../components/ui/field";

export default function Select<
  T extends { id: number; name: string; email?: string },
>({
  label,
  id,
  description,
  entity,
  orientation = "vertical",
  className = "",
  onChange,
}: {
  label: string;
  id: string;
  description?: string;
  entity: T[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  onChange?: (value) => void;
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
      <Combobox
        items={entity}
        itemToStringValue={(customer: T) => `${customer.id}`}
        itemToStringLabel={(customer) => customer.name}
        onValueChange={(value) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field.handleChange(value as any);

          onChange?.(value);
        }}
      >
        <ComboboxInput
          placeholder="Search customer..."
          onBlur={field.handleBlur}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No customers found.</ComboboxEmpty>
          <ComboboxList>
            {(customer) => (
              <ComboboxItem key={customer.id} value={customer}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {customer.name}
                    </ItemTitle>
                    <ItemDescription>{customer.email}</ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {description && <FieldDescription>{description}</FieldDescription>}
      {!field.state.meta.isValid && (
        <FieldError>
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </FieldError>
      )}
    </Field>
  );
}
