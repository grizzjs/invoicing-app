import type { DeliveryReceiptDto } from "@/api/models";
import { Key } from "@/components/ui/key-pair/key";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import build from "../lib/state-builder";

type StatesTimelineProps = {
  delivery: DeliveryReceiptDto;
};

export default function StatesTimeline({ delivery }: StatesTimelineProps) {
  const [currentState, states] = build(delivery);

  return (
    <Timeline activeIndex={currentState} className="[--timeline-dot-size:2rem]">
      {states.map((item) => (
        <TimelineItem key={item.id}>
          <TimelineDot>
            {item.completed ? <Check className="size-3.5" /> : null}
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTime dateTime={item.dateTime}>{item.date}</TimelineTime>
              <TimelineTitle>
                <Key>{item.title}</Key>
              </TimelineTitle>
            </TimelineHeader>
            <TimelineDescription>
              {item.meta?.po && (
                <div>
                  <span>Purchase Order: </span>
                  <Link to={`/purchase-orders/${item.meta.po}`}>
                    {item.meta.po}
                  </Link>
                </div>
              )}
              {item.meta?.si && (
                <div>
                  <span>Invoice: </span>
                  <Link to={`/invoices/${item.meta.si}`}> {item.meta.si}</Link>
                </div>
              )}
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
