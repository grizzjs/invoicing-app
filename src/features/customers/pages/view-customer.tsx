import { useGetCustomer } from "@/api/endpoints/customers/customers";
import { InvoiceDtoStatus } from "@/api/models/invoiceDtoStatus";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useParams } from "@tanstack/react-router";

import { formatDate } from "@/lib/format-date";
import { parseDateFromISO } from "@/lib/parse-date";
import { CustomerCard } from "../components/customer-card.component";
import { StatementOfAccountCard } from "../components/statement-of-account-card.component";
import { columns } from "../definition/invoice";
import { buildStatementOfAccount } from "../lib/statement-of-account";

export default function ViewCustomerPage() {
  const params = useParams({ from: "/customers/$customerId" });
  const {
    data: customer,
    isLoading,
    isError,
  } = useGetCustomer(params.customerId);
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const account = buildStatementOfAccount(customer.invoices);

  // Only unpaid invoices, newest first. Sort on the date value before it is
  // formatted for display.
  const invoices = customer.invoices
    .filter((invoice) => invoice.status === InvoiceDtoStatus.Unpaid)
    .sort(
      (a, b) =>
        parseDateFromISO(b.createDate).toMillis() -
        parseDateFromISO(a.createDate).toMillis(),
    )
    .map(({ amount, createDate, id }) => {
      return {
        createDate: formatDate(createDate),
        amount,
        id,
      };
    });

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Top bar */}
      <div className="border-b border-#989898 bg-white px-6 py-4 h-16">
        <div className="flex items-center gap-4 h-7">
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <div className="h-5 w-px bg-gray-300" />
          <span className="text-base font-normal">#{customer.id}</span>
        </div>
      </div>

      {/* Page Body */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Top Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Customer Details */}
          <CustomerCard customer={customer} className="col-span-2" />

          {/* Statement of Account */}
          <StatementOfAccountCard account={account} />
        </div>

        {/* Invoice Table */}

        <DataTable data={invoices} columns={columns} enablePagination={true} />
      </div>
    </main>
  );
}
