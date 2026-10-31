export default function format(value: string) {
  if (!value) return "";
  const tin = value.replace(/[^\d]/g, ""); // Keep only numbers
  const tinLength = tin.length;

  if (tinLength < 4) return `${tin}`;
  if (tinLength < 7) {
    return `${tin.slice(0, 3)}-${tin.slice(3)}`;
  }
  if (tinLength < 10) {
    return `${tin.slice(0, 3)}-${tin.slice(3, 6)}-${tin.slice(6, 9)}`;
  }

  return `${tin.slice(0, 3)}-${tin.slice(3, 6)}-${tin.slice(6, 9)}-${tin.slice(9, 14)}`;
}
