import { emitter } from '@amatiasq/emitter';
import { renderHtml } from '../util/renderHtml';

import html from './Hamburger.html';
import './Hamburger.css';

export class Hamburger {
  private readonly $fragment = renderHtml(html);
  private readonly $checkbox = this.$fragment.querySelector(
    '.hamburger input',
  ) as HTMLInputElement;

  private readonly emitChange = emitter<boolean>();
  readonly onChange = this.emitChange.subscribe;

  constructor(private readonly key: string) {
    this.toggle = this.toggle.bind(this);
  }

  render(parent: HTMLElement) {
    this.$checkbox.addEventListener('change', this.toggle);

    parent.appendChild(this.$fragment);

    const stored = localStorage.getItem(this.key);
    if (stored) {
      this.$checkbox.checked = true;
      this.toggle();
    }
  }

  toggle() {
    const { checked } = this.$checkbox;

    if (checked) {
      localStorage.setItem(this.key, 'true');
    } else {
      localStorage.removeItem(this.key);
    }

    this.emitChange(checked);
  }
}
