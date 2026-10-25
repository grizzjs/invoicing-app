import {
  Document,
  Font,
  Page,
  Image as PDFImage,
  Text,
  View,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

import type { InvoiceDto } from "@/api/models";
import logo from "@/assets/logo.png";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
import { parseDateFromISO } from "@/lib/parse-date";
import { uniq } from "ramda";

Font.register({
  family: "NotoSans",
  fonts: [
    { src: "/fonts/NotoSans-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSans-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/NotoSans-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/NotoSans-Italic.ttf", fontStyle: "italic" },
  ],
});

Font.register({
  family: "NotoSansMono",
  fonts: [
    { src: "/fonts/NotoSansMono-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansMono-Bold.ttf", fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["NotoSans"],
      mono: ["NotoSansMono"],
    },
  },
});

// ── Data ────────────────────────────────────────────────────────────────────
const invoiceData = {
  company: {
    name: "ENGINE✕LABS",
    tagline: "IT SOLUTIONS",
    address: "359 Mc Arthur Hi-Way, Brgy. Corazon, Calumpit, Bulacan",
    contact: "Phone No. (+63) 917-517-9241  •  TIN: 446-160-716-000",
  },
  notes:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eleifend lobortis varius. Praesent orci est, finibus varius imperdiet et, accumsan id elit. Etiam dolor sapien, elementum eu molestie ut, eleifend vel nisl.",
};

type InvoicePDF = {
  entity: InvoiceDto;
};

// ── Component ───────────────────────────────────────────────────────────────
const InvoicePDF = ({ entity }: InvoicePDF) => {
  const poNumbers = uniq(
    entity.deliveryReceipts.map((delivery) => delivery.purchaseOrder.id),
  );
  const deliveries = entity.deliveryReceipts.map((delivery) => delivery.id);
  const lineItems =
    entity.deliveryReceipts?.flatMap((delivery) => {
      return delivery.lineItems.map((lineItem) => {
        return {
          name: lineItem.purchaseOrderLineItem.name,
          description: lineItem.purchaseOrderLineItem.description,
          quantity: lineItem.quantity,
          unitPrice: lineItem.purchaseOrderLineItem.unitPrice,
          amount: lineItem.quantity * lineItem.purchaseOrderLineItem.unitPrice,
        };
      });
    }) || [];

  const totalAmount = lineItems.reduce(
    (result, current) => result + current.amount,
    0,
  );

  const subTotal = totalAmount / 1.12;
  const vatableSale = subTotal;
  const vat = subTotal * 0.12;
  const withholding = 0;

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...tw("px-10 py-10 text-[9px] text-gray-800 bg-white"),
          fontFamily: "NotoSans",
        }}
      >
        {/* Header */}
        <View style={tw("flex-row items-start mb-2")}>
          {/* Logo + Address */}
          <View style={{ flex: 1 }}>
            <PDFImage
              src={logo}
              style={{
                width: 160,
                height: 50,
                objectFit: "contain",
                objectPositionX: 0,
                objectPositionY: 0,
                alignSelf: "flex-start",
              }}
            />
            <Text style={tw("text-[10px] mt-1")}>
              {invoiceData.company.address}
            </Text>
            <Text style={tw("text-[10px]")}>{invoiceData.company.contact}</Text>
          </View>

          {/* Title */}
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Text style={tw("text-2xl font-bold")}>Sales Invoice</Text>
          </View>
        </View>

        <View style={tw("border-t border-gray-300 mt-2 mb-6")} />

        {/* Bill To + General Info */}

        <View style={tw("flex-row mb-6")}>
          {/* Bill To — 2/3 width */}
          <View style={{ flex: 2 }}>
            <Text style={tw("font-bold")}>Bill to</Text>
            <Text style={tw("text-gray-700")}>{entity.customer.name}</Text>
            <Text style={tw("text-gray-700")}>{entity.customer.address}</Text>
            <Text style={tw("text-gray-700")}>{entity.customer.tin}</Text>
            <Text style={tw("text-gray-700")}>
              {entity.customer.phoneNumber}
            </Text>
          </View>

          {/* General Info — 1/3 width */}
          <View style={{ flex: 1 }}>
            <Text style={tw("font-bold")}>General Information</Text>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Date</Text>
              <Text style={tw("text-right")}>
                {formatDate(entity.createDate)}
              </Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Invoice No.</Text>
              <Text style={tw("text-right")}>{entity.id}</Text>
            </View>
            {poNumbers.map((id, index) => (
              <View style={tw("flex-row")}>
                <Text style={tw("flex-1")}>
                  {index === 0 ? "Purchase Order No." : ""}
                </Text>
                <Text style={tw("text-right")}>{id}</Text>
              </View>
            ))}
            {deliveries.map((id, index) => (
              <View style={tw("flex-row")}>
                <Text style={tw("flex-1")}>
                  {index === 0 ? "Delivery No." : ""}
                </Text>
                <Text style={tw("text-right")}>{id}</Text>
              </View>
            ))}
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Terms</Text>
              <Text style={tw("text-right")}>{entity.term}</Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Due Date</Text>
              <Text style={tw("text-right")}>
                {formatDate(
                  parseDateFromISO(entity.createDate).plus({
                    days: entity.dueInDays,
                  }),
                )}
              </Text>
            </View>
          </View>
        </View>
        {/* Table Header */}
        <View style={tw("flex-row border-b border-gray-200 pb-2 mb-1")}>
          <Text style={tw("flex-1 font-bold")}>Item Description</Text>
          <Text style={tw("w-[72px] font-bold text-center")}>Quantity</Text>
          <Text style={tw("w-[80px] font-bold text-right")}>Unit Price</Text>
          <Text style={tw("w-[80px] font-bold text-right")}>Amount</Text>
        </View>

        {/* Table Rows */}
        {lineItems.map((item, i) => (
          <View key={i} style={tw("flex-row border-b border-gray-200 py-2")}>
            <View style={tw("flex-1")}>
              <Text
                style={{ ...tw("text-gray-800"), fontFamily: "NotoSansMono" }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  ...tw("text-gray-500 text-[8px]"),
                  fontFamily: "NotoSansMono",
                }}
              >
                {item.description}
              </Text>
            </View>
            <Text
              style={{
                ...tw("w-[72px] text-center text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {item.quantity}
            </Text>
            <Text
              style={{
                ...tw("w-[80px] text-right text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {format(item.unitPrice)}
            </Text>
            <Text
              style={{
                ...tw("w-[80px] text-right text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {format(item.amount)}
            </Text>
          </View>
        ))}

        <View
          style={{
            ...tw("mt-6 text-right text-gray-700 py-2 flex-column gap-2"),
            fontFamily: "NotoSansMono",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>Subtotal</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>
              {format(subTotal)}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>Vatable Sale</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>
              {format(vatableSale)}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>VAT-Except Sale</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>{format(0)}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>VAT zero-rated Salte</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>{format(0)}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>VAT (12%)</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>{format(vat)}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3") }}>Less: Withholding</Text>
            <Text style={{ ...tw("pl-3"), width: 120 }}>
              {format(withholding)}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}></View>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ ...tw("flex-1 pr-3 font-bold") }}>
              Total Amount Due
            </Text>
            <Text style={{ ...tw("pl-3 font-bold"), width: 120 }}>
              {format(totalAmount)}
            </Text>
          </View>
        </View>
        <View style={tw("mt-6")}>
          <Text style={tw("font-bold mb-1")}>Notes:</Text>
          <Text style={tw("text-[8px] text-gray-500 leading-relaxed")}>
            {invoiceData.notes}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
