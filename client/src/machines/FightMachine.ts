import { Mud } from '../Mud';

export class FightMachine {
  private isTargetDead = false;
  private hasEscaped = false;
  private timesAttacksIn = 0;
  private timesAttacksOut = 0;

  private escaped: () => void = () => {};
  private escape = new Promise(resolve => (this.escaped = resolve));

  private attackOut = new RegExp(
    `Tu (?<attack>\\w+) (?<effect>\\w+) a( |\\w)+ ${this.target}.`,
    'g',
  );
  private attackIn = new RegExp(
    `El ataque de( |\\w)+ ${this.target} te (?<effect>\w+).`,
    'g',
  );

  get stats() {
    return this.mud.get('stats');
  }

  constructor(private readonly mud: Mud, readonly target: string) {}

  async start() {
    this.mud.send(`kill ${this.target}`);

    this.expectAttackOut();
    this.expectAttackIn();

    await Promise.race([this.watchTargetDie(), this.escape]);

    console.log(
      `Fight over: ${this.timesAttacksOut} - ${this.timesAttacksIn} - ${
        this.isTargetDead ? 'won' : 'lost'
      }`,
    );

    return this.isTargetDead;
  }

  private async watchTargetDie() {
    await this.mud.expect(`${this.target} ha MUERTO!!`);
    this.isTargetDead = true;
  }

  private async expectAttackOut(): Promise<any> {
    if (await this.onAttack(this.attackOut)) {
      this.timesAttacksOut++;
      return this.expectAttackOut();
    }
  }

  private async expectAttackIn(): Promise<any> {
    if (await this.onAttack(this.attackIn)) {
      this.timesAttacksIn++;
      return this.expectAttackIn();
    }
  }

  private async onAttack(pattern: RegExp) {
    try {
      await this.mud.expect(pattern, { timeout: 5000 });
    } catch (error) {
      return false;
    }

    if (this.isTargetDead || this.hasEscaped) {
      return false;
    }

    return this.analyzeSituation();
  }

  private async analyzeSituation() {
    if (this.stats.isInDanger) {
      this.mud.send('recall');
      this.escaped();
      this.hasEscaped = true;
      return false;
    }

    if (this.stats.isExhausted || this.stats.needsHospital) {
      this.mud.send('huir');
      this.escaped();

      await this.mud.expect('Huyes como un cobarde del combate.', {
        timeout: 2000,
      });

      this.hasEscaped = true;
      return false;
    }

    return true;
  }
}
