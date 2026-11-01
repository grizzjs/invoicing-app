import {
  Document,
  Font,
  Page,
  Image as PDFImage,
  Text,
  View,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

import type { CollectionDto } from "@/api/models";
import logo from "@/assets/logo.png";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";

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
const companyData = {
  address: "359 Mc Arthur Hi-Way, Brgy. Corazon, Calumpit, Bulacan",
  contact: "Phone No. (+63) 917-517-9241  •  TIN: 446-160-716-000",
};

type CollectionPDFProps = {
  entity: CollectionDto;
};

// ── Component ───────────────────────────────────────────────────────────────
const CollectionPDF = ({ entity }: CollectionPDFProps) => {
  const subtotal = entity.amount / (1 - entity.vat / 100);

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
            <Text style={tw("text-[10px] mt-1")}>{companyData.address}</Text>
            <Text style={tw("text-[10px]")}>{companyData.contact}</Text>
          </View>

          {/* Title */}
          <View
            style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}
          >
            <Text style={tw("text-2xl font-bold")}>Collection Receipt</Text>
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
            <Text style={tw("text-gray-700")}>{entity.customer.phoneNumber}</Text>
          </View>

          {/* General Info — 1/3 width */}
          <View style={{ flex: 1 }}>
            <Text style={tw("font-bold")}>General Information</Text>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Date</Text>
              <Text style={tw("text-right")}>{formatDate(entity.createDate)}</Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Collection No.</Text>
              <Text style={tw("text-right")}>{entity.id}</Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Subtotal</Text>
              <Text style={tw("text-right")}>{format(subtotal)}</Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>VAT Withheld</Text>
              <Text style={tw("text-right")}>
                {format(subtotal * (entity.vat / 100))}
              </Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1 font-bold")}>Amount Collected</Text>
              <Text style={tw("text-right font-bold")}>{format(entity.amount)}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={tw("flex-row border-b border-gray-200 pb-2 mb-1")}>
          <Text style={tw("w-[48px] font-bold")}>Invoice</Text>
          <Text style={tw("flex-1 font-bold text-center")}>Description</Text>
          <Text style={tw("w-[80px] font-bold text-right")}>Amount</Text>
        </View>

        {/* Table Rows */}
        {entity.invoices.map((invoice, i) => (
          <View key={i} style={tw("flex-row border-b border-gray-200 py-2")}>
            <Text
              style={{
                ...tw("w-[48px] text-gray-800"),
                fontFamily: "NotoSansMono",
              }}
            >
              {invoice.id}
            </Text>
            <Text
              style={{
                ...tw("flex-1 text-center text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {formatDate(invoice.createDate)}
            </Text>
            <Text
              style={{
                ...tw("w-[80px] text-right text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {format(invoice.amount)}
            </Text>
          </View>
        ))}

        {/* Notes */}
        {entity.notes ? (
          <View style={tw("mt-6")}>
            <Text style={tw("font-bold mb-1")}>Notes:</Text>
            <Text style={tw("text-[8px] text-gray-500 leading-relaxed")}>
              {entity.notes}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default CollectionPDF;
