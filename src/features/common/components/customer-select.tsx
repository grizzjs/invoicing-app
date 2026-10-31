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
  disabled = false,
  onChange,
}: {
  label: string;
  id: string;
  description?: string;
  customers: CustomerDto[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  disabled?: boolean;
  onChange?: (value) => void;
}) {
  const field = useFieldContext<{ id: number }>();
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
        disabled={disabled}
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
        value={
          customers.find((customer) => customer.id === field.state.value?.id) ??
          null
        }
      >
        <ComboboxInput
          placeholder="Search customer..."
          onBlur={field.handleBlur}
          disabled={disabled}
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
