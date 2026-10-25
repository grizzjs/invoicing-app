import {
  Document,
  Font,
  Page,
  Image as PDFImage,
  Text,
  View,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

import type { PurchaseOrderDto } from "@/api/models";
import logo from "@/assets/logo.png";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
Font.register({
  family: "NotoSans",
  fonts: [
    { src: "/fonts/NotoSans-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSans-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/NotoSans-Bold.ttf", fontWeight: 700 },
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

type PurchaseOrderPDF = {
  entity: PurchaseOrderDto;
};

// ── Component ───────────────────────────────────────────────────────────────
const PurchaseOrderPDF = ({ entity }: PurchaseOrderPDF) => (
  <Document>
    <Page
      size="A4"
      style={{
        ...tw("px-10 py-10 text-[9px] text-gray-800 bg-white"),
        fontFamily: "NotoSans",
      }}
    >
      {/* Header */}
      <View style={tw("flex flex-col")}>
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

      <View style={tw("border-t border-gray-300 mt-2 mb-6")} />

      {/* Bill To + General Info */}

      <View style={tw("flex-row mb-6")}>
        {/* Bill To — 2/3 width */}
        <View style={{ flex: 2 }}>
          <Text style={tw("font-bold")}>Bill to</Text>
          <Text style={tw("text-gray-700")}>{entity.customer.name}</Text>
          <Text style={tw("text-gray-700")}>{entity.customer.address}</Text>
          <Text style={tw("text-gray-700")}>{entity.customer.tin}</Text>
          <Text style={tw("text-gray-700")}>{entity.customer.phoneNumber}</Text>
        </View>

        {/* General Info — 1/3 width */}
        <View style={{ flex: 1 }}>
          <Text style={tw("font-bold")}>General Information</Text>
          <View style={tw("flex-row mb-1")}>
            <Text style={tw("flex-1")}>Date</Text>
            <Text style={tw("text-right")}>
              {formatDate(entity.createDate)}
            </Text>
          </View>
          <View style={tw("flex-row")}>
            <Text style={tw("flex-1")}>PO No.</Text>
            <Text style={tw("text-right")}>{entity.id}</Text>
          </View>
        </View>
      </View>
      {/* Table Header */}
      <View style={tw("flex-row border-b border-gray-200 pb-2 mb-1")}>
        <Text style={tw("flex-1 font-bold")}>Item Description</Text>
        <Text style={tw("w-[72px] font-bold text-center")}>Quantity</Text>
        <Text style={tw("w-[80px] font-bold text-right")}>Unit Price</Text>
        <Text style={tw("w-[88px] font-bold text-right")}>Amount</Text>
      </View>

      {/* Table Rows */}
      {entity.lineItems.map((item, i) => (
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
            {item.unitPrice}
          </Text>
          <Text
            style={{
              ...tw("w-[88px] text-right text-gray-700"),
              fontFamily: "NotoSansMono",
            }}
          >
            {format(item.quantity * item.unitPrice)}
          </Text>
        </View>
      ))}

      {/* Total */}
      <View style={tw("flex-row py-2")}>
        <Text
          style={{
            ...tw("flex-1 font-bold text-[10px]"),
            fontFamily: "NotoSansMono",
          }}
        >
          TOTAL
        </Text>
        <Text
          style={{
            ...tw("w-[88px] text-right font-bold text-[10px]"),
            fontFamily: "NotoSansMono",
          }}
        >
          {format(
            entity.lineItems.reduce(
              (result, current) =>
                result + current.unitPrice * current.quantity,
              0,
            ),
          )}
        </Text>
      </View>

      {/* Notes */}
      <View style={tw("mt-6")}>
        <Text style={tw("font-bold mb-1")}>Notes:</Text>
        <Text style={tw("text-[8px] text-gray-500 leading-relaxed")}>
          {invoiceData.notes}
        </Text>
      </View>
    </Page>
  </Document>
);

export default PurchaseOrderPDF;
