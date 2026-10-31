import type { PurchaseOrderDto } from "@/api/models";
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
import { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../components/ui/field";

export default function PurchaseOrderSelect({
  label,
  id,
  description,
  purchaseOrders,
  orientation = "vertical",
  className = "",
  hideLabel = false,
  disabled = false,
  onChange = () => {},
}: {
  label: string;
  id: string;
  description?: string;
  purchaseOrders: PurchaseOrderDto[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  onChange?: (value) => void;
}) {
  const field = useFieldContext<number>();
  const { isInvalid, message: errorMessage } = getFieldError(field.state.meta);

  const [search, setSearch] = useState("");

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
        disabled={disabled}
        items={purchaseOrders
          .filter((purchaseOrder) =>
            purchaseOrder.id.toString().includes(search),
          )
          .slice(0, 5)}
        itemToStringLabel={(purchaseOrder) => String(purchaseOrder.id)}
        itemToStringValue={(purchaseOrder) => String(purchaseOrder.id)}
        onValueChange={(value) => {
          if (!value) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field.handleChange(value.id);
          field.handleBlur();

          onChange(value);
        }}
        value={purchaseOrders.find((po) => po.id === field.state.value) ?? null}
      >
        <ComboboxInput
          placeholder="Search purchase order..."
          onBlur={field.handleBlur}
          // value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxList>
            {(po: PurchaseOrderDto) => (
              <ComboboxItem key={po.id} value={po}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">{po.id}</ItemTitle>
                    <ItemDescription>{po.customer.name}</ItemDescription>
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
