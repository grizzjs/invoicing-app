import { useGetCustomer } from "@/api/endpoints/customers/customers";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import StatementPDF from "../components/statement-pdf";

const ViewStatementPDF = () => {
  const params = useParams({
    from: "/customers_/$customerId/statements/$period",
  });

  const {
    data: customer,
    isLoading,
    isError,
  } = useGetCustomer(params.customerId);

  //const period = params.period;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <StatementPDF entity={customer} />
    </PDFViewer>
  );
};

export default ViewStatementPDF;
