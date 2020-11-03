import { Mud } from '../Mud';

export class LoginMachine {
  constructor(private readonly mud: Mud) {}

  async start(username: string, password: string) {
    const { mud } = this;

    const removeEnter = mud.when('Pulsa [ENTER]', () => mud.send(' '));

    mud.send(username);
    await mud.expect('Password:');
    mud.send(password);

    setTimeout(removeEnter, 2000);
  }
}
