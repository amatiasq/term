export function getQueryParams() {
  const result: { [key: string]: string } = {};

  window.location.search
    .substr(1)
    .split('&')
    .map(entry => entry.split('=').map(decodeURIComponent))
    .forEach(([key, value]) => (result[key] = value));

  return result;
}
