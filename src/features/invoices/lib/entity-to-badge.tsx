import { classifyStatus, enrichStatus } from "./classify-status";

const entityToBadge = (entity: {
  status: string;
  dueInDays: number;
  createDate: string;
}) => {
  return {
    status: enrichStatus(entity.status, entity.dueInDays, entity.createDate),
    variant: classifyStatus(entity.status, entity.dueInDays, entity.createDate),
  };
};

export default entityToBadge;
