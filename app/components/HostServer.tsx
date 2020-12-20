/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ChildProcessWithoutNullStreams } from 'child_process';
import classnames from 'classnames';
import { shell } from 'electron';
import publicIp from 'public-ip';
import React from 'react';
import {
  bitResolution,
  bufferSizes,
  connectionPort,
  hubConnectionPort,
  // eslint-disable-next-line prettier/prettier
  sampleRates
} from '../constants/constants';
import { generateConnectionCode } from '../features/connectionCode';
import {
  configureInputMonitoring,
  connectChannel,
  isJackServerRunning,
  killProcesses,
  startJackdmp,
  // eslint-disable-next-line prettier/prettier
  startJackTripServer
} from '../features/jackInterface';
import { getPersistence, setPersistence } from '../features/persistence';
import sendProcessOutput from '../features/sendProcessOutput';
import ConnectionIndicator from './ConnectionIndicator';
import InputMonitoringButton from './InputMonitoring';
import LogButtons from './LogButtons';

const HostServer = () => {
  // Server settings
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('48000');
  const [bufferSize, setBufferSize] = React.useState<string>('256');
  const [queueLength, setQueueLength] = React.useState<string>('4');
  const [redundancy, setRedundancy] = React.useState<string>('1');
  const [bitRate, setBitRate] = React.useState<string>('16');
  const [hub, setHub] = React.useState<boolean>(false);
  const [hubPatchMode, setHubPatchMode] = React.useState<string>('2');

  // UI
  const [showLog, setShowLog] = React.useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);

  const [serverStart, setServerStart] = React.useState<boolean>(false);
  const [connected, setConnected] = React.useState<boolean>(false);
  const [codeCopied, setCodeCopied] = React.useState<boolean>(false);

  const [pollJack, setPollJack] = React.useState<NodeJS.Timeout>();
  const [pollConnection, setPollConnection] = React.useState<NodeJS.Timeout>();

  const connectionCodeRef = React.useRef<HTMLInputElement>(null);
  const outputLogRef = React.useRef<HTMLTextAreaElement>(null);

  const sendLog = (output: string | ChildProcessWithoutNullStreams) => {
    if (outputLogRef) {
      sendProcessOutput(outputLogRef, output);
    }
  };

  const clearLog = () => {
    if (outputLogRef.current) {
      outputLogRef.current.value = '';
    }
  };

  const stopPolling = () => {
    if (pollConnection) {
      clearInterval(pollConnection);
      setPollConnection(undefined);
    }
    if (pollJack) {
      clearInterval(pollJack);
      setPollJack(undefined);
    }
  };

  React.useEffect(() => {
    // load persisted values if they exist
    getPersistence('server_sample_rate', (value) => {
      setSampleRate(value);
    });
    getPersistence('server_buffer_size', (value) => {
      setBufferSize(value);
    });
    getPersistence('server_bit_resolution', (value) => {
      setBitRate(value);
    });
    getPersistence('server_queue_length', (value) => {
      setQueueLength(value);
    });
    getPersistence('server_packet_redundancy', (value) => {
      setRedundancy(value);
    });
    getPersistence('server_hub_patch_mode', (value) => {
      setHubPatchMode(value);
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
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    killProcesses();
    clearLog();
    setShowLog(true);
    setServerStart(true);

    const jackdmp = startJackdmp(bufferSize, sampleRate);
    sendLog(jackdmp.command);
    sendLog(jackdmp.process);

    const j = setInterval(() => {
      if (isJackServerRunning()) {
        // Start jacktrip after jack is confirmed running
        // enable / disable input monitoring after jack launches
        getPersistence('direct_input_monitoring', (value) => {
          if (value === 'true') {
            configureInputMonitoring(true);
          }
        });
        const jacktrip = startJackTripServer(
          hub,
          queueLength,
          bitRate,
          hubPatchMode,
          redundancy
        );
        sendLog(jacktrip.command);
        sendLog(jacktrip.process);
        clearInterval(j);
        setPollJack(undefined);
      }
    }, 1000);
    setPollJack(j);

    // poll for connection success, and connect channels on success
    const i = setInterval(() => {
      if (
        outputLogRef.current &&
        outputLogRef.current.value.includes('Received Connection from Peer!')
      ) {
        sendLog(connectChannel('system:capture_1', 'JackTrip:send_1'));
        sendLog(connectChannel('system:capture_2', 'JackTrip:send_1'));
        sendLog(connectChannel('JackTrip:receive_1', 'system:playback_1'));
        sendLog(connectChannel('JackTrip:receive_1', 'system:playback_2'));
        setConnected(true);
        clearInterval(i);
        setPollConnection(undefined);
      }
    }, 1000);
    setPollConnection(i);
  };

  const handleDisconnect = () => {
    killProcesses();
    setConnected(false);
    setServerStart(false);
    stopPolling();
  };

  const isValid =
    !!host && !!sampleRate && !!bufferSize && typeof hub === 'boolean';

  return (
    <>
      {!serverStart && (
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
              Servers require UDP port {connectionPort} to be open to the
              internet. Hub mode also needs ports {hubConnectionPort},{' '}
              {hubConnectionPort + 1}, {hubConnectionPort + 2}... for each
              connection. See{' '}
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
                    setPersistence('server_sample_rate', r, () =>
                      setSampleRate(r)
                    );
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
                    setPersistence('server_buffer_size', r, () =>
                      setBufferSize(r)
                    );
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
              Increasing sample rate lowers latency, but increases bandwidth
              use. Decreasing buffer size lowers latency but introduces more
              audio glitches. Default: 48000hz / 256fpp
            </p>
          </div>

          <div className="field ">
            <div className="label">
              Advanced settings&nbsp;&nbsp;
              <a
                className="has-text-link is-size-7"
                href="# "
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <>
                    <i className="fas fa-angle-up" /> hide
                  </>
                ) : (
                  <>
                    <i className="fas fa-angle-down" /> show
                  </>
                )}
              </a>
            </div>

            <div className={classnames({ 'is-hidden': !showAdvanced })}>
              <div className="is-flex" style={{ alignItems: 'center' }}>
                <input
                  className="input is-small"
                  type="number"
                  value={queueLength}
                  style={{ width: 60 }}
                  onChange={(b) => {
                    const r = b.currentTarget.value;
                    setPersistence('server_queue_length', r, () =>
                      setQueueLength(r)
                    );
                  }}
                />
                <p className="help" style={{ marginLeft: 10, marginTop: 0 }}>
                  <b>Queue buffer length</b> in packet size. If your connection
                  is very unstable, with a lot of jitter, increase this number
                  at the expense of a higher latency. Default: 4
                </p>
              </div>
              <div
                className="is-flex"
                style={{ alignItems: 'center', marginTop: 5 }}
              >
                <div className="select is-small" style={{}}>
                  <select
                    value={bitRate}
                    onChange={(b) => {
                      const r = b.currentTarget.value;
                      setPersistence('server_bit_resolution', r, () =>
                        setBitRate(r)
                      );
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
                  increase) the bandwidth requirements, at the expense of a
                  lower audio quality. Default: 16
                </p>
              </div>
              <div className="is-flex" style={{ alignItems: 'center' }}>
                <input
                  className="input is-small"
                  type="number"
                  value={redundancy}
                  style={{ width: 60 }}
                  onChange={(b) => {
                    const r = b.currentTarget.value;
                    setPersistence('server_packet_redundancy', r, () =>
                      setRedundancy(r)
                    );
                  }}
                />
                <p className="help" style={{ marginLeft: 10, marginTop: 0 }}>
                  <b>Packet redundancy</b> amount of redundant data packets to
                  send, increasing it will reduce audio glitches, but multiply
                  the amount of required bandwidth. Default: 1
                </p>
              </div>
              <div
                className="is-flex"
                style={{ alignItems: 'center', marginTop: 5 }}
              >
                <div className="select is-small" style={{}}>
                  <select
                    value={hubPatchMode}
                    onChange={(b) => {
                      const r = b.currentTarget.value;
                      setPersistence('server_hub_patch_mode', r, () =>
                        setHubPatchMode(r)
                      );
                    }}
                  >
                    <option disabled>Hub patch</option>
                    <option key="0" value="0">
                      0: Client only hears server
                    </option>
                    <option key="1" value="1">
                      1: Client only hears self
                    </option>
                    <option key="2" value="2">
                      2: Client hears all except self
                    </option>
                    <option key="4" value="4">
                      4: Full mix
                    </option>
                  </select>
                </div>
                <p className="help" style={{ marginLeft: 10, marginTop: 0 }}>
                  <b>Hub patch mode</b> audio routing modes (for hub sessions
                  only). You will probably want to stick to the default: 2
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {serverStart && (
        <>
          <div className="label">Server details</div>
          <div className="is-size-7" style={{ marginBottom: 10 }}>
            <b>Host</b>: {host}&nbsp;&nbsp;&nbsp;<b>Hub</b>: {hub.toString()}{' '}
            <br />
            <b>Sample rate</b>: {sampleRate} hz&nbsp;&nbsp;&nbsp;
            <b>Buffer size</b>: {bufferSize} fpp <br /> <b>Queue length</b>:{' '}
            {queueLength}&nbsp;&nbsp;&nbsp;
            <b>Bits</b>: {bitRate}&nbsp;&nbsp;&nbsp;<b>Redundancy</b>:{' '}
            {redundancy}
          </div>
        </>
      )}
      {isValid && (
        <>
          <div className="box has-background-grey-lighter">
            <div className="label">Connection code</div>
            <div className="field has-addons">
              <div className="control">
                <input
                  className="input"
                  readOnly
                  style={{ width: 320 }}
                  ref={connectionCodeRef}
                  value={generateConnectionCode(
                    host,
                    sampleRate,
                    bufferSize,
                    hub,
                    queueLength,
                    bitRate,
                    redundancy
                  )}
                />
              </div>
              <div className="control">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    if (connectionCodeRef.current) {
                      connectionCodeRef.current.select();
                      document.execCommand('copy');
                      setCodeCopied(true);
                      setTimeout(() => {
                        setCodeCopied(false);
                      }, 2000);
                    }
                  }}
                >
                  <i className="fas fa-copy" />
                  &nbsp;{codeCopied ? 'copied!' : 'copy'}
                </button>
              </div>
            </div>
            <p className="help">
              Send this code to the other folks. Note: the code changes if you
              modify audio settings.
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
        </>
      )}

      <div className={classnames('field', { 'is-hidden': !showLog })}>
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
            clearLog();
          }}
          onCopy={() => {
            if (outputLogRef.current) {
              outputLogRef.current.select();
              document.execCommand('copy');
            }
          }}
          onHide={() => {
            setShowLog(false);
          }}
        />
      </div>
    </>
  );
};

export default HostServer;
