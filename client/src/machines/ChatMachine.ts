import { PatternContext } from './../triggers/PatternTrigger';
import { Mud } from './../Mud';
import { requestNotificationPermission } from '../util/notifications';

interface Message {
  time: number;
  from: string;
  to: string;
  message: string;
}

type Log = Map<string, Message[]>;
type CaptureGroups = { [id: string]: string };

export class ChatMachine {
  private readonly storageKey = new Map<Log, string>();
  private readonly tell = this.loadMessages('chat-history.tell');
  private readonly whisper = this.loadMessages('chat-history.wisper');

  constructor(private readonly mud: Mud) {}

  async start() {
    const wrap = (handler: (groups: CaptureGroups) => void) => ({
      match: { groups },
    }: PatternContext) => handler(groups!);
    const onTellIn = wrap(groups =>
      this.received(this.tell, groups.name, groups.message),
    );
    const onTellOut = wrap(groups =>
      this.sent(this.tell, groups.name, groups.message),
    );
    const onWhisIn = wrap(groups =>
      this.received(this.whisper, groups.name, groups.message),
    );
    const onWhisOut = wrap(groups =>
      this.sent(this.whisper, groups.name, groups.message),
    );

    this.mud.when(/(?<name>.+) te cuenta '(?<message>[^']+)'/, onTellIn);
    this.mud.when(/(?<name>.+) te responde '(?<message>[^']+)'/, onTellIn);
    this.mud.when(/Cuentas a (?<name>.+) '(?<message>[^']+)'/, onTellOut);
    this.mud.when(/Respondes a (?<name>.+) '(?<message>[^']+)'/, onTellOut);

    this.mud.when(/(?<name>.+) te susurra '(?<message>[^']+)'/, onWhisIn);
    this.mud.when(/Susurras a (?<name>.+) '(?<message>[^']+)'/, onWhisOut);
  }

  private received(map: Log, from: string, message: string) {
    this.getHistory(map, from).push({
      time: Date.now(),
      from,
      to: 'me',
      message,
    });

    this.saveMessages(map);
    this.notify(from, message);
  }

  private sent(map: Log, to: string, message: string) {
    this.getHistory(map, to).push({
      time: Date.now(),
      from: 'me',
      to,
      message,
    });

    this.saveMessages(map);
  }

  private async notify(name: string, message: string) {
    await requestNotificationPermission();
    new Notification(`${name} te cuenta '${message}'`);
  }

  private getHistory(map: Log, user: string) {
    if (map.has(user)) {
      return map.get(user)!;
    }

    const history: Message[] = [];
    map.set(user, history);
    return history;
  }

  private loadMessages(key: string): Log {
    const stored = localStorage.getItem(key);
    const result = stored
      ? new Map(Object.entries(JSON.parse(stored)))
      : new Map();

    this.storageKey.set(result, key);
    return result;
  }

  private saveMessages(map: Log) {
    const key = this.storageKey.get(map);

    if (!key) {
      throw new Error('Key not found for map');
    }

    const obj = Object.fromEntries(map);
    localStorage.setItem(key, JSON.stringify(obj));
  }
}
