import type { InvoiceDto } from "@/api/models";
import { InvoiceDtoStatus } from "@/api/models/invoiceDtoStatus";
import { parseDateFromISO } from "@/lib/parse-date";
import { DateTime } from "luxon";

export type StatementLineItem = {
  date: DateTime;
  description: string;
  charge?: number;
  credit?: number;
};

const dueDateOf = ({ createDate, dueInDays }: InvoiceDto) =>
  parseDateFromISO(createDate).plus({ days: dueInDays });

// When the invoice was paid, taken from its collection. Undefined for unpaid
// invoices, and for paid ones with no collection on record.
const paidAtOf = ({ status, collection }: InvoiceDto) =>
  status === InvoiceDtoStatus.Paid && collection
    ? parseDateFromISO(collection.createDate)
    : undefined;

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

/**
 * Statement of account for the previous calendar month, built only from the
 * customer's own invoices.
 *
 * - Previous Balance: invoices due before last month that were still unpaid
 *   when last month began.
 * - Credits: invoices paid last month.
 * - New Charges: invoices that fell due last month, which the previous
 *   balance does not include.
 * - Outstanding Balance: Previous Balance - Credits + New Charges.
 *
 * `lineItems` lists the same figures row by row, so the table always adds up
 * to the totals.
 */
export function buildStatementOfAccount(
  invoices: InvoiceDto[],
  now: DateTime = DateTime.now(),
) {
  const periodEnd = now.startOf("month");
  const periodStart = periodEnd.minus({ months: 1 });

  const isInPeriod = (date: DateTime) =>
    date >= periodStart && date < periodEnd;

  const wasUnpaidAtStart = (invoice: InvoiceDto) => {
    if (invoice.status === InvoiceDtoStatus.Unpaid) return true;
    const paidAt = paidAtOf(invoice);
    return paidAt !== undefined && paidAt >= periodStart;
  };

  const previousBalance = sum(
    invoices
      .filter(
        (invoice) =>
          dueDateOf(invoice) < periodStart && wasUnpaidAtStart(invoice),
      )
      .map((invoice) => invoice.amount),
  );

  const paidInPeriod = invoices.filter((invoice) => {
    const paidAt = paidAtOf(invoice);
    return paidAt !== undefined && isInPeriod(paidAt);
  });
  const credits = sum(paidInPeriod.map((invoice) => invoice.amount));

  const dueInPeriod = invoices.filter((invoice) =>
    isInPeriod(dueDateOf(invoice)),
  );
  const newCharges = sum(dueInPeriod.map((invoice) => invoice.amount));

  const lineItems: StatementLineItem[] = [
    {
      date: periodStart,
      description: "Previous Balance (forwarded)",
      charge: previousBalance,
    },
    ...[
      ...dueInPeriod.map((invoice) => ({
        date: dueDateOf(invoice),
        description: `Invoice #${invoice.id}`,
        charge: invoice.amount,
      })),
      ...paidInPeriod.map((invoice) => ({
        date: paidAtOf(invoice),
        description: `Payment for Invoice #${invoice.id}`,
        credit: invoice.amount,
      })),
    ].sort((a, b) => a.date.toMillis() - b.date.toMillis()),
  ];

  return {
    previousBalance,
    credits,
    newCharges,
    outstandingBalance: previousBalance - credits + newCharges,
    lineItems,
  };
}
