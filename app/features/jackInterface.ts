import { spawn } from 'child_process';
import {
  jackConnectPath,
  jackDmpPath,
  jackTripPath,
} from '../constants/constants';

export const startJackdmp = (bufferSize: string, sampleRate: string) => {
  return spawn(jackDmpPath, [
    '-d',
    'coreaudio',
    '-o',
    '2',
    '-p',
    bufferSize,
    '-r',
    sampleRate,
  ]);
};

export const startJackTripClient = (host: string, hub: boolean) => {
  return spawn(jackTripPath, [hub ? '-C' : '-c', host]);
};

export const startJackTripServer = (hub: boolean) => {
  return spawn(jackTripPath, [hub ? '-S' : '-s']);
};

export const connectChannel = (source: string, destination: string) => {
  return spawn(jackConnectPath, [source, destination]);
};

export const killProcesses = () => {
  spawn('killall', ['jackdmp']);
  spawn('killall', ['jacktrip']);
};
