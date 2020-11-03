import { Mud } from './../Mud';

export class NavigationMachine {
  private directions: string[] = [];
  private _isNavigating = false;

  get isNavigating() {
    return this._isNavigating;
  }

  constructor(private readonly mud: Mud) {}

  async start() {
    this.mud.when(
      /\nSalidas: ([^\.]+)/,
      ({ match }) => {
        this.directions = match[1].split(' ');
        this._isNavigating = false;
      },
      { skipLog: true },
    );
  }

  recall() {
    this.mud.send('recall');
    return (
      this.mud
        .expect('Plaza de Darkhaven', { timeout: 1000 })
        // timeout is a valid situation
        .catch(() => {})
    );
  }

  hasExit(direction: string) {
    return this.directions.some(x => x.startsWith(direction));
  }

  async go(direction: string) {
    const dir = this.directions.find(x => x.startsWith(direction));

    if (!dir) {
      debugger;
      throw new Error(`Unknown direction '${direction}'`);
    }

    if (dir.includes('(cerrada)')) {
      this.mud.send(`abrir ${direction}`);
      await this.mud.expect('Abres la puerta.');
    }

    this.mud.send(direction);
    this._isNavigating = true;
    return this.mud.expect(/\nSalidas: /, { skipLog: true });
  }
}
