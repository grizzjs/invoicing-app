import { useGetInvoice } from "@/api/endpoints/invoices/invoices";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import InvoicePDF from "../components/invoice-pdf";

const ViewInvoicePDF = () => {
  const params = useParams({ from: "/invoices_/$invoiceId/pdf" });
  const { data: invoice, isLoading, isError } = useGetInvoice(params.invoiceId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <InvoicePDF entity={invoice} />
    </PDFViewer>
  );
};

export default ViewInvoicePDF;
