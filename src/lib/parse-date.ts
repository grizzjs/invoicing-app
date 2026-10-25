import { DateTime } from "luxon";

export function parseDateFromFormat(format: string, date: string) {
  if (!date) return "";
  //DateTime.fromISO(po.createDate).toFormat( "MMM dd, yyyy")
  try {
    return DateTime.fromFormat(date, format);
  } catch {
    return "";
  }
}

export function parseDateFromISO(date: string) {
  if (!date) return "";
  //DateTime.fromISO(po.createDate).toFormat( "MMM dd, yyyy")
  try {
    return DateTime.fromISO(date);
  } catch {
    return "";
  }
}
