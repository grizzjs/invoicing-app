import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";

import TextInput from "@/features/common/components/text-input";
import CheckBox from "../components/checkbox";
import CustomerSelect from "../components/customer-select";
import Dropdown from "../components/dropdown";
import LineItemSelect from "../components/lineitem-select";
import PurchaseOrderSelect from "../components/purchase-order-select";
import Radio from "../components/radio";
import SubmitButton from "../components/submit-button";
import TextArea from "../components/text-area";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext: fieldContext,
  formContext: formContext,
  fieldComponents: {
    TextInput: TextInput,
    Select: Dropdown,
    SelectCustomer: CustomerSelect,
    SelectLineItem: LineItemSelect,
    SelectPurchaseOrder: PurchaseOrderSelect,
    TextArea: TextArea,
    CheckBox: CheckBox,
    Radio: Radio,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
});
