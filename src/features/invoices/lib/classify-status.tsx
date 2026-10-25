import { today } from "@/lib/date-utils";
import { parseDateFromISO } from "@/lib/parse-date";
import Status from "../enum";

export const enrichStatus = (status, due, date) => {
  if (status == Status.Paid) return status;
  if (!date) return;
  const dueDate = parseDateFromISO(date).plus({ days: due });
  const dayToCheck = today();
  if (dueDate <= dayToCheck) return Status.Overdue;
  return status;
};

export const classifyStatus = (status, due, date) => {
  const enrichedStatus = enrichStatus(status, due, date);

  let variant: "info" | "error" | "warning" | "success" = "info";
  switch (enrichedStatus) {
    case "Overdue":
      variant = "error";
      break;
    case "Unpaid":
      variant = "info";
      break;
    case "Paid":
      variant = "success";
      break;
  }
  return variant;
};
