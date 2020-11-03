import { Mud } from '../Mud';

type Pattern = RegExp | string;

function watch(pattern: Pattern | Pattern[], handler: () => void) {
  return { remove() {} };
}

function invokeWorkflow(name: string, args?: any[]) {
  return Promise.resolve();
}

function waitFor(pattern: Pattern | Pattern[]) {
  return {
    then(handler: Function) {},
    timeout(seconds: number) {},
    wait(seconds: number) {},
  };
}

const plugins: Mud['machines'] = null as any;

// ----------------------

export async function train() {
  const { navigation: nav } = plugins;

  let isFighting = false;
  let direction = 'sur';

  await nav.recall();
  await nav.go('abajo');

  prepareToFight((target: string) => async () => {
    isFighting = true;
    await invokeWorkflow('fight', [target]);
    isFighting = false;
    nextRoom();
  });

  return nextRoom();

  async function nextRoom(): Promise<any> {
    if (nav.canGo(direction)) {
      await nav.go(direction);
    } else if (nav.canGo('east')) {
      await nav.go('east');
      direction = direction === 'sur' ? 'norte' : 'sur';
    } else {
      return;
    }

    if (!isFighting) {
      return nextRoom();
    }
  }

  function prepareToFight(hunt: (target: string) => () => Promise<any>) {
    return [
      watch(
        [
          'Un pequenyo caracol esta aqui haciendo trompos.',
          'El pequenyo caracol llega desde el',
        ],
        hunt('pequenyo caracol'),
      ),
      watch(
        [
          'Un buitre carronyero esta aqui.',
          'El buitre carronyero llega desde el',
        ],
        hunt('buitre carronyero'),
      ),
      watch(
        [
          'Un lobo hambriento te esta mirando.',
          'El lobo hambriento llega desde el',
        ],
        hunt('lobo hambriento'),
      ),
      watch(
        [
          'Una serpiente que parece venenosa te mira fijamente.',
          'La serpiente llega desde el',
        ],
        hunt('serpiente'),
      ),
    ];
  }
}
