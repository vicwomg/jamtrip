/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { shell } from 'electron';
import publicIp from 'public-ip';
import React from 'react';
import {
  bitResolution,
  bufferSizes,
  connectionPort,
  hubConnectionPort,
  sampleRates,
} from '../constants/constants';
import { generateConnectionCode } from '../features/connectionCode';
import {
  connectChannel,
  isJackServerRunning,
  killProcesses,
  startJackdmp,
  startJackTripServer,
} from '../features/jackInterface';
import { getPersistence, setPersistence } from '../features/persistence';
import sendProcessOutput from '../features/sendProcessOutput';
import ConnectionIndicator from './ConnectionIndicator';
import InputMonitoringButton from './InputMonitoring';
import LogButtons from './LogButtons';

const HostServer = () => {
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('48000');
  const [bufferSize, setBufferSize] = React.useState<string>('256');
  const [queueLength, setQueueLength] = React.useState<string>('4');
  const [bits, setBits] = React.useState<string>('16');
  const [hub, setHub] = React.useState<boolean>(false);

  const [serverStart, setServerStart] = React.useState<boolean>(false);
  const [connected, setConnected] = React.useState<boolean>(false);
  const [codeCopied, setCodeCopied] = React.useState<boolean>(false);

  const connectionCodeRef = React.useRef(null);
  const outputLogRef = React.useRef(null);

  React.useEffect(() => {
    // load persisted values if they exist
    getPersistence('server_sample_rate', (value) => {
      setSampleRate(value);
    });
    getPersistence('server_buffer_size', (value) => {
      setBufferSize(value);
    });
    getPersistence('server_bit_resolution', (value) => {
      setBits(value);
    });
    getPersistence('server_queue_length', (value) => {
      setQueueLength(value);
    });
    getPersistence('server_hub', (value) => {
      setHub(value === 'true');
    });

    // fetch external IP
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
          outputLogRef.current &&
          !outputLogRef.current.value.includes('Received Connection from Peer!')
        ) {
          window.setTimeout(() => waitForConnection(timer + 1000), 1000);
        } else {
          connectChannel('system:capture_1', 'JackTrip:send_1');
          connectChannel('JackTrip:receive_1', 'system:playback_1');
          connectChannel('JackTrip:receive_1', 'system:playback_2');
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
        const jacktrip = startJackTripServer(hub, queueLength, bits);
        sendProcessOutput(outputLogRef, jacktrip);
        setTimeout(() => {
          connectChannel('system:capture_1', 'system:playback_1');
          connectChannel('system:capture_1', 'system:playback_2');
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
        <label className="checkbox" style={{ marginTop: 10 }}>
          <input
            checked={hub}
            onChange={() => {
              const r = !hub;
              setPersistence('server_hub', r, () => setHub(r));
            }}
            type="checkbox"
          />{' '}
          Enable hub server (for 3 or more people)
        </label>
        <p className="help">
          Servers require UDP port {connectionPort} to be open to the internet.
          Hub mode also needs ports {hubConnectionPort}, {hubConnectionPort + 1}
          , {hubConnectionPort + 2}... for each connection. See{' '}
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

      <div className="field ">
        <div className="label">Audio settings</div>
        <div className="control is-grouped">
          <div className="select">
            <select
              value={sampleRate}
              onChange={(s) => {
                const r = s.currentTarget.value;
                setPersistence('server_sample_rate', r, () => setSampleRate(r));
              }}
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
              onChange={(b) => {
                const r = b.currentTarget.value;
                setPersistence('server_buffer_size', r, () => setBufferSize(r));
              }}
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
          Increasing sample rate lowers latency, but increases bandwidth use.
          Not all sound hardware supports above 48khz. Decreasing buffer size
          lowers latency but introduces more audio glitches. Default: 48000/256
        </p>
      </div>

      <div className="field ">
        <div className="label">Advanced</div>
        <div className="is-flex" style={{ alignItems: 'center' }}>
          <input
            className="input is-small"
            type="number"
            value={queueLength}
            style={{ width: 60 }}
            onChange={(b) => {
              const r = b.currentTarget.value;
              setPersistence('server_queue_length', r, () => setQueueLength(r));
            }}
          />
          <p className="help" style={{ marginLeft: 10, marginTop: 0 }}>
            <b>Queue buffer length</b> in packet size. If your connection is
            very unstable, with a lot of jitter, increase this number at the
            expense of a higher latency. Default: 4
          </p>
        </div>
        <div className="is-flex" style={{ alignItems: 'center', marginTop: 5 }}>
          <div className="select is-small" style={{}}>
            <select
              value={bits}
              onChange={(b) => {
                const r = b.currentTarget.value;
                setPersistence('server_bit_resolution', r, () => setBits(r));
              }}
            >
              <option disabled>Bits</option>
              {bitResolution.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <p className="help" style={{ marginLeft: 10, marginTop: 0 }}>
            <b>Audio bit rate resolution</b> can be used to decrease (or
            increase) the bandwidth requirements, at the expense of a lower
            audio quality. Default: 16
          </p>
        </div>
      </div>

      {isValid && (
        <>
          <div className="box has-background-grey-lighter">
            <div className="label">Connection code</div>
            <div className="field has-addons">
              <div className="control">
                <input
                  className="input"
                  readOnly
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
                    setCodeCopied(true);
                    setTimeout(() => {
                      setCodeCopied(false);
                    }, 2000);
                  }}
                >
                  <i className="fas fa-copy" />
                  &nbsp;{codeCopied ? 'copied!' : 'copy'}
                </button>
              </div>
            </div>
            <p className="help">
              Send this code to the other folks. Note: the code changes if you
              change audio settings.
            </p>
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
            <InputMonitoringButton />
            <button
              type="button"
              style={{ marginLeft: 10 }}
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
