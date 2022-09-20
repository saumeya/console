import { K8sResourceCondition } from '@console/internal/module/k8s';

export type StatusCondition = {
  status: string;
  type: string;

  lastTransitionTime: string;
  message: string;
  reason: string;
};

export const getCondition = (
  resource: {
    status: {
      conditions?: K8sResourceCondition[];
    };
  },
  type: string,
): K8sResourceCondition | undefined =>
  resource?.status?.conditions?.find((c: K8sResourceCondition) => c.type === type);
