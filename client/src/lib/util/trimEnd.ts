export function trimEnd(value: string, maxLength: number) {
  return value.length > maxLength
    ? value.substr(value.length - maxLength)
    : value;
}
