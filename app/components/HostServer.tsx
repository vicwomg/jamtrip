/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { shell } from 'electron';
import publicIp from 'public-ip';
import React from 'react';
import {
  bufferSizes,
  connectionPort,
  hubConnectionPort,
  sampleRates,
} from '../constants/constants';
import generateConnectionCode from '../features/connectionCode';
import {
  connectChannel,
  isJackServerRunning,
  killProcesses,
  startJackdmp,
  startJackTripServer,
} from '../features/jackInterface';
import sendProcessOutput from '../features/sendProcessOutput';
import ConnectionIndicator from './ConnectionIndicator';
import LogButtons from './LogButtons';

const HostServer = () => {
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('48000');
  const [bufferSize, setBufferSize] = React.useState<string>('128');
  const [hub, setHub] = React.useState<boolean>(false);
  // const [portOpen, setPortOpen] = React.useState<boolean>();
  // const [hubPortOpen, setHubPortOpen] = React.useState<boolean>();

  const [serverStart, setServerStart] = React.useState<boolean>(false);
  const [connected, setConnected] = React.useState<boolean>(false);

  const connectionCodeRef = React.useRef(null);
  const outputLogRef = React.useRef(null);

  React.useEffect(() => {
    publicIp
      .v4()
      .then((ip) => {
        setHost(ip);
        return null;
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (serverStart) {
      const waitForConnection = (timer: number) => {
        if (timer > 300000 && serverStart) {
          killProcesses();
          // eslint-disable-next-line no-alert
          alert(
            'Timed out waiting for connection to server. Check the log output.'
          );
          return;
        }
        if (
          !outputLogRef.current.value.includes('Received Connection from Peer!')
        ) {
          window.setTimeout(() => waitForConnection(timer + 1000), 1000);
        } else {
          sendProcessOutput(
            outputLogRef,
            connectChannel('system:capture_1', 'JackTrip:send_1')
          );
          sendProcessOutput(
            outputLogRef,
            connectChannel('JackTrip:receive_1', 'system:playback_1')
          );
          sendProcessOutput(
            outputLogRef,
            connectChannel('JackTrip:receive_1', 'system:playback_2')
          );
          setConnected(true);
        }
      };
      waitForConnection(0);
    }
  }, [serverStart]);

  const handleConnect = () => {
    killProcesses();
    setServerStart(true);

    const jackdmp = startJackdmp(bufferSize, sampleRate);
    sendProcessOutput(outputLogRef, jackdmp);

    const waitForJackServer = (timer: number) => {
      if (timer > 15000) {
        killProcesses();
        // eslint-disable-next-line no-alert
        alert(
          'Timed out waiting for JACK server to start. Check the log output'
        );
        return;
      }
      if (!isJackServerRunning()) {
        window.setTimeout(() => waitForJackServer(timer + 500), 500);
      } else {
        const jacktrip = startJackTripServer(hub);
        sendProcessOutput(outputLogRef, jacktrip);
        setTimeout(() => {
          sendProcessOutput(
            outputLogRef,
            connectChannel('system:capture_1', 'system:playback_1')
          );
          sendProcessOutput(
            outputLogRef,
            connectChannel('system:capture_1', 'system:playback_2')
          );
        }, 2000);
      }
    };
    waitForJackServer(0);
  };
  const handleDisconnect = () => {
    killProcesses();
    setConnected(false);
    setServerStart(false);
  };

  const isValid =
    !!host && !!sampleRate && !!bufferSize && typeof hub === 'boolean';

  return (
    <>
      <div className="field">
        <div className="label">Server IP address</div>
        <div className="control">
          <input
            className="input"
            type="text"
            value={host || 'loading...'}
            disabled
          />
        </div>
        <p className="help">
          To host a server, UDP port {connectionPort} needs to be open to accept
          connections from the internet. See{' '}
          <u
            style={{ cursor: 'pointer' }}
            onClick={() => {
              shell.openExternal(
                'https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/'
              );
            }}
          >
            this article
          </u>{' '}
          for help with port forwarding.
        </p>
      </div>
      <div className="field">
        <label className="checkbox">
          <input
            checked={hub}
            onClick={() => {
              setHub(!hub);
            }}
            type="checkbox"
          />{' '}
          Enable hub server
        </label>
        <p className="help">
          Hub servers can host jams of more than 2 people. Port{' '}
          {hubConnectionPort} needs to be open, as well as subsequent ports{' '}
          {hubConnectionPort + 1}, {hubConnectionPort + 2} ... depending on the
          number of connections.
        </p>
      </div>

      <div className="field ">
        <div className="label">Audio settings</div>
        <div className="control is-grouped">
          <div className="select">
            <select
              value={sampleRate}
              onChange={(s) => setSampleRate(s.currentTarget.value)}
            >
              <option value="" disabled>
                Sample rate
              </option>
              {sampleRates.map((e) => (
                <option key={e} value={e}>
                  {e}hz
                </option>
              ))}
            </select>
          </div>
          <div className="select" style={{ marginLeft: 10 }}>
            <select
              value={bufferSize}
              onChange={(b) => setBufferSize(b.currentTarget.value)}
            >
              <option disabled>Buffer size</option>
              {bufferSizes.map((e) => (
                <option key={e} value={e}>
                  {e}fpp
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="help">
          Decreasing buffer size lowers latency but may introduce audio
          glitches.
        </p>
      </div>

      {isValid && (
        <>
          <div className="box has-background-grey-lighter">
            <div className="label">Connection code</div>
            <div className="field has-addons">
              <div className="control">
                <input
                  className="input"
                  style={{ width: 300 }}
                  ref={connectionCodeRef}
                  value={generateConnectionCode(
                    host,
                    sampleRate,
                    bufferSize,
                    hub
                  )}
                />
              </div>
              <div className="control">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    connectionCodeRef.current.select();
                    document.execCommand('copy');
                  }}
                >
                  <i className="fas fa-copy" />
                  &nbsp;copy
                </button>
              </div>
            </div>
            <p className="help">Send this code to the other folks.</p>
          </div>
        </>
      )}
      {!serverStart ? (
        <div className="pulled-right">
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConnect}
            className="button is-rounded is-success"
          >
            Start server
          </button>
        </div>
      ) : (
        <>
          <div className="pulled-right">
            <button
              type="button"
              onClick={handleDisconnect}
              className="button is-rounded is-danger"
            >
              Stop server
            </button>
          </div>
          <ConnectionIndicator
            connected={connected}
            standbyMessage="Waiting for a connection..."
            successMessage="connected!"
          />
          <div className="field">
            <div className="label">Log output</div>
            <textarea
              className="textarea has-background-dark has-text-success is-size-7"
              name="output"
              ref={outputLogRef}
              id="output"
              rows={12}
              style={{ width: '100%' }}
            />
            <LogButtons
              onClear={() => {
                outputLogRef.current.value = '';
              }}
              onCopy={() => {
                outputLogRef.current.select();
                document.execCommand('copy');
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default HostServer;
