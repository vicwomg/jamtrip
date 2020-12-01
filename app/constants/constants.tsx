export const sampleRates = [22050, 32000, 44100, 48000, 88200, 96000, 192000];
export const bufferSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
export const bitResolution = [8, 16, 24, 32];

const getJackPaths = () => {
  const ostype = process.platform;
  if (ostype === 'win32') {
    const basePath = 'C:\\Program Files (x86)\\Jack\\';
    return {
      jackConnect: `${basePath}jack_connect.exe`,
      jackDmp: `${basePath}jackd.exe`,
      jackLsp: `${basePath}jack_lsp.exe`,
      jackTrip: `${basePath}jacktrip.exe`,
    };
  }
  const basePath = '/usr/local/bin/';
  return {
    jackConnect: `${basePath}jack_connect`,
    jackDmp: `${basePath}jackdmp`,
    jackLsp: `${basePath}jack_lsp`,
    jackTrip: `${basePath}jacktrip`,
  };
};

export const paths = getJackPaths();

export const connectionPort = 4464;
export const hubConnectionPort = 61000;
