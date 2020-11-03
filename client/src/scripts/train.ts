type Pattern = RegExp | string;

const stats: any = null;
const navigation: any = null;

function watch(pattern: Pattern | Pattern[], handler: () => void) {
  return { remove() {} };
}

function expect(pattern: Pattern) {
  return {
    then(handler: Function) {},
    timeout(seconds: number) {},
    wait(seconds: number) {},
  };
}

// ----------------------

export async function train() {
  let isGoingSouth = true;
  let isFighting = false;

  const hunt = (target: string) => () => {
    isFighting = true;
    // TODO: FIGHT
    console.log(`matar ${target}`);
    isFighting = false;
    navigateArena();
  };

  await goToArena();
  const listeners = prepareToFight();
  await navigateArena();

  listeners.forEach(x => x.remove());

  async function navigateArena(): Promise<any> {
    const dir = isGoingSouth ? 'sur' : 'norte';

    if (navigation.hasExit(dir)) {
      await navigation.go(dir);
    } else if (navigation.hasExit('este')) {
      isGoingSouth = !isGoingSouth;
      await navigation.go('este');
    } else if (!isFighting) {
      return navigateArena();
    }
  }

  function prepareToFight() {
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

async function goToArena() {
  await navigation.recall();
  await navigation.execute('ds');
}
