export const generateConnectionCode = (
  host: string,
  sampleRate: number | string,
  bufferSize: number | string,
  hub: boolean,
  queueBuffer: number | string,
  bitRate: number | string,
  redundancy: number | string
) => {
  const hubString = hub ? 'h' : 'c';
  return `${host}_${sampleRate}_${bufferSize}_${hubString}_b${bitRate}_q${queueBuffer}_r${redundancy}`;
};

export const decodeConnectionCode = (code: string) => {
  const params = code.split('_');
  if (params.length >= 7) {
    return {
      host: params[0],
      sampleRate: params[1],
      bufferSize: params[2],
      hub: params[3] === 'h',
      bitRate: params[4].replace('b', ''),
      queue: params[5].replace('q', ''),
      redundancy: params[6].replace('r', ''),
    };
  }
  return null;
};
