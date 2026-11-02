import { downloadFile } from "@/api/endpoints/s3/s3";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileVideo,
} from "lucide-react";

type AttachmentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: string;
  resourceId: number;
  files: string[];
};

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
};

export function basename(key: string) {
  return key.split("/").pop() ?? key;
}

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (ext === "pdf")
    return <FileType2 className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["doc", "docx"].includes(ext))
    return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return (
      <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
    );
  if (["mp4", "mov", "avi", "mkv"].includes(ext))
    return <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

async function handleDownload(
  resource: string,
  resourceId: number,
  key: string,
) {
  const data = await downloadFile(resource, String(resourceId), key);
  const name = basename(key);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext] ?? "application/octet-stream";
  const blob = new Blob([data as unknown as ArrayBuffer], { type: mime });
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
  resource,
  resourceId,
  files,
}: AttachmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Attachments</DialogTitle>
        </DialogHeader>

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
                onClick={() => handleDownload(resource, resourceId, key)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {files.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No attachments found.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
