import { useGetJobOrder } from "@/api/endpoints/job-orders/job-orders";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import JobOrderPDF from "../components/job-order-pdf";

const ViewJobOrderPDF = () => {
  const params = useParams({ from: "/job-orders_/$jobOrderId/pdf" });
  const {
    data: jobOrder,
    isLoading,
    isError,
  } = useGetJobOrder(Number(params.jobOrderId));

  if (isLoading) return <p>Loading...</p>;
  if (isError || !jobOrder) return <p>Error loading job order...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <JobOrderPDF entity={jobOrder} />
    </PDFViewer>
  );
};

export default ViewJobOrderPDF;
