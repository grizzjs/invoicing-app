import {
  Document,
  Font,
  Page,
  Image as PDFImage,
  Text,
  View,
} from "@react-pdf/renderer";
import { DateTime } from "luxon";
import { createTw } from "react-pdf-tailwind";

import type { CustomerDto } from "@/api/models";
import logo from "@/assets/logo.png";
import format from "@/lib/format-money";
import type { buildStatementOfAccount } from "../lib/statement-of-account";

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

type StatementPDF = {
  entity: CustomerDto;
  account: ReturnType<typeof buildStatementOfAccount>;
};

// ── Component ───────────────────────────────────────────────────────────────
const StatementPDF = ({ entity, account }: StatementPDF) => {
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
            <Text style={tw("text-2xl font-bold")}>Statement of Account</Text>
          </View>
        </View>

        <View style={tw("border-t border-gray-300 mt-2 mb-6")} />

        {/* Bill To + General Info */}

        <View style={tw("flex-row mb-6")}>
          {/* Bill To — 2/3 width */}
          <View style={{ flex: 2 }}>
            <Text style={tw("font-bold")}>Bill to</Text>
            <Text style={tw("text-gray-700")}>{entity.name}</Text>
            <Text style={tw("text-gray-700")}>{entity.address}</Text>
            <Text style={tw("text-gray-700")}>{entity.tin}</Text>
            <Text style={tw("text-gray-700")}>{entity.phoneNumber}</Text>
          </View>

          {/* General Info — 1/3 width */}
          <View style={{ flex: 1 }}>
            <Text style={tw("font-bold")}>General Information</Text>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Statement Date</Text>
              <Text style={tw("text-right")}>
                {DateTime.now().toFormat("LLL d, yyyy")}
              </Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Previous Balance</Text>
              <Text style={tw("text-right")}>
                {format(account.previousBalance)}
              </Text>
            </View>

            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Credits</Text>
              <Text style={tw("text-right")}>{format(account.credits)}</Text>
            </View>

            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>New Charges</Text>
              <Text style={tw("text-right")}>{format(account.newCharges)}</Text>
            </View>
            <View style={tw("flex-row")}>
              <Text style={tw("flex-1")}>Outstanding Balance</Text>
              <Text style={tw("text-right")}>
                {format(account.outstandingBalance)}
              </Text>
            </View>
          </View>
        </View>
        {/* Table Header */}
        <View style={tw("flex-row border-b border-gray-200 pb-2 mb-1")}>
          <Text style={tw("w-[72px] font-bold")}>Date</Text>
          <Text style={tw("w-[72px] flex-1  font-bold text-center")}>
            Description
          </Text>
          <Text style={tw("w-[80px] font-bold text-right")}>Charge</Text>
          <Text style={tw("w-[80px] font-bold text-right")}>Credit</Text>
        </View>

        {/* Table Rows */}
        {account.lineItems.map((item, i) => (
          <View key={i} style={tw("flex-row border-b border-gray-200 py-2")}>
            <View style={tw("w-[72px]")}>
              <Text
                style={{ ...tw("text-gray-800"), fontFamily: "NotoSansMono" }}
              >
                {item.date.toFormat("MM/dd/yyyy")}
              </Text>
            </View>
            <Text
              style={{
                ...tw("w-[72px] flex-1 text-center text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {item.description}
            </Text>
            <Text
              style={{
                ...tw("w-[80px] text-right text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {item.charge ? format(item.charge) : `-`}
            </Text>
            <Text
              style={{
                ...tw("w-[80px] text-right text-gray-700"),
                fontFamily: "NotoSansMono",
              }}
            >
              {item.credit ? format(item.credit) : `-`}
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
            <Text style={{ ...tw("flex-1 pr-3 font-bold") }}>
              Outstanding Balance
            </Text>
            <Text style={{ ...tw("pl-3 font-bold"), width: 120 }}>
              {format(account.outstandingBalance)}
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

export default StatementPDF;
