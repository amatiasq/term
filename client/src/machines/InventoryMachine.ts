import { Mud } from './../Mud';

export class InventoryMachine {
  private isInitialized = false;
  private items: string[] = [];

  constructor(private readonly mud: Mud) {}

  async start() {
    this.mud.when(/Estas llevando:(\n.*)+?\n\n/, ({ match }) => {
      const [_, ...items] = match[0]
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      this.isInitialized = true;
      this.items = items;
    });
  }

  request() {
    this.mud.send('inventario');
    return this.mud.expect('Estas llevando');
  }

  async hasItem(value: string) {
    if (!this.isInitialized) {
      await this.request();
    }

    return this.items.some(x => x === value);
  }
}
