import { emitter } from '@amatiasq/emitter';
import { wait } from '../util/wait';
import { Mud } from './../Mud';

const PROMPT = [
  '&W<',
  '&R%h/%Hhp ',
  '&C%m/%Mm ',
  '&G%v/%Vmv ',
  '&P%Xxp ',
  '&Y%gg',
  '&W> ',
  '&W%A ',
  '\n',
].join('');

const FPROMPT = PROMPT.replace('&W>', ' &R%E&W>');

const PROMPT_DETECTOR = new RegExp(
  [
    '<',
    '(?<hpCurr>\\d+)/(?<hpTotal>\\d+)hp ',
    '(?<mCurr>\\d+)/(?<mTotal>\\d+)m ',
    '(?<mvCurr>\\d+)/(?<mvTotal>\\d+)mv ',
    '(?<exp>(\\d|,)+)xp ',
    '(?<gold>(\\d|,)+)g',
    '( \\((?<enemy>\\d+)%\\))?',
    '> (?<invis>I)?',
  ].join(''),
);

class Stat {
  total = 0;
  current = 0;

  get normalized() {
    if (!this.total) {
      return 0;
    }

    return (1 / this.total) * this.current;
  }
}

export class StatsMachine {
  private hp = new Stat();
  private mana = new Stat();
  private mv = new Stat();
  private exp = 0;
  private gold = 0;
  private invis = false;
  private enemy: number | null = null;

  private readonly emitUpdate = emitter<StatsMachine>();
  readonly onUpdate = this.emitUpdate.subscribe;

  get isExhausted() {
    return this.mv.current < 15;
  }

  get isInjured() {
    return this.hp.normalized !== 1;
  }

  get needsHospital() {
    return this.hp.normalized < 0.3;
  }

  get isInDanger() {
    return this.hp.normalized < 0.1;
  }

  get isInvisible() {
    return this.invis;
  }

  constructor(private readonly mud: Mud) {}

  async start() {
    await this.mud
      .expect(PROMPT_DETECTOR, { timeout: 1000 })
      .catch(() => this.setPrompt());

    this.mud.when(
      PROMPT_DETECTOR,
      ({ match }) => {
        const g = match.groups!;
        this.hp.current = toInt(g.hpCurr);
        this.hp.total = toInt(g.hpTotal);
        this.mana.current = toInt(g.mCurr);
        this.mana.total = toInt(g.mTotal);
        this.mv.current = toInt(g.mvCurr);
        this.mv.total = toInt(g.mvTotal);
        this.exp = toInt(g.exp);
        this.gold = toInt(g.gold);
        this.enemy = g.enemy ? toInt(g.enemy) : null;
        this.invis = Boolean(g.invis);

        if (this.enemy) {
          console.log(this.enemy);
        }

        this.emitUpdate(this);
      },
      { skipLog: true },
    );
  }

  setPrompt() {
    this.mud.send(`prompt ${PROMPT}`);
    this.mud.send(`fprompt ${FPROMPT}`);
  }

  expectPrompt() {
    return this.mud.expect(PROMPT_DETECTOR);
  }

  request() {
    this.mud.send('inventario');
    return this.mud.expect('Estas llevando');
  }

  getPercent(stat: 'hp' | 'mana' | 'mv') {
    return this[stat].normalized;
  }
}

function toInt(value: string) {
  return parseInt(value.replace(/,/g, ''), 10);
}
