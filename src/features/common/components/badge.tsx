import { Status, StatusLabel } from "@/components/ui/status";

export function Badge({
  variant,
  text,
}: {
  variant: "default" | "success" | "error" | "warning" | "info";
  text: string;
}) {
  return (
    <Status variant={variant}>
      <StatusLabel>{text}</StatusLabel>
    </Status>
  );
}
