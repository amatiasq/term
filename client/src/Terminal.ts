import { emitter } from '@amatiasq/emitter';
import Convert from 'ansi-to-html';

export class Terminal {
  readonly $el = document.createElement('div');
  readonly $log = document.createElement('span');
  readonly $input = document.createElement('input');
  private readonly convert = new Convert();
  private log = '';

  private readonly emitSubmit = emitter<string>();
  readonly onSubmit = this.emitSubmit.subscribe;

  focus() {
    this.$input.focus();
  }

  render(element: HTMLElement) {
    this.$el.classList.add('terminal');

    this.$log.classList.add('log');
    this.$el.appendChild(this.$log);

    this.$input.autofocus = true;
    this.$el.appendChild(this.$input);

    element.appendChild(this.$el);

    this.$input.addEventListener('keydown', event => {
      if (event.code === 'Enter') {
        this.submit();
      }
    });
  }

  write(data: string) {
    this.log += data.replace(/\r/g, '');

    const html = this.convert
      .toHtml(this.log.replace(/ /g, '&nbsp;'))
      .replace(/\n/g, '<br>');

    this.$log.innerHTML = html;

    document.body.scrollTop = document.body.scrollHeight;
  }

  private submit() {
    const { value } = this.$input;
    this.$input.value = '';
    this.emitSubmit(value);
  }
}
