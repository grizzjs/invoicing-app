import { useGetDeliveryReceipt } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import DeliveryPDF from "../components/delivery-pdf";

const ViewDeliveryPDF = () => {
  const params = useParams({ from: "/deliveries_/$deliveryId/pdf" });
  const {
    data: delivery,
    isLoading,
    isError,
  } = useGetDeliveryReceipt(params.deliveryId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <DeliveryPDF entity={delivery} />
    </PDFViewer>
  );
};

export default ViewDeliveryPDF;
