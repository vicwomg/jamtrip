/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { shell } from 'electron';
import fs from 'fs';
import React from 'react';
import {
  jackConnectPath,
  jackDmpPath,
  jackTripPath,
} from '../constants/constants';
import ConnectionCode from './Client';
import HostServer from './HostServer';

const Home = () => {
  const [tab, setTab] = React.useState<'CLIENT' | 'SERVER'>('CLIENT');
  const [binariesExist, setBinariesExist] = React.useState<boolean>(true);

  React.useEffect(() => {
    setBinariesExist(
      fs.existsSync(jackTripPath) &&
        fs.existsSync(jackConnectPath) &&
        fs.existsSync(jackDmpPath)
    );
  }, []);

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
            JACK or JackTrip binaries were not found. Have you installed them?
            For instructions, see the{' '}
            <a
              onClick={() => {
                shell.openExternal(
                  'https://ccrma.stanford.edu/software/jacktrip/osx/index.html'
                );
              }}
            >
              CCRMA web site
            </a>
          </div>
        ) : (
          <>
            {tab === 'CLIENT' && <ConnectionCode />}
            {tab === 'SERVER' && <HostServer />}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
