import { IonChip, IonGrid, IonLabel, IonRow } from '@ionic/react';
import { V1StatefulSet, V1StatefulSetUpdateStrategy } from '@kubernetes/client-node';
import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';

import { IContext } from '../../../../declarations';
import { AppContext } from '../../../../utils/context';
import { labelSelector } from '../../../../utils/helpers';
import QueryList from '../../../plugins/elasticsearch/QueryList';
import TraceList from '../../../plugins/jaeger/TraceList';
import Dashboard from '../../../plugins/prometheus/Dashboard';
import DashboardList from '../../../plugins/prometheus/DashboardList';
import List from '../../misc/list/List';
import Conditions from '../../misc/template/Conditions';
import Configuration from '../../misc/template/Configuration';
import Metadata from '../../misc/template/Metadata';
import Row from '../../misc/template/Row';
import Status from '../../misc/template/Status';

interface IStatefulSetDetailsProps extends RouteComponentProps {
  item: V1StatefulSet;
  section: string;
  type: string;
}

const StatefulSetDetails: React.FunctionComponent<IStatefulSetDetailsProps> = ({
  item,
  type,
}: IStatefulSetDetailsProps) => {
  const context = useContext<IContext>(AppContext);

  const updateStrategy = (strategy: V1StatefulSetUpdateStrategy): string => {
    if (strategy.rollingUpdate && strategy.rollingUpdate.partition) {
      return `${strategy.type ? `${strategy.type}: ` : ''}Partition ${strategy.rollingUpdate.partition}`;
    }

    return strategy.type ? strategy.type : '';
  };

  return (
    <IonGrid>
      <IonRow>
        <Configuration>
          <Row obj={item} objKey="spec.updateStrategy" title="Update Strategy" value={updateStrategy} />
          <Row
            obj={item}
            objKey="spec.selector.matchLabels"
            title="Selectors"
            value={(value) =>
              Object.keys(value).map((label) => {
                return (
                  <IonChip key={label} className="unset-chip-height">
                    <IonLabel>
                      {label}: {value[label]}
                    </IonLabel>
                  </IonChip>
                );
              })
            }
          />
          <Row obj={item} objKey="spec.serviceName" title="Service Name" />
          <Row obj={item} objKey="spec.revisionHistoryLimit" title="Revision History Limit" />
          <Row obj={item} objKey="spec.podManagementPolicy" title="Pod Management Policy" />
          <Row obj={item} objKey="spec.replicas" title="Replicas" />
        </Configuration>

        <Status>
          <Row obj={item} objKey="status.replicas" title="Desired Replicas" />
          <Row obj={item} objKey="status.currentReplicas" title="Current Replicas" />
          <Row obj={item} objKey="status.readyReplicas" title="Ready Replicas" />
          <Row obj={item} objKey="status.updatedReplicas" title="Updated Replicas" />
          <Row obj={item} objKey="status.currentRevision" title="Current Revision" />
          <Row obj={item} objKey="status.updateRevision" title="Update Revision" />
          <Row obj={item} objKey="status.observedGeneration" title="Observed Generation" />
        </Status>
      </IonRow>

      {item.metadata ? <Metadata metadata={item.metadata} type={type} /> : null}

      {item.status && item.status.conditions ? (
        <IonRow>
          <Conditions conditions={item.status.conditions} />
        </IonRow>
      ) : null}

      {item.metadata && item.metadata.namespace && item.spec && item.spec.selector ? (
        <IonRow>
          <List
            name="Pods"
            section="workloads"
            type="pods"
            namespace={item.metadata.namespace}
            parent={item}
            selector={`labelSelector=${labelSelector(item.spec.selector)}`}
          />
        </IonRow>
      ) : null}

      {item.metadata && item.metadata.name && item.metadata.namespace ? (
        <IonRow>
          <List
            name="Events"
            section="cluster"
            type="events"
            namespace={item.metadata.namespace}
            parent={item}
            selector={`fieldSelector=involvedObject.name=${item.metadata.name}`}
          />
        </IonRow>
      ) : null}

      {context.settings.prometheusEnabled ? (
        <Dashboard
          title="Metrics"
          charts={[
            {
              title: 'Pods',
              unit: '',
              size: {
                xs: '12',
                sm: '12',
                md: '12',
                lg: '12',
                xl: '12',
              },
              type: 'area',
              queries: [
                {
                  label: 'Desired',
                  query: `kube_statefulset_replicas{namespace="${
                    item.metadata ? item.metadata.namespace : ''
                  }", statefulset="${item.metadata ? item.metadata.name : ''}"}`,
                },
                {
                  label: 'Current',
                  query: `kube_statefulset_status_replicas_current{namespace="${
                    item.metadata ? item.metadata.namespace : ''
                  }", statefulset="${item.metadata ? item.metadata.name : ''}"}`,
                },
                {
                  label: 'Ready',
                  query: `kube_statefulset_status_replicas_ready{namespace="${
                    item.metadata ? item.metadata.namespace : ''
                  }", statefulset="${item.metadata ? item.metadata.name : ''}"}`,
                },
                {
                  label: 'Updated',
                  query: `kube_statefulset_status_replicas_updated{namespace="${
                    item.metadata ? item.metadata.namespace : ''
                  }", statefulset="${item.metadata ? item.metadata.name : ''}"}`,
                },
              ],
            },
          ]}
        />
      ) : null}

      {context.settings.prometheusEnabled ? <DashboardList item={item} /> : null}
      {context.settings.elasticsearchEnabled ? <QueryList item={item} /> : null}
      {context.settings.jaegerEnabled ? <TraceList item={item} /> : null}
    </IonGrid>
  );
};

export default StatefulSetDetails;
