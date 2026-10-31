import { useGetCollections } from "@/api/endpoints/collections/collections";
import { useGetDeliveryReceipts } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { useGetInvoices } from "@/api/endpoints/invoices/invoices";
import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import { DeliveryReceiptDtoStatus } from "@/api/models/deliveryReceiptDtoStatus";
import { PurchaseOrderDtoStatus } from "@/api/models/purchaseOrderDtoStatus";
import { Header } from "@/components/ui/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard, type TrendProp } from "@/components/ui/stat-card";
import { DeliveryStatusChart } from "@/features/dashboard/components/delivery-status-chart";
import { DeliveryTimeChart } from "@/features/dashboard/components/delivery-time-chart";
import { OverdueTrendChart } from "@/features/dashboard/components/overdue-trend-chart";
import { PurchaseOrderStatusChart } from "@/features/dashboard/components/purchase-order-status-chart";
import { PurchaseOrdersOverviewChart } from "@/features/dashboard/components/purchase-orders-overview-chart";
import { RevenueCollectionsChart } from "@/features/dashboard/components/revenue-collections-chart";
import { enrichStatus } from "@/features/invoices/lib/classify-status";
import { today } from "@/lib/date-utils";
import { parseDateFromISO } from "@/lib/parse-date";
import { useState } from "react";

type Period = "1" | "3" | "6" | "12";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "1", label: "Last 1 month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

function formatShort(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(0)}K`;
  return `₱${amount}`;
}

function isInRange(dateISO: string, start: number, end: number): boolean {
  const date = parseDateFromISO(dateISO);
  if (!date.isValid) return false;
  const now = today();
  return date >= now.minus({ months: start }) && date < now.minus({ months: end });
}

function calcTrend(current: number, previous: number): TrendProp {
  if (previous === 0) {
    return current > 0
      ? { label: "100%", direction: "up" }
      : { label: "0%", direction: "neutral" };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    label: `${Math.abs(pct).toFixed(0)}%`,
    direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
  };
}

/** Returns the last N months as short month labels (e.g. ["Jan","Feb",...]) */
function lastNMonths(n: number): string[] {
  const now = today();
  return Array.from({ length: n }, (_, i) =>
    now.minus({ months: n - 1 - i }).toFormat("MMM"),
  );
}

/** Buckets items by month label (short) within a date range */
function bucketByMonth<T>(
  items: T[],
  getDate: (item: T) => string,
  months: number,
): Map<string, T[]> {
  const now = today();
  const map = new Map<string, T[]>();
  const labels = lastNMonths(months);
  labels.forEach((l) => map.set(l, []));

  items.forEach((item) => {
    const date = parseDateFromISO(getDate(item));
    if (!date.isValid) return;
    if (date < now.minus({ months })) return;
    const label = date.toFormat("MMM");
    if (map.has(label)) map.get(label)!.push(item);
  });
  return map;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("6");

  const { data: invoices, isLoading: invoicesLoading } = useGetInvoices(
    {},
    { query: { staleTime: 10000 } },
  );
  const { data: collections, isLoading: collectionsLoading } = useGetCollections(
    {},
    { query: { staleTime: 10000 } },
  );
  const { data: purchaseOrders, isLoading: poLoading } = useGetPurchaseOrders(
    {},
    { query: { staleTime: 10000 } },
  );
  const { data: deliveries, isLoading: deliveriesLoading } = useGetDeliveryReceipts(
    {},
    { query: { staleTime: 10000 } },
  );

  if (invoicesLoading || collectionsLoading || poLoading || deliveriesLoading) return null;

  const months = parseInt(period);

  // ── Stat card amounts ────────────────────────────────────────────────────────
  const filteredInvoices = (invoices ?? []).filter((inv) =>
    isInRange(inv.createDate, months, 0),
  );
  const prevInvoices = (invoices ?? []).filter((inv) =>
    isInRange(inv.createDate, months * 2, months),
  );
  const filteredCollections = (collections ?? []).filter((col) =>
    isInRange(col.createDate, months, 0),
  );
  const prevCollections = (collections ?? []).filter((col) =>
    isInRange(col.createDate, months * 2, months),
  );

  const invoicedAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const prevInvoicedAmount = prevInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collectedAmount = filteredCollections.reduce((sum, col) => sum + col.amount, 0);
  const prevCollectedAmount = prevCollections.reduce((sum, col) => sum + col.amount, 0);

  const outstandingAmount = filteredInvoices
    .filter((inv) => enrichStatus(inv.status, inv.dueInDays, inv.createDate) === "Unpaid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const prevOutstandingAmount = prevInvoices
    .filter((inv) => enrichStatus(inv.status, inv.dueInDays, inv.createDate) === "Unpaid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices
    .filter((inv) => enrichStatus(inv.status, inv.dueInDays, inv.createDate) === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const prevOverdueAmount = prevInvoices
    .filter((inv) => enrichStatus(inv.status, inv.dueInDays, inv.createDate) === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // ── Revenue vs Collections line chart ────────────────────────────────────────
  const invoiceBuckets = bucketByMonth(invoices ?? [], (i) => i.createDate, months);
  const collectionBuckets = bucketByMonth(collections ?? [], (c) => c.createDate, months);
  const revenueCollectionsData = lastNMonths(months).map((month) => ({
    month,
    invoiced: (invoiceBuckets.get(month) ?? []).reduce((s, i) => s + i.amount, 0),
    collected: (collectionBuckets.get(month) ?? []).reduce((s, c) => s + c.amount, 0),
  }));

  // ── Overdue trend line chart ──────────────────────────────────────────────────
  const overdueTrendData = lastNMonths(months).map((month) => ({
    month,
    amount: (invoiceBuckets.get(month) ?? [])
      .filter((inv) => enrichStatus(inv.status, inv.dueInDays, inv.createDate) === "Overdue")
      .reduce((s, i) => s + i.amount, 0),
  }));

  // ── PO Status donut ───────────────────────────────────────────────────────────
  const allPOs = purchaseOrders ?? [];
  const filteredPOs = allPOs.filter((po) => isInRange(po.createDate, months, 0));
  const poTotal = filteredPOs.length;
  const poStatusOrder = [
    PurchaseOrderDtoStatus.Draft,
    PurchaseOrderDtoStatus.Finalized,
    PurchaseOrderDtoStatus.Approved,
    PurchaseOrderDtoStatus.Pending,
    PurchaseOrderDtoStatus.Completed,
    PurchaseOrderDtoStatus.Cancelled,
  ];
  const poStatusData = poStatusOrder.map((status) => {
    const count = filteredPOs.filter((po) => po.status === status).length;
    return {
      name: status,
      value: count,
      pct: poTotal > 0 ? Math.round((count / poTotal) * 100) : 0,
    };
  });

  // ── PO Overview bar chart ─────────────────────────────────────────────────────
  const poBuckets = bucketByMonth(allPOs, (po) => po.createDate, months);
  const poOverviewData = lastNMonths(months).map((month) => ({
    month,
    count: (poBuckets.get(month) ?? []).length,
  }));

  // ── Delivery Time line chart (count per status per month) ─────────────────────
  const allDeliveries = deliveries ?? [];
  const filteredDeliveries = allDeliveries.filter((d) => isInRange(d.createDate, months, 0));
  const deliveryBuckets = bucketByMonth(allDeliveries, (d) => d.createDate, months);
  const deliveryTimeData = lastNMonths(months).map((month) => {
    const bucket = deliveryBuckets.get(month) ?? [];
    return {
      month,
      new: bucket.filter((d) => d.status === DeliveryReceiptDtoStatus.New).length,
      shipped: bucket.filter((d) => d.status === DeliveryReceiptDtoStatus.Shipped).length,
      delivered: bucket.filter((d) => d.status === DeliveryReceiptDtoStatus.Delivered).length,
    };
  });

  // ── Delivery Status donut ─────────────────────────────────────────────────────
  const deliveryTotal = filteredDeliveries.length;
  const deliveryStatusOrder = [
    DeliveryReceiptDtoStatus.New,
    DeliveryReceiptDtoStatus.Shipped,
    DeliveryReceiptDtoStatus.Delivered,
    DeliveryReceiptDtoStatus.Paid,
  ];
  const deliveryStatusData = deliveryStatusOrder.map((status) => {
    const count = filteredDeliveries.filter((d) => d.status === status).length;
    return {
      name: status,
      value: count,
      pct: deliveryTotal > 0 ? Math.round((count / deliveryTotal) * 100) : 0,
    };
  });

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      <Header title="Dashboard">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Header>

      <div className="flex flex-col pt-6 pr-6 pb-10 pl-6 gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            label="Invoiced Amount"
            value={formatShort(invoicedAmount)}
            trend={calcTrend(invoicedAmount, prevInvoicedAmount)}
            positiveDirection={true}
          />
          <StatCard
            label="Collected Amount"
            value={formatShort(collectedAmount)}
            trend={calcTrend(collectedAmount, prevCollectedAmount)}
            positiveDirection={true}
          />
          <StatCard
            label="Outstanding Amount"
            value={formatShort(outstandingAmount)}
            trend={calcTrend(outstandingAmount, prevOutstandingAmount)}
            positiveDirection={false}
          />
          <StatCard
            label="Overdue Amount"
            value={formatShort(overdueAmount)}
            trend={calcTrend(overdueAmount, prevOverdueAmount)}
            positiveDirection={false}
          />
        </div>

        {/* Row 1: Revenue vs Collections + Overdue Trend */}
        <div className="grid grid-cols-2 gap-6">
          <RevenueCollectionsChart data={revenueCollectionsData} />
          <OverdueTrendChart data={overdueTrendData} />
        </div>

        {/* Row 2: PO Status + PO Overview */}
        <div className="grid grid-cols-2 gap-6">
          <PurchaseOrderStatusChart data={poStatusData} total={poTotal} />
          <PurchaseOrdersOverviewChart data={poOverviewData} />
        </div>

        {/* Row 3: Delivery Time + Delivery Status */}
        <div className="grid grid-cols-2 gap-6">
          <DeliveryTimeChart data={deliveryTimeData} />
          <DeliveryStatusChart data={deliveryStatusData} total={deliveryTotal} />
        </div>
      </div>
    </main>
  );
}
