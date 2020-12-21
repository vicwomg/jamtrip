import React from 'react';
import { connectChannel, getHubClients } from '../features/jackInterface';
import ConnectionIndicator from './ConnectionIndicator';

const HubClientConnections = () => {
  const [sendChannels, setSendChannels] = React.useState<string[]>([]);
  const [receiveChannels, setReceiveChannels] = React.useState<string[]>([]);

  const handleClients = React.useCallback(() => {
    const c = getHubClients();
    // console.log('Fetching clients');

    // auto-connect server inputs to new sends
    if (c.sendChannels.length > sendChannels.length) {
      // console.log('new send connection');
      c.sendChannels.forEach((e) => {
        if (!sendChannels.includes(e)) {
          connectChannel('system:capture_1', e);
          connectChannel('system:capture_2', e);
          setSendChannels([...sendChannels, e]);
        }
      });
    } else if (c.sendChannels.length < sendChannels.length) {
      // console.log('disconnect send');
      setSendChannels(c.sendChannels);
    }

    // auto-connect client receives to server playback
    if (c.receiveChannels.length > receiveChannels.length) {
      // console.log('new receive connection');
      c.receiveChannels.forEach((e) => {
        if (!receiveChannels.includes(e)) {
          connectChannel(e, 'system:playback_1');
          connectChannel(e, 'system:playback_2');
          setReceiveChannels([...receiveChannels, e]);
        }
      });
    } else if (c.receiveChannels.length < receiveChannels.length) {
      // console.log('disconnect receive');
      setReceiveChannels(c.receiveChannels);
    }
  }, [receiveChannels, sendChannels]);

  React.useEffect(() => {
    const i = setInterval(handleClients, 2500);
    return () => clearInterval(i);
  }, [handleClients]);

  return (
    <>
      <div className="box is-size-7" style={{ marginTop: 20 }}>
        <h3 className="label" style={{ marginBottom: 10 }}>
          Connected hub clients: {sendChannels.length}
        </h3>
        {sendChannels.length === 0 ? (
          <>Awaiting connections...</>
        ) : (
          <div>
            <b>Clients</b>
            <ul>
              {sendChannels.map((e) => (
                <li key={e}>{e.replace('_send', '')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ConnectionIndicator
        connected={sendChannels.length > 0}
        standbyMessage="Waiting for a connection..."
        successMessage="connected!"
      />
    </>
  );
};

export default HubClientConnections;
