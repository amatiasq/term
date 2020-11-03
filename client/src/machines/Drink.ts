import { Mud } from './../Mud';

const thirsty = [
  'Te apetece dar un sorbo a algo refrescante.',
  'Tienes sed.',
  'Estas realmente sediento.',
  'Estas MUERTO de SED!',
];

export class DrinkMachine {
  private hasFont = false;
  private isBottleFull = false;

  get inventory() {
    return this.mud.get('inventory');
  }

  constructor(private readonly mud: Mud) {
    this.thirsty = this.thirsty.bind(this);
    this.fontAvailable = this.fontAvailable.bind(this);
  }

  start() {
    this.watchFonts();
    this.watchThirst();

    // Never ending
    return new Promise(() => {});
  }

  private watchFonts() {
    this.mud.when('Salidas:', () => (this.hasFont = false));
    this.mud.when('Un manantial magico esta aqui.', this.fontAvailable);
    this.mud.when(
      'Una hermosa fuente de marmol blanco esta aqui.',
      this.fontAvailable,
    );
  }

  private watchThirst() {
    thirsty.forEach(x => this.mud.when(x, this.thirsty));
  }

  async thirsty() {
    const { mud } = this;

    if (this.hasFont) {
      mud.send('beber');
      this.isBottleFull = false;
      return;
    }

    const bottle = await this.getWaterBottle();

    if (bottle) {
      mud.send(`beber ${bottle}`);
      return;
    }

    console.log('No hay fuente de agua');
  }

  private async fontAvailable() {
    this.hasFont = true;

    if (this.isBottleFull) {
      return;
    }

    const bottle = await this.getWaterBottle();

    if (bottle) {
      this.mud.send(`llenar ${bottle}`);
      this.isBottleFull = true;
    }
  }

  private async getWaterBottle() {
    if (await this.inventory.hasItem('un odre de cuero')) {
      return 'odre';
    }
  }
}
