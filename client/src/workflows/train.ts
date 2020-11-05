import { Context } from './../lib/workflow/Context';

export async function train({
  watch,
  invokeWorkflow,
  plugins: { navigation: nav },
}: Context) {
  const enemies: string[] = [];
  let isFighting = false;
  let direction = 'sur';

  await nav.recall();
  await nav.go('abajo');

  const hunt = (prey: string) => () => enemies.push(prey);

  watch(
    [
      'Un pequenyo caracol esta aqui haciendo trompos.',
      'El pequenyo caracol llega desde el',
    ],
    hunt('pequenyo caracol'),
  );

  watch(
    ['Un buitre carronyero esta aqui.', 'El buitre carronyero llega desde el'],
    hunt('buitre carronyero'),
  );

  watch(
    [
      'Un lobo hambriento te esta mirando.',
      'El lobo hambriento llega desde el',
    ],
    hunt('lobo hambriento'),
  );

  watch(
    [
      'Una serpiente que parece venenosa te mira fijamente.',
      'La serpiente llega desde el',
    ],
    hunt('serpiente'),
  );

  return nextRoom();

  async function nextRoom(): Promise<any> {
    while (enemies.length) {
      await fight(enemies.pop()!);
    }

    if (nav.canGo(direction)) {
      await nav.go(direction);
    } else if (nav.canGo('este')) {
      await nav.go('este');
      direction = direction === 'sur' ? 'norte' : 'sur';
    } else {
      return;
    }

    return nextRoom();
  }

  async function fight(prey: string) {
    console.log('FIGHT STARTS');
    isFighting = true;
    await invokeWorkflow('fight', [prey]);
    isFighting = false;
    console.log('FIGHT ENDS');
  }
}
