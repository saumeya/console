import * as React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom-v5-compat';
import { DetailsPage } from '@console/internal/components/factory';
import { navFactory } from '@console/internal/components/utils';
import { PersistentVolumeClaimModel, PodModel, TemplateModel } from '@console/internal/models';
import { referenceFor } from '@console/internal/module/k8s';
import LazyActionMenu from '@console/shared/src/components/actions/LazyActionMenu';
import { ActionMenuVariant } from '@console/shared/src/components/actions/types';
import { useK8sModel } from '@console/shared/src/hooks/useK8sModel';
import {
  VM_DETAIL_CONSOLES_HREF,
  VM_DETAIL_DETAILS_HREF,
  VM_DETAIL_DISKS_HREF,
  VM_DETAIL_NETWORKS_HREF,
} from '../../constants';
import { VIRTUALMACHINES_BASE_URL } from '../../constants/url-params';
import {
  TEMPLATE_TYPE_LABEL,
  VM_DETAIL_ENVIRONMENT,
  VM_DETAIL_SNAPSHOTS,
} from '../../constants/vm';
import { useVMStatus } from '../../hooks/use-vm-status';
import {
  DataVolumeModel,
  VirtualMachineImportModel,
  VirtualMachineInstanceMigrationModel,
  VirtualMachineInstanceModel,
  VirtualMachineModel,
  VirtualMachineSnapshotModel,
} from '../../models';
import { kubevirtReferenceForModel } from '../../models/kubevirtReferenceForModel';
import { getResource } from '../../utils';
import { VMDisksAndFileSystemsPage } from '../vm-disks/vm-disks';
import { VMNics } from '../vm-nics';
import { VMSnapshotsPage } from '../vm-snapshots/vm-snapshots';
import { PendingChangesWarningFirehose } from './pending-changes-warning';
import VMConsoleDetailsPage from './vm-console/VMConsoleDetailsPage';
import { VMDashboard } from './vm-dashboard';
import { VMDetailsFirehose } from './vm-details';
import { VMEnvironmentFirehose } from './vm-environment/vm-environment-page';
import { VMEvents } from './vm-events';

export const breadcrumbsForVMPage = (t: TFunction, location: any, params: any) => () => [
  {
    name: t('kubevirt-plugin~Virtualization'),
    path: `/k8s/ns/${params.ns || 'default'}/${VIRTUALMACHINES_BASE_URL}`,
  },
  {
    name: t('kubevirt-plugin~Virtual Machines'),
    path: `/k8s/ns/${params.ns || 'default'}/${VIRTUALMACHINES_BASE_URL}`,
  },
  {
    name: t('kubevirt-plugin~{{name}} Details', { name: params.name }),
    path: `${location.pathname}`,
  },
];

export const VirtualMachinesDetailsPage: React.FC = (props) => {
  const params = useParams();
  const location = useLocation();
  const { name, ns: namespace } = params;
  const { t } = useTranslation();
  const [snapshotResource] = useK8sModel(kubevirtReferenceForModel(VirtualMachineSnapshotModel));
  const vmStatusBundle = useVMStatus(name, namespace);

  const dashboardPage = {
    href: '', // default landing page
    // t('kubevirt-plugin~Overview')
    nameKey: 'kubevirt-plugin~Overview',
    component: VMDashboard,
  };

  const overviewPage = {
    href: VM_DETAIL_DETAILS_HREF,
    // t('kubevirt-plugin~Details')
    nameKey: 'kubevirt-plugin~Details',
    component: VMDetailsFirehose,
  };

  const consolePage = {
    href: VM_DETAIL_CONSOLES_HREF,
    // t('kubevirt-plugin~Console')
    nameKey: 'kubevirt-plugin~Console',
    component: VMConsoleDetailsPage,
  };

  const nicsPage = {
    href: VM_DETAIL_NETWORKS_HREF,
    // t('kubevirt-plugin~Network Interfaces')
    nameKey: 'kubevirt-plugin~Network Interfaces',
    component: VMNics,
  };

  const disksPage = {
    href: VM_DETAIL_DISKS_HREF,
    // t('kubevirt-plugin~Disks')
    nameKey: 'kubevirt-plugin~Disks',
    component: VMDisksAndFileSystemsPage,
  };

  const environmentPage = {
    href: VM_DETAIL_ENVIRONMENT,
    // t('kubevirt-plugin~Environment')
    nameKey: 'kubevirt-plugin~Environment',
    component: VMEnvironmentFirehose,
  };

  const snapshotsPage = {
    href: VM_DETAIL_SNAPSHOTS,
    // t('kubevirt-plugin~Snapshots')
    nameKey: 'kubevirt-plugin~Snapshots',
    component: VMSnapshotsPage,
  };

  const pages = [
    dashboardPage,
    overviewPage,
    navFactory.editYaml(),
    environmentPage,
    navFactory.events(VMEvents),
    consolePage,
    nicsPage,
    disksPage,
    ...(snapshotResource ? [snapshotsPage] : []),
  ];

  const resources = [
    getResource(PodModel, { namespace, prop: 'pods' }),
    getResource(TemplateModel, {
      isList: true,
      namespace,
      prop: 'templates',
      matchExpressions: [
        {
          key: TEMPLATE_TYPE_LABEL,
          operator: 'Exists',
        },
      ],
    }),
    {
      kind: kubevirtReferenceForModel(VirtualMachineInstanceMigrationModel),
      namespace,
      prop: 'migrations',
      isList: true,
    },
    {
      kind: kubevirtReferenceForModel(VirtualMachineInstanceModel),
      namespace,
      isList: true,
      prop: 'vmis',
      optional: true,
      fieldSelector: `metadata.name=${name}`, // Note(yaacov): we look for a list, instead of one obj, to avoid 404 response if no VMI exist.
    },
    {
      kind: kubevirtReferenceForModel(VirtualMachineImportModel),
      isList: true,
      namespace,
      prop: 'vmImports',
      optional: true,
    },
    {
      kind: PersistentVolumeClaimModel.kind,
      isList: true,
      namespace,
      prop: 'pvcs',
    },
    {
      kind: kubevirtReferenceForModel(DataVolumeModel),
      isList: true,
      namespace,
      prop: 'dataVolumes',
    },
  ];

  return (
    <DetailsPage
      {...props}
      name={name}
      namespace={namespace}
      kind={kubevirtReferenceForModel(VirtualMachineModel)}
      kindObj={VirtualMachineModel}
      customActionMenu={(kindObj, obj) => {
        const objReference = referenceFor(obj);
        const context = { [objReference]: obj };
        return <LazyActionMenu variant={ActionMenuVariant.DROPDOWN} context={context} />;
      }}
      pages={pages}
      resources={resources}
      breadcrumbsFor={breadcrumbsForVMPage(t, location, params)}
      customData={{ kindObj: VirtualMachineModel }}
      getResourceStatus={() => vmStatusBundle.status.getSimpleLabel()}
    >
      <PendingChangesWarningFirehose name={name} namespace={namespace} />
    </DetailsPage>
  );
};
