import { useGetPurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import PurchaseOrderPDF from "../components/purchase-order-pdf";

const ViewPurchaseOrderPDF = () => {
  const params = useParams({ from: "/purchase-orders_/$purchaseOrderId/pdf" });
  const {
    data: purchaseOrder,
    isLoading,
    isError,
  } = useGetPurchaseOrder(params.purchaseOrderId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <PurchaseOrderPDF entity={purchaseOrder} />
    </PDFViewer>
  );
};

export default ViewPurchaseOrderPDF;
