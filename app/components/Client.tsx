/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { bufferSizes, sampleRates } from '../constants/constants';
import {
  connectChannel,
  killProcesses,
  startJackdmp,
  startJackTripClient,
} from '../features/jackInterface';
import sendProcessOutput from '../features/sendProcessOutput';
import LogButtons from './LogButtons';

const ConnectionCode = () => {
  const [host, setHost] = React.useState<string>('');
  const [sampleRate, setSampleRate] = React.useState<string>('');
  const [bufferSize, setBufferSize] = React.useState<string>('');
  const [hub, setHub] = React.useState<boolean>(false);
  const [connectionCode, setConnectionCode] = React.useState<string>('');
  const [manualConnect, setManualConnect] = React.useState<boolean>(false);

  const [connect, setConnect] = React.useState<boolean>(false);

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
    const params = connectionCode.split('_');
    if (params.length === 4) {
      setHost(params[0]);
      setSampleRate(params[1]);
      setBufferSize(params[2]);
      setHub(params[3] === 'h');
    } else {
      clearSettings();
    }
  }, [connectionCode]);

  const outputElement = React.useRef(null);

  const handleConnect = () => {
    killProcesses();
    setConnect(true);
    const jackdmp = startJackdmp(bufferSize, sampleRate);
    sendProcessOutput(outputElement, jackdmp);

    setTimeout(() => {
      const jacktrip = startJackTripClient(host, hub);
      sendProcessOutput(outputElement, jacktrip);
    }, 2000);

    setTimeout(() => {
      const jackConnect1 = connectChannel(
        'system:capture_1',
        'system:playback_1'
      );
      sendProcessOutput(outputElement, jackConnect1);
      const jackConnect2 = connectChannel(
        'system:capture_1',
        'system:playback_2'
      );
      sendProcessOutput(outputElement, jackConnect2);
      const jackConnect3 = connectChannel(
        `${host}:receive_1`,
        'system:playback_1'
      );
      sendProcessOutput(outputElement, jackConnect3);
      const jackConnect4 = connectChannel(
        `${host}:receive_1`,
        'system:playback_2'
      );
      sendProcessOutput(outputElement, jackConnect4);
      const jackConnect5 = connectChannel(`system:capture_1`, `${host}:send_1`);
      sendProcessOutput(outputElement, jackConnect5);
    }, 4000);
  };

  const handleDisconnect = () => {
    killProcesses();
    setConnect(false);
  };

  const handleToggleManualConf = () => {
    clearSettings();
    codeInputElement.current.value = '';
    setConnectionCode('');
    setManualConnect(!manualConnect);
  };

  return (
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
            onClick={handleToggleManualConf}
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
                className="input"
                onChange={(e) => setHost(e.currentTarget.value)}
              />
            </div>
            <p className="help">
              Regular servers only host one-on-one connections. Hub servers host
              3 or more connections.
            </p>
            <div>
              <label className="checkbox" style={{ marginTop: 10 }}>
                <input
                  checked={hub}
                  onClick={() => {
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
              ref={outputElement}
              id="output"
              rows={12}
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

export default ConnectionCode;
