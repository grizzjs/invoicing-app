import { classifyStatus } from "./classify-status";

const entityToBadge = (entity: { status: string }) => {
  return {
    status: entity.status,
    variant: classifyStatus(entity.status),
  };
};

export default entityToBadge;
