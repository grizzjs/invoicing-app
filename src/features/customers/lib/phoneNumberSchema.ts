import z from "zod";
import formatPhoneNumber from "./formatPhoneNumber";

// Length of a fully formatted phone number: "(917) 517 9241".
export const PHONE_MAX_LENGTH = 14;

// Digits are counted on the raw value so extra digits hidden by the input
// formatter still fail validation instead of being silently dropped on save.
export const phoneNumberSchema = z
  .string()
  .min(1, { message: "Phone number is required", abort: true })
  .refine((value) => value.replace(/\D/g, "").length === 10, {
    message: "Phone number must be 10 digits",
  })
  .transform(formatPhoneNumber);
