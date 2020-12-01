import { spawn, spawnSync } from 'child_process';
import {
  jackConnectPath,
  jackDmpPath,
  jackLspPath,
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

export const isJackServerRunning = () => {
  // jack_lsp will return an error if jack server isn't running
  const proc = spawnSync(jackLspPath);
  return proc.status === 0;
};

export const startJackTripClient = (host: string, hub: boolean) => {
  return spawn(jackTripPath, [hub ? '-C' : '-c', host]);
};

export const startJackTripServer = (
  hub: boolean,
  queueBuffer: string,
  bits: string
) => {
  return spawn(jackTripPath, [
    hub ? '-S' : '-s',
    '-q',
    queueBuffer,
    '-b',
    bits,
  ]);
};

export const connectChannel = (source: string, destination: string) => {
  return spawn(jackConnectPath, [source, destination]);
};

export const killProcesses = () => {
  spawnSync('killall', ['jackdmp']);
  spawnSync('killall', ['jacktrip']);
};
