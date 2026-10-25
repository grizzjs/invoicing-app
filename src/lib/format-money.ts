export const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default function format(amount: number): string {
  return formatter.format(amount);
}
