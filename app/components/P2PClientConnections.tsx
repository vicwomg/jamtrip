import React from 'react';
import { connectChannel } from '../features/jackInterface';
import ConnectionIndicator from './ConnectionIndicator';

const P2PClientConnections = ({
  outputLogRef,
}: {
  outputLogRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  const [connected, setConnected] = React.useState<boolean>(false);
  const [poll, setPoll] = React.useState<NodeJS.Timeout>();

  React.useEffect(() => {
    if (poll && connected) clearInterval(poll);
  }, [connected, poll]);

  React.useEffect(() => {
    setPoll(
      setInterval(() => {
        if (
          outputLogRef.current &&
          outputLogRef.current.value.includes(
            'Received Connection from Peer!'
          ) &&
          !connected
        ) {
          connectChannel('JackTrip:receive_1', 'system:playback_2');
          setConnected(true);
        }
      }, 1000)
    );
    return () => {
      if (poll) clearInterval(poll);
    };
  }, []);

  return (
    <ConnectionIndicator
      connected={connected}
      standbyMessage="Waiting for a connection..."
      successMessage="connected!"
    />
  );
};

export default P2PClientConnections;
