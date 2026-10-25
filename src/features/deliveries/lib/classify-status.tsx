export function classifyStatus(status) {
  let variant: "info" | "error" | "warning" | "success" = "info";
  switch (status) {
    case "New":
      variant = "info";
      break;
    case "Shipped":
      variant = "warning";
      break;
    case "Paid":
      variant = "success";
      break;
    case "Delivered":
      variant = "success";
      break;
  }
  return variant;
}
