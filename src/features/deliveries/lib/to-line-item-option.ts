import type { PurchaseOrderLineItemDto } from "@/api/models";
import type { LineItemOption } from "../components/delivery-form";

// Remaining quantity counts deliveries from every receipt except the one
// being edited, so its own quantities stay available to it.
const toLineItemOption = (
  lineItem: PurchaseOrderLineItemDto,
  deliveryReceiptId?: number,
): LineItemOption => ({
  id: lineItem.id,
  name: lineItem.name,
  orderedQuantity: lineItem.quantity,
  remainingQuantity:
    lineItem.quantity -
    lineItem.deliveries
      .filter((delivery) => delivery.deliveryReceipt?.id !== deliveryReceiptId)
      .reduce((result, current) => result + current.quantity, 0),
  deliveryQuantity: 0,
});

export default toLineItemOption;
