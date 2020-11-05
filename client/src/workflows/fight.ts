import { Context } from '../lib/workflow/Context';

export async function fight(
  { watch, write, waitFor, plugins: { prompt, navigation } }: Context,
  target: string,
) {
  let isTargetDead = true;

  watch(
    [
      new RegExp(`Tu (?<attack>\\w+) (?<effect>\\w+) a( |\\w)+ ${target}.`),
      new RegExp(`El ataque de( |\\w)+ ${target} te (?<effect>\w+).`),
    ],
    update,
  );

  write(`kill ${target}`);

  await Promise.race([
    waitFor(`${target} ha MUERTO!!`).then(() => (isTargetDead = true)),
    waitFor('Huyes como un cobarde del combate.'),
    navigation.waitForRecall(),
  ]);

  async function update() {
    if (prompt.isInDanger) {
      await navigation.recall();
    } else if (prompt.isExhausted || prompt.needsHospital) {
      write('huir');
    }
  }
}
