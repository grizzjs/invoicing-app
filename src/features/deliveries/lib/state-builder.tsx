import type { DeliveryReceiptDto } from "@/api/models";
import { formatDate } from "@/lib/format-date";
import { both, indexBy, isNotEmpty, isNotNil, prop } from "ramda";

type StateTimeline = {
  id: number;
  dateTime: string;
  date: string;
  title: string;
  meta?: { [k: string]: string | number };
  completed: boolean;
};

const build = (
  delivery: DeliveryReceiptDto,
): [number, [StateTimeline, StateTimeline, StateTimeline, StateTimeline]] => {
  const keyByStatus = indexBy(prop("status"), delivery.states);
  const statesTimeline: [
    StateTimeline,
    StateTimeline,
    StateTimeline,
    StateTimeline,
  ] = [
    {
      id: 1,
      dateTime: keyByStatus.New?.date,
      date: formatDate(keyByStatus.New?.date),
      title: "New",
      meta: {
        po: delivery.purchaseOrder.id,
        si: delivery.invoice?.id,
      },
      completed: true,
    },
    {
      id: 2,
      dateTime: keyByStatus.Shipped?.date ?? "9999-01-01",
      date: formatDate(keyByStatus.Shipped?.date),
      title: "Shipped",
      completed: both(isNotEmpty, isNotNil)(keyByStatus.Shipped),
    },
    {
      id: 3,
      dateTime: keyByStatus.Delivered?.date ?? "9999-01-03",
      date: formatDate(keyByStatus.Delivered?.date),
      title: "Delivered",
      completed: both(isNotEmpty, isNotNil)(keyByStatus.Delivered),
    },
    {
      id: 4,
      dateTime: keyByStatus.Paid?.date ?? "9999-01-04",
      date: formatDate(keyByStatus.Paid?.date),
      title: "Paid",
      completed: both(isNotEmpty, isNotNil)(keyByStatus.Paid),
    },
  ];

  const maxDate = statesTimeline
    .map(prop("dateTime"))
    .filter((date) => !date.includes("9999"))
    .reduce((a, b) => (a > b ? a : b), "");

  const index = statesTimeline.findLastIndex(
    (state) => state.dateTime === maxDate,
  );

  return [index, statesTimeline];
};

export default build;
