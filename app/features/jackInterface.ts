import { spawn, spawnSync } from 'child_process';
import { isPackaged } from 'electron-is-packaged';
import os from 'os';
import path from 'path';
import semver from 'semver';

const BIN_PATH = isPackaged
  ? path.join(process.resourcesPath, 'resources', 'bin')
  : path.join(__dirname, '../resources/bin');

const getJackPaths = () => {
  const ostype = process.platform;
  if (ostype === 'win32') {
    const basePath = 'C:\\Program Files (x86)\\Jack\\';
    return {
      jackConnect: `${basePath}jack_connect.exe`,
      jackDmp: `${basePath}jackd.exe`,
      jackLsp: `${basePath}jack_lsp.exe`,
      jackTrip: path.join(BIN_PATH, 'win32', 'jacktrip.exe'),
    };
  }
  if (ostype === 'darwin') {
    const basePath = '/usr/local/bin/';
    const kernelVersion = os.release();
    // versions older than high sierra (kernel 17.0.0.0) use jacktrip 1.1
    return {
      jackConnect: `${basePath}jack_connect`,
      jackDmp: `${basePath}jackdmp`,
      jackLsp: `${basePath}jack_lsp`,
      jackTrip: path.join(
        BIN_PATH,
        `/darwin/${
          semver.gte(kernelVersion, '17.0.0') ? 'jacktrip' : 'jacktrip_1.1'
        }`
      ),
    };
  }
  // Linux users must install jacktrip manually. Assume linux default dist binary dir
  const basePath = '/usr/bin/';
  return {
    jackConnect: `${basePath}jack_connect`,
    jackDmp: `${basePath}jackdmp`,
    jackLsp: `${basePath}jack_lsp`,
    jackTrip: `${basePath}jacktrip`,
  };
};

export const paths = getJackPaths();

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
    spawnSync('taskkill', ['/IM', 'jacktrip.exe', '/F']);
    spawnSync('taskkill', ['/IM', 'jack_connect.exe', '/F']);
    spawnSync('taskkill', ['/IM', 'jackd.exe', '/F']);
  }
  spawnSync('killall', ['jacktrip']);
  spawnSync('killall', ['jack_connect']);
  spawnSync('killall', ['jackdmp']);
};
