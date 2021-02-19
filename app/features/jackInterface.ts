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
      jackDisconnect: `${basePath}jack_disconnect.exe`,
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
      jackDisconnect: `${basePath}jack_disconnect`,
      jackDmp: `${basePath}jackdmp`,
      jackLsp: `${basePath}jack_lsp`,
      jackTrip: path.join(
        BIN_PATH,
        `/darwin/${
          semver.gte(kernelVersion, '15.0.0') ? 'jacktrip' : 'jacktrip_1.1'
        }`
      ),
    };
  }
  // Linux users must install jacktrip manually. Assume linux default dist binary dir
  const basePath = '/usr/bin/';
  return {
    jackConnect: `${basePath}jack_connect`,
    jackDisconnect: `${basePath}jack_disconnect`,
    jackDmp: `${basePath}jackd`,
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
      return ['-d', 'alsa'];
  }
};

const paramsToString = (params: string[]) => {
  return params.toString().replaceAll(',', ' ');
};

export const startJackdmp = (bufferSize: string, sampleRate: string) => {
  const params = getDeviceParams().concat([
    '-o',
    '2',
    '-p',
    bufferSize,
    '-r',
    sampleRate,
  ]);
  return {
    command: `** ${paths.jackDmp} ${paramsToString(params)}`,
    process: spawn(paths.jackDmp, params),
  };
};

export const isJackServerRunning = () => {
  // jack_lsp will return an error if jack server isn't running
  const proc = spawnSync(paths.jackLsp);
  return proc.status === 0;
};

export const startJackTripClient = (
  host: string,
  hub: boolean,
  queueBuffer: string,
  bits: string,
  redundancy: string
) => {
  const params = [
    '-n',
    '2',
    '-z',
    '-q',
    queueBuffer,
    '-b',
    bits,
    '-r',
    redundancy || '1',
    hub ? '-C' : '-c',
    host,
  ];
  // const params = ['-n', '1', '-z', hub ? '-C' : '-c', host];
  return {
    command: `** ${paths.jackTrip} ${paramsToString(params)}`,
    process: spawn(paths.jackTrip, params),
  };
};

export const startJackTripServer = (
  hub: boolean,
  queueBuffer: string,
  bits: string,
  hubPatchMode?: string,
  redundancy?: string
) => {
  const params = [
    hub ? '-S' : '-s',
    '-p',
    hubPatchMode || '2',
    '-n',
    '2',
    '-q',
    queueBuffer,
    '-b',
    bits,
    '-z',
    '-r',
    redundancy || '1',
  ];
  return {
    command: `** ${paths.jackTrip} ${paramsToString(params)}`,
    process: spawn(paths.jackTrip, params),
  };
};

export const connectChannel = (source: string, destination: string) => {
  const result = spawnSync(paths.jackConnect, [source, destination]);
  return `** Connecting '${source}' to '${destination}'.\n${
    !!result.stderr && `stderr: ${result.stderr}`
  }`;
};

export const disconnectChannel = (source: string, destination: string) => {
  const result = spawnSync(paths.jackDisconnect, [source, destination]);
  return `** Disconnecting '${source}' from '${destination}'.\n${!!result.stdout}${
    result.stderr && `stderr: ${result.stderr}`
  }`;
};

export const configureInputMonitoring = (inputMonitoring: boolean) => {
  let output = '';
  if (inputMonitoring) {
    output += `${connectChannel('system:capture_1', 'system:playback_1')}\n`;
    output += `${connectChannel('system:capture_1', 'system:playback_2')}\n`;
    output += `${connectChannel('system:capture_2', 'system:playback_1')}\n`;
    output += `${connectChannel('system:capture_2', 'system:playback_2')}\n`;
  } else {
    output += `${disconnectChannel('system:capture_1', 'system:playback_1')}\n`;
    output += `${disconnectChannel('system:capture_1', 'system:playback_2')}\n`;
    output += `${disconnectChannel('system:capture_2', 'system:playback_1')}\n`;
    output += `${disconnectChannel('system:capture_2', 'system:playback_2')}\n`;
  }
  return output;
};

export const getHubClients = () => {
  const result = spawnSync(paths.jackLsp);
  const output = result.stdout.toString().split('\n');
  const sendChannels = Array<string>();
  const receiveChannels = Array<string>();
  output.forEach((e) => {
    if (e.includes('send_')) {
      sendChannels.push(e);
    }
    if (e.includes('receive_')) {
      receiveChannels.push(e);
    }
  });
  return {
    sendChannels,
    receiveChannels,
  };
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
  spawnSync('killall', ['jackd']);
};
