import {
  Combobox,
  ComboboxContent,
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

type LineItem = {
  id: number;
  name: string;
  orderedQuantity: number;
  remainingQuantity: number;
  deliveryQuantity: number;
};

export default function LineItemSelect({
  label,
  id,
  description,
  lineItems,
  orientation = "vertical",
  className = "",
  hideLabel = false,
  onChange = () => {},
}: {
  label: string;
  id: string;
  description?: string;
  lineItems: LineItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  hideLabel?: boolean;
  onChange?: (value) => void;
}) {
  const field = useFieldContext<number>();
  const { isInvalid, message: errorMessage } = getFieldError(field.state.meta);
  return (
    <Field orientation={orientation} className={className}>
      {!hideLabel && (
        <FieldLabel
          htmlFor={id}
          className="text-base font-medium w-24 text-right shrink-0"
        >
          {label}
        </FieldLabel>
      )}
      <Combobox
        items={lineItems}
        itemToStringLabel={(lineItem) => lineItem.name}
        onValueChange={(value) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field.handleChange(value.id);
          field.handleBlur();

          onChange(value);
        }}
        value={lineItems.find((li) => li.id === field.state.value) ?? null}
      >
        <ComboboxInput
          placeholder="Search item..."
          onBlur={field.handleBlur}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxList>
            {(lineItem) => (
              <ComboboxItem key={lineItem.id} value={lineItem}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {lineItem.name}
                    </ItemTitle>
                    <ItemDescription>{lineItem.description}</ItemDescription>
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
