import { Mud } from './../Mud';

export class DrinkMachine {
  private hasFont = false;

  constructor(private readonly mud: Mud) {
    this.thirsty = this.thirsty.bind(this);
  }

  start() {
    this.watchFonts();
    this.watchThirst();

    // Never ending
    return new Promise(() => {});
  }

  private watchFonts() {
    this.mud.when('Salidas:', () => (this.hasFont = false));
    this.mud.when(
      'Una hermosa fuente de marmol blanco esta aqui.',
      () => (this.hasFont = true),
    );
  }

  private watchThirst() {
    this.mud.when('Tienes sed.', this.thirsty);
    this.mud.when('Estas realmente sediento.', this.thirsty);
    this.mud.when('Estas MUERTO de SED!', this.thirsty);
  }

  async thirsty() {
    const { mud } = this;

    if (this.hasFont) {
      mud.send('beber');
      return;
    }

    const inventory = mud.get('inventory');

    if (await inventory.hasItem('un odre de cuero')) {
      mud.send('beber ordre');
      return;
    }

    console.log('No hay fuente de agua');
  }
}
