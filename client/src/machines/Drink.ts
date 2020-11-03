import { RemoteTelnet } from '../RemoteTelnet';
import { TriggerCollection } from './../triggers/TriggerCollection';

enum LoginStatus {
  EXPECTING_NAME,
  EXPECTING_PASSWORD,
  COMPLETED,
}

export class LoginMachine {
  status = LoginStatus.EXPECTING_NAME;

  constructor(
    private readonly triggers: TriggerCollection,
    private readonly telnet: RemoteTelnet,
  ) {}

  async start(username: string, password: string) {
    this.telnet.send(username);

    this.triggers.addPattern(/Pulsa \[ENTER\]/, ({ send }) => send(' '));

    await this.triggers.expectPattern(/\bPassword:/, ({ send }) =>
      send(password),
    );
  }
}
