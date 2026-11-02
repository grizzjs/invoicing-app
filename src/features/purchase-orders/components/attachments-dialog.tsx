import {
  getGetFilesQueryKey,
  useUploadFile,
} from "@/api/endpoints/s3/s3";
import { downloadFile } from "@/api/endpoints/s3/s3";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileVideo,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

type AttachmentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId: number;
  files: string[];
};

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["pdf"].includes(ext))
    return <FileType2 className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["doc", "docx"].includes(ext))
    return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["mp4", "mov", "avi", "mkv"].includes(ext))
    return <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function basename(key: string) {
  return key.split("/").pop() ?? key;
}

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  mp4: "video/mp4", mov: "video/quicktime", avi: "video/x-msvideo",
};

async function handleDownload(purchaseOrderId: number, key: string) {
  const arrayBuffer = await downloadFile(
    "purchase-orders",
    String(purchaseOrderId),
    key,
  );
  const name = basename(key);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext] ?? "application/octet-stream";
  const blob = new Blob([arrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttachmentsDialog({
  open,
  onOpenChange,
  purchaseOrderId,
  files,
}: AttachmentsDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: upload, isPending: isUploading } = useUploadFile();

  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) setStagedFiles((prev) => [...prev, ...picked]);
    // reset input so the same file can be re-selected if removed
    e.target.value = "";
  };

  const removeStagedFile = (idx: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    await Promise.all(
      stagedFiles.map((file) =>
        upload({
          resource: "purchase-orders",
          id: String(purchaseOrderId),
          data: { file },
        }),
      ),
    );
    setStagedFiles([]);
    queryClient.invalidateQueries({
      queryKey: getGetFilesQueryKey("purchase-orders", String(purchaseOrderId)),
    });
  };

  const handleClose = () => {
    setStagedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Attachments</DialogTitle>
        </DialogHeader>

        {/* Existing files */}
        <div className="flex flex-col">
          {files.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                {fileIcon(basename(key))}
                <span className="text-sm text-gray-800">{basename(key)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-gray-900"
                onClick={() => handleDownload(purchaseOrderId, key)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {files.length === 0 && stagedFiles.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No attachments found.
            </p>
          )}
        </div>

        {/* Staged (pending upload) files */}
        {stagedFiles.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Ready to upload
            </p>
            {stagedFiles.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {fileIcon(f.name)}
                  <span className="text-sm text-gray-700 truncate">
                    {f.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeStagedFile(idx)}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Attach button */}
        <button
          type="button"
          className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4" />
          Attach files
        </button>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Close
          </Button>
          {stagedFiles.length > 0 && (
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                `Upload ${stagedFiles.length} ${stagedFiles.length === 1 ? "file" : "files"}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
