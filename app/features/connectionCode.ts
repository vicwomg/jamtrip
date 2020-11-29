const generateConnectionCode = (
  host: string,
  sampleRate: number | string,
  bufferSize: number | string,
  hub: boolean
) => {
  const hubString = hub ? 'h' : 'c';
  return `${host}_${sampleRate}_${bufferSize}_${hubString}`;
};

export default generateConnectionCode;
