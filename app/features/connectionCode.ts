export const generateConnectionCode = (
  host: string,
  sampleRate: number | string,
  bufferSize: number | string,
  hub: boolean
) => {
  const hubString = hub ? 'h' : 'c';
  return `${host}_${sampleRate}_${bufferSize}_${hubString}`;
};

export const decodeConnectionCode = (code: string) => {
  const params = code.split('_');
  if (params.length === 4) {
    return {
      host: params[0],
      sampleRate: params[1],
      bufferSize: params[2],
      hub: params[3] === 'h',
    };
  }
  return null;
};
