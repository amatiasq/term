import './Terminal.css';

import Convert from 'ansi-to-html';

import { emitter } from '@amatiasq/emitter';

import { renderHtml } from '../util/renderHtml';
import html from './Terminal.html';

const convert = new Convert();

export class Terminal {
  private readonly $fragment = renderHtml(html);
  private readonly $log = this.$fragment.querySelector('.log')!;
  private readonly $input = this.$fragment.querySelector('input')!;
  private readonly log: string[] = [];
  private readonly history: string[] = [];
  private historyPosition = 0;

  private readonly emitSubmit = emitter<string>();
  readonly onSubmit = this.emitSubmit.subscribe;

  constructor() {
    this.onKey = this.onKey.bind(this);
  }

  focus() {
    this.$input.focus();
  }

  render(parent: HTMLElement) {
    // TODO: watch keypress and/or keyup?
    this.$input.addEventListener('keydown', this.onKey);
    parent.appendChild(this.$fragment);
  }

  write(data: string) {
    const $parent = this.$log.parentElement!;
    const prev = this.log.length ? this.log.pop() : '';
    const content = `${prev}${fixLineEndings(data)}`.split(/\n\n+/);
    const last = content.pop()!;

    for (const block of content) {
      this.log.push(block);

      const p = document.createElement('p');
      p.innerHTML = asciiToHtml(block);
      $parent.insertBefore(p, this.$log);
    }

    this.log.push(last);
    this.$log.innerHTML = asciiToHtml(last);
    $parent.scrollTop = $parent.scrollHeight;
  }

  private onKey(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.submit();
    }

    if (event.code === 'ArrowUp') {
      this.loadHistory(1);
    }

    if (event.code === 'ArrowDown') {
      this.loadHistory(-1);
    }

    this.$input.size = this.$input.value.length + 1;
  }

  private submit() {
    const { value } = this.$input;
    this.$input.value = '';

    this.history.unshift(value);
    this.historyPosition = 0;

    this.emitSubmit(value);
  }

  private loadHistory(modifier: 1 | -1) {
    this.historyPosition += modifier;
    this.$input.value = this.history[this.historyPosition];
  }
}

function asciiToHtml(text: string) {
  const escaped = escapeHtml(text);
  const whitespace = escaped.replace(/ /g, '&nbsp;');
  const html = convert.toHtml(whitespace);
  return html.replace(/\n/g, '<br>');
}

function fixLineEndings(text: string) {
  return text.replace(/\r/g, '');
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
