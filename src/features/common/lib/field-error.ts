import type { AnyFieldMeta } from "@tanstack/react-form";

// Errors stay hidden until the user touches the field (or submits). Forms
// validate on both mount and change, so the same message can arrive twice and
// is de-duplicated.
export function getFieldError(meta: AnyFieldMeta) {
  const isInvalid = meta.isTouched && !meta.isValid;
  const message = [
    ...new Set(meta.errors.map((error) => error?.message as string)),
  ].join(", ");
  return { isInvalid, message };
}
