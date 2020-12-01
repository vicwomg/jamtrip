import settings from 'electron-settings';

export const setPersistence = (
  key: string,
  value: string | boolean,
  onSuccess?: () => void
) => {
  settings
    .set(key, typeof value === 'boolean' ? value.toString() : value)
    .then(onSuccess)
    .catch(() => null);
};

export const getPersistence = (
  key: string,
  onSuccess?: (val: string) => void
) => {
  settings
    .get(key)
    .then((value) => {
      return value && onSuccess && onSuccess(value as string);
    })
    .catch(() => null);
};
