import * as _ from 'lodash';
import { GraphTypes } from './dashboard/MonitoringDashboardGraph';
import {
  Humanize,
  humanizeBinaryBytes,
  humanizeCpuCores,
  humanizeDecimalBytesPerSec,
} from '@console/internal/components/utils';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';

export interface MonitoringQuery {
  query: _.TemplateExecutor;
  chartType: GraphTypes;
  title: string;
  humanize: Humanize;
  byteDataType: ByteDataTypes;
}

export const metricsQuery = {
  PODS_BY_CPU: 'CPU Usage',
  PODS_BY_MEMORY: 'Memory Usage',
  PODS_BY_FILESYSTEM: 'Filesystem Usage',
  PODS_BY_NETWORK_IN: 'Receive Bandwidth',
  PODS_BY_NETWORK_OUT: 'Transmit Bandwidth',
  RATE_OF_RECEIVED_PACKETS: 'Rate of Received Packets',
  RATE_OF_TRANSMITTED_PACKETS: 'Rate of Transmitted Packets',
  RATE_OF_RECEIVED_PACKETS_DROPPED: 'Rate of Received Packets Dropped',
  RATE_OF_TRANSMITTED_PACKETS_DROPPED: 'Rate of Transmitted Packets Dropped',
};

export const monitoringDashboardQueries: MonitoringQuery[] = [
  {
    query: _.template(
      `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace='<%= namespace %>'}) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'CPU Usage',
    humanize: humanizeCpuCores,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(container_memory_working_set_bytes{container!="", namespace='<%= namespace %>'}) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Memory Usage',
    humanize: humanizeBinaryBytes,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_receive_bytes_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Receive Bandwidth',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_transmit_bytes_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Transmit Bandwidth',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_receive_packets_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Rate of Received Packets',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_transmit_packets_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Rate of Transmitted Packets',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_receive_packets_dropped_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Rate of Received Packets Dropped',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
  {
    query: _.template(
      `sum(irate(container_network_transmit_packets_dropped_total{namespace='<%= namespace %>'}[2h])) by (pod)`,
    ),
    chartType: GraphTypes.area,
    title: 'Rate of Transmitted Packets Dropped',
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.BinaryBytes,
  },
];

export const topWorkloadMetricsQueries: MonitoringQuery[] = [
  {
    title: 'CPU Usage',
    chartType: GraphTypes.area,
    humanize: humanizeCpuCores,
    byteDataType: ByteDataTypes.BinaryBytes,
    query: _.template(
      `sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate{namespace='<%= namespace %>'}
          * on(namespace,pod) group_left(workload, workload_type) namespace_workload_pod:kube_pod_owner:relabel{
          namespace='<%= namespace %>', workload='<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Memory Usage',
    chartType: GraphTypes.area,
    humanize: humanizeBinaryBytes,
    byteDataType: ByteDataTypes.BinaryBytes,
    query: _.template(
      `sum(container_memory_working_set_bytes{namespace='<%= namespace %>', container!=""}
          * on(namespace,pod) group_left(workload, workload_type) namespace_workload_pod:kube_pod_owner:relabel{
          namespace='<%= namespace %>', workload='<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Receive Bandwidth',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_receive_bytes_total{namespace=~'<%= namespace %>'}[4h])
          * on (namespace,pod) group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{
          namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
];

export const workloadMetricsQueries: MonitoringQuery[] = [
  {
    title: 'Transmit Bandwidth',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_receive_bytes_total{namespace=~'<%= namespace %>'}[4h])
         * on (namespace,pod) group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{
         namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Rate of Received Packets',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_receive_packets_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod)group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Rate of Transmitted Packets',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_transmit_packets_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod)group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Rate of Received Packets Dropped',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_receive_packets_dropped_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod) group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Rate of Transmitted Packets Dropped',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `sum(irate(container_network_transmit_packets_dropped_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod)
      group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)
      `,
    ),
  },
  {
    title: 'Average Container Bandwidth by Pod: Received',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `avg(irate(container_network_receive_bytes_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod)group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
  {
    title: 'Average Container Bandwidth by Pod: Transmitted',
    chartType: GraphTypes.area,
    humanize: humanizeDecimalBytesPerSec,
    byteDataType: ByteDataTypes.DecimalBytes,
    query: _.template(
      `avg(irate(container_network_transmit_bytes_total{namespace=~'<%= namespace %>'}[4h])* on (namespace,pod)group_left(workload,workload_type) namespace_workload_pod:kube_pod_owner:relabel{namespace=~'<%= namespace %>', workload=~'<%= workloadName %>', workload_type='<%= workloadType %>'}) by (pod)`,
    ),
  },
];

const getMetricsQuery = (title: string): _.TemplateExecutor => {
  const queryObject = _.find(monitoringDashboardQueries, (q) => q.title === title);
  return queryObject.query;
};

const topMetricsQueries = {
  PODS_BY_CPU: getMetricsQuery('CPU Usage'),
  PODS_BY_MEMORY: getMetricsQuery('Memory Usage'),
  PODS_BY_FILESYSTEM: _.template(
    `topk(25, sort_desc(sum(pod:container_fs_usage_bytes:sum{container="",pod!="",namespace='<%= namespace %>'}) BY (pod, namespace)))`,
  ),
  PODS_BY_NETWORK_IN: getMetricsQuery('Receive Bandwidth'),
  PODS_BY_NETWORK_OUT: getMetricsQuery('Transmit Bandwidth'),
  RATE_OF_RECEIVED_PACKETS: getMetricsQuery('Rate of Received Packets'),
  RATE_OF_TRANSMITTED_PACKETS: getMetricsQuery('Rate of Transmitted Packets'),
  RATE_OF_RECEIVED_PACKETS_DROPPED: getMetricsQuery('Rate of Received Packets Dropped'),
  RATE_OF_TRANSMITTED_PACKETS_DROPPED: getMetricsQuery('Rate of Transmitted Packets Dropped'),
};

export const getTopMetricsQueries = (namespace: string) => ({
  [metricsQuery.PODS_BY_CPU]: topMetricsQueries.PODS_BY_CPU({ namespace }),
  [metricsQuery.PODS_BY_MEMORY]: topMetricsQueries.PODS_BY_MEMORY({ namespace }),
  [metricsQuery.PODS_BY_FILESYSTEM]: topMetricsQueries.PODS_BY_FILESYSTEM({
    namespace,
  }),
  [metricsQuery.PODS_BY_NETWORK_IN]: topMetricsQueries.PODS_BY_NETWORK_IN({
    namespace,
  }),
  [metricsQuery.PODS_BY_NETWORK_OUT]: topMetricsQueries.PODS_BY_NETWORK_OUT({
    namespace,
  }),
  [metricsQuery.RATE_OF_RECEIVED_PACKETS]: topMetricsQueries.RATE_OF_RECEIVED_PACKETS({
    namespace,
  }),
  [metricsQuery.RATE_OF_TRANSMITTED_PACKETS]: topMetricsQueries.RATE_OF_TRANSMITTED_PACKETS({
    namespace,
  }),
  [metricsQuery.RATE_OF_RECEIVED_PACKETS_DROPPED]: topMetricsQueries.RATE_OF_RECEIVED_PACKETS_DROPPED(
    {
      namespace,
    },
  ),
  [metricsQuery.RATE_OF_TRANSMITTED_PACKETS_DROPPED]: topMetricsQueries.RATE_OF_TRANSMITTED_PACKETS_DROPPED(
    {
      namespace,
    },
  ),
});
