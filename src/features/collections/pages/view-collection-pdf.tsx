import { useGetCollection } from "@/api/endpoints/collections/collections";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "@tanstack/react-router";
import CollectionPDF from "../components/collection-pdf";

const ViewCollectionPDF = () => {
  const params = useParams({ from: "/collections_/$collectionId/pdf" });
  const {
    data: collection,
    isLoading,
    isError,
  } = useGetCollection(params.collectionId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  return (
    <PDFViewer className="w-full h-screen">
      <CollectionPDF entity={collection} />
    </PDFViewer>
  );
};

export default ViewCollectionPDF;
