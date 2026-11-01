import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type SupportingDocumentsProps = {
  existingFiles?: string[];
};

function basename(key: string) {
  return key.split("/").pop() ?? key;
}

/**
 * Uncontrolled file-upload section. Call `getFiles()` on the ref to retrieve
 * the selected File objects before submitting.
 */
export type SupportingDocumentsRef = {
  getFiles: () => File[];
};

export function useSupportingDocuments(existingFiles: string[] = []) {
  const [fileEntries, setFileEntries] = useState<Array<File | null>>([null]);
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const addFileEntry = () => setFileEntries((prev) => [...prev, null]);

  const removeFileEntry = (idx: number) => {
    setFileEntries((prev) => prev.filter((_, i) => i !== idx));
    fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== idx);
  };

  const handleFileChange = (idx: number, file: File | null) => {
    setFileEntries((prev) => prev.map((f, i) => (i === idx ? file : f)));
  };

  const getFiles = () => fileEntries.filter((f): f is File => f !== null);

  return {
    fileEntries,
    fileInputRefs,
    addFileEntry,
    removeFileEntry,
    handleFileChange,
    getFiles,
    existingFiles,
  };
}

type SupportingDocumentsSectionProps = ReturnType<
  typeof useSupportingDocuments
>;

export function SupportingDocumentsSection({
  existingFiles,
  fileEntries,
  fileInputRefs,
  addFileEntry,
  removeFileEntry,
  handleFileChange,
}: SupportingDocumentsSectionProps) {
  return (
    <section>
      <h2 className="text-xs font-normal text-gray-400 mb-4">
        Supporting Documents
      </h2>
      <div className="flex flex-col gap-3">
        {existingFiles.map((key) => (
          <div
            key={key}
            className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2"
          >
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm text-gray-700 truncate">
              {basename(key)}
            </span>
          </div>
        ))}
        {fileEntries.map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              ref={(el) => {
                fileInputRefs.current[idx] = el;
              }}
              type="file"
              className="flex-1 block w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer file:mr-3 file:py-0.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              onChange={(e) =>
                handleFileChange(idx, e.target.files?.[0] ?? null)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFileEntry(idx)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addFileEntry}
        className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add file
      </button>
    </section>
  );
}
