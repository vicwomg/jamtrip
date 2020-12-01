import { spawn, spawnSync } from 'child_process';
import { paths } from '../constants/constants';

const getDeviceParams = () => {
  switch (process.platform) {
    case 'win32':
      return ['-d', 'portaudio', '-d', 'ASIO::ASIO4ALL v2'];
    case 'darwin':
      return ['-d', 'coreaudio'];
    default:
      return [];
  }
};

export const startJackdmp = (bufferSize: string, sampleRate: string) => {
  return spawn(
    paths.jackDmp,
    getDeviceParams().concat(['-o', '2', '-p', bufferSize, '-r', sampleRate])
  );
};

export const isJackServerRunning = () => {
  // jack_lsp will return an error if jack server isn't running
  const proc = spawnSync(paths.jackLsp);
  return proc.status === 0;
};

export const startJackTripClient = (host: string, hub: boolean) => {
  return spawn(paths.jackTrip, [hub ? '-C' : '-c', host]);
};

export const startJackTripServer = (
  hub: boolean,
  queueBuffer: string,
  bits: string
) => {
  return spawn(paths.jackTrip, [
    hub ? '-S' : '-s',
    '-q',
    queueBuffer,
    '-b',
    bits,
  ]);
};

export const connectChannel = (source: string, destination: string) => {
  return spawnSync(paths.jackConnect, [source, destination]);
};

export const killProcesses = () => {
  if (process.platform === 'win32') {
    spawnSync('Taskkill', ['/IM', 'jacktrip.exe', '/F']);
    spawnSync('Taskkill', ['/IM', 'jack_connect.exe', '/F']);
    spawnSync('Taskkill', ['/IM', 'jackd.exe', '/F']);
  }
  spawnSync('killall', ['jacktrip']);
  spawnSync('killall', ['jack_connect']);
  spawnSync('killall', ['jackdmp']);
};
