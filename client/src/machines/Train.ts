import { FightMachine } from './FightMachine';
import { Mud } from './../Mud';

export class TrainMachine {
  private fightMachine: FightMachine | null = null;
  private isGoingSouth = true;
  private isDone = false;
  private fightListeners: (() => boolean)[] = [];

  get isFighting() {
    return this.fightMachine;
  }

  get nav() {
    return this.mud.get('navigation');
  }

  get stats() {
    return this.mud.get('stats');
  }

  constructor(private readonly mud: Mud) {}

  async start() {
    await this.goToArena();
    this.prepareToFight();
    await this.navigateArena();
    this.finish();
  }

  private async navigateArena(): Promise<any> {
    const dir = this.isGoingSouth ? 'sur' : 'norte';

    if (this.nav.hasExit(dir)) {
      await this.nav.go(dir);
    } else if (this.nav.hasExit('este')) {
      this.isGoingSouth = !this.isGoingSouth;
      await this.nav.go('este');
    } else {
      return;
    }

    if (!this.isFighting && !this.isDone) {
      return this.navigateArena();
    }
  }

  private async goToArena() {
    await this.nav.recall();
    await this.nav.go('abajo');
    await this.nav.go('sur');
  }

  private prepareToFight() {
    this.fightListeners = [
      ...this.hunt('pequenyo caracol', [
        'Un pequenyo caracol esta aqui haciendo trompos.',
        'El pequenyo caracol llega desde el',
      ]),
      ...this.hunt('buitre carronyero', [
        'Un buitre carronyero esta aqui.',
        'El buitre carronyero llega desde el',
      ]),
      ...this.hunt('lobo hambriento', [
        'Un lobo hambriento te esta mirando.',
        'El lobo hambriento llega desde el',
      ]),
      ...this.hunt('serpiente', [
        'Una serpiente que parece venenosa te mira fijamente.',
        'La serpiente llega desde el',
      ]),
    ];
  }

  private hunt(name: string, triggers: string[]) {
    return triggers.map(x => this.mud.when(x, () => this.fight(name)));
  }

  private async fight(target: string) {
    this.fightMachine = new FightMachine(this.mud, target);
    await this.fightMachine.start();
    this.fightMachine = null;
    this.navigateArena();
  }

  private finish() {
    this.fightListeners.forEach(x => x());
    this.isDone = true;
  }
}
