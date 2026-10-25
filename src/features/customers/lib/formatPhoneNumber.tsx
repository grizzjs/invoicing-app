export default function format(value: string) {
  if (!value) return "";
  const phoneNumber = value.replace(/[^\d]/g, ""); // Keep only numbers
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return `${phoneNumber}`;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
}
