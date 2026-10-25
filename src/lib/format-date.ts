import { DateTime } from "luxon";

export function formatDate(
  date: Date | DateTime | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  if (date instanceof DateTime) {
    date = date.toISO();
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "short",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export function formatDateFromISO(
  date: string,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";
  //DateTime.fromISO(po.createDate).toFormat( "MMM dd, yyyy")
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "short",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(DateTime.fromISO(date));
  } catch {
    return "";
  }
}
