import { initializePlugins, PluginMap } from './plugins/index';
import { emitter } from '@amatiasq/emitter';
import { PluginContext } from './engine/PluginContext';
import { RemoteTelnet } from './remote/RemoteTelnet';
import { TriggerCollection } from './trigger/TriggerCollection';
import { Context } from './workflow/Context';
import { Workflow } from './workflow/Workflow';
import { WorkflowNotFoundError } from './workflow/WorkflowNotFoundError';
import { login } from './login';

export class Mud {
  private readonly triggers = new TriggerCollection();
  private readonly workflows: Record<string, Workflow> = {};
  private plugins!: PluginMap;

  private readonly emitCommand = emitter<string>();
  readonly onCommand = this.emitCommand.subscribe;

  constructor(private readonly telnet: RemoteTelnet) {
    this.send = this.send.bind(this);
    this.invokeWorkflow = this.invokeWorkflow.bind(this);
    this.telnet.onData(x => this.triggers.process(removeNoise(x)));
  }

  async login(user: string, pass: string) {
    const context = new PluginContext('login', 'N/A', this.triggers, this.send);
    await login(context, user, pass);
    this.initPlugins(user);
  }

  send(text: string) {
    this.emitCommand(text);
    this.telnet.send(text);
  }

  private initPlugins(username: string) {
    this.plugins = initializePlugins(
      name => new PluginContext(name, username, this.triggers, this.send),
    );
  }

  addWorkflow<Args extends any[]>(
    run: (context: Context, ...args: Args) => Promise<any> | void,
  ) {
    const workflow = new Workflow(run);
    this.workflows[workflow.name] = workflow as Workflow<any, any>;
    return workflow;
  }

  async invokeWorkflow(name: string, params: any[]) {
    if (!(name in this.workflows)) {
      throw new WorkflowNotFoundError(`Workflow ${name} is not registered.`);
    }

    const workflow = this.workflows[name];
    const context = this.createWorkflowContext(name);
    const result = await workflow.execute(context, ...params);
    context.dispose();
    return result;
  }

  private createWorkflowContext(name: string) {
    return new Context(
      name,
      this.triggers,
      this.plugins,
      this.send,
      this.invokeWorkflow,
    );
  }
}

function removeNoise(text: string) {
  return removeAsciiCodes(text).replace(/\r/g, '');
}

function removeAsciiCodes(text: string) {
  return text.replace(/\u001b\[.*?m/g, '');
}
