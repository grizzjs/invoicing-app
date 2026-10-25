import { useGetInvoice } from "@/api/endpoints/invoices/invoices";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import OfficialReceiptPDF from "../components/official-receipt-pdf";

const ViewOfficialReceiptPDF = () => {
  const params = useParams({ from: "/invoices_/$invoiceId/official-receipt" });
  const { data: invoice, isLoading, isError } = useGetInvoice(params.invoiceId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <OfficialReceiptPDF entity={invoice} />
    </PDFViewer>
  );
};

export default ViewOfficialReceiptPDF;
