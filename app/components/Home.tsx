/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { shell } from 'electron';
import fs from 'fs';
import React from 'react';
import {
  jackConnectPath,
  jackDmpPath,
  jackLspPath,
  jackTripPath,
} from '../constants/constants';
import ClientConnect from './Client';
import HostServer from './HostServer';

const Home = () => {
  const [tab, setTab] = React.useState<'CLIENT' | 'SERVER'>('CLIENT');
  const [binariesExist, setBinariesExist] = React.useState<boolean>(true);

  const requiredBinaries = [
    jackTripPath,
    jackConnectPath,
    jackDmpPath,
    jackLspPath,
  ];

  React.useEffect(() => {
    const b = requiredBinaries.reduce((accumulator, currentValue) => {
      return accumulator && fs.existsSync(currentValue);
    }, true);
    setBinariesExist(b);
  }, [requiredBinaries]);

  return (
    <div className="section">
      <div className="container" data-tid="container">
        <div className="tabs">
          <ul>
            <li className={tab === 'CLIENT' ? 'is-active' : ''}>
              <a href="# " onClick={() => setTab('CLIENT')}>
                Connect to a server
              </a>
            </li>
            <li className={tab === 'SERVER' ? 'is-active' : ''}>
              <a href="# " onClick={() => setTab('SERVER')}>
                Host a server
              </a>
            </li>
          </ul>
        </div>

        {!binariesExist ? (
          <div className="notification is-danger">
            Some required files were not found. Have you installed JACK and
            JackTrip? For instructions, see the{' '}
            <a
              onClick={() => {
                shell.openExternal(
                  'https://ccrma.stanford.edu/software/jacktrip/'
                );
              }}
            >
              CCRMA web site
            </a>
            <h3 style={{ marginTop: 10 }}>
              <b>Required files:</b>
            </h3>
            <ul>
              {requiredBinaries.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            {tab === 'CLIENT' && <ClientConnect />}
            {tab === 'SERVER' && <HostServer />}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
