import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import {
  ellipsisHorizontal,
  ellipsisVertical,
  help,
  layers,
  layersOutline,
  refresh as refreshIcon,
} from 'ionicons/icons';
import React, { useState } from 'react';

import { openURL } from '../../../utils/helpers';

interface IDetailsProps {
  refresh: () => void;
  showAllVersions?: boolean;
  setShowAllVersions?: (value: boolean) => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  refresh,
  showAllVersions,
  setShowAllVersions,
}: IDetailsProps) => {
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [popoverEvent, setPopoverEvent] = useState();

  return (
    <React.Fragment>
      <IonPopover isOpen={showPopover} event={popoverEvent} onDidDismiss={() => setShowPopover(false)}>
        <IonList>
          <IonItem
            button={true}
            detail={false}
            onClick={() => {
              refresh();
              setShowPopover(false);
            }}
          >
            <IonIcon slot="end" color="primary" icon={refreshIcon} />
            <IonLabel>Refresh</IonLabel>
          </IonItem>
          {showAllVersions !== undefined && setShowAllVersions ? (
            <IonItem
              button={true}
              detail={false}
              onClick={() => {
                setShowAllVersions(!showAllVersions);
                setShowPopover(false);
              }}
            >
              <IonIcon slot="end" color="primary" icon={showAllVersions ? layers : layersOutline} />
              <IonLabel>All Versions</IonLabel>
            </IonItem>
          ) : null}
          <IonItem
            button={true}
            detail={false}
            onClick={() => {
              openURL('https://docs.kubenav.io/plugins/helm/');
              setShowPopover(false);
            }}
          >
            <IonIcon slot="end" color="primary" icon={help} />
            <IonLabel>Help</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>

      <IonButton
        onClick={(e) => {
          e.persist();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPopoverEvent(e as any);
          setShowPopover(true);
        }}
      >
        <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical} />
      </IonButton>
    </React.Fragment>
  );
};

export default Details;
