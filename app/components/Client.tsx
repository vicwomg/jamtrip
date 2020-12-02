/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { bufferSizes, sampleRates } from '../constants/constants';
import { decodeConnectionCode } from '../features/connectionCode';
import {
  configureInputMonitoring,
  connectChannel,
  isJackServerRunning,
  killProcesses,
  startJackdmp,
  startJackTripClient,
} from '../features/jackInterface';
import { getPersistence, setPersistence } from '../features/persistence';
import sendProcessOutput from '../features/sendProcessOutput';
import ConnectionIndicator from './ConnectionIndicator';
import InputMonitoringButton from './InputMonitoring';
import LogButtons from './LogButtons';

const ClientConnect = () => {
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('');
  const [bufferSize, setBufferSize] = React.useState<string>('');
  const [hub, setHub] = React.useState<boolean>(false);
  const [connectionCode, setConnectionCode] = React.useState<string>('');
  const [manualConnect, setManualConnect] = React.useState<boolean>(false);

  const [connect, setConnect] = React.useState<boolean>(false);
  const [connected, setConnected] = React.useState<boolean>(false);

  const isValid =
    !!host && !!sampleRate && !!bufferSize && typeof hub === 'boolean';

  const codeInputElement = React.useRef(null);

  const clearSettings = () => {
    setHost('');
    setSampleRate('');
    setBufferSize('');
    setHub(false);
  };

  React.useEffect(() => {
    getPersistence('connection_code', (value) => {
      setConnectionCode(value);
    });
  }, []);

  const processCode = () => {
    const decoded = decodeConnectionCode(connectionCode);
    if (decoded) {
      setHost(decoded.host);
      setSampleRate(decoded.sampleRate);
      setBufferSize(decoded.bufferSize);
      setHub(decoded.hub);
      setPersistence('connection_code', connectionCode);
    } else {
      clearSettings();
    }
  };

  React.useEffect(() => {
    processCode();
  }, [connectionCode]);

  const outputElement = React.useRef(null);

  React.useEffect(() => {
    if (connect) {
      const waitForConnection = (timer: number) => {
        if (timer > 30000 && connect) {
          killProcesses();
          // eslint-disable-next-line no-alert
          alert(
            'Timed out waiting for connection to server. Check the log output.'
          );
          return;
        }
        if (
          !outputElement.current.value.includes(
            'Received Connection from Peer!'
          )
        ) {
          window.setTimeout(() => waitForConnection(timer + 1000), 1000);
        } else {
          setConnected(true);
        }
      };
      waitForConnection(0);
    }
  }, [connect]);

  const handleConnect = () => {
    killProcesses();
    setConnect(true);

    const jackdmp = startJackdmp(bufferSize, sampleRate);
    sendProcessOutput(outputElement, jackdmp);

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
        const jacktrip = startJackTripClient(host, hub);
        sendProcessOutput(outputElement, jacktrip);
        setTimeout(() => {
          getPersistence('direct_input_monitoring', (value) => {
            if (value === 'true') {
              configureInputMonitoring(true);
            }
          });
          connectChannel(`${host}:receive_1`, 'system:playback_1');
          connectChannel(`${host}:receive_1`, 'system:playback_2');
          connectChannel(`system:capture_1`, `${host}:send_1`);
        }, 2000);
      }
    };
    waitForJackServer(0);
  };

  const handleDisconnect = () => {
    killProcesses();
    setConnect(false);
    setConnected(false);
  };

  const handleToggleManualConf = () => {
    if (manualConnect) {
      clearSettings();
      processCode();
    }
    setManualConnect(!manualConnect);
  };

  return (
    <>
      {!connect && (
        <>
          <div className="field">
            <div className="label">Connection code</div>

            <div style={{ marginBottom: 10 }}>
              The person hosting the server sends the connection code to you.{' '}
            </div>
            <div className="control">
              <input
                type="text"
                className="input"
                defaultValue={connectionCode}
                ref={codeInputElement}
                disabled={manualConnect}
                onChange={(e) => {
                  setConnectionCode(e.currentTarget.value);
                }}
              />
            </div>
            <p className="help">
              <u>Example</u>: jackloop128.stanford.edu_48000_128_h
            </p>
          </div>
          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={manualConnect}
                onChange={() => {
                  handleToggleManualConf();
                }}
              />{' '}
              Manual configuration
            </label>
          </div>
          {manualConnect && (
            <>
              <div className="field">
                <div className="label">Server hostname or IP address</div>
                <div className="control">
                  <input
                    type="text"
                    value={host}
                    className="input"
                    onChange={(e) => setHost(e.currentTarget.value)}
                  />
                </div>
                <p className="help">
                  Regular servers only host one-on-one connections. Hub servers
                  host 3 or more connections.
                </p>
                <div>
                  <label className="checkbox" style={{ marginTop: 10 }}>
                    <input
                      checked={hub}
                      onChange={() => {
                        setHub(!hub);
                      }}
                      type="checkbox"
                    />{' '}
                    Hub connection
                  </label>
                </div>
              </div>
              <div className="field ">
                <div className="label">Audio settings</div>
                <div style={{ marginBottom: 10 }}>
                  Sample rate in (hertz) and buffer size (frames per period).
                </div>
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
                      <option value="" disabled>
                        Buffer size
                      </option>
                      {bufferSizes.map((e) => (
                        <option key={e} value={e}>
                          {e}fpp
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="help">
                  These must match the settings on the server.
                </div>
              </div>
            </>
          )}
          <hr />
        </>
      )}

      {!connect ? (
        <div className="pulled-right">
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConnect}
            className="button is-rounded is-success"
          >
            Connect
          </button>
        </div>
      ) : (
        <>
          <div className="pulled-right">
            <InputMonitoringButton />
            <button
              style={{ marginLeft: 10 }}
              type="button"
              onClick={handleDisconnect}
              className="button is-rounded is-danger"
            >
              Disconnect
            </button>
          </div>
          <ConnectionIndicator
            connected={connected}
            standbyMessage="connecting to server..."
            successMessage="connected!"
          />
          <div className="field">
            <div className="label">Log output</div>
            <textarea
              className="textarea has-background-dark has-text-success is-size-7"
              name="output"
              ref={outputElement}
              id="output"
              rows={20}
              style={{ width: '100%' }}
            />
            <LogButtons
              onClear={() => {
                outputElement.current.value = '';
              }}
              onCopy={() => {
                outputElement.current.select();
                document.execCommand('copy');
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ClientConnect;
