import type { CustomerDto } from "@/api/models";
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
import { getFieldError } from "@/features/common/lib/field-error";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../components/ui/field";

export default function CustomerSelect({
  label,
  id,
  description,
  customers,
  orientation = "vertical",
  className = "",
  onChange,
}: {
  label: string;
  id: string;
  description?: string;
  customers: CustomerDto[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  onChange?: (value) => void;
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
      <Combobox
        items={customers}
        itemToStringValue={(customer: (typeof customers)[number]) =>
          `${customer.id}`
        }
        itemToStringLabel={(customer) => customer.name}
        onValueChange={(value) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field.handleChange(value as any);

          onChange(value);
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
      {isInvalid && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}
