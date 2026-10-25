export const classifyStatus = (status) => {
  let variant: "info" | "error" | "warning" | "success" = "info";
  switch (status) {
    case "Cancelled":
      variant = "error";
      break;
    case "Pending":
      variant = "warning";
      break;
    case "Completed":
      variant = "success";
      break;
  }
  return variant;
};
