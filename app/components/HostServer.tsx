/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { shell } from 'electron';
import isPortReachable from 'is-port-reachable';
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
import LogButtons from './LogButtons';

const PortStatusIcon = ({ status }: { status: boolean | undefined }) => {
  return (
    <>
      {status === undefined ? (
        <i className="fas fa-spinner fa-spin" />
      ) : (
        <>
          {typeof status === 'boolean' && status ? (
            <i className="fas fa-check has-text-success" />
          ) : (
            <i className="fas fa-times has-text-danger" />
          )}
        </>
      )}
    </>
  );
};

const HostServer = () => {
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('48000');
  const [bufferSize, setBufferSize] = React.useState<string>('128');
  const [hub, setHub] = React.useState<boolean>(false);
  const [portOpen, setPortOpen] = React.useState<boolean>();
  const [hubPortOpen, setHubPortOpen] = React.useState<boolean>();

  const [serverStart, setServerStart] = React.useState<boolean>(false);

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
    if (host) {
      isPortReachable(connectionPort, { host })
        .then((e: boolean) => {
          setPortOpen(e);
          return e;
        })
        .catch(() => {});
      isPortReachable(hubConnectionPort, { host })
        .then((e: boolean) => {
          setHubPortOpen(e);
          return e;
        })
        .catch(() => {});
    }
  }, [host]);

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
        <ul className="is-size-7" style={{ marginTop: 10 }}>
          <li>
            Base port {connectionPort} open?{' '}
            <PortStatusIcon status={portOpen} />
          </li>
          <li>
            Hub port {hubConnectionPort} open?{' '}
            <PortStatusIcon status={hubPortOpen} />
          </li>
        </ul>
        {portOpen === false && (
          <div className="has-text-danger is-size-7" style={{ marginTop: 10 }}>
            <i className="fas fa-exclamation-circle" /> Port {connectionPort} is
            not accessible. To run a JackTrip server that can be accessed
            outside of your network, you must have this port open or forwarded.
            See{' '}
            <a
              className="has-text-danger"
              onClick={() => {
                shell.openExternal(
                  'https://en.wikipedia.org/wiki/Port_forwarding'
                );
              }}
            >
              this article
            </a>{' '}
            for help with port forwarding.
          </div>
        )}
      </div>
      <div className="field">
        <div className="label">Hub configuration</div>
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
          Regular servers only host one-on-one connections. Hub servers can also
          host 3 or more connections.
        </p>
        {hubPortOpen === false && hub && (
          <div className="has-text-danger is-size-7" style={{ marginTop: 10 }}>
            <i className="fas fa-exclamation-circle" /> Port {hubConnectionPort}{' '}
            is not accessible. To run in hub mode outside of your local network,
            you will need to open ports 61000, 61001, 61002 ... 61XXX and so on
            depending on how many concurrent connections you hope to support.
          </div>
        )}
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

      <hr />
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
            <p className="help">Send this code to the other side.</p>
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
            Start
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
              Disconnect
            </button>
          </div>
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
