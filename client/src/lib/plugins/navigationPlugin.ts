import { PluginContext } from './../engine/PluginContext';

export function navigationPlugin({ watch, waitFor, write }: PluginContext) {
  let isNavigating = false;
  let directions: string[] = [];

  watch(/\nSalidas: ([^\.]+)/, ({ captured }) => {
    directions = captured[1].split(' ');
    isNavigating = false;
  });

  return {
    recall,
    canGo,
    go,
    execute,

    get isNavigating() {
      return isNavigating;
    },
  };

  function recall() {
    write('recall');
    return waitFor('Plaza de Darkhaven').wait(1);
  }

  function canGo(direction: string) {
    return Boolean(get(direction));
  }

  function isClosed(direction: string) {
    return get(direction)?.includes('(cerrada)');
  }

  async function execute(pattern: string) {
    for (const step of pattern) {
      await go(step);
    }
  }

  async function go(direction: string) {
    const dir = get(direction);

    if (!dir) {
      throw new Error(`Unknown direction '${direction}'`);
    }

    if (isClosed(direction)) {
      write(`abrir ${direction}`);
      await waitFor('Abres la puerta.');
    }

    write(direction);
    isNavigating = true;
    await waitFor('\nSalidas: ');
  }

  function get(direction: string) {
    return directions.find(x => x.startsWith(direction));
  }
}