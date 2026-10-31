import { DateTime } from "luxon";

export function parseDateFromFormat(format: string, date: string) {
  if (!date) return DateTime.invalid("empty date");
  //DateTime.fromISO(po.createDate).toFormat( "MMM dd, yyyy")
  try {
    return DateTime.fromFormat(date, format);
  } catch {
    return DateTime.invalid("unparsable date");
  }
}

export function parseDateFromISO(date: string) {
  if (!date) return DateTime.invalid("empty date");
  //DateTime.fromISO(po.createDate).toFormat( "MMM dd, yyyy")
  try {
    return DateTime.fromISO(date);
  } catch {
    return DateTime.invalid("unparsable date");
  }
}
